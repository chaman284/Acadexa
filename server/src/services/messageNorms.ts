// Chat-facing normalisation for short replies and typo-tolerant intent lists.
// Retrieval still uses textUtils.normalize(); this module only makes casual
// messages such as "wht data u r trained on?" or "goof" match their intents.

const CHAT_SLANG: Record<string, string> = {
  u: 'you',
  r: 'are',
  ur: 'your',
  wht: 'what',
  wat: 'what',
  wut: 'what',
  gud: 'good',
  goof: 'good',
  plz: 'please',
  k: 'ok',
  kk: 'ok',
  okk: 'ok',
  yess: 'yes',
  ya: 'ya',
  hmm: 'hmm',
};

/** Lowercase, strip punctuation and collapse repeated letters in short replies. */
export function normalizeChatMessage(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\bno{2,}\b/g, 'no')
    .replace(/\bha{3,}\b/g, 'haa')
    .replace(/\bye+s+\b/g, 'yes')
    .replace(/\bok{2,}\b/g, 'ok');

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(word => CHAT_SLANG[word] || word)
    .join(' ');
}

/** Levenshtein distance, with an early exit once `maxDistance` is exceeded. */
export function editDistance(a: string, b: string, maxDistance = Number.MAX_SAFE_INTEGER): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowBest = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowBest = Math.min(rowBest, current[j]);
    }
    if (rowBest > maxDistance) return maxDistance + 1;
    previous = current;
  }
  return previous[b.length];
}

function tokenCost(a: string, b: string): number {
  if (a === b) return 0;
  // A one-letter typo is cheap; anything bigger costs two edits so unrelated
  // short words ("good" vs "morning") cannot accidentally match.
  return editDistance(a, b, 1) <= 1 ? 1 : 2;
}

/**
 * Fuzzy phrase match. `maxDistance` counts token insertions/deletions and
 * one-letter typos, so "hu r u" matches "who are you" and "goof" matches
 * "good" without turning every short question into an acknowledgement.
 */
export function fuzzyPhraseMatch(text: string, phrases: string[], maxDistance = 1): boolean {
  const words = normalizeChatMessage(text).split(' ').filter(Boolean);
  if (words.length === 0) return false;

  return phrases.some(phrase => {
    const target = normalizeChatMessage(phrase).split(' ').filter(Boolean);
    if (target.length === 0) return false;
    // Multi-word phrases must have the same word count. Otherwise "ok"
    // matches "ok cool" by deletion and is stolen from the affirmative path.
    // Typos are still handled by tokenCost() inside each aligned word.
    if (words.length !== target.length) return false;

    let previous = Array.from({ length: target.length + 1 }, (_, index) => index);
    for (let i = 1; i <= words.length; i++) {
      const current = [i];
      for (let j = 1; j <= target.length; j++) {
        current[j] = Math.min(
          previous[j] + 1,
          current[j - 1] + 1,
          previous[j - 1] + tokenCost(words[i - 1], target[j - 1])
        );
      }
      if (Math.min(...current) > maxDistance) return false;
      previous = current;
    }
    return previous[target.length] <= maxDistance;
  });
}
