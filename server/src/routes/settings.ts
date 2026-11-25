import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { readUserSettings, type UserSettings } from '../services/userSettingsService';

const router = Router();

const BOOLEAN_KEYS = [
  'emailAlertsOnEnrollment',
  'systemMaintenanceAlerts',
  'autoSyncAcademicYears',
  'quizReportNotifications',
  'soundEffects',
  'emailNotifications',
  'submissionAlerts',
  'lowPerformanceAlerts',
  'departmentAnnouncements',
  'weeklyReportDigest',
  'quizReminders',
  'announcementAlerts',
  'performanceReports',
  'autoSaveProgress',
] as const;

const STRING_KEYS = ['theme', 'language', 'exportFormat', 'autoExportFormat'] as const;

const sanitize = (input: any): UserSettings => {
  const clean: UserSettings = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return clean;

  for (const key of BOOLEAN_KEYS) {
    if (typeof input[key] === 'boolean') clean[key] = input[key];
  }
  for (const key of STRING_KEYS) {
    if (typeof input[key] === 'string' && input[key].length <= 100) clean[key] = input[key];
  }
  return clean;
};

router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    res.json({ settings: await readUserSettings(req.user.id) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    const settings = sanitize(req.body?.settings ?? req.body);
    await prisma.$executeRaw`
      UPDATE "User" SET "settings" = ${JSON.stringify(settings)}::jsonb WHERE "id" = ${req.user.id}
    `;
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
