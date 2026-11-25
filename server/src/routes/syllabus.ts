import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';
import { createNotification } from '../services/notificationService';

const router = Router();

interface SyllabusTopic {
  id: string;
  name: string;
}

interface SyllabusModule {
  id: string;
  title: string;
  moduleNumber?: number;
  hours?: string;
  description?: string;
  topics: SyllabusTopic[];
  completedTopicIds: string[];
  progress: number;
}

interface SyllabusRow {
  id: string;
  subjectId: string;
  sectionId: string;
  facultyId: string | null;
  modules: unknown;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  semester: number;
}

const MAX_MODULES = 30;
const MAX_TOPICS_PER_MODULE = 100;

const asArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray((value as any).modules)) {
    return (value as any).modules;
  }
  return [];
};

const text = (value: unknown, fallback = '', max = 2000): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : fallback;
};

const progressFor = (topics: SyllabusTopic[], completedTopicIds: string[]): number => {
  if (topics.length === 0) return 0;
  return Math.round((completedTopicIds.length / topics.length) * 100);
};

const normalizeModules = (input: unknown): SyllabusModule[] => {
  return asArray(input).slice(0, MAX_MODULES).map((raw: any, index: number) => {
    const topics: SyllabusTopic[] = asArray(raw?.topics)
      .slice(0, MAX_TOPICS_PER_MODULE)
      .map((topic: any, topicIndex: number) => ({
        id: text(topic?.id, `topic-${index + 1}-${topicIndex + 1}`, 120),
        name: text(topic?.name, '', 300),
      }))
      .filter(topic => topic.name.length > 0);

    const validTopicIds = new Set(topics.map(topic => topic.id));
    const completedTopicIds = asArray(raw?.completedTopicIds)
      .map(id => text(id, '', 120))
      .filter(id => validTopicIds.has(id));

    return {
      id: text(raw?.id, `module-${index + 1}`, 120),
      title: text(raw?.title, `Module ${index + 1}`, 250),
      moduleNumber:
        typeof raw?.moduleNumber === 'number' && Number.isFinite(raw.moduleNumber)
          ? raw.moduleNumber
          : undefined,
      hours: text(raw?.hours, '', 60),
      description: text(raw?.description, '', 3000),
      topics,
      completedTopicIds,
      progress: progressFor(topics, completedTopicIds),
    };
  });
};

const overallProgress = (modules: SyllabusModule[]): number => {
  if (modules.length === 0) return 0;
  const total = modules.reduce((sum, module) => sum + (module.progress || 0), 0);
  return Math.round(total / modules.length);
};

