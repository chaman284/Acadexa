// One-command ingest: read notes (or the previous JSON source), build
// fine-grained chunks, validate, write chunks.json + embeddings, and seed DB.
// Run with: npm run ingest

import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { embedTexts } from '../src/services/embeddings';
import {
  chunksFilePath,
  embeddingsFilePath,
  loadChunksFromJson,
  seedChunks,
} from '../src/services/chunkStore';
import { normalize } from '../src/services/textUtils';
import type { ChunkType, TutorChunk } from '../src/services/tutorTypes';

interface LegacyChunk {
  id: string;
  topic_id: string;
  topic_title: string;
  module: string;
  section: string;
  subsection: string | null;
  keywords: string[];
  question_types: string[];
  content: string;
}

const DATA_DIR = join(__dirname, '..', 'prisma', 'data');
const NOTES_DIR = join(DATA_DIR, 'notes');

function slug(text: string): string {
  return normalize(text).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
}

function firstSentences(text: string, max: number): string {
  const parts = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
  return parts.slice(0, max).join(' ').trim();
}

function topicAliases(title: string, definition: string, simpleKeywords: string[]): string[] {
  const aliases = new Set<string>();
  const clean = title.replace(/^Introduction to\s+/i, '').replace(/^Elements of\s+/i, '');
  aliases.add(title.toLowerCase());
  aliases.add(clean.toLowerCase());
  for (const match of `${title} ${definition}`.matchAll(/\(([A-Za-z]{2,})\)/g)) {
    aliases.add(match[1].toLowerCase());
  }
  const words = clean.toLowerCase().replace(/[^a-z\s]/g, '').split(' ').filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    aliases.add(words.slice(i, i + 2).join(' '));
    aliases.add(words.slice(i, i + 3).join(' '));
  }
  simpleKeywords
    .filter(keyword => keyword.includes(' ') && !/^cv-m\d/i.test(keyword))
    .forEach(keyword => aliases.add(normalize(keyword)));
  aliases.delete('');
  return [...aliases].filter(alias => alias.length > 1);
}

function makeChunk(
  base: Omit<LegacyChunk, 'id'> & { id: string },
  chunkType: ChunkType,
  text: string,
  keywords: string[],
  aliases: string[],
  extras: Partial<TutorChunk> = {}
): TutorChunk {
  const label = base.subsection ? `${base.section} - ${base.subsection}` : base.section;
  return {
    chunk_id: base.id,
    topic_id: base.topic_id,
    topic_title: base.topic_title,
    module: base.module,
    section: base.section,
    subsection: base.subsection,
    chunk_type: chunkType,
    keywords: [...new Set(keywords)].filter(Boolean),
    aliases: [...new Set(aliases)].filter(Boolean),
    text,
    embedded_text: `[Computer Vision | ${base.topic_id} ${base.topic_title} | ${label}] ${text}`,
    term: null,
    definition: null,
    linked_chunk_ids: [],
    example_chunk_id: null,
    word_count: text.split(/\s+/).filter(Boolean).length,
    ...extras,
  };
}

