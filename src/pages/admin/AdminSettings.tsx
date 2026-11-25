import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useSettings } from '../../context/SettingsContext';
import type { AdminSettingsConfig } from '../../types/settings';
import {
  Bell, ShieldCheck, Database, RefreshCw, Volume2,
  Mail, Save, CheckCircle2, AlertCircle, FileSpreadsheet, Cpu, Layers, Moon, Globe
} from 'lucide-react';

type BooleanSettingKey = {
  [K in keyof AdminSettingsConfig]: AdminSettingsConfig[K] extends boolean ? K : never
}[keyof AdminSettingsConfig];

export const AdminSettings: React.FC = () => {
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
      ? 'Administrator preferences saved and applied successfully!'
      : 'Preferences saved on this device (backend unavailable).');
  };

  const handleReset = () => {
    resetSettings();
    showFeedback('Preferences reset to default values.');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Settings & Governance Preferences"
        subtitle="Configure institutional notifications, system alerts, and administrator preferences"
        breadcrumbs={[{ label: 'Dashboard', to: '/admin' }, { label: 'Settings' }]}
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

      {/* Administrative Alert Controls */}
      <Card>
        <CardHeader
          title="Administrative Alert Preferences"
          subtitle="Configure how and when you receive automated updates across departments and enrollment batches"
        />

        <div className="divide-y divide-[var(--color-border)]">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-oxblood" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Student Enrollment Alerts
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Receive notifications when new students are enrolled or assigned sections
              </p>
            </div>
            <button
              onClick={() => handleToggle('emailAlertsOnEnrollment')}
              aria-pressed={settings.emailAlertsOnEnrollment}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.emailAlertsOnEnrollment ? 'bg-oxblood' : 'bg-taupe/60'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.emailAlertsOnEnrollment ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  System Maintenance & Database Alerts
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Receive alerts on schema synchronizations, database backups, and system status changes
              </p>
            </div>
            <button
              onClick={() => handleToggle('systemMaintenanceAlerts')}
              aria-pressed={settings.systemMaintenanceAlerts}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.systemMaintenanceAlerts ? 'bg-oxblood' : 'bg-taupe/60'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.systemMaintenanceAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Academic Year Auto-Mapping
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Include automatic semester-to-year mapping in enrollment records and alerts
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoSyncAcademicYears')}
              aria-pressed={settings.autoSyncAcademicYears}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.autoSyncAcademicYears ? 'bg-oxblood' : 'bg-taupe/60'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.autoSyncAcademicYears ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-oxblood" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Quiz & Assessment Activity Reports
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Show quiz publish and completion notices in your notification feed
              </p>
            </div>
            <button
              onClick={() => handleToggle('quizReportNotifications')}
              aria-pressed={settings.quizReportNotifications}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                settings.quizReportNotifications ? 'bg-oxblood' : 'bg-taupe/60'
              }`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                settings.quizReportNotifications ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Interface & Data Export */}
      <Card>
        <CardHeader
          title="Data Export & Display Preferences"
          subtitle="Manage output formats for institutional reporting and audio cues"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-forest" /> Default Export Format
            </div>
            <select
              value={settings.exportFormat}
              onChange={e => updateSettings({ exportFormat: e.target.value as typeof settings.exportFormat })}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[8px] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="csv">CSV (Spreadsheet / Microsoft Excel)</option>
              <option value="json">JSON (Structured Archive)</option>
            </select>
          </div>

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

          <div className="p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                <Volume2 className="w-3.5 h-3.5 text-oxblood" /> Audio Feedback & Cues
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">Sound effects on actions & changes</p>
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
            <Badge color="oxblood">Administrator Root Access Validated</Badge>
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
