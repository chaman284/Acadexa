// ============================================
// TUTOR RETRIEVAL PIPELINE
// query rewrite -> intent -> alias/entity detection -> BM25 + embeddings
// (RRF) -> metadata/exact boosts -> rerank -> threshold -> 1-3 chunks.
// ============================================

import { config } from '../config';
import { cosineSimilarity, embedTexts, localEmbedding } from './embeddings';
import {
  loadChunksFromDatabase,
  loadChunksFromJson,
  loadEmbeddingsFromJson,
} from './chunkStore';
import { normalize, tokenize } from './textUtils';
import { fuzzyPhraseMatch, normalizeChatMessage } from './messageNorms';
import {
  canonicalConcept,
  isBareTopicName,
  isTopicSwitch,
  resolveTopicFromMessage,
  topicConcept,
  topicLabel,
} from './topicMetadata';
import type {
  ChatMessageItem,
  ChunkType,
  Intent,
  PendingOffer,
  RankedChunk,
  RetrievalDebug,
  RetrievalResult,
  TutorChunk,
  TutorState,
} from './tutorTypes';

export type { Intent, TutorChunk } from './tutorTypes';

// Keep older imports working while tests move to the new intent names.
export type QuestionIntent = Intent;

interface ConceptHit {
  concept: string;
  chunk: TutorChunk;
  priority: number;
}

export interface RewriteResult {
  question: string;
  followup: boolean;
  closing: boolean;
  declined: boolean;
  focus_concept: string;
  offer?: Exclude<PendingOffer, null>;
  topic_switch?: boolean;
  target_topic_id?: string | null;
  /** Set for intents that must bypass normal follow-up classification. */
  intent?: Intent;
}

