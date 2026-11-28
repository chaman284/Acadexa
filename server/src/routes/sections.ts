import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

/** Monday of the ISO week containing `value`, normalised to local midnight. */
const weekStart = (value: Date): Date => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return date;
};

/** Weekly average score from submitted attempts, oldest first (last 6 weeks). */
const buildWeeklyPerformance = (
  attempts: Array<{ score: number | null; submittedAt: Date | null }>,
): Array<{ label: string; score: number }> => {
  const buckets = new Map<string, { total: number; count: number; date: Date }>();
  for (const attempt of attempts) {
    if (attempt.score == null || !attempt.submittedAt) continue;
    const start = weekStart(new Date(attempt.submittedAt));
    const key = start.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? { total: 0, count: 0, date: start };
    bucket.total += Number(attempt.score);
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((bucket) => ({
      label: bucket.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      score: Math.round(bucket.total / bucket.count),
    }));
};

const trendFromWeekly = (
  weekly: Array<{ score: number }>,
): 'improving' | 'declining' | 'stable' => {
  if (weekly.length < 2) return 'stable';
  const delta = weekly[weekly.length - 1].score - weekly[0].score;
  if (delta > 2) return 'improving';
  if (delta < -2) return 'declining';
  return 'stable';
};

// GET /api/sections - List sections with student count and assignments
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { semester, departmentId } = req.query;
    const where: any = {};
    if (semester) where.semester = parseInt(String(semester), 10);
    if (departmentId) where.departmentId = String(departmentId);

    const sections = await prisma.section.findMany({
      where,
      include: {
        department: true,
        assignments: {
          include: {
            faculty: {
              include: { user: { select: { name: true } } },
            },
            subject: true,
          },
        },
        _count: {
          select: { students: true, assignments: true, quizzes: true },
        },
      },
      orderBy: [{ semester: 'asc' }, { name: 'asc' }],
    });

    const formatted = sections.map(s => ({
      id: s.id,
      name: s.name,
      section: `Section ${s.name}`,
      semester: s.semester,
      semesterLabel: `Semester ${s.semester}`,
      departmentId: s.departmentId,
      departmentName: s.department?.name,
      departmentCode: s.department?.code,
      studentsCount: s._count.students,
      assignments: s.assignments.map(a => ({
        facultyName: a.faculty.user.name,
        subjectId: a.subjectId,
        subjectName: a.subject.name,
        subjectCode: a.subject.code,
      })),
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/sections/faculty-classes - Get assigned classes for the logged-in faculty
router.get('/faculty-classes', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Try finding faculty profile for current user
    let faculty = await prisma.faculty.findUnique({
      where: { userId: req.user.id },
      include: {
        assignments: {
          include: {
            subject: true,
            section: {
              include: {
                _count: { select: { students: true } },
                department: true,
              },
            },
          },
        },
      },
    });

    // If not found or no assignments (e.g. admin logged in or test faculty), fallback to first faculty with assignments
    if (!faculty || faculty.assignments.length === 0) {
      faculty = await prisma.faculty.findFirst({
        where: { assignments: { some: {} } },
        include: {
          assignments: {
            include: {
              subject: true,
              section: {
                include: {
                  _count: { select: { students: true } },
                  department: true,
                },
              },
            },
          },
        },
      });
    }

    if (faculty && faculty.assignments.length > 0) {
      const classes = await Promise.all(
        faculty.assignments.map(async (a, index) => {
          // Get active quiz count for this subject & section
          const activeQuizCount = await prisma.quiz.count({
            where: {
              subjectId: a.subjectId,
              sectionId: a.sectionId,
              status: 'ACTIVE',
            },
          });

          // Get attempts count and avg score if available
          const attemptWhere = {
            quiz: {
              subjectId: a.subjectId,
              sectionId: a.sectionId,
            },
          };
          const attempts = await prisma.quizAttempt.aggregate({
            where: attemptWhere,
            _avg: { score: true },
            _count: { id: true },
          });

          const since = new Date();
          since.setDate(since.getDate() - 42);
          since.setHours(0, 0, 0, 0);
          const weeklyAttempts = await prisma.quizAttempt.findMany({
            where: {
              ...attemptWhere,
              isSubmitted: true,
              submittedAt: { gte: since },
            },
            select: { score: true, submittedAt: true },
            orderBy: { submittedAt: 'asc' },
          });
          const weeklyPerformance = buildWeeklyPerformance(weeklyAttempts);

          const avgScore = attempts._avg.score ? Math.round(attempts._avg.score) : 0;

          return {
            id: a.id,
            sectionId: a.sectionId,
            subjectId: a.subjectId,
            subject: a.subject.name,
            subjectCode: a.subject.code,
            semester: `Sem ${(a.subject as any).semester || a.section.semester}`,
            section: `${a.section.semester}${a.section.name}`,
            sectionName: `Section ${a.section.name}`,
            studentsCount: a.section._count.students,
            avgScore,
            activeQuizCount,
            pendingReviewCount: 0,
            lastQuizDate: weeklyAttempts.length
              ? new Date(weeklyAttempts[weeklyAttempts.length - 1].submittedAt!).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            trend: trendFromWeekly(weeklyPerformance),
            weeklyPerformance,
            weakTopics: [],
          };
        })
      );

      return res.json(classes);
    }

    // Fallback: if no faculty assignments exist in DB yet, query sections directly
    const allSections = await prisma.section.findMany({
      include: {
        department: true,
        _count: { select: { students: true } },
      },
      orderBy: [{ semester: 'asc' }, { name: 'asc' }],
    });

    const fallbackClasses = allSections.map((sec) => ({
      id: sec.id,
      sectionId: sec.id,
      subjectId: 'default',
      subject: sec.department?.name || 'Artificial Intelligence and Machine Learning',
      subjectCode: `AIML${sec.semester}01`,
      semester: `Sem ${sec.semester}`,
      section: `${sec.semester}${sec.name}`,
      sectionName: `Section ${sec.name}`,
      studentsCount: sec._count.students,
      avgScore: 0,
      activeQuizCount: 0,
      pendingReviewCount: 0,
      lastQuizDate: new Date().toISOString().split('T')[0],
      trend: 'stable' as const,
      weeklyPerformance: [],
      weakTopics: [],
    }));

    return res.json(fallbackClasses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
