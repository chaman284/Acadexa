// Shared text normalisation for retrieval, embeddings and the answer engine.

export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'to', 'in', 'on', 'at', 'by', 'with', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'it', 'its', 'this', 'that', 'these', 'those',
  'what', 'which', 'when', 'where', 'who', 'whom', 'why', 'how', 'can', 'could', 'should',
  'would', 'will', 'do', 'does', 'did', 'have', 'has', 'had', 'you', 'your', 'me', 'my',
  'tell', 'give', 'show', 'please', 'about', 'into', 'some', 'any', 'more', 'one', 'two',
  'three', 'me', 'us', 'get', 'got', 'want', 'need', 'know', 'mean', 'means', 'said',
]);

/** Lowercase, strip punctuation, and normalise British/American spellings. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/colour/g, 'color')
    .replace(/analys/g, 'analyz')
    .replace(/recognise/g, 'recognize')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

export function wordMatch(token: string, word: string): boolean {
  return token === word || token === `${word}s` || word === `${token}s`;
}

export function sentenceCount(text: string): number {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(part => part.trim())
    .filter(Boolean).length;
}
