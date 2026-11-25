-- Optional provenance for questions generated from uploaded documents.
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "source" JSONB;
