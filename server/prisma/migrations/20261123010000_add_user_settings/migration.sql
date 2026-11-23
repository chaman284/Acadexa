-- Per-user portal preferences (theme, alerts, export format, etc.)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "settings" JSONB;
