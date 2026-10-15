import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

// Knowledge Tracing profile for current authenticated student
router.get('/knowledge-tracing', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    let studentId = req.query.studentId as string | undefined;

    if (!studentId && req.user?.id) {
      try {
        const student = await prisma.student.findUnique({
          where: { userId: req.user.id },
        });
        if (student) {
          studentId = student.id;
        }
      } catch (e) {
        // DB unreachable
      }
    }

    if (!studentId) {
      studentId = 'stu001';
    }

    const data = await analyticsService.computeKnowledgeTracing(studentId);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Knowledge Tracing profile by explicit student ID
router.get('/knowledge-tracing/:studentId', authenticateJWT, async (req, res) => {
  try {
    const data = await analyticsService.computeKnowledgeTracing(req.params.studentId as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Recommended Practice questions for a topic (learning gap)
router.get('/practice/:topicId', authenticateJWT, async (req, res) => {
  try {
    const questions = await analyticsService.getRecommendedPracticeQuestions(
      req.params.topicId as string,
      parseInt(req.query.limit as string) || 5
    );
    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Student performance summary
router.get('/student/:id', authenticateJWT, async (req, res) => {
  try {
    const data = await analyticsService.getStudentPerformance(req.params.id as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Section-level analytics (Faculty / Admin)
router.get(
  '/section/:id',
  authenticateJWT,
  requireRole(['FACULTY', 'ADMIN']),
  async (req, res) => {
    try {
      const data = await analyticsService.getSectionAnalytics(req.params.id as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Learning gap analysis
router.get('/gaps/:studentId', authenticateJWT, async (req, res) => {
  try {
    const data = await analyticsService.getLearningGaps(req.params.studentId as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Section leaderboard
router.get('/leaderboard/:sectionId', authenticateJWT, async (req, res) => {
  try {
    const data = await analyticsService.getLeaderboard(req.params.sectionId as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
