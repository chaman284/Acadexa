import { Router } from 'express';
import { analyticsService } from '../services/analyticsService';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Faculty learning gaps breakdown across assigned classes
router.get(
  '/faculty/learning-gaps',
  authenticateJWT,
  requireRole(['FACULTY', 'ADMIN']),
  async (req: AuthRequest, res) => {
    try {
      const classId = req.query.classId as string | undefined;
      const data = await analyticsService.getFacultyLearningGaps(req.user!.id, classId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

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