function buildTopicChunks(topicChunks: LegacyChunk[]): TutorChunk[] {
  const output: TutorChunk[] = [];
  const topic = topicChunks[0];
  const simple = topicChunks.find(c => c.section === 'Simple Explanation');
  const definitions = topicChunks.find(c => c.section === 'Key Definitions and Terms');
  const formulaSource = topicChunks.find(c => c.section === 'Formulas / Algorithm Steps');
  const mcqSource = topicChunks.find(c => c.section === 'Practice MCQs');
  const example = topicChunks.find(c => c.section === 'Worked Example');
  const exampleId = example?.id || null;

  // (a) One topic definition chunk: the topic's own definition, not list entries.
  if (simple) {
    const definition = firstSentences(simple.content, 2);
    output.push(makeChunk(
      { ...simple, id: `${topic.topic_id}-topic-definition` },
      'topic_definition',
      definition,
      [topic.topic_title.toLowerCase(), ...simple.keywords.slice(0, 8)],
      topicAliases(topic.topic_title, definition, simple.keywords),
      { subsection: null, definition }
    ));
  }

  // (b)+(c) Section and detailed sub-section chunks.
  const sectionType: Record<string, ChunkType> = {
    'Prerequisites': 'explanation',
    'Simple Explanation': 'explanation',
    'Detailed Explanation': 'explanation',
    'Advantages/Disadvantages': 'explanation',
    'Worked Example': 'worked_example',
    'Common Mistakes and Misconceptions': 'mistakes',
    'Important Exam Points': 'exam_points',
  };
  for (const chunk of topicChunks) {
    const chunkType = sectionType[chunk.section];
    if (!chunkType) continue; // handled separately below
    output.push(makeChunk(
      chunk,
      chunkType,
      chunk.content,
      chunk.keywords,
      chunk.subsection
        ? [chunk.subsection.toLowerCase(), ...chunk.keywords.filter(k => k.includes(' '))]
        : chunk.keywords.filter(k => k.includes(' ')),
      {
        linked_chunk_ids: chunkType === 'worked_example' && exampleId ? [exampleId] : [],
      }
    ));
  }

  // (d) One term definition chunk per term.
  if (definitions) {
    const lines = definitions.content.split('\n');
    let lastTermChunk: TutorChunk | null = null;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (/^note:/i.test(trimmed)) {
        if (lastTermChunk) {
          lastTermChunk.text += ` ${trimmed}`;
          lastTermChunk.definition += ` ${trimmed}`;
          lastTermChunk.embedded_text = makeChunk(
            { ...definitions, id: lastTermChunk.chunk_id },
            'term_definition',
            lastTermChunk.text,
            lastTermChunk.keywords,
            lastTermChunk.aliases
          ).embedded_text;
          lastTermChunk.word_count = lastTermChunk.text.split(/\s+/).filter(Boolean).length;
        }
        return;
      }
      const match = trimmed.match(/^[-•]?\s*(.+?):\s*(.+)$/);
      if (!match) return;
      const term = match[1].trim();
      const definition = match[2].trim();
      const chunk = makeChunk(
        { ...definitions, id: `${topic.topic_id}-term-${slug(term)}` },
        'term_definition',
        `${term}: ${definition}`,
        [term.toLowerCase(), ...normalize(definition).split(' ').filter(w => w.length > 4).slice(0, 8)],
        [term.toLowerCase(), `${term.toLowerCase()}s`, normalize(term)],
        { subsection: null, term, definition }
      );
      output.push(chunk);
      lastTermChunk = chunk;
    });
  }

  // One formula per chunk, keeping each "where" explanation attached.
  if (formulaSource) {
    const formulaLines = formulaSource.content.split('\n').filter(line => /^\d+\.\s*/.test(line.trim()));
    formulaLines.forEach((raw, index) => {
      const line = raw.replace(/^\d+\.\s*/, '').trim();
      const name = (line.split(':')[0] || line.split('=')[0]).trim().slice(0, 80);
      const isFormula = /[=]|\blaw\b|formula/i.test(line);
      const id = `${topic.topic_id}-formula-${slug(name) || index + 1}`;
      output.push(makeChunk(
        { ...formulaSource, id },
        isFormula ? 'formula' : 'explanation',
        line,
        [name.toLowerCase(), ...formulaSource.keywords.filter(k => normalize(line).includes(normalize(k)))],
        [name.toLowerCase(), ...name.toLowerCase().split(' ').filter(w => w.length > 4)],
        {
          subsection: name,
          linked_chunk_ids: exampleId && isFormula ? [exampleId] : [],
          example_chunk_id: exampleId && isFormula ? exampleId : null,
        }
      ));
    });
  }

  // One MCQ per chunk.
  if (mcqSource) {
    const questions = mcqSource.content.split('\n').filter(line => /^\d+\.\s*/.test(line.trim()));
    questions.forEach((raw, index) => {
      const line = raw.replace(/^\d+\.\s*/, '').trim();
      output.push(makeChunk(
        { ...mcqSource, id: `${topic.topic_id}-mcq-${index + 1}` },
        'mcq',
        line,
        [...mcqSource.keywords.filter(k => /mcq|quiz|practice/.test(k)), ...normalize(line).split(' ').filter(w => w.length > 5).slice(0, 6)],
        [],
        { subsection: `MCQ ${index + 1}` }
      ));
    });
  }

  return output;
}

