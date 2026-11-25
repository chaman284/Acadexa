// ============================================================================
// GEMINI MCQ GENERATOR — provider-swappable document question generation
// Only this file talks to the model. Validation and chunking happen here too.
// ============================================================================
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { config } from '../config';
import type { DocumentUnit } from './documentExtractor';

// Keep this constant easy to swap. The project key currently serves 3.5-flash-lite;
// 2.5-flash can be selected by setting GEMINI_DOCUMENT_MODEL.
const DOCUMENT_GEMINI_MODEL = process.env.GEMINI_DOCUMENT_MODEL || 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = Array.from(
  new Set([DOCUMENT_GEMINI_MODEL, config.geminiModel, 'gemini-3.5-flash'])
);
const WORDS_PER_CHUNK = 7000;
const REQUEST_TIMEOUT_MS = 45_000;

export type DocumentDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type GeneratedDifficulty = 'easy' | 'medium' | 'hard';

export interface GenerationSubtopic {
  id?: string;
  name?: string;
  topicId?: string;
  topicName?: string;
}

export interface GenerateMCQsInput {
  units: DocumentUnit[];
  numQuestions: number;
  difficulty: DocumentDifficulty;
  subtopic?: GenerationSubtopic;
  fileName: string;
  /** Used by "regenerate this question" so the provider avoids repeating it. */
  previousQuestions?: string[];
}

export interface GeneratedMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: GeneratedDifficulty;
  sourcePage: number;
  sourceSnippet: string;
}

export class GenerationError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = 'GenerationError';
    this.status = status;
  }
}

interface TextChunk {
  label: string;
  unitNumber: number;
  words: number;
  text: string;
}

const SYSTEM_INSTRUCTIONS = `You generate university-level multiple-choice questions for an instructor.
STRICT RULES:
1. Generate ONLY multiple-choice questions with exactly 4 options and exactly 1 correct answer.
2. Base every question strictly on the provided document text. Do not use outside knowledge.
3. Every question must include: question, options (array of 4 strings), correctIndex (0-3), explanation (one or two lines), difficulty (easy/medium/hard), sourcePage (the unit number from the marker), and sourceSnippet (a short supporting phrase copied from the text).
4. Distractors must be plausible. Never use "All of the above" or "None of the above".
5. Do not repeat questions.
6. Match the requested difficulty mix.
7. Return ONLY valid JSON matching the requested schema. No markdown, no commentary.`;

const RESPONSE_SCHEMA: any = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          correctIndex: { type: SchemaType.INTEGER },
          explanation: { type: SchemaType.STRING },
          difficulty: { type: SchemaType.STRING },
          sourcePage: { type: SchemaType.INTEGER },
          sourceSnippet: { type: SchemaType.STRING },
        },
        required: [
          'question',
          'options',
          'correctIndex',
          'explanation',
          'difficulty',
          'sourcePage',
          'sourceSnippet',
        ],
      },
    },
  },
  required: ['questions'],
};

const splitWords = (text: string): string[] => text.split(/\s+/).filter(Boolean);

function chunkUnits(units: DocumentUnit[]): TextChunk[] {
  const chunks: TextChunk[] = [];
  for (const unit of units) {
    const words = splitWords(unit.text);
    if (words.length === 0) continue;
    for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
      const piece = words.slice(i, i + WORDS_PER_CHUNK);
      chunks.push({
        label: unit.label,
        unitNumber: unit.unitNumber,
        words: piece.length,
        text: piece.join(' '),
      });
    }
  }
  return chunks;
}

