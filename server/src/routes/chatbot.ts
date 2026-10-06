import { Router } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();

router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if GEMINI_API_KEY is configured
    if (!config.geminiApiKey) {
      // Return a smart fallback if API key isn't configured yet
      return res.json({
        reply: `Hello ${req.user?.name || 'there'}! I am your Acadexa AI Study Tutor. (Note: To enable live Gemini responses, please set GEMINI_API_KEY in server/.env). How can I assist you with your coursework today?`,
      });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            ...(history || []).map((h: { sender: string; text: string }) => ({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            })),
            {
              role: 'user',
              parts: [
                {
                  text: `You are Acadexa AI Tutor, an intelligent, encouraging academic assistant helping university students learn concepts and prepare for quizzes. Keep answers structured, insightful, and pedagogical.\n\nStudent asks: ${message}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I could not generate a response at this moment.";

    res.json({ reply: replyText });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