const CLOSING_RE = /^(?:no+|nope|no thanks|not now|later|that's all|that is all|nothing else|bye|goodbye)\b/i;
const DECLINE_RE = /^(?:no+|nope|no thanks|not now|later|that's all|that is all|nothing else|bye|goodbye)\b/i;
const FILLER_WORDS = new Set(['bro', 'da', 'pls', 'please', 'hey', 'hi']);
const AFFIRMATIVE_RE = /\b(?:yes|yeah|yep|yup|ya|haa|haan|ha|hmm\s+yes|ok|okay|k|kk|sure|go on|do it|continue|next|alright|fine)\b/i;
const REQUEST_RE = /\b(?:send|show|give|go on|do it|continue|next)\b/i;
const SHORT_REPLY_RE = /^(yes|yeah|yep|yup|ya|haa|haan|ha|hmm\s+yes|ok|okay|k|kk|sure|go on|do it|continue|next|please|alright|fine|more|explain more|tell me more|go deeper|example|an example|give example|give an example|show example|send example|numerical|a numerical|give a numerical|solve|calculate|why|why not|formula|the formula|give formula|give the formula)\s*[?.!]*$/i;
const GENERIC_WORDS = new Set(['formula', 'example', 'numerical', 'question', 'topic', 'notes', 'this', 'that']);

// Questions about the tutor itself are answered from a fixed template, never
// from retrieval. Both normal wording and common typed-short forms are listed.
const META_PHRASES = [
  'what data are you trained on',
  'what data you are trained on',
  'what were you trained on',
  'what training data do you use',
  'where do your answers come from',
  'who are you',
  'who made you',
  'who built you',
  'what are you',
  'tell me about yourself',
  'which model',
  'which model are you',
  'what model are you',
  'what can you do',
  'how do you work',
  'how does this tutor work',
  'are you chatgpt',
  'are you chat gpt',
  'are you an ai',
  'can you see my notes',
  'can you read my notes',
  'do you use my notes',
  'what notes do you use',
];

const ACK_PHRASES = [
  'good', 'goof', 'gud', 'nice', 'great', 'cool', 'awesome', 'super',
  'thanks', 'thank you', 'ok cool', 'got it', 'everything okay',
];

const CLARIFICATION_PHRASES = [
  'what', 'huh', 'sorry', 'come again', 'say again', 'what was that',
];

/** META outranks even an open pending offer. */
function isMetaQuestion(text: string): boolean {
  return fuzzyPhraseMatch(text, META_PHRASES, 2);
}

/** Negative/close replies outrank acknowledgements ("thanks" closes the offer). */
function isAcknowledgement(text: string): boolean {
  return fuzzyPhraseMatch(text, ACK_PHRASES, 1);
}

function isClarification(text: string): boolean {
  return fuzzyPhraseMatch(text, CLARIFICATION_PHRASES, 1);
}
const NON_CONCEPT_TOKENS = new Set(['formula', 'formulas', 'law', 'laws', 'equation', 'equations', 'expression', 'expressions', 'derive', 'state', 'write', 'give', 'show', 'explain', 'describe', 'tell', 'about', 'find', 'calculate', 'solve', 'numerical']);

/** Remove conversational filler before intent detection or retrieval. */
function stripFillers(text: string): string {
  return text
    .replace(/\b(?:bro|da|pls|please|hey|hi)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsOf(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s']/g, ' ').split(/\s+/).filter(Boolean);
}

/** A short yes/send-style reply that belongs to the pending offer. */
function hasOfferSignal(text: string): boolean {
  const normalized = normalizeChatMessage(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 6 &&
    (AFFIRMATIVE_RE.test(normalized) || REQUEST_RE.test(normalized));
}

/** If the reply names an offer explicitly, it beats the generic pending one. */
function requestedOffer(text: string): Exclude<PendingOffer, null> | null {
  const q = text.toLowerCase();
  if (/\b(numerical|worked example|calculate|solve|matrix)\b/.test(q) || /\d+\s*[x×]\s*\d+/.test(q)) return 'numerical';
  if (/\bexample\b/.test(q)) return 'example';
  if (/\b(formula|equation)\b/.test(q)) return 'formula';
  if (/\b(quiz|mcq|test me|practice question)\b/.test(q)) return 'quiz';
  if (/\b(comparison|compare|difference|versus|vs)\b/.test(q)) return 'comparison';
  return null;
}

function offerQuestion(offer: Exclude<PendingOffer, null>, concept: string): string {
  const subject = concept || 'this topic';
  switch (offer) {
    case 'numerical': return `Give a numerical example on ${subject}.`;
    case 'formula': return `Give the formula for ${subject}.`;
    case 'comparison': return `Compare ${subject} with the related concept from the previous answer.`;
    case 'quiz': return `Give me a quiz on ${subject}.`;
    case 'exam_question': return `Give an exam-style question on ${subject}.`;
    case 'example':
    default: return `Give an example of ${subject}.`;
  }
}

/** Rule-based intent classification. Query rewrite runs before this. */
export function classifyIntent(query: string): Intent {
  const q = normalize(query);
  const chat = normalizeChatMessage(query);
  if (!q) return 'chitchat';

  // Priority: meta -> topic switch -> close -> clarification -> ack -> normal.
  if (isMetaQuestion(chat)) return 'meta';
  if (/^(?:switch to|change to)\b|\b(?:other|another|different|next)\s+topic\b|\bsomething else\b|\bchange topic\b|\bswitch topic\b/.test(q)) return 'topic_switch';
  if (CLOSING_RE.test(chat)) return 'chitchat';
  if (isClarification(chat)) return 'clarification';
  if (isAcknowledgement(chat)) return 'acknowledgement';

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|how are you|help)\b/.test(q)) return 'chitchat';
  if (/capital of|weather|cricket|football|recipe|prime minister|president of|movie|song|stock price/.test(q)) return 'out_of_scope';
  if (/mcq|multiple choice|\bquiz\b|test me|practice question|sample question|objective question/.test(q)) return 'mcq_quiz';
  if (/common mistake|misconception|mistake|confusion/.test(q)) return 'common_mistakes';
  if (/formula|equation|expression|derive|state weber|weber law|michelson contrast formula|write the formula/.test(q)) return 'formula';
  if (/numerical|calculate|compute|solve|storage (?:of|for)\s*\d|\d+\s*[x×]\s*\d+[^.]{0,40}\b(?:bits?|bpp)\b|how many bits|find the value|step by step/.test(q)) return 'numerical';
  if (/\bexample\b|worked example|show me an/.test(q)) return 'example';
  if (/difference between|differentiate|compare|versus|\bvs\b|and cmos/.test(q)) return 'difference';
  if (/exam|important point|question paper|marks?\b/.test(q)) return 'exam_question';
  if (/advantage|disadvantage|pros|cons|benefits|limitations/.test(q)) return 'advantages';
  if (/application|used in|where is .* used|real life use|uses of/.test(q)) return 'application';
  if (/^what is|^what are|^define|^definition|meaning of|^which|^who is|^state /.test(q)) return 'definition';
  if (/explain|describe|why |how |list |types |methods |process|tell me about/.test(q)) return 'explanation';
  return 'definition';
}

/** Pull a short concept phrase out of a previous standalone question. */
function conceptFromQuestion(question: string): string {
  const cleaned = question
    .trim()
    .replace(/^(what is|what are|define|explain|describe|tell me about|give|state)\s+/i, '')
    .replace(/^(an?|the)\s+/i, '')
    .replace(/[?.!]+$/, '')
    .trim();
  return cleaned || '';
}

function lastUserQuestion(history: ChatMessageItem[]): string {
  for (let i = history.length - 1; i >= 0; i--) {
    const text = history[i].text.trim();
    if (history[i].sender === 'user' && !SHORT_REPLY_RE.test(text) && !hasOfferSignal(stripFillers(text))) {
      return text;
    }
  }
  return '';
}

/** Follow-ups use only the CURRENT state, never an older history concept. */
function focusForRewrite(state: TutorState, chunks: TutorChunk[]): string {
  return canonicalConcept(state.last_concept || '', chunks);
}

/** Rewrite short replies as standalone questions using current state only. */
export function rewriteQuery(
  message: string,
  history: ChatMessageItem[] = [],
  state: TutorState = {},
  chunks: TutorChunk[] = []
): RewriteResult {
  const trimmed = message.trim();
  const cleaned = stripFillers(trimmed) || trimmed;
  const chat = normalizeChatMessage(cleaned);
  const focus = focusForRewrite(state, chunks);

  // Meta questions are checked before follow-ups, so an open offer cannot
  // swallow "who are you?" or "wht data u r trained on?".
  if (isMetaQuestion(chat)) {
    return {
      question: trimmed,
      followup: false,
      closing: false,
      declined: false,
      focus_concept: '',
      intent: 'meta',
    };
  }

  // A topic switch closes the current offer before any yes/no or offer logic.
  // A bare topic name ("image acquisition") switches too; a real question
  // about that topic ("what is image acquisition?") does not.
  if (isTopicSwitch(chat) || isBareTopicName(cleaned, chunks)) {
    const target = resolveTopicFromMessage(cleaned, chunks);
    return {
      question: target ? `Switch to ${topicConcept(target, chunks)}.` : 'Switch to another topic.',
      followup: true,
      closing: false,
      declined: DECLINE_RE.test(chat),
      focus_concept: '',
      topic_switch: true,
      target_topic_id: target,
    };
  }

  if (CLOSING_RE.test(chat)) {
    return {
      question: cleaned,
      followup: true,
      closing: true,
      declined: DECLINE_RE.test(chat),
      focus_concept: focus,
    };
  }

  if (isClarification(chat)) {
    return {
      question: cleaned,
      followup: false,
      closing: false,
      declined: false,
      focus_concept: '',
      intent: 'clarification',
    };
  }

  if (isAcknowledgement(chat)) {
    return {
      question: cleaned,
      followup: false,
      closing: false,
      declined: false,
      focus_concept: '',
      intent: 'acknowledgement',
    };
  }

  // Resolve an accepted offer BEFORE retrieval. Searching for "yes bro send"
  // cannot work; the pending state already tells us what was offered.
  if (state.pending_offer && hasOfferSignal(chat)) {
    const offer = requestedOffer(chat) || state.pending_offer;
    return {
      question: offerQuestion(offer, focus || state.last_topic_id || 'this topic'),
      followup: true,
      closing: false,
      declined: false,
      focus_concept: focus,
      offer,
    };
  }

  const andMatch = cleaned.match(/^and\s+([a-z0-9][a-z0-9\s-]{1,50})\??$/i);
  if (andMatch) {
    const concept = andMatch[1].trim();
    const previous = focus;
    return {
      question: previous ? `What is ${concept} (compare with ${previous})?` : `What is ${concept}?`,
      followup: true,
      closing: false,
      declined: false,
      focus_concept: focus,
    };
  }

  if (!SHORT_REPLY_RE.test(chat)) {
    return { question: cleaned, followup: false, closing: false, declined: false, focus_concept: '' };
  }

  const subject = focus || state.last_topic_id || 'this topic';
  const low = chat.replace(/[?.!]+$/, '');

  let question: string;
  if (/^(why|why not)/.test(low)) question = `Explain why ${subject} works that way.`;
  else if (/^(formula|the formula|give formula|give the formula)/.test(low)) question = `Give the formula for ${subject}.`;
  else if (/^(numerical|a numerical|give a numerical|send numerical|solve|calculate)/.test(low)) question = `Give a numerical on ${subject}.`;
  else if (/^(example|an example|give example|give an example|send example|show example)/.test(low)) question = `Give an example of ${subject}.`;
  else if (/^(more|explain more|tell me more|go deeper)/.test(low)) question = `Explain ${subject} in more detail.`;
  else if (state.pending_offer) question = offerQuestion(state.pending_offer, subject);
  else question = `Give an example of ${subject}.`;

  return { question, followup: true, closing: false, declined: false, focus_concept: focus };
}

/** Build a weighted alias index from every chunk's aliases, terms and title. */
function conceptIndex(chunks: TutorChunk[]): ConceptHit[] {
  const hits: ConceptHit[] = [];
  for (const chunk of chunks) {
    const candidates = [
      ...(chunk.term ? [chunk.term] : []),
      ...chunk.aliases,
      chunk.topic_title,
      chunk.subsection || '',
      ...chunk.keywords.filter(keyword => keyword.includes(' ')),
    ];
    for (const raw of candidates) {
      const concept = normalize(raw);
      if (concept.length < 2 || GENERIC_WORDS.has(concept)) continue;
      const priority = chunk.chunk_type === 'topic_definition' ? 3
        : chunk.chunk_type === 'term_definition' ? 2
        : chunk.chunk_type === 'formula' ? 2
        : 1;
      hits.push({ concept, chunk, priority });
    }
  }
  return hits.sort((a, b) => b.concept.length - a.concept.length || b.priority - a.priority);
}

/** Detect concepts with longest-exact-phrase-first so DIP beats "digital image". */
export function detectConcepts(query: string, chunks: TutorChunk[]): ConceptHit[] {
  const q = ` ${normalize(query)} `;
  const found: ConceptHit[] = [];
  const seen = new Set<string>();
  for (const hit of conceptIndex(chunks)) {
    if (seen.has(hit.concept)) continue;
    if (q.includes(` ${hit.concept} `) || q.startsWith(`${hit.concept} `) || q.endsWith(` ${hit.concept}`) || q === hit.concept) {
      found.push(hit);
      seen.add(hit.concept);
    }
  }
  return found;
}

function topicFromCode(query: string, chunks: TutorChunk[]): string | null {
  const match = query.match(/cv\s*-?\s*m\s*(\d)\s*-?\s*(\d{2})/i);
  if (!match) return null;
  const code = `CV-M${match[1]}-${match[2]}`.toUpperCase();
  return chunks.some(chunk => chunk.topic_id === code) ? code : null;
}

const ALLOWED_TYPES: Record<Intent, ChunkType[]> = {
  definition: ['topic_definition', 'term_definition', 'explanation'],
  explanation: ['explanation', 'topic_definition', 'term_definition'],
  formula: ['formula'],
  numerical: ['worked_example', 'formula'],
  example: ['worked_example', 'explanation'],
  difference: ['topic_definition', 'term_definition', 'explanation'],
  exam_question: ['exam_points'],
  mcq_quiz: ['mcq'],
  common_mistakes: ['mistakes'],
  application: ['explanation', 'topic_definition'],
  advantages: ['explanation', 'term_definition'],
  out_of_scope: [],
  chitchat: [],
  topic_switch: ['topic_definition'],
  meta: [],
  acknowledgement: [],
  clarification: [],
};

function metadataBonus(chunk: TutorChunk, intent: Intent, concepts: ConceptHit[], query: string): number {
  if (!ALLOWED_TYPES[intent].includes(chunk.chunk_type)) return -1;
  const q = normalize(query);
  const deep = /detail|deep|in depth|more/.test(q);
  let bonus = 0;

  switch (intent) {
    case 'definition': {
      const topicConcept = concepts.find(hit => hit.chunk.topic_id === chunk.topic_id && hit.chunk.chunk_type === 'topic_definition');
      const termConcept = concepts.find(hit => hit.concept === normalize(chunk.term || '') && hit.chunk.chunk_type === 'term_definition');
      if (chunk.chunk_type === 'topic_definition' && topicConcept) bonus += 0.38;
      if (chunk.chunk_type === 'term_definition' && termConcept) bonus += 0.3;
      if (chunk.chunk_type === 'explanation' && concepts.some(hit => hit.chunk.chunk_id === chunk.chunk_id)) bonus += 0.3;
      if (chunk.section === 'Simple Explanation') bonus += 0.06;
      break;
    }
    case 'explanation':
      if (chunk.chunk_type === 'explanation') {
        bonus += chunk.section === 'Simple Explanation' ? 0.22 : 0.12;
        if (deep && chunk.section === 'Detailed Explanation') bonus += 0.14;
        const subsection = normalize(chunk.subsection || '');
        const exactConcept = concepts.some(hit =>
          hit.chunk.chunk_id === chunk.chunk_id ||
          normalize(chunk.term || '') === hit.concept ||
          (subsection && subsection === hit.concept)
        );
        const partialConcept = concepts.some(hit =>
          subsection && (subsection.includes(hit.concept) || hit.concept.includes(subsection))
        );
        if (exactConcept) bonus += 0.45;
        else if (partialConcept) bonus += 0.05;
        const subsectionTokens = tokenize(chunk.subsection || '');
        const overlap = tokenize(query)
          .filter(token => !NON_CONCEPT_TOKENS.has(token))
          .filter(token => subsectionTokens.includes(token)).length;
        if (overlap > 0) bonus += 0.18 * overlap;
      }
      break;
    case 'formula':
    case 'numerical':
      if (chunk.chunk_type === 'worked_example') bonus += 0.3;
      if (chunk.chunk_type === 'formula') bonus += 0.26;
      break;
    case 'example':
      // Non-numerical "give an example" should use the explanation, not a numerical.
      bonus += chunk.chunk_type === 'explanation' ? 0.3 : 0.12;
      if (/worked example|step by step|numerical example/.test(q) && chunk.chunk_type === 'worked_example') bonus += 0.5;
      break;
    case 'difference':
      if (chunk.chunk_type === 'term_definition' || chunk.chunk_type === 'explanation') bonus += 0.18;
      break;
    case 'exam_question': bonus += 0.3; break;
    case 'mcq_quiz': bonus += 0.3; break;
    case 'common_mistakes': bonus += 0.3; break;
    case 'application':
      if (/application|used in|uses/i.test(chunk.subsection || '')) bonus += 0.3;
      break;
    case 'advantages':
      if (/advantage/i.test(chunk.section)) bonus += 0.3;
      if (chunk.chunk_type === 'term_definition') bonus += 0.15;
      break;
    default: break;
  }
  return bonus;
}

function exactBonus(chunk: TutorChunk, concepts: ConceptHit[], query: string): number {
  const q = normalize(query);
  let bonus = 0;
  if (q.includes(normalize(chunk.topic_title))) bonus += 0.4;
  for (const hit of concepts) {
    if (hit.chunk.chunk_id !== chunk.chunk_id) continue;
    if (chunk.chunk_type === 'topic_definition') bonus += 0.25;
    else if (chunk.chunk_type === 'term_definition' && normalize(chunk.term || '') === hit.concept) bonus += 0.2;
  }
  return bonus;
}

/** Simple BM25 over embedded text, enriched with keywords and aliases. */
function bm25Scores(chunks: TutorChunk[], queryTokens: string[]): Map<string, number> {
  const docs = chunks.map(chunk => tokenize(`${chunk.embedded_text} ${chunk.keywords.join(' ')} ${chunk.aliases.join(' ')}`));
  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1);
  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const token of new Set(doc)) df.set(token, (df.get(token) || 0) + 1);
  }
  const scores = new Map<string, number>();
  chunks.forEach((chunk, index) => {
    const doc = docs[index];
    const termFrequency = new Map<string, number>();
    for (const token of doc) termFrequency.set(token, (termFrequency.get(token) || 0) + 1);
    let score = 0;
    for (const token of queryTokens) {
      const tf = termFrequency.get(token) || 0;
      const frequency = df.get(token) || 0;
      if (tf === 0 || frequency === 0) continue;
      const idf = Math.log(1 + (chunks.length - frequency + 0.5) / (frequency + 0.5));
      score += idf * (tf * 2.5) / (tf + 1.5 * (0.25 + 0.75 * doc.length / (avgLength || 1)));
    }
    scores.set(chunk.chunk_id, score);
  });
  return scores;
}