function allocateCounts(chunks: TextChunk[], numQuestions: number): Map<number, number> {
  const allocation = new Map<number, number>();
  if (chunks.length === 0) return allocation;

  if (chunks.length > numQuestions) {
    // Keep the densest chunks when the faculty asks for fewer questions than chunks.
    chunks
      .map((chunk, index) => ({ chunk, index }))
      .sort((a, b) => b.chunk.words - a.chunk.words)
      .slice(0, numQuestions)
      .forEach(({ index }) => allocation.set(index, 1));
    return allocation;
  }

  const totalWords = chunks.reduce((sum, chunk) => sum + chunk.words, 0) || 1;
  chunks.forEach((chunk, index) => {
    allocation.set(index, Math.max(1, Math.floor((numQuestions * chunk.words) / totalWords)));
  });

  let allocated = Array.from(allocation.values()).reduce((sum, n) => sum + n, 0);
  while (allocated < numQuestions) {
    const index = chunks
      .map((_, i) => i)
      .sort((a, b) => allocation.get(b)! - allocation.get(a)!)[0];
    allocation.set(index, allocation.get(index)! + 1);
    allocated++;
  }
  while (allocated > numQuestions) {
    const index = chunks
      .map((_, i) => i)
      .sort((a, b) => allocation.get(a)! - allocation.get(b)!)
      .find(i => allocation.get(i)! > 1);
    if (index === undefined) break;
    allocation.set(index, allocation.get(index)! - 1);
    allocated--;
  }
  return allocation;
}

const normalizeDifficulty = (value: unknown): GeneratedDifficulty => {
  const v = String(value || '').toLowerCase();
  return v === 'easy' || v === 'hard' ? v : 'medium';
};

const duplicateKey = (question: string): string =>
  question.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 140);

function validateItems(
  raw: unknown,
  fallback: TextChunk,
  seenKeys: Set<string>
): GeneratedMCQ[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.questions)
      ? (raw as any).questions
      : [];
  const accepted: GeneratedMCQ[] = [];

  for (const item of list) {
    const question = String((item as any)?.question || '').trim();
    const options: string[] = Array.isArray((item as any)?.options)
      ? (item as any).options.map((opt: unknown) =>
          String(typeof opt === 'string' ? opt : (opt as any)?.text || '').trim()
        )
      : [];
    const correctIndex = Number((item as any)?.correctIndex);

    if (!question || options.length !== 4 || options.some(o => !o)) continue;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) continue;
    if (options.some(o => /^(all|none) of the above[.!]?$/i.test(o))) continue;

    const key = duplicateKey(question);
    if (!key || seenKeys.has(key)) continue;
    seenKeys.add(key);

    const sourcePage = Number((item as any)?.sourcePage);
    const sourceSnippet = String((item as any)?.sourceSnippet || '').trim();
    // Provenance is required so faculty can verify every question against the source.
    if (!sourceSnippet) continue;

    accepted.push({
      id: `doc_mcq_${Date.now()}_${accepted.length}_${Math.random().toString(36).slice(2, 7)}`,
      question,
      options,
      correctIndex,
      explanation: String((item as any)?.explanation || '').trim(),
      difficulty: normalizeDifficulty((item as any)?.difficulty),
      sourcePage: Number.isInteger(sourcePage) && sourcePage > 0 ? sourcePage : fallback.unitNumber,
      sourceSnippet,
    });
  }
  return accepted;
}

function friendlyProviderError(error: any): GenerationError {
  const status = Number(error?.status || error?.response?.status || 0);
  const message = String(error?.message || '');
  if (status === 429 || /429|quota|resource_exhausted/i.test(message)) {
    return new GenerationError('Try again in a moment.', 429);
  }
  if (status === 401 || status === 403 || /api[_ -]?key|unauthorized|permission/i.test(message)) {
    return new GenerationError(
      'AI generation is not configured correctly. Please contact support.',
      503
    );
  }
  if (status === 404 || /not found|model/i.test(message)) {
    return new GenerationError('The configured AI model is unavailable.', 503);
  }
  if (/timeout|timed out|aborted/i.test(message)) {
    return new GenerationError('The request timed out. Please try again.', 504);
  }
  return new GenerationError('The AI service is temporarily unavailable. Please try again.', 502);
}

