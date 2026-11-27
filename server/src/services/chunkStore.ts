// Storage helpers for fine-grained tutor chunks.
// JSON files are the source of truth for ingest/tests; Postgres is the
// runtime cache. Raw SQL is used because prisma generate is blocked by a
// locked query-engine DLL on this machine.

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import type { TutorChunk } from './tutorTypes';

const DATA_DIR = join(__dirname, '..', '..', 'prisma', 'data');
const CHUNKS_FILE = join(DATA_DIR, 'chunks.json');
const EMBEDDINGS_FILE = join(DATA_DIR, 'chunkEmbeddings.json');

export function loadChunksFromJson(): TutorChunk[] {
  const file = existsSync(CHUNKS_FILE)
    ? CHUNKS_FILE
    : join(DATA_DIR, 'cvModule1Chunks.json');
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as { chunks: TutorChunk[] };
  return parsed.chunks;
}

export function loadEmbeddingsFromJson(): Record<string, number[]> {
  if (!existsSync(EMBEDDINGS_FILE)) return {};
  return JSON.parse(readFileSync(EMBEDDINGS_FILE, 'utf8')) as Record<string, number[]>;
}

export function chunksFilePath(): string {
  return CHUNKS_FILE;
}

export function embeddingsFilePath(): string {
  return EMBEDDINGS_FILE;
}

/** Replace the table contents with the freshly ingested chunks. */
export async function seedChunks(chunks: TutorChunk[], client = new PrismaClient()): Promise<void> {
  await client.$executeRawUnsafe('DELETE FROM "CurriculumChunk"');
  for (const c of chunks) {
    await client.$executeRawUnsafe(
      `INSERT INTO "CurriculumChunk"
        ("id", "topicId", "topicTitle", "module", "section", "subsection", "chunkType",
         "keywords", "questionTypes", "aliases", "content", "text", "embeddedText",
         "term", "definition", "linkedChunkIds", "exampleChunkId", "wordCount", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
      c.chunk_id,
      c.topic_id,
      c.topic_title,
      c.module,
      c.section,
      c.subsection,
      c.chunk_type,
      c.keywords,
      [],
      c.aliases,
      c.text,
      c.text,
      c.embedded_text,
      c.term ?? null,
      c.definition ?? null,
      c.linked_chunk_ids,
      c.example_chunk_id ?? null,
      c.word_count,
      new Date()
    );
  }
}

/** Load chunks from Postgres when available; otherwise use the JSON source. */
export async function loadChunksFromDatabase(): Promise<TutorChunk[] | null> {
  const client = new PrismaClient();
  try {
    const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT "id", "topicId", "topicTitle", "module", "section", "subsection", "chunkType",
              "keywords", "aliases", "text", "embeddedText", "term", "definition",
              "linkedChunkIds", "exampleChunkId", "wordCount"
       FROM "CurriculumChunk"`
    );
    if (rows.length === 0) return null;
    return rows.map(row => ({
      chunk_id: String(row.id),
      topic_id: String(row.topicId),
      topic_title: String(row.topicTitle),
      module: String(row.module),
      section: String(row.section),
      subsection: row.subsection ? String(row.subsection) : null,
      chunk_type: String(row.chunkType) as TutorChunk['chunk_type'],
      keywords: (row.keywords as string[]) || [],
      aliases: (row.aliases as string[]) || [],
      text: String(row.text),
      embedded_text: String(row.embeddedText),
      term: row.term ? String(row.term) : null,
      definition: row.definition ? String(row.definition) : null,
      linked_chunk_ids: (row.linkedChunkIds as string[]) || [],
      example_chunk_id: row.exampleChunkId ? String(row.exampleChunkId) : null,
      word_count: Number(row.wordCount) || 0,
    }));
  } catch {
    return null;
  } finally {
    await client.$disconnect();
  }
}
