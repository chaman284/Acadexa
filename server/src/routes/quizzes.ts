import { Router } from 'express';
import { quizService } from '../services/quizService';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

// List quizzes (filtered by user section for students or query params for faculty)
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    let sectionId = req.query.sectionId as string | undefined;
    let studentId: string | undefined;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });
      if (student) {
        sectionId = student.sectionId;
        studentId = student.id;
      }
    }

    const quizzes = await quizService.getQuizzes({
      sectionId,
      subjectId: req.query.subjectId as string,
      status: req.query.status as string,
      studentId,
    });
    res.json(quizzes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create quiz (Faculty / Admin only)
router.post('/', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json(quiz);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get quiz details
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id as string);
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
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
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
      studentId: student.id,
      timeTaken: req.body.timeTaken || 0,
      answers: req.body.answers || [],
    });

    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Get results / student responses of a quiz
router.get('/:id/results', authenticateJWT, async (req, res) => {
  try {
    const results = await quizService.getQuizResults(req.params.id as string);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get current student's attempt for a quiz
router.get('/:id/my-attempt', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const attempt = await prisma.quizAttempt.findFirst({
      where: { quizId: req.params.id as string, studentId: student.id },
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
      orderBy: { submittedAt: 'desc' },
    });
    res.json(attempt);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz status (e.g. End open quiz to COMPLETED)
router.patch('/:id/status', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const updated = await quizService.updateQuizStatus(req.params.id as string, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update quiz schedule
router.patch('/:id/schedule', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id as string },
    });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot schedule an ended quiz. Completed assessments cannot be rescheduled.' });
    }

    const { scheduledAt, status } = req.body;
    const dateVal = scheduledAt ? new Date(scheduledAt) : null;
    const updated = await quizService.updateQuizSchedule(req.params.id as string, dateVal, status);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete quiz
router.delete('/:id', authenticateJWT, requireRole(['FACULTY', 'ADMIN']), async (req, res) => {
  try {
    await quizService.deleteQuiz(req.params.id as string);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
