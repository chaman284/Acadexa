import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useSettings } from '../../context/SettingsContext';
import type { StudentSettings as StudentSettingsType } from '../../types/settings';
import {
  Bell, Volume2, Moon, Globe, Save, CheckCircle2,
  AlertCircle, ShieldCheck, Database, RefreshCw
} from 'lucide-react';

type BooleanSettingKey = {
  [K in keyof StudentSettingsType]: StudentSettingsType[K] extends boolean ? K : never
}[keyof StudentSettingsType];

export const StudentSettingsPage: React.FC = () => {
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
      ? 'Settings saved and applied successfully!'
      : 'Settings saved on this device (backend unavailable).');
  };

  const handleReset = () => {
    resetSettings();
    showFeedback('Settings reset to default values.');
  };

  const toggleRow = (
    key: BooleanSettingKey,
    title: string,
    description: string,
    testId?: string,
  ) => (
    <div key={key} className="py-3.5 flex items-center justify-between gap-4" data-testid={testId}>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={settings[key]}
          onChange={() => handleToggle(key)}
          className="sr-only peer"
          aria-label={title}
        />
        <div className="w-11 h-6 bg-taupe/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-oxblood"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your dashboard experience, alerts, and learning preferences"
        breadcrumbs={[{ label: 'Dashboard', to: '/student' }, { label: 'Settings' }]}
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
              Save Preferences
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Notifications Section */}
      <Card>
        <CardHeader
          title="Notification Alerts"
          subtitle="Configure which academic updates appear in your notification bell"
          action={<Bell className="w-4 h-4 text-[var(--color-accent)]" />}
        />
        <div className="divide-y divide-[var(--color-border)]">
          {toggleRow('quizReminders', 'Quiz & Assessment Reminders',
            'Show notices before weekly quizzes and deadlines')}
          {toggleRow('announcementAlerts', 'Department Announcements',
            'Alerts for college schedules, exams, and symposium events')}
          {toggleRow('emailNotifications', 'Email Notifications',
            'Receive important notifications at your registered email')}
          {toggleRow('performanceReports', 'Weekly Performance Reports',
            'Show topic mastery and quiz summary digests in your feed')}
        </div>
      </Card>

      {/* Learning & Interface Preferences */}
      <Card>
        <CardHeader
          title="Learning Experience"
          subtitle="Customize your interactive study interface"
          action={<Volume2 className="w-4 h-4 text-oxblood" />}
        />
        <div className="divide-y divide-[var(--color-border)]">
          {toggleRow('soundEffects', 'Interactive Sound Effects',
            'Play audio feedback during quiz actions and submissions')}
          {toggleRow('autoSaveProgress', 'Auto-Save Topic Progress',
            'Keep completed syllabus units across sessions when enabled')}

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Color Theme</p>
              <p className="text-xs text-[var(--color-text-muted)]">Applied to the whole portal immediately</p>
            </div>
            <select
              value={settings.theme}
              onChange={e => updateSettings({ theme: e.target.value as typeof settings.theme })}
              aria-label="Color Theme"
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="system">System Preference</option>
            </select>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Display Language</p>
              <p className="text-xs text-[var(--color-text-muted)]">Language for courses, questions, and dashboard UI</p>
            </div>
            <select
              value={settings.language}
              onChange={e => updateSettings({ language: e.target.value })}
              aria-label="Display Language"
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="English">English (US/UK)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Spanish">Español (Spanish)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Account Security Info */}
      <Card>
        <CardHeader
          title="Account Security & Privacy"
          subtitle="Your student session security details"
          action={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
        />
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-[var(--color-muted)] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">Role-based Access Control</p>
              <p className="text-xs text-[var(--color-text-muted)]">Authorized as Student (Student Dashboard Access Only)</p>
            </div>
            <Badge color="green">Active Session</Badge>
          </div>
          <div className="p-3 bg-[var(--color-muted)] rounded-xl flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--color-text-primary)]">Data Persistence</p>
              <p className="text-xs text-[var(--color-text-muted)]">Progress and profile are synced to local storage and backend</p>
            </div>
            <Database className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
        </div>
      </Card>
    </div>
  );
};
