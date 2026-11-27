// Embedding helpers. Gemini text-embedding-004 when a key is available,
// with a deterministic local hashing embedding so local-only tests and
// offline deployments still have a working vector signal.

import { config } from '../config';
import { normalize } from './textUtils';

const DIMENSIONS = 128;

/** Deterministic hashing-trick embedding (bag of words + bigrams). */
export function localEmbedding(text: string, dimensions = DIMENSIONS): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const words = normalize(text).split(' ').filter(Boolean);
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) tokens.push(`${words[i]}_${words[i + 1]}`);

  for (const token of tokens) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    vector[(hash >>> 0) % dimensions] += 1;
  }

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map(value => Number((value / norm).toFixed(6)));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

/** Embed a batch of texts. Falls back to local hashing on any failure. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (!config.geminiApiKey || process.env.TUTOR_USE_GEMINI_EMBEDDINGS === 'false') {
    return texts.map(text => localEmbedding(text));
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: texts.map(text => ({
            model: 'models/text-embedding-004',
            content: { parts: [{ text }] },
          })),
        }),
      }
    );
    if (!response.ok) throw new Error(`Embedding API ${response.status}`);
    const data = await response.json() as { embeddings?: { values?: number[] }[] };
    const values = data.embeddings?.map(item => item.values || []);
    if (!values || values.length !== texts.length || values.some(v => v.length === 0)) {
      throw new Error('Incomplete embedding response');
    }
    return values;
  } catch (error) {
    if (process.env.TUTOR_DEBUG === 'true') {
      console.warn('[tutor] Gemini embeddings unavailable, using local embeddings:', (error as Error).message);
    }
    return texts.map(text => localEmbedding(text));
  }
}