export function buildChunks(source: LegacyChunk[]): TutorChunk[] {
  const byTopic = new Map<string, LegacyChunk[]>();
  source.forEach(chunk => {
    const list = byTopic.get(chunk.topic_id) || [];
    list.push(chunk);
    byTopic.set(chunk.topic_id, list);
  });
  const chunks = [...byTopic.values()].flatMap(buildTopicChunks);
  const ids = new Set<string>();
  return chunks.map(chunk => {
    if (ids.has(chunk.chunk_id)) throw new Error(`Duplicate chunk id: ${chunk.chunk_id}`);
    ids.add(chunk.chunk_id);
    return chunk;
  });
}

function sourceChunks(): { label: string; chunks: LegacyChunk[]; isLegacy: boolean } {
  if (existsSync(NOTES_DIR)) {
    const files = readdirSync(NOTES_DIR).filter(file => file.endsWith('.json')).sort();
    if (files.length > 0) {
      const chunks = files.flatMap(file => {
        const parsed = JSON.parse(readFileSync(join(NOTES_DIR, file), 'utf8')) as { chunks?: LegacyChunk[] };
        return parsed.chunks || [];
      });
      if (chunks.length > 0) return { label: `notes/*.json (${files.length} files)`, chunks, isLegacy: true };
    }
  }
  const existing = loadChunksFromJson() as unknown as LegacyChunk[];
  const isLegacy = !('chunk_type' in existing[0]) && 'content' in existing[0];
  return { label: isLegacy ? 'cvModule1Chunks.json (previous coarse source)' : 'chunks.json', chunks: existing, isLegacy };
}

function printValidation(chunks: TutorChunk[]): void {
  console.log('\nChunk validation (id | type | words | flag)');
  console.log('-'.repeat(78));
  for (const chunk of chunks) {
    const flag = chunk.word_count > 300 ? 'OVER 300' : chunk.word_count < 15 ? 'UNDER 15' : '';
    console.log(`${chunk.chunk_id.padEnd(48)} ${chunk.chunk_type.padEnd(16)} ${String(chunk.word_count).padStart(4)}  ${flag}`);
  }
  const byType = chunks.reduce<Record<string, number>>((counts, chunk) => {
    counts[chunk.chunk_type] = (counts[chunk.chunk_type] || 0) + 1;
    return counts;
  }, {});
  console.log('-'.repeat(78));
  console.log(`Total: ${chunks.length} chunks | ${JSON.stringify(byType)}`);
  console.log(`Flagged: ${chunks.filter(c => c.word_count > 300 || c.word_count < 15).length} (under 15 words is expected for tiny term/formula chunks)`);
}

async function main(): Promise<void> {
  const source = sourceChunks();
  console.log(`Ingest source: ${source.label}`);
  const chunks = source.isLegacy ? buildChunks(source.chunks) : source.chunks as unknown as TutorChunk[];
  printValidation(chunks);

  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(chunksFilePath(), JSON.stringify({
    subject: 'Computer Vision',
    module: 'Module 1',
    moduleTitle: 'Fundamentals of Digital Imaging and Transformations',
    chunks,
  }, null, 2));
  console.log(`\nWrote ${chunksFilePath()}`);

  const vectors = await embedTexts(chunks.map(chunk => chunk.embedded_text));
  const embeddingMap: Record<string, number[]> = {};
  chunks.forEach((chunk, index) => { embeddingMap[chunk.chunk_id] = vectors[index]; });
  writeFileSync(embeddingsFilePath(), JSON.stringify(embeddingMap));
  console.log(`Wrote ${embeddingsFilePath()} (${vectors[0]?.length || 0} dimensions)`);

  if (!process.argv.includes('--no-seed')) {
    const client = new PrismaClient();
    try {
      await seedChunks(chunks, client);
      console.log(`Seeded ${chunks.length} chunks into CurriculumChunk.`);
    } catch (error) {
      console.warn('DB seed failed (JSON files are still ready):', (error as Error).message);
    } finally {
      await client.$disconnect();
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
