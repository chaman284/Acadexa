// Per-session conversation memory for the tutor.
// Keyed by JWT user id (no frontend change needed); stores the last 8
// messages plus lightweight conversation state. State is derived from the
// chunks that were actually used to build each reply, not from the question.

import { conceptFromChunk } from './topicMetadata';
import type {
  ChatMessageItem,
  Intent,
  PendingOffer,
  TutorChunk,
  TutorState,
} from './tutorTypes';

interface Session {
  messages: ChatMessageItem[];
  state: TutorState;
}

const sessions = new Map<string, Session>();
const MAX_MESSAGES = 8;

function emptySession(): Session {
  return { messages: [], state: {} };
}

export function getSession(sessionId: string): Session {
  const key = sessionId || 'anonymous';
  if (!sessions.has(key)) sessions.set(key, emptySession());
  return sessions.get(key)!;
}

export function getHistory(sessionId: string): ChatMessageItem[] {
  return [...getSession(sessionId).messages];
}

export function getState(sessionId: string): TutorState {
  const state = getSession(sessionId).state;
  return {
    ...state,
    shown_chunks: state.shown_chunks ? { ...state.shown_chunks } : undefined,
  };
}

export function setState(sessionId: string, state: TutorState): void {
  getSession(sessionId).state = { ...state };
}

export function appendMessages(sessionId: string, messages: ChatMessageItem[]): void {
  const session = getSession(sessionId);
  session.messages.push(...messages);
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }
}

export function clearSession(sessionId: string): void {
  sessions.set(sessionId, emptySession());
}

const OFFER_PATTERNS: { kind: Exclude<PendingOffer, null>; pattern: RegExp }[] = [
  { kind: 'numerical', pattern: /want (?:a |an )?(?:quick )?(?:numerical|worked example)|numerical on (?:it|this)|try it with your own values/i },
  { kind: 'formula', pattern: /want (?:a |an |the )?(?:quick )?formula|formula on (?:it|this)/i },
  { kind: 'example', pattern: /want (?:an? )?(?:quick )?example|want to see/i },
  { kind: 'comparison', pattern: /want (?:a |an )?(?:quick )?(?:\d[- ]mark )?comparison|comparison table/i },
  { kind: 'exam_question', pattern: /want (?:an? )?(?:quick )?exam(?:-style| style)? question|want exam questions/i },
  { kind: 'quiz', pattern: /want (?:a |an )?(?:quick )?quiz|quiz me|test me|practice question/i },
];

/** Only the final paragraph can contain the live offer. */
function offerTail(answer: string): string {
  return answer.trim().split(/\n\s*\n/).pop() || '';
}

/** Set pending_offer when the answer ends with a follow-up offer. */
export function offerFromAnswer(answer: string): TutorState['pending_offer'] {
  const tail = offerTail(answer);
  const offers: { kind: Exclude<PendingOffer, null>; index: number }[] = [];
  for (const offer of OFFER_PATTERNS) {
    const match = tail.match(offer.pattern);
    if (match && match.index !== undefined) offers.push({ kind: offer.kind, index: match.index });
  }
  if (offers.length === 0) return null;
  // When an answer offers both, the first offer is the one "yes" accepts.
  return offers.sort((a, b) => a.index - b.index)[0].kind;
}

/** The exact final offer sentence, used to avoid repeating the same offer. */
export function offerTextFromAnswer(answer: string): string | null {
  const tail = offerTail(answer);
  return tail
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .find(sentence => /^(?:want|quiz me|test me)/i.test(sentence) && OFFER_PATTERNS.some(offer => offer.pattern.test(sentence)))
    || null;
}

export interface TurnStateInput {
  previous: TutorState;
  /** Chunks that were actually used to build the reply. */
  chunks?: TutorChunk[];
  /** Full chunk set, used only to verify a concept belongs to the used topic. */
  allChunks?: TutorChunk[];
  topicId?: string | null;
  concept?: string;
  intent?: Intent;
  answer?: string;
  closing?: boolean;
  declined?: boolean;
  declineOffer?: boolean;
  topicSwitch?: boolean;
  targetTopicId?: string | null;
  /** Keep pending offer, concept and shown chunks exactly as they were. */
  preserveState?: boolean;
}

/**
 * Build the next state from the reply's source chunks. Switching topics
 * clears the old concept, pending offer and shown-chunk list so a later
 * follow-up cannot silently reuse the previous topic.
 */
export function deriveTurnState(update: TurnStateInput): TutorState {
  const previous = update.previous || {};
  if (update.preserveState) {
    return {
      ...previous,
      shown_chunks: previous.shown_chunks ? { ...previous.shown_chunks } : undefined,
    };
  }
  const usedChunks = update.chunks || [];
  const allChunks = update.allChunks || usedChunks;
  const usedTopicId = usedChunks[0]?.topic_id || null;
  const targetTopicId = update.topicSwitch ? update.targetTopicId || null : null;
  const explicitTopicId = targetTopicId || update.topicId || null;
  const topicId = update.topicSwitch && !targetTopicId
    ? undefined
    : usedTopicId || explicitTopicId || previous.last_topic_id;
  const topicChanged = Boolean(
    update.topicSwitch && (!targetTopicId || targetTopicId !== previous.last_topic_id)
  ) || Boolean(topicId && previous.last_topic_id && topicId !== previous.last_topic_id);

  let concept: string | undefined;
  if (update.topicSwitch && !targetTopicId) {
    concept = undefined;
  } else if (usedChunks.length > 0) {
    const preferred = update.concept || (topicChanged ? '' : previous.last_concept || '');
    concept = conceptFromChunk(usedChunks[0], allChunks, preferred || '');
  } else if (!topicChanged && !update.closing) {
    concept = update.concept || previous.last_concept;
  }

  const pendingOffer = update.declineOffer || update.declined || update.closing
    ? null
    : update.answer !== undefined
      ? offerFromAnswer(update.answer)
      : previous.pending_offer || null;

  const shown: Record<string, string[]> = topicChanged
    ? {}
    : { ...(previous.shown_chunks || {}) };
  if (usedTopicId && update.answer !== undefined && !update.closing) {
    const existing = shown[usedTopicId] || [];
    shown[usedTopicId] = [...new Set([...existing, ...usedChunks.map(chunk => chunk.chunk_id)])];
  }

  return {
    last_topic_id: topicId,
    last_concept: concept,
    last_intent: update.intent || previous.last_intent,
    pending_offer: pendingOffer,
    shown_chunks: shown,
    last_offer_text: update.answer !== undefined ? offerTextFromAnswer(update.answer) : previous.last_offer_text || null,
    last_offer_kind: pendingOffer,
  };
}

/** Update state after a turn. Callers pass the chunks used for the answer. */
export function updateState(sessionId: string, update: Omit<TurnStateInput, 'previous'>): void {
  setState(sessionId, deriveTurnState({ previous: getState(sessionId), ...update }));
}
