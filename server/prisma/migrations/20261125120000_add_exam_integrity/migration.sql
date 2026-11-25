-- Formal-exam integrity: tab-switch counter, auto-submission state, violation log,
-- persisted answer drafts, and an explicit submitted/finalized flag for drafts.

ALTER TABLE "QuizAttempt"
    ADD COLUMN IF NOT EXISTS "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS "autoSubmitReason" TEXT,
    ADD COLUMN IF NOT EXISTS "violations" JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS "isSubmitted" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "answerDrafts" JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "QuizAttempt_isSubmitted_startedAt_idx"
    ON "QuizAttempt"("isSubmitted", "startedAt");
