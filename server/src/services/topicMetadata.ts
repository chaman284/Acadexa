// Helpers for reading topic names and concepts from chunk metadata.
// All topic switches and follow-up concepts come from these fields so no
// topic or example is hardcoded or cached across topics.

import { normalize } from './textUtils';
import type { TutorChunk } from './tutorTypes';

export interface TopicInfo {
  topic_id: string;
  topic_title: string;
  short_label: string;
  concept: string;
  aliases: string[];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** Promote aliases such as "dip" or "ccd" to the note's display wording. */
export function canonicalConcept(raw: string, chunks: TutorChunk[]): string {
  const value = (raw || '').trim();
  if (!value) return '';
  const target = normalize(value);
  let fallback = value;

  for (const chunk of chunks) {
    if (target && normalize(chunk.term || '') === target) return chunk.term!.trim();
    if (!chunk.aliases.some(alias => normalize(alias) === target)) continue;

    // "Digital Image Processing (DIP)" and "CCD (Charge-Coupled Device)".
    const expanded = chunk.text.match(
      new RegExp(`([A-Z][A-Za-z][A-Za-z ]+?)\\s*\\(${escapeRegExp(value)}\\)`, 'i')
    );
    if (expanded) return expanded[1].trim();

    // Only promote the case when the note itself starts with this exact term.
    const prefix = chunk.text.split('\n')[0].trim().split(/[:(]/)[0].trim();
    if (normalize(prefix) === target) {
      const words = prefix.split(/\s+/);
      if (words.length > 0 && words.length <= 8) {
        if (words[0] === value.toUpperCase()) return value.toUpperCase();
        return titleCase(prefix);
      }
    }
  }
  return fallback;
}

/** The display concept for a whole topic, taken from its definition chunk. */
export function topicConcept(topicId: string, chunks: TutorChunk[]): string {
  const chunk = chunks.find(item => item.topic_id === topicId && item.chunk_type === 'topic_definition')
    || chunks.find(item => item.topic_id === topicId);
  if (!chunk) return topicId;

  const acronymAlias = chunk.aliases.find(alias => /^[a-z]{2,}$/i.test(alias.trim()));
  if (acronymAlias) {
    const expanded = canonicalConcept(acronymAlias, [chunk]);
    if (expanded !== acronymAlias) return expanded;
  }

  const title = chunk.topic_title.replace(/^Elements of\s+/i, '');
  if (chunk.topic_title.startsWith('Introduction to')) {
    const withoutTail = title.replace(/^Introduction to\s+/i, '').replace(/\s+and System Components$/i, '');
    return acronymAlias ? `Intro to ${acronymAlias.toUpperCase()}` : withoutTail;
  }
  return title;
}

function shortLabel(info: Pick<TopicInfo, 'topic_title' | 'aliases' | 'topic_id'>): string {
  const acronym = info.aliases.find(alias => /^[a-z]{2,}$/i.test(alias.trim()));
  if (info.topic_title.startsWith('Introduction to')) {
    return acronym ? `Intro to ${acronym.toUpperCase()}` : info.topic_title.replace(/^Introduction to\s+/i, '');
  }
  return info.topic_title.replace(/^Elements of\s+/i, '');
}

/** One entry per topic, in the order they appear in the chunk metadata. */
export function getTopicCatalogue(chunks: TutorChunk[]): TopicInfo[] {
  const seen = new Set<string>();
  const catalogue: TopicInfo[] = [];

  for (const chunk of chunks) {
    if (seen.has(chunk.topic_id)) continue;
    seen.add(chunk.topic_id);
    const topicChunks = chunks.filter(item => item.topic_id === chunk.topic_id);
    const aliases = [...new Set(topicChunks.flatMap(item => item.aliases))];
    const info = {
      topic_id: chunk.topic_id,
      topic_title: chunk.topic_title,
      short_label: shortLabel({ ...chunk, aliases }),
      concept: topicConcept(chunk.topic_id, chunks),
      aliases,
    };
    catalogue.push(info);
  }
  return catalogue;
}

function joinWithOr(items: string[]): string {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} or ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, or ${items[items.length - 1]}`;
}

/** The exact clarification wording used when no topic is named. */
export function topicSwitchPrompt(chunks: TutorChunk[]): string {
  return `Sure! Which topic? ${joinWithOr(getTopicCatalogue(chunks).map(info => info.short_label))}?`;
}

export function topicLabel(topicId: string, chunks: TutorChunk[]): string {
  return getTopicCatalogue(chunks).find(info => info.topic_id === topicId)?.short_label
    || topicConcept(topicId, chunks);
}

const TOPIC_SWITCH_RE = /\b(?:other|another|different|next)\s+topic\b|\bsomething else\b|\bchange\s+topic\b|\bswitch\s+topic\b|\btopic\s+change\b/i;

/** "other topic", "next topic", "something else", "change topic", etc. */
export function isTopicSwitch(message: string): boolean {
  return TOPIC_SWITCH_RE.test(message);
}

function containsPhrase(haystack: string, needle: string): boolean {
  const value = normalize(needle);
  if (value.length < 3) return false;
  return haystack === value
    || haystack.includes(` ${value} `)
    || haystack.startsWith(`${value} `)
    || haystack.endsWith(` ${value}`);
}

/** Resolve a named topic from chunk titles, aliases and topic codes. */
export function resolveTopicFromMessage(message: string, chunks: TutorChunk[]): string | null {
  const code = message.match(/cv\s*-?\s*m\s*(\d)\s*-?\s*(\d{2})/i);
  if (code) {
    const topicId = `CV-M${code[1]}-${code[2]}`.toUpperCase();
    if (chunks.some(chunk => chunk.topic_id === topicId)) return topicId;
  }

  const q = normalize(message);
  if (!q) return null;
  const catalogue = getTopicCatalogue(chunks);

  // Titles and topic-definition aliases win across ALL topics before generic
  // component aliases are considered. "image acquisition" is both a DIP
  // component and the CV-M1-03 topic, so the topic definition must win.
  for (const info of catalogue) {
    const definition = chunks.find(chunk =>
      chunk.topic_id === info.topic_id && chunk.chunk_type === 'topic_definition'
    );
    const primary = [info.topic_title, info.short_label, info.concept, ...(definition?.aliases || [])];
    if (primary.some(identifier => containsPhrase(q, identifier))) return info.topic_id;
  }
  for (const info of catalogue) {
    if (info.aliases.some(identifier => containsPhrase(q, identifier))) return info.topic_id;
  }
  return null;
}

const CONTENT_REQUEST_RE = /\b(?:what|define|define|explain|describe|tell|give|show|send|example|examples|numerical|formula|quiz|mcq|question|questions|marks?|difference|differentiate|compare|application|applications|advantage|advantages|uses?)\b/i;

/** A bare topic name such as "image acquisition" means "switch to it". */
export function isBareTopicName(message: string, chunks: TutorChunk[]): boolean {
  const clean = message.trim().replace(/[?.!]+$/, '').trim();
  const wordCount = clean.split(/\s+/).filter(Boolean).length;
  if (!clean || wordCount === 0 || wordCount > 6) return false;
  if (CONTENT_REQUEST_RE.test(clean)) return false;

  const target = normalize(clean);
  return getTopicCatalogue(chunks).some(info => {
    const definition = chunks.find(chunk =>
      chunk.topic_id === info.topic_id && chunk.chunk_type === 'topic_definition'
    );
    const topicNames = [info.topic_title, info.short_label, info.concept, ...(definition?.aliases || [])];
    return topicNames.some(name => normalize(name) === target);
  });
}

function chunkMentionsConcept(chunk: TutorChunk, concept: string): boolean {
  const value = normalize(concept);
  if (!value) return false;
  const searchable = normalize([
    chunk.text,
    chunk.topic_title,
    chunk.subsection || '',
    chunk.term || '',
    ...chunk.aliases,
    ...chunk.keywords,
  ].join(' '));
  const subsection = normalize(chunk.subsection || '');
  return searchable.includes(value) || (subsection.length > 2 && value.includes(subsection));
}

/** A concept is verified against the metadata of the topic that was used. */
export function conceptBelongsToTopic(concept: string, topicId: string, chunks: TutorChunk[]): boolean {
  const value = normalize(concept);
  if (!value) return false;
  return chunks.some(chunk => {
    if (chunk.topic_id !== topicId) return false;
    const searchable = normalize([
      chunk.topic_title,
      chunk.term || '',
      chunk.subsection || '',
      ...chunk.aliases,
      ...chunk.keywords,
    ].join(' '));
    return searchable.includes(value);
  });
}

/** Derive the concept that a reply actually used, preferring a verified focus. */
export function conceptFromChunk(
  chunk: TutorChunk,
  chunks: TutorChunk[],
  preferred = ''
): string {
  const topic = topicConcept(chunk.topic_id, chunks);
  const cleanSubsection = (chunk.subsection || '').split(':').pop()?.trim() || '';
  const candidates = [preferred, chunk.term || '', cleanSubsection, topic];

  for (const candidate of candidates) {
    const canonical = canonicalConcept(candidate, chunks);
    if (!canonical) continue;
    if (chunkMentionsConcept(chunk, canonical) || conceptBelongsToTopic(canonical, chunk.topic_id, chunks)) {
      return canonical;
    }
  }
  return topic;
}
