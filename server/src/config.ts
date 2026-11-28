import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  // Optional: when set, the tutor may mention this model in its meta answer.
  modelName: process.env.MODEL_NAME || '',
  tutorDebug: process.env.TUTOR_DEBUG === 'true',
  // Relative to the best rerank score; below this, chunks are treated as not found.
  tutorRelevanceThreshold: Number(process.env.TUTOR_RELEVANCE_THRESHOLD || '0.35'),
  tutorMaxChunks: Number(process.env.TUTOR_MAX_CHUNKS || '3'),
  // Daily skill-gap digest. Defaults to 08:00 Asia/Kolkata.
  skillGapDigestEnabled: process.env.SKILL_GAP_DIGEST_ENABLED !== 'false',
  skillGapDigestHour: Math.min(23, Math.max(0, Number(process.env.SKILL_GAP_DIGEST_HOUR || '8'))),
  skillGapDigestMinute: Math.min(59, Math.max(0, Number(process.env.SKILL_GAP_DIGEST_MINUTE || '0'))),
  skillGapDigestTimeZone: process.env.SKILL_GAP_DIGEST_TIMEZONE || 'Asia/Kolkata',
};
