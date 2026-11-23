// ============================================
// UNIFIED PORTAL SETTINGS
// Preferences are shared by all three roles and persisted per user.
// ============================================

export type ThemePreference = 'light' | 'dark' | 'system';
export type ExportFormat = 'csv' | 'json';

export interface AppSettings {
  // Shared
  theme: ThemePreference;
  language: string;
  soundEffects: boolean;

  // Administrator
  emailAlertsOnEnrollment: boolean;
  systemMaintenanceAlerts: boolean;
  autoSyncAcademicYears: boolean;
  quizReportNotifications: boolean;
  exportFormat: ExportFormat;

  // Faculty
  emailNotifications: boolean;
  submissionAlerts: boolean;
  lowPerformanceAlerts: boolean;
  departmentAnnouncements: boolean;
  weeklyReportDigest: boolean;
  autoExportFormat: ExportFormat;

  // Student
  quizReminders: boolean;
  announcementAlerts: boolean;
  performanceReports: boolean;
  autoSaveProgress: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  language: 'English',
  soundEffects: true,

  emailAlertsOnEnrollment: true,
  systemMaintenanceAlerts: true,
  autoSyncAcademicYears: true,
  quizReportNotifications: false,
  exportFormat: 'csv',

  emailNotifications: true,
  submissionAlerts: true,
  lowPerformanceAlerts: true,
  departmentAnnouncements: true,
  weeklyReportDigest: false,
  autoExportFormat: 'csv',

  quizReminders: true,
  announcementAlerts: true,
  performanceReports: false,
  autoSaveProgress: true,
};

export type AdminSettingsConfig = Pick<
  AppSettings,
  'emailAlertsOnEnrollment' | 'systemMaintenanceAlerts' | 'autoSyncAcademicYears' |
  'quizReportNotifications' | 'exportFormat' | 'soundEffects'
>;

export type FacultySettings = Pick<
  AppSettings,
  'emailNotifications' | 'submissionAlerts' | 'lowPerformanceAlerts' |
  'departmentAnnouncements' | 'weeklyReportDigest' | 'theme' | 'language' |
  'soundEffects' | 'autoExportFormat'
>;

export type StudentSettings = Pick<
  AppSettings,
  'emailNotifications' | 'quizReminders' | 'announcementAlerts' |
  'performanceReports' | 'theme' | 'language' | 'soundEffects' | 'autoSaveProgress'
>;
