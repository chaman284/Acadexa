import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../prisma';
import {
  canAccessStudent,
  canAccessSubjectSection,
  listFacultyAssignments,
} from '../services/facultyAssignmentService';
import {
  getFacultyClassData,
  getFacultyStudentReport,
  StudentRow,
} from '../services/facultySkillGapService';
import { CONFIG } from '../services/skillGapService';
import { visibleNotificationWhere } from '../services/notificationService';

const router = Router();
router.use(authenticateJWT, requireRole(['FACULTY', 'ADMIN']));

const paramStr = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] || '' : value || '';

const queryRecord = (req: Request): Record<string, unknown> =>
  req.query as unknown as Record<string, unknown>;

/** List fields are always arrays at the HTTP boundary; never `0` or null. */
function list<T>(value: T[] | number | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/** Count fields are always finite numbers; never arrays or null. */
const num = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

/** Every subject/section route passes through this exact-pair check. */
const requireAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const subjectId = paramStr(req.params.sid);
  const sectionId = paramStr(req.params.secid);
  if (!subjectId || !sectionId) {
    return res.status(400).json({ message: 'subjectId and sectionId are required' });
  }
  if (!(await canAccessSubjectSection(req.user, subjectId, sectionId))) {
    return res.status(403).json({ message: 'Forbidden: subject and section are not assigned to you' });
  }
  return next();
};

// My assigned subject + section pairs.
router.get('/assignments', async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await listFacultyAssignments(req.user!);
    res.json({
      assignments: list(assignments),
      thresholds: {
        below: Math.round(CONFIG.MODERATE_AT * 100),
        strong: Math.round(CONFIG.MASTERED_AT * 100),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// In-app faculty notifications, including the unread count for the header/panel.
router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: visibleNotificationWhere(req.user!),
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const notificationsList = list(notifications);
    res.json({
      notifications: notificationsList,
      unreadCount: num(notificationsList.filter((n) => !n.isRead).length),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        id: paramStr(req.params.id),
        ...visibleNotificationWhere(req.user!),
      },
      data: { isRead: true },
    });
    if (!result.count) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Class-level aggregate cards, aligned display bands, and trend.
router.get(
  '/subjects/:sid/sections/:secid/class-summary',
  requireAssignment,
  async (req: AuthRequest, res: Response) => {
    try {
      const subjectId = paramStr(req.params.sid);
      const sectionId = paramStr(req.params.secid);
      const data = await getFacultyClassData(sectionId, subjectId, queryRecord(req));
      res.json({
        subjectId,
        sectionId,
        ...data.summary,
        totalStudents: num(data.summary.totalStudents),
        assessedStudents: num(data.summary.assessedStudents),
        belowThresholdCount: num(data.summary.belowThresholdCount),
        distribution: list(data.summary.distribution),
        trend: list(data.trend),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Topic/module analysis, weakest first, with the three weakest highlighted.
router.get(
  '/subjects/:sid/sections/:secid/topic-analysis',
  requireAssignment,
  async (req: AuthRequest, res: Response) => {
    try {
      const subjectId = paramStr(req.params.sid);
      const sectionId = paramStr(req.params.secid);
      const data = await getFacultyClassData(sectionId, subjectId, queryRecord(req));
      res.json({
        subjectId,
        sectionId,
        ...data.analysis,
        topics: list(data.analysis.topics),
        highlightedTopicIds: list(data.analysis.highlightedTopicIds),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

const statusRank: Record<StudentRow['status'], number> = {
  'below-threshold': 0,
  'no-attempts': 1,
  average: 2,
  strong: 3,
};

router.get(
  '/subjects/:sid/sections/:secid/students',
  requireAssignment,
  async (req: AuthRequest, res: Response) => {
    try {
      const subjectId = paramStr(req.params.sid);
      const sectionId = paramStr(req.params.secid);
      const data = await getFacultyClassData(sectionId, subjectId, queryRecord(req));
      const query = queryRecord(req);
      const search = String(query.search || '').trim().toLowerCase();
      const quickFilter = String(query.quickFilter || '');
      const topicId = String(query.topicId || '');
      const sortBy = String(query.sortBy || 'overallScore');
      const sortDir = String(query.sortDir || 'asc') === 'desc' ? -1 : 1;

      let students = data.students.filter((student) => {
        if (search && !`${student.name} ${student.rollNo}`.toLowerCase().includes(search)) return false;
        if (quickFilter === 'below-threshold' && student.status !== 'below-threshold') return false;
        if (quickFilter === 'no-attempts' && student.status !== 'no-attempts') return false;
        if (quickFilter === 'weak-topic') {
          if (!topicId) return false;
          const topic = student.topicScores.find((t) => t.topicId === topicId);
          if (!topic?.weak) return false;
        }
        return true;
      });

      students = [...students].sort((a, b) => {
        const value = (row: StudentRow): string | number | null => {
          switch (sortBy) {
            case 'name': return row.name.toLowerCase();
            case 'rollNo': return row.rollNo.toLowerCase();
            case 'weakTopicCount': return row.weakTopicCount;
            case 'status': return statusRank[row.status];
            case 'lastActivity': return row.lastActivity || '';
            default: return row.overallScore;
          }
        };
        const av = value(a);
        const bv = value(b);
        if (av === null && bv === null) return 0;
        if (av === null) return 1;
        if (bv === null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });

      const studentList = list(students);
      res.json({
        subjectId,
        sectionId,
        students: studentList,
        total: num(studentList.length),
        topics: list(data.analysis.topics).map((t) => ({
          topicId: t.topicId,
          topicName: t.topicName,
          moduleNo: t.moduleNo,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
);

// The exact same raw report payload the student receives; only the route differs.
router.get(
  '/subjects/:sid/sections/:secid/students/:studentId/skill-gap',
  requireAssignment,
  async (req: AuthRequest, res: Response) => {
    try {
      const subjectId = paramStr(req.params.sid);
      const sectionId = paramStr(req.params.secid);
      const studentId = paramStr(req.params.studentId);
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { id: true, sectionId: true },
      });
      if (!student || !(await canAccessStudent(req.user, student, subjectId))) {
        return res.status(403).json({ message: 'Forbidden: student is not in the assigned section' });
      }
      if (student.sectionId !== sectionId) {
        return res.status(403).json({ message: 'Forbidden: student is not in the assigned section' });
      }
      const report = await getFacultyStudentReport(studentId, subjectId, sectionId);
      if (!report) return res.status(403).json({ message: 'Forbidden: student is not in the assigned section' });
      const payload = report as Record<string, unknown>;
      return res.json({
        ...payload,
        tree: payload.tree ?? null,
        weakestTopics: list(payload.weakestTopics as any[] | number),
        weakestSubtopics: list(payload.weakestSubtopics as any[] | number),
        subtopicDiagnoses: list(payload.subtopicDiagnoses as any[] | number),
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  },
);

export default router;
