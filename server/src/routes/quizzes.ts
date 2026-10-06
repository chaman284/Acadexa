import { Router } from 'express';
import { quizService } from '../services/quizService';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

// List quizzes (filtered by user section for students or query params for faculty)
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    let sectionId = req.query.sectionId as string | undefined;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
      });
      if (student) {
        sectionId = student.sectionId;
      }
    }

    const quizzes = await quizService.getQuizzes({
      sectionId,
      subjectId: req.query.subjectId as string,
      status: req.query.status as string,
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

// Get results of a quiz
router.get('/:id/results', authenticateJWT, async (req, res) => {
  try {
    const results = await quizService.getQuizResults(req.params.id as string);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
