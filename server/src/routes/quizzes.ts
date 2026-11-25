import { Router } from 'express';
import { quizService } from '../services/quizService';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

const getFacultyIdForUser = async (req: AuthRequest): Promise<string | null> => {
  if (req.user?.role !== 'FACULTY') return null;
  const faculty = await prisma.faculty.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });
  return faculty?.id || null;
};

/** Faculty may only reach quizzes they created; admins may manage all quizzes. */
const canAccessQuiz = async (req: AuthRequest, quizId: string): Promise<boolean> => {
  if (req.user?.role === 'ADMIN') return true;
  const facultyId = await getFacultyIdForUser(req);
  if (!facultyId) return false;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { facultyId: true },
  });
  return quiz?.facultyId === facultyId;
};

// List quizzes (filtered by user section for students or query params for faculty)
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    let sectionId = req.query.sectionId as string | undefined;
    let studentId: string | undefined;
    let facultyId: string | undefined;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });
      if (student) {
        sectionId = student.sectionId;
        studentId = student.id;
      }
    } else if (req.user?.role === 'FACULTY') {
      facultyId = (await getFacultyIdForUser(req)) || undefined;
      if (!facultyId) return res.json([]);
    }

    const quizzes = await quizService.getQuizzes({
      sectionId,
      subjectId: req.query.subjectId as string,
      status: req.query.status as string,
      studentId,
      facultyId,
    });
    res.json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create quiz (Faculty / Admin only)
router.post('/', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { subjectId, sectionId } = req.body;
    let ownerFacultyId: string | null = null;

    // Validate faculty teaching authorization if user is faculty
    if (req.user?.role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: req.user.id },
        include: { assignments: true },
      });
      if (!faculty) {
        return res.status(403).json({ message: 'Faculty profile not found' });
      }
      ownerFacultyId = faculty.id;

      if (subjectId && sectionId && faculty.assignments.length > 0) {
        const isAuthorized = faculty.assignments.some(
          a => a.subjectId === subjectId && a.sectionId === sectionId
        );
        if (!isAuthorized) {
          return res.status(403).json({
            message: 'You are not authorized to create or assign quizzes to a subject or section outside your assigned classes.',
          });
        }
      }
    } else if (req.body.facultyId) {
      const target = await prisma.faculty.findUnique({
        where: { id: String(req.body.facultyId) },
        select: { id: true },
      });
      if (target) ownerFacultyId = target.id;
    }

    const quiz = await quizService.createQuiz({ ...req.body, facultyId: ownerFacultyId });
    res.status(201).json(quiz);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get quiz details
router.get('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const quizId = req.params.id as string;
    if (req.user?.role === 'FACULTY' && !(await canAccessQuiz(req, quizId))) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const quiz = await quizService.getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz attempt (Student)
router.post('/:id/attempt', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    let studentId = req.user!.id;
    try {
      const student = await prisma.student.findUnique({
        where: { userId: req.user!.id },
      });
      if (student) {
        studentId = student.id;
      }
    } catch (e) {
      // Prisma offline or DB fallback
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id as string },
    });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.status === 'COMPLETED') {
      return res.status(400).json({ message: 'This quiz has already ended and is no longer accepting submissions.' });
    }
    if (quiz.scheduledAt && new Date(quiz.scheduledAt) > new Date()) {
      return res.status(400).json({
        message: `This quiz is scheduled for ${new Date(quiz.scheduledAt).toLocaleString('en-IN')} and cannot be attempted yet.`,
      });
    }

    const attempt = await quizService.submitAttempt({
      quizId: req.params.id as string,
      studentId,
      timeTaken: req.body.timeTaken || 0,
      answers: req.body.answers || [],
      attemptId: req.body.attemptId || undefined,
      autoSubmitted: Boolean(req.body.autoSubmitted),
      autoSubmitReason: req.body.autoSubmitReason || undefined,
    });

    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get results / student responses of a quiz
router.get(
  '/:id/results',
  authenticateJWT,
  requireRole(['FACULTY', 'ADMIN']),
  async (req: AuthRequest, res) => {
    try {
      const quizId = req.params.id as string;
      if (!(await canAccessQuiz(req, quizId))) {
        return res.status(403).json({ message: 'You can only view results for your own quizzes.' });
      }
      const results = await quizService.getQuizResults(quizId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get current student's attempt for a quiz
router.get('/:id/my-attempt', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const quizId = req.params.id as string;

    // A submitted attempt always wins over an abandoned draft. Draft rows keep
    // submittedAt populated for schema compatibility, so ordering by that field
    // alone could surface an in-progress attempt as the student's final result.
    const submitted = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "QuizAttempt"
      WHERE "quizId" = ${quizId} AND "studentId" = ${student.id} AND "isSubmitted" = true
      ORDER BY "submittedAt" DESC
      LIMIT 1
    `;
    const active = submitted.length > 0
      ? []
      : await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "QuizAttempt"
          WHERE "quizId" = ${quizId} AND "studentId" = ${student.id} AND "isSubmitted" = false
          ORDER BY "startedAt" DESC
          LIMIT 1
        `;

    const attemptId = submitted[0]?.id || active[0]?.id;
    if (!attemptId) {
      // No attempt exists yet. Returning a payload here would make the client
      // treat the empty response as a completed exam.
      return res.json(null);
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
                topic: true,
              },
            },
          },
        },
        quiz: {
          include: {
            subject: true,
          },
        },
      },
    });
    if (!attempt) return res.json(null);

    const integrity = await quizService.getAttemptIntegrity(attempt.id);
    res.json({
      ...attempt,
      isSubmitted: integrity?.isSubmitted ?? submitted.length > 0,
      startedAt: integrity?.startedAt || null,
      answerDrafts: integrity?.answerDrafts || {},
      tabSwitchCount: integrity?.tabSwitchCount || 0,
      autoSubmitted: integrity?.autoSubmitted || false,
      autoSubmitReason: integrity?.autoSubmitReason || null,
      violations: integrity?.violations || [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz status (e.g. End open quiz to COMPLETED)
router.patch('/:id/status', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const quizId = req.params.id as string;
    if (!(await canAccessQuiz(req, quizId))) {
      return res.status(403).json({ message: 'You can only manage your own quizzes.' });
    }
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const updated = await quizService.updateQuizStatus(quizId, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz schedule
router.patch('/:id/schedule', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const quizId = req.params.id as string;
    if (!(await canAccessQuiz(req, quizId))) {
      return res.status(403).json({ message: 'You can only manage your own quizzes.' });
    }
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot schedule an ended quiz. Completed assessments cannot be rescheduled.' });
    }

    const { scheduledAt, status } = req.body;
    const dateVal = scheduledAt ? new Date(scheduledAt) : null;
    const updated = await quizService.updateQuizSchedule(quizId, dateVal, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete quiz
router.delete('/:id', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const quizId = req.params.id as string;
    if (!(await canAccessQuiz(req, quizId))) {
      return res.status(403).json({ message: 'You can only manage your own quizzes.' });
    }
    await quizService.deleteQuiz(quizId);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
