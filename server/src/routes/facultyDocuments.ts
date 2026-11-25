// ============================================================================
// FACULTY DOCUMENT ROUTES — extraction + Gemini MCQ generation
// Extracted units are returned to the client and sent back for generation.
// No document is permanently stored on the server.
// ============================================================================
import { Router, type RequestHandler } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { authenticateJWT, requireRole, type AuthRequest } from '../middleware/auth';
import { DocumentExtractionError, extractDocument, type DocumentUnit } from '../services/documentExtractor';
import { GenerationError, generateMCQs, type DocumentDifficulty } from '../services/questionGenerator';

const router = Router();
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_UNITS_PER_REQUEST = 50;
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const ALLOWED_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.ppt' || ext === '.doc') {
      cb(new Error('Legacy .ppt/.doc files are not supported. Please convert to PPTX/DOCX and upload again.'));
      return;
    }
    const expectedMime = ALLOWED_TYPES[ext];
    if (!expectedMime) {
      cb(new Error('Unsupported file format. Upload a PDF, PPTX, DOCX, or TXT file.'));
      return;
    }
    const mime = String(file.mimetype || '').toLowerCase();
    const mimeMatches = mime === expectedMime || (ext === '.txt' && mime === '');
    if (!mimeMatches) {
      cb(new Error('The file type does not match its extension. Please re-upload the document.'));
      return;
    }
    cb(null, true);
  },
});

/** Convert multer errors into the same friendly JSON shape as our routes. */
const uploadSingle: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, (error: any) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size exceeds the 15MB limit. Please upload a smaller document.',
      });
    }
    return res.status(400).json({ message: error.message || 'Invalid upload.' });
  });
};

const generationHits = new Map<string, number[]>();

const generationRateLimit: RequestHandler = (req: AuthRequest, res, next) => {
  const key = req.user?.id || 'anonymous';
  const now = Date.now();
  const recent = (generationHits.get(key) || []).filter(ts => now - ts < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      message: 'Generation limit reached. Try again in a moment.',
    });
  }
  recent.push(now);
  generationHits.set(key, recent);
  next();
};

router.use(authenticateJWT, requireRole(['FACULTY']));

// POST /api/faculty/documents/extract
router.post('/extract', uploadSingle, async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No document was uploaded. Use the "file" field.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase() || '.txt';
  const tempPath = path.join(os.tmpdir(), `acadexa-document-${randomUUID()}${ext}`);

  try {
    await writeFile(tempPath, req.file.buffer);
    const extracted = await extractDocument(tempPath, req.file.mimetype);

    return res.json({
      documentId: randomUUID(),
      fileName: req.file.originalname || extracted.fileName,
      totalUnits: extracted.totalUnits,
      wordCount: extracted.wordCount,
      units: extracted.units,
      preview: extracted.preview,
      warning: extracted.warning || null,
    });
  } catch (error: any) {
    if (error instanceof DocumentExtractionError) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Document extraction failed:', error);
    return res.status(500).json({ message: 'Document text could not be extracted. Please try another file.' });
  } finally {
    await unlink(tempPath).catch(() => undefined);
  }
});

// POST /api/faculty/documents/generate-questions
router.post('/generate-questions', generationRateLimit, async (req: AuthRequest, res) => {
  try {
    const rawUnits = Array.isArray(req.body?.units) ? req.body.units : [];
    const units: DocumentUnit[] = rawUnits
      .filter((unit: any) => unit && Number.isFinite(Number(unit.unitNumber)))
      .map((unit: any) => ({
        unitNumber: Number(unit.unitNumber),
        label: String(unit.label || `Page ${unit.unitNumber}`),
        text: String(unit.text || ''),
      }))
      .filter((unit: DocumentUnit) => unit.text.trim().length > 0);

    if (units.length === 0) {
      return res.status(400).json({ message: 'Select at least one page or slide to generate from.' });
    }
    if (units.length > MAX_UNITS_PER_REQUEST) {
      return res.status(400).json({
        message: `Please select ${MAX_UNITS_PER_REQUEST} pages or fewer per generation.`,
      });
    }

    const numQuestions = Number(req.body?.numQuestions);
    // 1 is only used internally by "regenerate this question"; the UI offers 5/10/15/20.
    if (![1, 5, 10, 15, 20].includes(numQuestions)) {
      return res.status(400).json({ message: 'Choose 5, 10, 15, or 20 questions.' });
    }

    const difficulty = String(req.body?.difficulty || 'mixed').toLowerCase() as DocumentDifficulty;
    if (!['easy', 'medium', 'hard', 'mixed'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty selection.' });
    }

    const rawSubtopic = req.body?.subtopic;
    const subtopic = rawSubtopic && typeof rawSubtopic === 'object'
      ? {
          id: rawSubtopic.id ? String(rawSubtopic.id) : undefined,
          name: rawSubtopic.name ? String(rawSubtopic.name) : undefined,
          topicId: rawSubtopic.topicId ? String(rawSubtopic.topicId) : undefined,
          topicName: rawSubtopic.topicName ? String(rawSubtopic.topicName) : undefined,
        }
      : undefined;

    const previousQuestions = Array.isArray(req.body?.previousQuestions)
      ? req.body.previousQuestions.map((q: unknown) => String(q || '')).filter(Boolean).slice(0, 25)
      : [];

    const questions = await generateMCQs({
      units,
      numQuestions,
      difficulty,
      subtopic,
      fileName: String(req.body?.fileName || 'Uploaded document'),
      previousQuestions,
    });

    return res.json({ questions });
  } catch (error: any) {
    if (error instanceof GenerationError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Document question generation failed:', error);
    return res.status(502).json({ message: 'Questions could not be generated. Please try again.' });
  }
});

export default router;
