-- Extend CurriculumChunk for fine-grained tutor chunks.
ALTER TABLE "CurriculumChunk"
  ADD COLUMN IF NOT EXISTS "chunkType" TEXT NOT NULL DEFAULT 'explanation',
  ADD COLUMN IF NOT EXISTS "aliases" TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS "text" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "embeddedText" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "term" TEXT,
  ADD COLUMN IF NOT EXISTS "definition" TEXT,
  ADD COLUMN IF NOT EXISTS "linkedChunkIds" TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS "exampleChunkId" TEXT,
  ADD COLUMN IF NOT EXISTS "wordCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS "CurriculumChunk_chunkType_idx" ON "CurriculumChunk"("chunkType");
