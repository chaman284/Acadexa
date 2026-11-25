-- Quizzes are private to the faculty member who created them.
ALTER TABLE "Quiz" ADD COLUMN IF NOT EXISTS "facultyId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Quiz_facultyId_fkey'
  ) THEN
    ALTER TABLE "Quiz"
      ADD CONSTRAINT "Quiz_facultyId_fkey"
      FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Quiz_facultyId_idx" ON "Quiz"("facultyId");

-- Backfill existing quizzes from a matching faculty/subject assignment so
-- faculty do not lose access to quizzes they created before this change.
UPDATE "Quiz" q
SET "facultyId" = (
  SELECT fs."facultyId"
  FROM "FacultySubject" fs
  WHERE fs."subjectId" = q."subjectId" AND fs."sectionId" = q."sectionId"
  ORDER BY fs."id"
  LIMIT 1
)
WHERE q."facultyId" IS NULL;
