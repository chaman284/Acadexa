-- AlterTable
ALTER TABLE "Topic" ADD COLUMN IF NOT EXISTS "moduleNo" INTEGER;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subtopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Subtopic_topicId_idx" ON "Subtopic"("topicId");

-- AlterTable
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "subtopicId" TEXT;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Subtopic_topicId_fkey') THEN
        ALTER TABLE "Subtopic"
        ADD CONSTRAINT "Subtopic_topicId_fkey"
        FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Question_subtopicId_fkey') THEN
        ALTER TABLE "Question"
        ADD CONSTRAINT "Question_subtopicId_fkey"
        FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON UPDATE CASCADE ON DELETE SET NULL;
    END IF;
END $$;
