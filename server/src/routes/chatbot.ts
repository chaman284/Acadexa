import { Router } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { chatbotService } from '../services/chatbot';

const router = Router();

/**
 * POST /api/chatbot
 * Primary endpoint for Nexus RAG Department AI Assistant
 */
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const result = await chatbotService.askNexus(message, history || [], req.user?.name);

    res.json({
      reply: result.reply,
      contextSources: result.contextSources,
    });
  } catch (error: any) {
    console.error('Nexus Chatbot Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error in Nexus assistant' });
  }
});

/**
 * POST /api/chatbot/nexus
 * Alias dedicated specifically to Nexus Department Assistant
 */
router.post('/nexus', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const result = await chatbotService.askNexus(message, history || [], req.user?.name);

    res.json({
      reply: result.reply,
      contextSources: result.contextSources,
    });
  } catch (error: any) {
    console.error('Nexus Chatbot Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error in Nexus assistant' });
  }
});

/**
 * GET /api/chatbot/context?query=...
 * Inspect retrieved RAG context for verification & debugging
 */
router.get('/context', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const query = (req.query.query as string) || '';
    const ragData = await chatbotService.retrieveContext(query);
    res.json(ragData);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
