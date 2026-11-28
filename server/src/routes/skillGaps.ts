import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { prisma } from '../prisma';
import { getStudentSkillReport, getSectionSkillReport, getYearSkillReport } from '../services/skillGapService';
import { canAccessSubjectSection, isAdmin } from '../services/facultyAssignmentService';

const router = Router();
router.use(authenticateJWT);

const paramStr = (val: string | string[] | undefined): string => {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
};

const subjectQ = (req: Request): string | undefined => {
  const q = req.query.subjectId;
  if (typeof q === 'string') return q;
  if (Array.isArray(q) && typeof q[0] === 'string') return q[0];
  return undefined;
};

/** Faculty analytics only count attempts from quizzes that faculty created. */
const facultyIdQ = async (req: Request): Promise<string | undefined> => {
  const user = (req as any).user;
  if (user?.role !== 'FACULTY') return undefined;
  const faculty = await prisma.faculty.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  return faculty?.id;
};

/**
 * Faculty may only view the exact subject+section pair assigned to them.
 * A missing subjectId is a 403 for faculty: without it we cannot enforce the
 * subject half of the assignment and could leak another subject's evidence.
 * Admins can view any existing section and, optionally, any subject.
 */
async function canViewSection(req: Request, sectionId: string, subjectId?: string): Promise<boolean> {
  const user = (req as any).user;
  if (!user) return false;
  if (isAdmin(user)) {
    return canAccessSubjectSection(user, subjectId || '', sectionId);
  }
  if (!subjectId) return false;
  return canAccessSubjectSection(user, subjectId, sectionId);
}

// GET /api/skill-gaps/student/me?subjectId=
router.get('/student/me', requireRole(['STUDENT']), async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: (req as any).user?.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });
    res.json(await getStudentSkillReport(student.id, subjectQ(req)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute skill gaps' });
  }
});

// GET /api/skill-gaps/student/:studentId   (faculty of that student's section, or admin)
router.get('/student/:studentId', requireRole(['FACULTY', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const studentId = paramStr(req.params.studentId);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const subjectId = subjectQ(req);
    if (!(await canViewSection(req, student.sectionId, subjectId))) {
      return res.status(403).json({ error: 'Forbidden: subject and section are not assigned to you' });
    }
    res.json(await getStudentSkillReport(student.id, subjectId, await facultyIdQ(req)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute skill gaps' });
  }
});

// GET /api/skill-gaps/section/:sectionId?subjectId=
router.get('/section/:sectionId', requireRole(['FACULTY', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const sectionId = paramStr(req.params.sectionId);
    const subjectId = subjectQ(req);
    if (!(await canViewSection(req, sectionId, subjectId))) {
      return res.status(403).json({ error: 'Forbidden: subject and section are not assigned to you' });
    }
    res.json(await getSectionSkillReport(sectionId, subjectId, await facultyIdQ(req)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute skill gaps' });
  }
});

// GET /api/skill-gaps/year/:year?subjectId=      (admin only; year 1..4)
router.get('/year/:year', requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const yearStr = paramStr(req.params.year);
    const year = Number(yearStr);
    if (!Number.isInteger(year) || year < 1 || year > 4) return res.status(400).json({ error: 'year must be 1-4' });
    res.json(await getYearSkillReport(year, subjectQ(req)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to compute skill gaps' });
  }
});

export default router;
