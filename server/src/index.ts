import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/error';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import quizzesRoutes from './routes/quizzes';
import questionsRoutes from './routes/questions';
import analyticsRoutes from './routes/analytics';
import chatbotRoutes from './routes/chatbot';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Acadexa API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Acadexa Backend running on http://localhost:${config.port}`);
});
