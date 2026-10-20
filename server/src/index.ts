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
import adminRoutes from './routes/admin';
import notificationsRoutes from './routes/notifications';
import coursesRoutes from './routes/courses';
import sectionsRoutes from './routes/sections';
import skillGapRoutes from './routes/skillGaps';
import deptRoutes from './routes/dept';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

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
app.use('/api/skill-gaps', skillGapRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/dept', deptRoutes);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Acadexa Backend running on http://localhost:${config.port}`);
});
