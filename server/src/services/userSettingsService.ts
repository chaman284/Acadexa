import { prisma } from '../prisma';

export type UserSettings = Record<string, string | boolean>;

/** Read preferences stored on the user row. Returns {} when nothing was saved yet. */
export const readUserSettings = async (userId: string): Promise<UserSettings> => {
  const rows = await prisma.$queryRaw<Array<{ settings: unknown }>>`
    SELECT "settings" FROM "User" WHERE "id" = ${userId} LIMIT 1
  `;
  const raw = rows[0]?.settings;
  if (!raw) return {};
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as UserSettings
      : {};
  } catch {
    return {};
  }
};
