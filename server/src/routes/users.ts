import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Admin: list all users
router.get('/', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        student: {
          include: {
            section: true,
          },
        },
        faculty: true,
      },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create student account
router.post('/student', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { email, password, name, rollNo, sectionId } = req.body;
    const passwordHash = await bcrypt.hash(password || 'Acadexa@123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'STUDENT',
        student: {
          create: {
            rollNo,
            sectionId,
          },
        },
      },
      include: {
        student: true,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Create faculty account
router.post('/faculty', authenticateJWT, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const passwordHash = await bcrypt.hash(password || 'Acadexa@123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'FACULTY',
        faculty: {
          create: {},
        },
      },
      include: {
        faculty: true,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update profile
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: {
        ...(name ? { name } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
    });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
