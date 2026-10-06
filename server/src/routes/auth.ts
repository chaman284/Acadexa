import { Router } from 'express';
import { authService } from '../services/authService';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

router.post('/logout', (req, res) => {
  // Stateless JWT logout is handled on client by clearing the token
  res.json({ message: 'Logged out successfully' });
});

export default router;