function ranksFromScores(scores: Map<string, number>): Map<string, number> {
  return new Map(
    [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id], index) => [id, 1 / (60 + index + 1)])
  );
}

/** Formula chunks must belong to the concept asked about, not just the topic. */
function matchesFormulaConcept(chunk: TutorChunk, concepts: ConceptHit[], query: string): boolean {
  const identity = normalize([
    chunk.term || '',
    chunk.subsection || '',
    chunk.chunk_id,
    ...chunk.aliases,
    ...chunk.keywords,
  ].join(' '));
  if (concepts.some(hit => hit.chunk.chunk_id === chunk.chunk_id)) return true;
  if (concepts.some(hit => hit.concept.length > 3 && identity.includes(hit.concept))) return true;
  // Variables such as imax/imin appear in several formulas, so only use
  // distinctive words to decide which formula the student means.
  const distinctive = tokenize(query).filter(token =>
    !NON_CONCEPT_TOKENS.has(token) && !['imax', 'imin', 'max', 'min', 'i'].includes(token)
  );
  const tokens = distinctive.length > 0 ? distinctive : tokenize(query).filter(token => !NON_CONCEPT_TOKENS.has(token));
  return tokens.some(token => identity.includes(token));
}

/** Split a two-term question such as "difference between X and Y" or "X (compare with Y)". */
function differenceTerms(question: string): string[] {
  const clean = question.trim().replace(/[?.!]+$/, '');
  const compare = clean.match(/^(?:what is|define|explain|compare)\s+(.+?)\s*\(compare with\s+(.+?)\)$/i);
  if (compare) return [compare[1].trim(), compare[2].trim()];
  const remainder = clean
    .replace(/^.*?(?:difference between|differentiate between|differentiate|compare)\s+/i, '')
    .replace(/^what is\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
  return remainder
    .split(/\s+(?:and|versus|vs)\s+/i)
    .map(term => term.trim())
    .filter(term => term.length > 1);
}

/** A weak lexical and vector signal means the notes do not support an answer. */
function hasEvidence(item: Pick<RankedChunk, 'bm25' | 'embedding'>): boolean {
  return item.bm25 > 0 || item.embedding >= 0.5;
}

function rankChunks(
  chunks: TutorChunk[],
  query: string,
  intent: Intent,
  concepts: ConceptHit[],
  chunkVectors: Record<string, number[]>,
  queryVector: number[]
): RankedChunk[] {
  const tokens = tokenize(query);
  const bm25 = bm25Scores(chunks, tokens);
  const bm25Ranks = ranksFromScores(bm25);
  const similarities = new Map<string, number>();
  for (const chunk of chunks) {
    const vector = chunkVectors[chunk.chunk_id] || localEmbedding(chunk.embedded_text);
    similarities.set(chunk.chunk_id, cosineSimilarity(queryVector, vector));
  }
  const embeddingRanks = ranksFromScores(similarities);

  return chunks.map(chunk => {
    const formulaMismatch = (intent === 'formula' || intent === 'numerical') && chunk.chunk_type === 'formula' && !matchesFormulaConcept(chunk, concepts, query);
    const metadata = formulaMismatch ? -1 : metadataBonus(chunk, intent, concepts, query);
    const exact = exactBonus(chunk, concepts, query);
    return {
      chunk,
      bm25: bm25.get(chunk.chunk_id) || 0,
      embedding: similarities.get(chunk.chunk_id) || 0,
      rrf: (bm25Ranks.get(chunk.chunk_id) || 0) + (embeddingRanks.get(chunk.chunk_id) || 0),
      metadata,
      exact,
      rerank: (bm25Ranks.get(chunk.chunk_id) || 0) + (embeddingRanks.get(chunk.chunk_id) || 0) + metadata + exact,
    };
  })
    .filter(item => item.metadata >= 0)
    .sort((a, b) => b.rerank - a.rerank);
}

function keepCount(intent: Intent, concepts: ConceptHit[]): number {
  switch (intent) {
    case 'definition': return concepts.length > 1 ? 2 : 1;
    case 'formula': return 1;
    case 'numerical': return 2;
    case 'example': return 1;
    case 'difference': return Math.min(2, Math.max(2, concepts.length));
    case 'exam_question': return 1;
    case 'mcq_quiz': return 2;
    case 'common_mistakes': return 1;
    default: return config.tutorMaxChunks;
  }
}

/**
 * Examples and numericals are selected from the CURRENT topic's metadata.
 * A repeated request uses another chunk from that topic, or asks the answer
 * engine to recompute a fresh variant of the same worked example.
 */
function selectTopicExampleChunks(
  ranked: RankedChunk[],
  topicId: string,
  intent: Intent,
  query: string,
  shownIds: string[]
): { ranked: RankedChunk[]; repeatContent: boolean } | null {
  if (intent !== 'example' && intent !== 'numerical' && intent !== 'mcq_quiz') return null;
  const inTopic = ranked.filter(item =>
    item.chunk.topic_id === topicId &&
    item.rerank > 0.05 &&
    hasEvidence(item)
  );
  if (inTopic.length === 0) return null;

  if (intent === 'mcq_quiz') {
    // A generic quiz asks for the topic's own MCQs in note order. Ranking by
    // the question wording can otherwise favour a later MCQ that happens to
    // repeat "acquisition" in its keywords.
    const mcqs = inTopic.filter(item => item.chunk.chunk_type === 'mcq')
      .sort((a, b) => a.chunk.chunk_id.localeCompare(b.chunk.chunk_id, undefined, { numeric: true }));
    if (mcqs.length === 0) return null;
    const fresh = mcqs.filter(item => !shownIds.includes(item.chunk.chunk_id));
    const chosen = (fresh.length > 0 ? fresh : mcqs).slice(0, keepCount('mcq_quiz', []));
    return { ranked: chosen, repeatContent: fresh.length === 0 };
  }

  const isWorkedRequest = /worked example|step by step|numerical example|calculate|numerical/i.test(query);
  const ofType = (type: ChunkType): RankedChunk[] => inTopic.filter(item => item.chunk.chunk_type === type);
  const fresh = (items: RankedChunk[]): RankedChunk | undefined =>
    items.find(item => !shownIds.includes(item.chunk.chunk_id));

  if (intent === 'numerical') {
    const worked = ofType('worked_example');
    const chosen = fresh(worked) || worked[0];
    if (!chosen) return null;
    const formulas = ofType('formula').filter(item => item.chunk.chunk_id !== chosen.chunk.chunk_id);
    return {
      ranked: [chosen, ...formulas].slice(0, 2),
      repeatContent: shownIds.includes(chosen.chunk.chunk_id),
    };
  }

  const explanations = ofType('explanation');
  const worked = ofType('worked_example');
  // A generic "example" means the Simple Explanation example for this topic.
  // It can be a smartphone camera here, not an applications subsection from
  // another part of the notes.
  const simple = explanations.filter(item => item.chunk.section === 'Simple Explanation');
  const otherExplanations = explanations.filter(item => item.chunk.section !== 'Simple Explanation');
  const pool = isWorkedRequest
    ? [...worked, ...simple, ...otherExplanations]
    : [...simple, ...otherExplanations, ...worked];
  const chosen = fresh(pool) || pool[0];
  if (!chosen) return null;
  return { ranked: [chosen], repeatContent: shownIds.includes(chosen.chunk.chunk_id) };
}

interface DebugMeta {
  followup: boolean;
  declined: boolean;
  focusConcept: string;
  pendingOffer: PendingOffer;
  topicSwitch: boolean;
  topicTarget: string | null;
}

function emptyDebug(
  original: string,
  rewritten: string,
  intent: Intent,
  meta: DebugMeta
): RetrievalDebug {
  return {
    original_message: original,
    rewritten_question: rewritten,
    intent,
    followup: meta.followup,
    declined: meta.declined,
    focus_concept: meta.focusConcept || null,
    pending_offer: meta.pendingOffer,
    detected_concepts: [],
    detected_topic_id: null,
    ranked: [],
    kept_chunk_ids: [],
    threshold: config.tutorRelevanceThreshold,
    decision: 'skipped',
    topic_switch: meta.topicSwitch,
    topic_target: meta.topicTarget,
  };
}

function buildDebug(
  original: string,
  rewritten: string,
  intent: Intent,
  meta: DebugMeta,
  concepts: ConceptHit[],
  topicId: string | null,
  ranked: RankedChunk[],
  kept: TutorChunk[],
  decision: RetrievalDebug['decision']
): RetrievalDebug {
  return {
    original_message: original,
    rewritten_question: rewritten,
    intent,
    followup: meta.followup,
    declined: meta.declined,
    focus_concept: meta.focusConcept || null,
    pending_offer: meta.pendingOffer,
    detected_concepts: [...new Set(concepts.map(hit => hit.concept))].slice(0, 8),
    detected_topic_id: topicId,
    ranked: ranked.slice(0, 10).map(item => ({
      chunk_id: item.chunk.chunk_id,
      chunk_type: item.chunk.chunk_type,
      scores: {
        bm25: Number(item.bm25.toFixed(4)),
        embedding: Number(item.embedding.toFixed(4)),
        rrf: Number(item.rrf.toFixed(4)),
        metadata: Number(item.metadata.toFixed(4)),
        exact: Number(item.exact.toFixed(4)),
        rerank: Number(item.rerank.toFixed(4)),
      },
    })),
    kept_chunk_ids: kept.map(chunk => chunk.chunk_id),
    threshold: config.tutorRelevanceThreshold,
    decision,
    topic_switch: meta.topicSwitch,
    topic_target: meta.topicTarget,
  };
}

function logDebug(debug: RetrievalDebug): void {
  if (config.tutorDebug) console.log('[tutor debug]', JSON.stringify(debug, null, 2));
}

export interface RetrieveOptions {
  chunks?: TutorChunk[];
  embeddings?: Record<string, number[]>;
  debug?: boolean;
  useDatabase?: boolean;
}

/** Full pipeline for a single student message. */
export async function retrieveForMessage(
  message: string,
  history: ChatMessageItem[] = [],
  state: TutorState = {},
  options: RetrieveOptions = {}
): Promise<RetrievalResult> {
  const chunks = options.chunks || (options.useDatabase === false
    ? loadChunksFromJson()
    : (await loadChunksFromDatabase()) || loadChunksFromJson());
  const rewrite = rewriteQuery(message, history, state, chunks);
  const intent = rewrite.intent || classifyIntent(rewrite.question);
  const topicSwitch = Boolean(rewrite.topic_switch) || intent === 'topic_switch';
  const topicSwitchTarget = rewrite.target_topic_id || null;
  // Meta, clarification and acknowledgement turns are state-neutral: they do
  // not retrieve and must not look like in-scope content follow-ups.
  const stateNeutral = intent === 'meta' || intent === 'clarification' || intent === 'acknowledgement';
  const previousInScope = Boolean(
    !stateNeutral && !topicSwitch && !rewrite.closing && !rewrite.declined && (state.last_topic_id || state.last_concept)
  );
  // A switch clears the old concept immediately, whether or not a topic was
  // named, so debug output cannot report a stale focus from the previous turn.
  let focusConcept = topicSwitch || stateNeutral
    ? (topicSwitchTarget ? topicConcept(topicSwitchTarget, chunks) : '')
    : rewrite.focus_concept || canonicalConcept(state.last_concept || '', chunks);
  const meta: DebugMeta = {
    followup: rewrite.followup || previousInScope,
    declined: rewrite.declined,
    focusConcept,
    pendingOffer: state.pending_offer || null,
    topicSwitch,
    topicTarget: topicSwitchTarget,
  };

  // These intents are answered from fixed templates. No retrieval, no
  // embeddings, and no pending-offer/concept lookup is involved.
  if (stateNeutral) {
    const debug = emptyDebug(message, rewrite.question, intent, meta);
    logDebug(debug);
    return {
      chunks: [],
      rewrittenQuestion: rewrite.question,
      intent,
      concepts: [],
      topicId: null,
      focusConcept: '',
      followup: false,
      previousInScope: false,
      closing: false,
      declined: false,
      topicSwitch: false,
      topicSwitchTarget: null,
      repeatContent: false,
      debug,
    };
  }

  // Topic switches are resolved from metadata only. No offer or old-chunk
  // retrieval is allowed to leak through this message.
  if (topicSwitch) {
    const selected = topicSwitchTarget
      ? chunks.find(chunk => chunk.topic_id === topicSwitchTarget && chunk.chunk_type === 'topic_definition') || null
      : null;
    const switchRanked: RankedChunk[] = selected
      ? [{ chunk: selected, bm25: 0, embedding: 0, rrf: 0, metadata: 1, exact: 0, rerank: 1 }]
      : [];
    const debug = buildDebug(
      message,
      rewrite.question,
      intent,
      meta,
      [],
      topicSwitchTarget,
      switchRanked,
      selected ? [selected] : [],
      'topic_switch'
    );
    logDebug(debug);
    return {
      chunks: selected ? [selected] : [],
      rewrittenQuestion: rewrite.question,
      intent,
      concepts: [],
      topicId: topicSwitchTarget,
      focusConcept: selected ? focusConcept : '',
      followup: rewrite.followup,
      previousInScope: false,
      closing: false,
      declined: rewrite.declined,
      topicSwitch: true,
      topicSwitchTarget,
      repeatContent: false,
      debug,
    };
  }

  if (rewrite.closing || intent === 'chitchat' || intent === 'out_of_scope') {
    const debug = emptyDebug(message, rewrite.question, intent, meta);
    logDebug(debug);
    return {
      chunks: [],
      rewrittenQuestion: rewrite.question,
      intent,
      concepts: [],
      topicId: null,
      focusConcept,
      followup: rewrite.followup,
      previousInScope,
      closing: rewrite.closing,
      declined: rewrite.declined,
      topicSwitch: false,
      topicSwitchTarget: null,
      repeatContent: false,
      debug,
    };
  }

  const concepts = detectConcepts(rewrite.question, chunks);
  let topicId = topicFromCode(rewrite.question, chunks)
    || concepts[0]?.chunk.topic_id
    || null;
  const effectiveTopicId = rewrite.followup ? state.last_topic_id || topicId : topicId;
  if (effectiveTopicId) topicId = effectiveTopicId;
  if (!focusConcept) focusConcept = canonicalConcept(concepts[0]?.concept || '', chunks);
  meta.focusConcept = focusConcept;

  const queryVectors = await embedTexts([rewrite.question]);
  const queryVector = queryVectors[0] || localEmbedding(rewrite.question);
  const chunkVectors = options.embeddings || loadEmbeddingsFromJson();

  let ranked = rankChunks(chunks, rewrite.question, intent, concepts, chunkVectors, queryVector);
  if (topicId && intent !== 'difference') {
    // A detected topic acts as a soft filter, never as an excuse to mix topics.
    ranked = ranked.map(item => ({
      ...item,
      metadata: item.chunk.topic_id === topicId ? item.metadata : item.metadata - 0.5,
      rerank: item.chunk.topic_id === topicId ? item.rerank : item.rerank - 0.5,
    })).sort((a, b) => b.rerank - a.rerank);
  }

  // Difference questions retrieve each concept separately, then merge.
  if (intent === 'difference') {
    const terms = differenceTerms(rewrite.question);
    const merged = new Map<string, RankedChunk>();
    for (const term of terms.length > 1 ? terms : [rewrite.question]) {
      const subQuestion = `What is ${term}?`;
      const perConcept = rankChunks(
        chunks,
        subQuestion,
        'definition',
        detectConcepts(subQuestion, chunks),
        chunkVectors,
        (await embedTexts([subQuestion]))[0] || localEmbedding(subQuestion)
      );
      const best = perConcept.find(item => item.rerank > 0 && hasEvidence(item));
      if (best) merged.set(best.chunk.chunk_id, best);
    }
    if (merged.size > 0) ranked = [...merged.values()].sort((a, b) => b.rerank - a.rerank);
  }

  let repeatContent = false;
  if (effectiveTopicId) {
    const shownIds = state.shown_chunks?.[effectiveTopicId] || [];
    const selected = selectTopicExampleChunks(
      ranked,
      effectiveTopicId,
      intent,
      rewrite.question,
      shownIds
    );
    if (selected) {
      ranked = selected.ranked;
      repeatContent = selected.repeatContent;
      topicId = effectiveTopicId;
    }
  }

  const top = ranked[0];
  const resultBase = {
    rewrittenQuestion: rewrite.question,
    intent,
    concepts: concepts.map(hit => hit.concept),
    topicId,
    focusConcept,
    followup: rewrite.followup,
    previousInScope,
    closing: false,
    declined: false,
    topicSwitch: false,
    topicSwitchTarget: null,
    repeatContent,
  };

  if (!top || top.rerank <= 0.05 || !hasEvidence(top)) {
    const debug = buildDebug(message, rewrite.question, intent, meta, concepts, topicId, ranked, [], 'no_match');
    logDebug(debug);
    return { chunks: [], ...resultBase, debug };
  }

  const limit = keepCount(intent, concepts);
  const kept = ranked
    .filter(item => item.rerank >= top.rerank * config.tutorRelevanceThreshold)
    .slice(0, limit)
    .map(item => item.chunk);
  // A whole-topic definition uses the topic's own display concept. This stops
  // an ambiguous alias such as "image acquisition" (also a DIP component)
  // from being canonicalised to the older topic's term chunk.
  if (kept[0]?.chunk_type === 'topic_definition') {
    focusConcept = topicConcept(kept[0].topic_id, chunks);
    meta.focusConcept = focusConcept;
    resultBase.focusConcept = focusConcept;
  }

  const decision: RetrievalDebug['decision'] = kept.length > 0 ? 'kept' : 'below_threshold';
  const debug = buildDebug(message, rewrite.question, intent, meta, concepts, topicId, ranked, kept, decision);
  logDebug(debug);
  return { chunks: kept, ...resultBase, debug };
}

/** Synchronous, local-only retrieval used by tests and the local fallback. */
export function retrieveChunksFrom(
  chunks: TutorChunk[],
  query: string,
  intent: Intent = classifyIntent(query)
): TutorChunk[] {
  const concepts = detectConcepts(query, chunks);
  const ranked = rankChunks(
    chunks,
    query,
    intent,
    concepts,
    {},
    localEmbedding(query)
  );
  const top = ranked[0];
  if (!top || top.rerank <= 0.05 || !hasEvidence(top)) return [];
  return ranked
    .filter(item => item.rerank >= top.rerank * config.tutorRelevanceThreshold)
    .slice(0, keepCount(intent, concepts))
    .map(item => item.chunk);
}

/** Async version for the live tutor (DB first, JSON fallback). */
export async function retrieveChunks(query: string): Promise<TutorChunk[]> {
  return (await retrieveForMessage(query)).chunks;
}

export function formatRetrievedContext(chunks: TutorChunk[]): string {
  if (chunks.length === 0) return 'No matching notes were retrieved for this question.';
  return '=== MATCHING NOTES (1-3 chunks only) ===\n' +
    chunks.map(chunk => `[${chunk.chunk_id} | ${chunk.chunk_type}]\n${chunk.embedded_text}`).join('\n\n');
}

export function buildCurriculumCatalogue(chunks: TutorChunk[] = loadChunksFromJson()): string {
  const seen = new Set<string>();
  return chunks.filter(chunk => {
    if (seen.has(chunk.topic_id)) return false;
    seen.add(chunk.topic_id);
    return true;
  }).map(chunk => `• **${chunk.topic_id} — ${chunk.topic_title}** (${chunk.module})`).join('\n');
}
