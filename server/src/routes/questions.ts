import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Browse question bank
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { topicId, difficulty, type } = req.query;

    const questions = await prisma.question.findMany({
      where: {
        ...(topicId ? { topicId: topicId as string } : {}),
        ...(difficulty ? { difficulty: difficulty as any } : {}),
        ...(type ? { type: type as any } : {}),
      },
      include: {
        options: true,
        topic: true,
      },
      orderBy: { id: 'desc' },
    });

    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Faculty: add question
router.post(
  '/',
  authenticateJWT,
  requireRole(['FACULTY', 'ADMIN']),
  async (req, res) => {
    try {
      const { text, type, difficulty, topicId, options } = req.body;

      const question = await prisma.question.create({
        data: {
          text,
          type: type || 'MCQ',
          difficulty: difficulty || 'MEDIUM',
          topicId,
          options: {
            create: options.map((opt: { text: string; isCorrect: boolean }) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
            })),
          },
        },
        include: {
          options: true,
          topic: true,
        },
      });

      res.status(201).json(question);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Faculty: edit question
router.put(
  '/:id',
  authenticateJWT,
  requireRole(['FACULTY', 'ADMIN']),
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const { text, type, difficulty, topicId, options } = req.body;

      // Update question text and metadata
      await prisma.question.update({
        where: { id },
        data: {
          text,
          type,
          difficulty,
          topicId,
        },
      });

      // If options are provided, recreate them
      if (options && Array.isArray(options)) {
        await prisma.option.deleteMany({
          where: { questionId: id },
        });

        await prisma.option.createMany({
          data: options.map((opt: { text: string; isCorrect: boolean }) => ({
            questionId: id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })),
        });
      }

      const updated = await prisma.question.findUnique({
        where: { id },
        include: { options: true, topic: true },
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Faculty: delete question
router.delete(
  '/:id',
  authenticateJWT,
  requireRole(['FACULTY', 'ADMIN']),
  async (req, res) => {
    try {
      const id = req.params.id as string;
      await prisma.option.deleteMany({
        where: { questionId: id },
      });
      await prisma.question.delete({
        where: { id },
      });

      res.json({ message: 'Question deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
