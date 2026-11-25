import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { visibleNotificationWhere } from '../services/notificationService';

const router = Router();

// Fetch notifications visible to the currently logged-in user
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const notifications = await prisma.notification.findMany({
      where: visibleNotificationWhere(req.user),
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark one of the current user's notifications as read
router.put('/:id/read', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: req.params.id as string,
        ...visibleNotificationWhere(req.user),
      },
      data: { isRead: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all of the current user's notifications as read
router.put('/read-all', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await prisma.notification.updateMany({
      where: {
        ...visibleNotificationWhere(req.user),
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete one of the current user's notifications
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await prisma.notification.deleteMany({
      where: {
        id: req.params.id as string,
        ...visibleNotificationWhere(req.user),
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