const formatRow = (row: SyllabusRow) => {
  const modules = normalizeModules(row.modules);
  return {
    id: row.id,
    subjectId: row.subjectId,
    subjectCode: row.subjectCode,
    subjectName: row.subjectName,
    sectionId: row.sectionId,
    sectionName: row.sectionName,
    semester: row.semester,
    facultyId: row.facultyId,
    modules,
    overallProgress: overallProgress(modules),
    isPublished: Boolean(row.isPublished),
    publishedAt: row.publishedAt ? new Date(row.publishedAt).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
};

const fetchSyllabus = async (subjectId: string, sectionId: string): Promise<SyllabusRow | null> => {
  const rows = await prisma.$queryRaw<SyllabusRow[]>`
    SELECT cs.*, s."code" AS "subjectCode", s."name" AS "subjectName",
           sec."name" AS "sectionName", sec."semester" AS "semester"
    FROM "CourseSyllabus" cs
    JOIN "Subject" s ON s."id" = cs."subjectId"
    JOIN "Section" sec ON sec."id" = cs."sectionId"
    WHERE cs."subjectId" = ${subjectId} AND cs."sectionId" = ${sectionId}
    LIMIT 1
  `;
  return rows[0] || null;
};

const resolveFaculty = async (req: AuthRequest) => {
  if (!req.user) return null;
  let faculty = await prisma.faculty.findUnique({
    where: { userId: req.user.id },
    include: { assignments: true },
  });
  if (!faculty || faculty.assignments.length === 0) {
    faculty = await prisma.faculty.findFirst({
      where: { assignments: { some: {} } },
      include: { assignments: true },
    });
  }
  return faculty;
};

const resolveAssignment = async (facultyId: string, classId: string) => {
  let assignment = await prisma.facultySubject.findUnique({
    where: { id: classId },
    include: { subject: true, section: true },
  });
  if (!assignment) {
    assignment = await prisma.facultySubject.findFirst({
      where: { sectionId: classId, facultyId },
      include: { subject: true, section: true },
    });
  }
  return assignment;
};

/**
 * Creates a class syllabus the first time a faculty/student opens it. The
 * supplied 5th-semester syllabi live in SyllabusTemplate, so a newly created
 * section automatically receives the correct default modules.
 */
const ensureSyllabus = async (subjectId: string, sectionId: string, subjectCode: string) => {
  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "CourseSyllabus"
    WHERE "subjectId" = ${subjectId} AND "sectionId" = ${sectionId}
    LIMIT 1
  `;
  if (existing.length > 0) return;

  const templates = await prisma.$queryRaw<Array<{ modules: unknown }>>`
    SELECT "modules" -> 'modules' AS modules
    FROM "SyllabusTemplate" WHERE "subjectCode" = ${subjectCode}
    LIMIT 1
  `;
  const hasTemplate = templates.length > 0;
  const modules = normalizeModules(hasTemplate ? templates[0].modules : []);
  const now = new Date();

  // Template-backed subjects (the supplied 5th-semester syllabi) are published
  // automatically for new sections; faculty can still edit or unpublish them.
  await prisma.$executeRaw`
    INSERT INTO "CourseSyllabus"
      ("id", "subjectId", "sectionId", "facultyId", "modules", "isPublished", "publishedAt")
    VALUES
      (${randomUUID()}, ${subjectId}, ${sectionId}, null, ${JSON.stringify(modules)}::jsonb, ${hasTemplate}, ${hasTemplate ? now : null})
    ON CONFLICT ("subjectId", "sectionId") DO NOTHING
  `;
};

const notifyStudentsOnPublish = async (
  sectionId: string,
  subjectName: string,
  subjectCode: string,
  sectionName: string,
  facultyName: string,
) => {
  const students = await prisma.student.findMany({
    where: { sectionId },
    select: { userId: true },
  });
  if (students.length === 0) return;
  await Promise.all(
    students.map(student =>
      createNotification({
        userId: student.userId,
        title: 'Syllabus Published',
        message: `${facultyName} published the syllabus for ${subjectName} (${subjectCode}) · Section ${sectionName}. Open My Courses to view module-wise teaching progress.`,
        type: 'course',
        role: 'STUDENT',
        actionUrl: '/student/courses',
      })
    )
  );
};

// GET /api/syllabus/class/:classId — faculty editor for an assigned class
router.get('/class/:classId', authenticateJWT, requireRole(['FACULTY']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const faculty = await resolveFaculty(req);
    if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

    const assignment = await resolveAssignment(faculty.id, String(req.params.classId));
    if (!assignment) return res.status(404).json({ message: 'Assigned class not found' });
    if (assignment.facultyId !== faculty.id) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }

    await ensureSyllabus(assignment.subjectId, assignment.sectionId, assignment.subject.code);
    const row = await fetchSyllabus(assignment.subjectId, assignment.sectionId);
    if (!row) return res.status(404).json({ message: 'Syllabus could not be loaded' });

    return res.json({
      class: {
        id: assignment.id,
        subject: assignment.subject.name,
        subjectCode: assignment.subject.code,
        section: `Section ${assignment.section.name}`,
        sectionName: assignment.section.name,
        semester: assignment.section.semester,
      },
      syllabus: formatRow(row),
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// PUT /api/syllabus/class/:classId — save edits and publish/unpublish
router.put('/class/:classId', authenticateJWT, requireRole(['FACULTY']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const faculty = await resolveFaculty(req);
    if (!faculty) return res.status(404).json({ message: 'Faculty profile not found' });

    const assignment = await resolveAssignment(faculty.id, String(req.params.classId));
    if (!assignment) return res.status(404).json({ message: 'Assigned class not found' });
    if (assignment.facultyId !== faculty.id) {
      return res.status(403).json({ message: 'You are not assigned to this class' });
    }

    await ensureSyllabus(assignment.subjectId, assignment.sectionId, assignment.subject.code);
    const previous = await fetchSyllabus(assignment.subjectId, assignment.sectionId);
    if (!previous) return res.status(404).json({ message: 'Syllabus could not be loaded' });

    const modules = normalizeModules(req.body?.modules);
    const requestedPublished = req.body?.isPublished;
    const isPublished =
      typeof requestedPublished === 'boolean' ? requestedPublished : Boolean(previous.isPublished);
    const now = new Date();
    const publishedAt = isPublished
      ? previous.publishedAt || now
      : null;
    const justPublished = isPublished && !previous.isPublished;

    await prisma.$executeRaw`
      UPDATE "CourseSyllabus"
      SET "modules" = ${JSON.stringify(modules)}::jsonb,
          "facultyId" = ${faculty.id},
          "isPublished" = ${isPublished},
          "publishedAt" = ${publishedAt},
          "updatedAt" = ${now}
      WHERE "subjectId" = ${assignment.subjectId} AND "sectionId" = ${assignment.sectionId}
    `;

    if (justPublished) {
      try {
        await notifyStudentsOnPublish(
          assignment.sectionId,
          assignment.subject.name,
          assignment.subject.code,
          assignment.section.name,
          req.user.name || 'Your faculty',
        );
      } catch (notificationError) {
        console.error('Failed to notify students about syllabus publish:', notificationError);
      }
    }

    const updated = await fetchSyllabus(assignment.subjectId, assignment.sectionId);
    return res.json({ syllabus: formatRow(updated || previous) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/syllabus/student — published syllabi for the logged-in student's section
router.get('/student', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      select: { sectionId: true },
    });
    if (!student?.sectionId) return res.json({ syllabi: [] });

    const assignments = await prisma.facultySubject.findMany({
      where: { sectionId: student.sectionId },
      include: { subject: true },
    });
    await Promise.all(
      assignments.map(assignment =>
        ensureSyllabus(assignment.subjectId, student.sectionId!, assignment.subject.code)
      )
    );

    const rows = await prisma.$queryRaw<SyllabusRow[]>`
      SELECT cs.*, s."code" AS "subjectCode", s."name" AS "subjectName",
             sec."name" AS "sectionName", sec."semester" AS "semester"
      FROM "CourseSyllabus" cs
      JOIN "Subject" s ON s."id" = cs."subjectId"
      JOIN "Section" sec ON sec."id" = cs."sectionId"
      WHERE cs."sectionId" = ${student.sectionId} AND cs."isPublished" = true
      ORDER BY s."code"
    `;
    return res.json({ syllabi: rows.map(formatRow) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
