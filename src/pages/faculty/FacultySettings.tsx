import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { facultyService, defaultFacultySettings } from '../../services/facultyService';
import type { FacultySettings as FacultySettingsType } from '../../types/faculty';
import {
  Bell, Volume2, Moon, Globe, Save, CheckCircle2,
  AlertCircle, ShieldCheck, Database, RefreshCw, FileSpreadsheet, Mail
} from 'lucide-react';

export const FacultySettings: React.FC = () => {
  const [settings, setSettings] = useState<FacultySettingsType>(facultyService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setSettings(facultyService.getSettings());
  }, []);

  const handleToggle = (key: keyof FacultySettingsType) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      facultyService.updateSettings(settings);
      setFeedback({ type: 'success', message: 'Faculty settings saved and applied successfully!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultFacultySettings);
    facultyService.updateSettings(defaultFacultySettings);
    setFeedback({ type: 'success', message: 'Settings reset to default values.' });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your faculty dashboard notifications, reports, and teaching preferences"
        breadcrumbs={[{ label: 'Dashboard', to: '/faculty' }, { label: 'Settings' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset Defaults
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Settings
            </Button>
          </div>
        }
      />

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Notifications & Alert Controls */}
      <Card>
        <CardHeader
          title="Notifications & Academic Alerts"
          subtitle="Configure how and when you receive automated updates on student progress and exams"
        />

        <div className="divide-y divide-[var(--color-border)]">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--color-accent)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Email Notifications
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Receive important academic notices and system announcements in your faculty inbox
              </p>
            </div>
            <button
              onClick={() => handleToggle('emailNotifications')}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.emailNotifications ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Quiz Submission Alerts
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Notify when students complete a published assessment or remedial test
              </p>
            </div>
            <button
              onClick={() => handleToggle('submissionAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.submissionAlerts ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.submissionAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Low Performance & Learning Gap Alerts
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Automated flag when class topic average drops below 60% or specific students need attention
              </p>
            </div>
            <button
              onClick={() => handleToggle('lowPerformanceAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.lowPerformanceAlerts ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.lowPerformanceAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Departmental Announcements
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Circulars regarding academic board meetings, syllabus revisions, and exam schedules
              </p>
            </div>
            <button
              onClick={() => handleToggle('departmentAnnouncements')}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.departmentAnnouncements ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.departmentAnnouncements ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Weekly Analytics Digest
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Receive weekly summarized performance matrices and topic completion digests
              </p>
            </div>
            <button
              onClick={() => handleToggle('weeklyReportDigest')}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.weeklyReportDigest ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.weeklyReportDigest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Interface & Preferences */}
      <Card>
        <CardHeader
          title="Display & Portal Preferences"
          subtitle="Customize interface theme, language, and default export formats"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <Moon className="w-3.5 h-3.5" /> Color Theme
            </div>
            <select
              value={settings.theme}
              onChange={e => setSettings({ ...settings, theme: e.target.value as any })}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="light">Light Theme (Default)</option>
              <option value="dark">Dark Theme</option>
              <option value="system">System Preference</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <Globe className="w-3.5 h-3.5" /> Portal Language
            </div>
            <select
              value={settings.language}
              onChange={e => setSettings({ ...settings, language: e.target.value })}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="English">English (US/UK)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Spanish">Spanish (Español)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Default Export Format
            </div>
            <select
              value={settings.autoExportFormat}
              onChange={e => setSettings({ ...settings, autoExportFormat: e.target.value as any })}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="csv">CSV (Comma Separated Values)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                <Volume2 className="w-3.5 h-3.5" /> Sound Effects & Audio
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Audio feedback on actions</p>
            </div>
            <button
              onClick={() => handleToggle('soundEffects')}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.soundEffects ? 'bg-[var(--color-accent)]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Security & System Info */}
      <Card>
        <CardHeader title="Data Security & Session" />
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Role Verification
            </span>
            <Badge color="indigo">Faculty Access Validated</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" /> Local Storage Sync
            </span>
            <span className="text-[var(--color-text-secondary)] font-medium">Auto-synced</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
