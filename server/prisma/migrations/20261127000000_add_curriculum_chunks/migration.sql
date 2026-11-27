-- CreateTable
CREATE TABLE IF NOT EXISTS "CurriculumChunk" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "subsection" TEXT,
    "keywords" TEXT[] NOT NULL DEFAULT '{}'::text[],
    "questionTypes" TEXT[] NOT NULL DEFAULT '{}'::text[],
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CurriculumChunk_topicId_section_idx" ON "CurriculumChunk"("topicId", "section");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CurriculumChunk_module_topicId_idx" ON "CurriculumChunk"("module", "topicId");
