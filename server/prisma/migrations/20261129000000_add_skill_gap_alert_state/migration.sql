-- Tracks the last skill-gap status faculty were notified about.
-- Applied with raw SQL because `prisma generate` currently fails with EPERM
-- on the local Windows query-engine file.

CREATE TABLE IF NOT EXISTS "SkillGapAlertState" (
  "id" TEXT NOT NULL,
  "facultyId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "lastMastery" DOUBLE PRECISION NOT NULL,
  "lastNotifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SkillGapAlertState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SkillGapAlertState_faculty_student_subject_section_key"
  ON "SkillGapAlertState"("facultyId", "studentId", "subjectId", "sectionId");

CREATE INDEX IF NOT EXISTS "SkillGapAlertState_faculty_section_subject_idx"
  ON "SkillGapAlertState"("facultyId", "sectionId", "subjectId");

CREATE INDEX IF NOT EXISTS "SkillGapAlertState_student_subject_section_idx"
  ON "SkillGapAlertState"("studentId", "subjectId", "sectionId");

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SkillGapAlertState_facultyId_fkey') THEN
    ALTER TABLE "SkillGapAlertState"
      ADD CONSTRAINT "SkillGapAlertState_facultyId_fkey"
      FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SkillGapAlertState_studentId_fkey') THEN
    ALTER TABLE "SkillGapAlertState"
      ADD CONSTRAINT "SkillGapAlertState_studentId_fkey"
      FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SkillGapAlertState_subjectId_fkey') THEN
    ALTER TABLE "SkillGapAlertState"
      ADD CONSTRAINT "SkillGapAlertState_subjectId_fkey"
      FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$migration$;

DO $migration$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SkillGapAlertState_sectionId_fkey') THEN
    ALTER TABLE "SkillGapAlertState"
      ADD CONSTRAINT "SkillGapAlertState_sectionId_fkey"
      FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$migration$;
