import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useSettings } from '../../context/SettingsContext';
import type { FacultySettings as FacultySettingsType } from '../../types/settings';
import {
  Bell, Volume2, Moon, Globe, Save, CheckCircle2,
  AlertCircle, ShieldCheck, Database, RefreshCw, FileSpreadsheet, Mail
} from 'lucide-react';

type BooleanSettingKey = {
  [K in keyof FacultySettingsType]: FacultySettingsType[K] extends boolean ? K : never
}[keyof FacultySettingsType];

export const FacultySettings: React.FC = () => {
  const { settings, updateSettings, resetSettings, savedToBackend } = useSettings();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    window.setTimeout(() => setFeedback(null), 3500);
  };

  const handleToggle = (key: BooleanSettingKey) => {
    updateSettings({ [key]: !settings[key] } as Partial<typeof settings>);
  };

  const handleSave = () => {
    showFeedback(savedToBackend
      ? 'Faculty settings saved and applied successfully!'
      : 'Settings saved on this device (backend unavailable).');
  };

  const handleReset = () => {
    resetSettings();
    showFeedback('Settings reset to default values.');
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
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Settings
            </Button>
          </div>
        }
      />

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
          {([
            ['emailNotifications', Mail, 'Email Notifications',
              'Receive important academic notices and system announcements in your faculty inbox', 'text-[var(--color-accent)]'],
            ['submissionAlerts', Bell, 'Quiz Submission Alerts',
              'Show notices when students complete a published assessment or remedial test', 'text-oxblood'],
            ['lowPerformanceAlerts', AlertCircle, 'Low Performance & Learning Gap Alerts',
              'Flag class topics averaging below 60% or students who need attention', 'text-brass'],
            ['departmentAnnouncements', Bell, 'Departmental Announcements',
              'Circulars regarding academic board meetings, syllabus revisions, and exam schedules', 'text-oxblood'],
            ['weeklyReportDigest', FileSpreadsheet, 'Weekly Analytics Digest',
              'Include a weekly performance summary in your analytics exports', 'text-forest'],
          ] as const).map(([key, Icon, label, description, iconColor]) => (
            <div key={key} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
              </div>
              <button
                onClick={() => handleToggle(key)}
                aria-pressed={settings[key]}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  settings[key] ? 'bg-oxblood' : 'bg-taupe/60'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  settings[key] ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
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
              onChange={e => updateSettings({ theme: e.target.value as typeof settings.theme })}
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
              onChange={e => updateSettings({ language: e.target.value })}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="English">English (US/UK)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Default Export Format
            </div>
            <select
              value={settings.autoExportFormat}
              onChange={e => updateSettings({ autoExportFormat: e.target.value as typeof settings.autoExportFormat })}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="csv">CSV (Excel-compatible)</option>
              <option value="json">JSON (Structured Data)</option>
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
              aria-pressed={settings.soundEffects}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.soundEffects ? 'bg-oxblood' : 'bg-taupe/60'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
              }`} />
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
              <ShieldCheck className="w-4 h-4 text-forest" /> Role Verification
            </span>
            <Badge color="oxblood">Faculty Access Validated</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-muted)] flex items-center gap-1.5">
              <Database className="w-4 h-4 text-oxblood" /> Preferences Sync
            </span>
            <span className="text-[var(--color-text-secondary)] font-medium">
              {savedToBackend ? 'Synced to your account' : 'Saved on this device'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