async function callGemini(
  apiKey: string,
  modelName: string,
  prompt: string
): Promise<unknown> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new GenerationError('The request timed out. Please try again.', 504)),
      REQUEST_TIMEOUT_MS
    );
  });

  try {
    const result = await Promise.race([model.generateContent(prompt), timeout]);
    const response = (result as any)?.response;
    const finishReason = response?.candidates?.[0]?.finishReason;
    if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
      throw new GenerationError('The AI blocked this response. Try a smaller selection.', 502);
    }
    const text = response?.text?.() || '';
    if (!String(text).trim()) {
      throw new GenerationError('The AI returned an empty response. Please try again.', 502);
    }
    try {
      return JSON.parse(String(text).replace(/^```json/i, '').replace(/```$/, '').trim());
    } catch {
      throw new GenerationError('The AI returned an invalid response. Please try again.', 502);
    }
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

async function requestBatch(
  apiKey: string,
  chunk: TextChunk,
  count: number,
  input: GenerateMCQsInput,
  retry: boolean
): Promise<unknown> {
  const topicLine = input.subtopic?.name
    ? `Curriculum tag: ${input.subtopic.name}${
        input.subtopic.topicName ? ` (${input.subtopic.topicName})` : ''
      }`
    : 'Curriculum tag: (not selected)';
  const previous = retry && input.previousQuestions?.length
    ? `Avoid repeating these questions:\n${input.previousQuestions
        .map(q => `- ${q}`)
        .join('\n')}\n`
    : '';

  const prompt = `${SYSTEM_INSTRUCTIONS}

Source document: ${input.fileName}
${topicLine}
Requested difficulty mix: ${input.difficulty}
Generate exactly ${count} question(s) from the text below.
${previous}
Document text:
[${chunk.label}]
${chunk.text}`;

  let lastError: any;
  for (const modelName of FALLBACK_MODELS) {
    try {
      return await callGemini(apiKey, modelName, prompt);
    } catch (error: any) {
      // A slow/unavailable model should not block the whole request; try the next one.
      lastError = error;
      const status = Number(error?.status || error?.response?.status || 0);
      if (status === 429 || /429|quota|resource_exhausted/i.test(String(error?.message || ''))) {
        throw friendlyProviderError(error);
      }
    }
  }
  throw friendlyProviderError(lastError);
}

/**
 * Generate validated MCQs from selected document units.
 * Long selections are split into ~7,000-word chunks; requests never exceed that size.
 */
export async function generateMCQs(input: GenerateMCQsInput): Promise<GeneratedMCQ[]> {
  if (!config.geminiApiKey) {
    throw new GenerationError(
      'AI generation is not configured. Please contact support.',
      503
    );
  }

  const chunks = chunkUnits(input.units);
  if (chunks.length === 0) {
    throw new GenerationError('No usable text was selected for generation.', 400);
  }

  const allocation = allocateCounts(chunks, input.numQuestions);
  const seenKeys = new Set<string>();
  const questions: GeneratedMCQ[] = [];

  for (let index = 0; index < chunks.length; index++) {
    const count = allocation.get(index);
    if (!count) continue;
    const raw = await requestBatch(config.geminiApiKey, chunks[index], count, input, false);
    questions.push(...validateItems(raw, chunks[index], seenKeys));
  }

  // One retry for the remainder, with the already-generated questions excluded.
  if (questions.length < input.numQuestions) {
    const missing = input.numQuestions - questions.length;
    const densest = chunks.slice().sort((a, b) => b.words - a.words)[0];
    const raw = await requestBatch(
      config.geminiApiKey,
      densest,
      missing,
      { ...input, previousQuestions: questions.map(q => q.question) },
      true
    );
    questions.push(...validateItems(raw, densest, seenKeys));
  }

  if (questions.length === 0) {
    throw new GenerationError('No valid questions could be generated. Try a different selection.', 502);
  }
  return questions.slice(0, input.numQuestions);
}
