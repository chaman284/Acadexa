import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Fetch notifications for currently logged-in user
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { role: req.user.role },
          { role: 'ALL' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications for user as read
router.put('/read-all', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: req.user.id },
          { role: req.user.role },
          { role: 'ALL' },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
