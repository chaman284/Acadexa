import { Router } from 'express';
import { prisma } from '../prisma';
import { quizService } from '../services/quizService';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

const VIOLATION_TYPES = new Set([
  'TAB_SWITCH',
  'COPY',
  'CUT',
  'PASTE',
  'SELECT_ALL',
  'CONTEXT_MENU',
  'SELECT_START',
  'DRAG_START',
]);

const resolveStudentId = async (req: AuthRequest): Promise<string | null> => {
  if (!req.user) return null;
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id },
    select: { id: true },
  });
  return student?.id || null;
};

const findOwnedAttempt = async (attemptId: string, studentId: string) => {
  const attempt = await quizService.getAttemptIntegrity(attemptId);
  if (!attempt || attempt.studentId !== studentId) return null;
  return attempt;
};

// Start (or resume) a draft attempt when a formal exam is opened.
router.post('/', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found' });

    const quizId = String(req.body?.quizId || '');
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { status: true, scheduledAt: true },
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.status === 'COMPLETED') {
      return res.status(400).json({ message: 'This quiz is no longer accepting attempts.' });
    }
    if (quiz.scheduledAt && new Date(quiz.scheduledAt) > new Date()) {
      return res.status(400).json({ message: 'This quiz is not open yet.' });
    }

    const submitted = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "QuizAttempt"
      WHERE "quizId" = ${quizId} AND "studentId" = ${studentId} AND "isSubmitted" = true
      LIMIT 1
    `;
    if (submitted.length > 0) {
      return res.status(409).json({ message: 'You have already submitted this attempt.' });
    }

    const active = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "QuizAttempt"
      WHERE "quizId" = ${quizId} AND "studentId" = ${studentId} AND "isSubmitted" = false
      ORDER BY "startedAt" DESC
      LIMIT 1
    `;
    if (active.length > 0) {
      return res.json({ attemptId: active[0].id, resumed: true });
    }

    const attempt = await quizService.startAttempt({ quizId, studentId });
    return res.status(201).json({ attemptId: attempt.id, resumed: false });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Get current integrity state (used to restore the counter after a refresh).
router.get('/:id', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found' });

    const attempt = await findOwnedAttempt(String(req.params.id), studentId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const full = await prisma.quizAttempt.findUnique({
      where: { id: attempt.id },
      include: {
        answers: {
          include: { question: { include: { options: true, topic: true } } },
        },
        quiz: { include: { subject: true } },
      },
    });

    return res.json({
      ...full,
      tabSwitchCount: attempt.tabSwitchCount,
      autoSubmitted: attempt.autoSubmitted,
      autoSubmitReason: attempt.autoSubmitReason,
      isSubmitted: attempt.isSubmitted,
      violations: attempt.violations,
      answers: attempt.answerDrafts,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Save an answer immediately after selection. Rejected once the attempt is finalized.
router.post('/:id/answer', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found' });

    const attempt = await findOwnedAttempt(String(req.params.id), studentId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
    if (attempt.isSubmitted) {
      return res.status(409).json({ message: 'This attempt has already been submitted.' });
    }

    const questionId = String(req.body?.questionId || '');
    const response = req.body?.response;
    if (!questionId || !response || typeof response !== 'object') {
      return res.status(400).json({ message: 'questionId and response are required' });
    }

    const saved = await quizService.saveDraftAnswer({
      attemptId: attempt.id,
      questionId,
      response,
    });
    return res.json(saved);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Log a violation. Tab switches increment the counter and can auto-finalize;
// copy/paste-style attempts are logged only and never affect the counter.
router.post('/:id/violation', authenticateJWT, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const studentId = await resolveStudentId(req);
    if (!studentId) return res.status(404).json({ message: 'Student profile not found' });

    const attempt = await findOwnedAttempt(String(req.params.id), studentId);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    const type = String(req.body?.type || '');
    if (!VIOLATION_TYPES.has(type)) {
      return res.status(400).json({ message: 'Invalid violation type' });
    }

    const result = await quizService.recordViolation({
      attemptId: attempt.id,
      type: type as any,
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

export default router;
