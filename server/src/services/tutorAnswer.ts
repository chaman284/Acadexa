// LOCAL ANSWER ENGINE
// Builds short, scope-limited answers from the retrieved 1-3 chunks.
// Used by local-only tests and whenever Gemini is unavailable.

import { config } from '../config';
import { normalize, sentenceCount, tokenize } from './textUtils';
import { topicLabel, topicSwitchPrompt } from './topicMetadata';
import type { Intent, PendingOffer, TutorChunk } from './tutorTypes';

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-•]\s*/gm, '')
    .trim();
}

export function splitSentences(text: string): string[] {
  return stripMarkdown(text)
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

function capSentences(text: string, max: number): string {
  return splitSentences(text).slice(0, max).join(' ');
}

function contentLines(chunk: TutorChunk): string[] {
  return chunk.text.split('\n').map(stripMarkdown).filter(line => line.length > 0);
}

/** Solve only formulas present in the notes, using the student's own numbers. */
export function solveNumerical(query: string): string | null {
  const valueAfter = (pattern: RegExp): number | null => {
    const match = query.match(pattern);
    return match ? Number(match[match.length - 1]) : null;
  };
  const dimensions = query.match(/(\d+)\s*[x×]\s*(\d+)/i);
  const bits = valueAfter(/(\d+)\s*(?:-?\s*bits?|bpp)\b/i);

  if (/michelson/i.test(query)) {
    const imax = valueAfter(/\b(?:i[_ ]?max|maximum(?:\s+intensity)?)\b[^0-9]{0,15}(\d+(?:\.\d+)?)/i);
    const imin = valueAfter(/\b(?:i[_ ]?min|minimum(?:\s+intensity)?)\b[^0-9]{0,15}(\d+(?:\.\d+)?)/i);
    if (imax === null || imin === null) return null;
    const c = (imax - imin) / (imax + imin);
    return (
      `Using C = (I_max - I_min) / (I_max + I_min):\n` +
      `I_max = ${imax}, I_min = ${imin}\n` +
      `C = (${imax} - ${imin}) / (${imax} + ${imin}) = ${imax - imin} / ${imax + imin} = ${c.toFixed(2)}\n` +
      `Final Answer: C = ${c.toFixed(2)} or ${(c * 100).toFixed(0)}%.`
    );
  }

  if (/weber/i.test(query)) {
    const delta = valueAfter(/\b(?:delta|change)\b[^0-9]{0,15}(\d+(?:\.\d+)?)/i);
    const intensity = valueAfter(/\b(?:background\s+intensity|intensity\s+i|\bi\b)\s*[=:]?\s*(\d+(?:\.\d+)?)/i);
    if (delta === null || intensity === null || intensity === 0) return null;
    return `Using ΔI / I = k:\nΔI = ${delta}, I = ${intensity}\nk = ${delta} / ${intensity} = ${(delta / intensity).toFixed(2)}`;
  }

  if (/storage|bits|bytes|kilobyte|\bkb\b|\bmb\b/i.test(query) && dimensions && bits !== null) {
    const rows = Number(dimensions[1]);
    const cols = Number(dimensions[2]);
    const pixels = rows * cols;
    const totalBits = pixels * bits;
    const bytes = totalBits / 8;
    const kb = bytes / 1024;
    return (
      `Using Storage = M x N x b:\n` +
      `M = ${rows}, N = ${cols}, b = ${bits}\n` +
      `Pixels = ${rows} x ${cols} = ${pixels}\n` +
      `Bits = ${pixels} x ${bits} = ${totalBits}; bytes = ${bytes}; KB = ${bytes}/1024 = ${kb} KB\n` +
      `Final Answer: ${kb} KB of raw storage, excluding metadata.`
    );
  }

  if (/total pixels|number of pixels/i.test(query) && dimensions) {
    const rows = Number(dimensions[1]);
    const cols = Number(dimensions[2]);
    return `Using Total Pixels = M x N:\nM = ${rows}, N = ${cols}\nTotal Pixels = ${rows} x ${cols} = ${rows * cols}`;
  }

  return null;
}

function notFromNotes(query: string): string {
  const general = /capital of france/i.test(query)
    ? ' The capital of France is Paris — but that is general knowledge, not from your notes.'
    : /edge detection/i.test(query)
      ? ' In general, edge detection finds boundaries of objects in an image — not from your notes.'
      : '';
  return (
    `That is not covered in your Computer Vision Module 1 notes, so this answer is **not from your notes**.${general}\n` +
    `I can help with digital image processing, visual perception, image sensing and acquisition.`
  );
}

function shortreplyGreeting(): string {
  return 'Hello! Ask me a Computer Vision question from your Module 1 notes and I will keep the answer short and focused.';
}

/** Fixed, honest answer for questions about the tutor itself. */
export function metaAnswer(): string {
  const modelSentence = config.modelName
    ? `The model behind me is ${config.modelName}; I don't have details about its training data.`
    : `The language model behind me was trained by its provider on general text, and I don't have details about that training data.`;
  return (
    `I'm an AI tutor for your VTU Computer Vision course. I answer using the Module 1 notes loaded here ` +
    `(Intro to DIP, Visual Perception, Image Sensing and Acquisition) and explain them in simple words. ` +
    `${modelSentence} For your syllabus, I only rely on your notes. If something isn't in them, I'll tell you. ` +
    `What would you like to continue with?`
  );
}

/** Short acknowledgement: friendly, but never a replay of the last answer. */
export function acknowledgementAnswer(): string {
  return 'Glad it helped! Want to try a quiz, see the formula, or switch topic?';
}

export function clarificationAnswer(): string {
  return 'Sorry, could you say that again? I want to answer the right question.';
}

/** Nothing new to show: offer a different action instead of a dead end. */
function nextActionFallback(intent: Intent, subject: string): string {
  const focus = subject && subject !== 'this topic' ? ` for ${subject}` : '';
  const actions = 'Want a quiz, the formula, exam questions, or another topic?';
  switch (intent) {
    case 'numerical':
      return `We've covered the worked example${focus}. ${actions}`;
    case 'example':
      return `We've covered the examples${focus}. ${actions}`;
    case 'formula':
      return `There is no specific formula for ${subject || 'that topic'} in these notes, so I won't borrow one from another topic. Want a quiz, exam questions, or another topic?`;
    case 'difference':
      return `We've covered the comparison${focus}. ${actions}`;
    case 'mcq_quiz':
      return `We've covered the practice questions${focus}. ${actions}`;
    default:
      return `We've covered what the notes have${focus}. ${actions}`;
  }
}

type Offer = { kind: Exclude<PendingOffer, null>; text: string };

const OFFER_VARIANTS: Record<Exclude<PendingOffer, null>, Offer[]> = {
  numerical: [
    { kind: 'numerical', text: 'Want a numerical on this?' },
    { kind: 'quiz', text: 'Want a quick quiz on this?' },
    { kind: 'formula', text: 'Want the formula used here?' },
    { kind: 'exam_question', text: 'Want an exam-style question on this?' },
  ],
  quiz: [
    { kind: 'quiz', text: 'Want a quick quiz on this?' },
    { kind: 'formula', text: 'Want the formula used here?' },
    { kind: 'exam_question', text: 'Want an exam-style question on this?' },
  ],
  formula: [
    { kind: 'formula', text: 'Want a numerical on it?' },
    { kind: 'quiz', text: 'Want a quick quiz on this?' },
    { kind: 'exam_question', text: 'Want an exam-style question on this?' },
  ],
  example: [
    { kind: 'example', text: 'Want an example?' },
    { kind: 'numerical', text: 'Want a numerical on this?' },
    { kind: 'quiz', text: 'Want a quick quiz on this?' },
  ],
  comparison: [
    { kind: 'comparison', text: 'Want a 5-mark comparison table on this?' },
    { kind: 'quiz', text: 'Want a quick quiz on this?' },
  ],
  exam_question: [
    { kind: 'exam_question', text: 'Want an exam-style question on this?' },
    { kind: 'quiz', text: 'Want a quick quiz on this?' },
    { kind: 'formula', text: 'Want the formula used here?' },
  ],
};

function offerAfter(kind: Exclude<PendingOffer, null>, options: LocalAnswerOptions): Offer {
  const variants = OFFER_VARIANTS[kind];
  const previousKind = options.lastOfferKind;
  const previousText = options.lastOfferText;
  const sameTextIndex = variants.findIndex(item =>
    item.text === previousText || (previousKind !== undefined && item.kind === previousKind)
  );
  if (sameTextIndex >= 0 && variants.length > 1) return variants[(sameTextIndex + 1) % variants.length];
  return variants[0];
}

function withOffer(answer: string, kind: Exclude<PendingOffer, null>, options: LocalAnswerOptions): string {
  const next = offerAfter(kind, options);
  return `${answer}\n\n${next.text}`;
}

/** Recompute a worked numerical with fresh values from the same note chunk. */
function workedExampleVariant(chunk: TutorChunk): string | null {
  const dimensions = chunk.text.match(/(\d+)\s*[x×]\s*(\d+)/i);
  const bits = chunk.text.match(/\b(\d+)\s*(?:bits?|bpp)\b/i);
  if (dimensions && bits) {
    const rows = Number(dimensions[1]);
    const cols = Number(dimensions[2]);
    const depth = Number(bits[1]);
    const nextRows = rows >= 640 ? Math.round(rows / 2) : rows * 2;
    const nextCols = cols >= 480 ? Math.round(cols / 2) : cols * 2;
    const solved = solveNumerical(`${nextRows} x ${nextCols} pixels, ${depth} bits per pixel storage`);
    if (solved) return `Here is a different version with new values:\n${solved}`;
  }

  const imax = chunk.text.match(/(?:i[_ ]?max|maximum[^0-9]{0,20})(\d+(?:\.\d+)?)/i);
  const imin = chunk.text.match(/(?:i[_ ]?min|minimum[^0-9]{0,20})(\d+(?:\.\d+)?)/i);
  if (imax && imin) {
    const solved = solveNumerical(`Michelson contrast with I_max ${Number(imax[1]) * 2} and I_min ${Number(imin[1]) / 2}`);
    if (solved) return `Here is a different version with new values:\n${solved}`;
  }
  return null;
}

/** Pick another example sentence from the same topic instead of repeating it. */
function exampleVariant(chunk: TutorChunk, alreadyShown: string): string {
  const sentences = splitSentences(chunk.text);
  const alternatives = sentences.filter(sentence =>
    normalize(sentence) !== normalize(alreadyShown) &&
    /for example|for instance|\bexample\b|\bused in\b|\bin [a-z]+,/i.test(sentence)
  );
  return alternatives[0] || sentences.find(sentence => normalize(sentence) !== normalize(alreadyShown)) || alreadyShown;
}

export interface LocalAnswerOptions {
  topicId?: string | null;
  concept?: string;
  closing?: boolean;
  declined?: boolean;
  followup?: boolean;
  previousInScope?: boolean;
  pendingOffer?: PendingOffer;
  allChunks?: TutorChunk[];
  topicSwitchTarget?: string | null;
  /** The selected example/numerical was already shown; use a new variant. */
  repeatContent?: boolean;
  lastOfferKind?: PendingOffer;
  lastOfferText?: string | null;
}

/** Build an answer from only the retrieved chunks and only what was asked. */
export function buildLocalAnswer(
  query: string,
  chunks: TutorChunk[],
  intent: Intent,
  options: LocalAnswerOptions = {}
): string {
  if (intent === 'meta') return metaAnswer();
  if (intent === 'acknowledgement') return acknowledgementAnswer();
  if (intent === 'clarification') return clarificationAnswer();

  if (intent === 'topic_switch') {
    const target = options.topicSwitchTarget;
    if (target && chunks.length > 0) {
      const label = topicLabel(target, options.allChunks || chunks);
      return `${withOffer(`Sure, switching to ${label}. ${capSentences(chunks[0].text, 2)}`, 'example', options)}`;
    }
    return `${options.declined ? 'No problem — ' : ''}${topicSwitchPrompt(options.allChunks || chunks)}`;
  }
  if (options.closing || (/^(no+|nope|no thanks|not now|later|thank you|thanks|that's all)\b/i.test(query.trim()) && intent === 'chitchat')) {
    return options.declined || /^(no+|nope|no thanks|not now|later|that's all)\b/i.test(query.trim())
      ? 'No problem — ask me anytime.'
      : "You're welcome. Ask me anytime if you want to continue.";
  }
  if (intent === 'chitchat') return shortreplyGreeting();
  // Out-of-scope is decided only on the rewritten standalone question.
  if (intent === 'out_of_scope') return notFromNotes(query);

  if (chunks.length === 0) {
    if (options.pendingOffer || options.followup || options.previousInScope) {
      return nextActionFallback(intent, options.concept || 'this topic');
    }
    if (intent === 'formula' && options.topicId) {
      const concept = options.concept || query.replace(/^.*?for\s+/i, '').replace(/[?.]+$/, '');
      return nextActionFallback('formula', concept);
    }
    return notFromNotes(query);
  }

  const first = chunks[0];

  switch (intent) {
    case 'definition': {
      const termChunks = chunks.filter(chunk => chunk.chunk_type === 'term_definition').slice(0, 2);
      if (termChunks.length > 1) {
        return `${termChunks.map(chunk => stripMarkdown(chunk.text)).join('\n')}\n\nWant an example or a quick numerical on these?`;
      }
      const text = first.chunk_type === 'topic_definition'
        ? first.text
        : capSentences(first.text, 3);
      return `${capSentences(text, 3)}\n\nWant an example or a quick numerical on this?`;
    }

    case 'explanation': {
      return `${capSentences(first.text, 5)}\n\nWant a formula or a quick example on this?`;
    }

    case 'formula': {
      const lines = contentLines(first).filter(line => /[=]|\blaw\b|formula/i.test(line));
      const text = lines.length > 0 ? lines.join('\n') : capSentences(first.text, 3);
      return `${text}\n\nWant a numerical on it?`;
    }

    case 'numerical': {
      const solved = solveNumerical(query);
      if (solved) return withOffer(solved, 'quiz', options);
      const example = chunks.find(chunk => chunk.chunk_type === 'worked_example') || first;
      const variant = options.repeatContent ? workedExampleVariant(example) : null;
      return withOffer(variant || stripMarkdown(example.text), 'quiz', options);
    }

    case 'example': {
      const exampleChunk = chunks.find(chunk => chunk.chunk_type === 'worked_example');
      if (exampleChunk) {
        const variant = options.repeatContent ? workedExampleVariant(exampleChunk) : null;
        return withOffer(variant || capSentences(exampleChunk.text, 4), 'numerical', options);
      }
      // Pick sentence-level examples that actually mention the requested concept.
      const wanted = tokenize(query).filter(word => word !== 'example' && word !== 'examples');
      const scored = splitSentences(first.text).map((sentence, index) => {
        const text = normalize(sentence);
        const conceptHits = wanted.filter(word => text.includes(word) || text.includes(`${word}s`)).length;
        const signal = /for example|for instance|\bexample\b|\bsuch as\b|\bin a (?:smartphone|camera|phone)\b|\bcan be performed using\b/i.test(sentence);
        return { sentence, index, score: (signal ? 3 : 0) + conceptHits, signal };
      });
      // An accepted offer must not replay the definition that was just given.
      const pool = options.followup || options.pendingOffer
        ? scored.filter(item => item.signal)
        : scored.filter(item => item.score > 0);
      const chosen = pool
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, 2)
        .sort((a, b) => a.index - b.index)
        .map(item => item.sentence);
      const shownText = chosen.length > 0 ? chosen.join(' ') : capSentences(first.text, 3);
      const text = options.repeatContent ? exampleVariant(first, shownText) : shownText;
      return withOffer(capSentences(text, 3), 'numerical', options);
    }

    case 'difference': {
      const lines = chunks.flatMap(contentLines).filter(line => line.length > 5);
      const unique = [...new Set(lines)].slice(0, 4);
      return withOffer(unique.join('\n'), 'comparison', options);
    }

    case 'exam_question': {
      return `${stripMarkdown(first.text)}\n\nWant a short answer on any of these points?`;
    }

    case 'mcq_quiz': {
      return withOffer(
        chunks.map((chunk, index) => `${index + 1}. ${stripMarkdown(chunk.text)}`).join('\n\n'),
        'comparison',
        options
      );
    }

    case 'common_mistakes': {
      return stripMarkdown(first.text);
    }

    case 'application':
    case 'advantages': {
      return `${capSentences(first.text, 5)}\n\nWant this as 5-mark exam points?`;
    }

    default: {
      return `${capSentences(first.text, 3)}\n\nWant me to explain this in more detail?`;
    }
  }
}

export function answerSentenceCount(answer: string): number {
  return sentenceCount(answer.replace(/Want (?:an? )?(?:example|numerical|formula|5-mark|short answer)[^\n]*$/i, ''));
}
