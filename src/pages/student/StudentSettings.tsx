import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { studentService } from '../../services/studentService';
import type { StudentSettings } from '../../types/student';
import {
  Bell, Volume2, Moon, Globe, Save, CheckCircle2,
  AlertCircle, ShieldCheck, Database, RefreshCw
} from 'lucide-react';

export const StudentSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StudentSettings>(studentService.getSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setSettings(studentService.getSettings());
  }, []);

  const handleToggle = (key: keyof StudentSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      studentService.updateSettings(settings);
      setFeedback({ type: 'success', message: 'Settings saved and applied successfully!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaults: StudentSettings = {
      emailNotifications: true,
      quizReminders: true,
      announcementAlerts: true,
      performanceReports: false,
      theme: 'light',
      language: 'English',
      soundEffects: true,
      autoSaveProgress: true,
    };
    setSettings(defaults);
    studentService.updateSettings(defaults);
    setFeedback({ type: 'success', message: 'Settings reset to default values.' });
    setTimeout(() => setFeedback(null), 3500);
  };

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
              isLoading={isSaving}
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
          subtitle="Configure how and when you receive academic updates"
          action={<Bell className="w-4 h-4 text-[var(--color-accent)]" />}
        />
        <div className="divide-y divide-[var(--color-border)]">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Quiz & Assessment Reminders</p>
              <p className="text-xs text-[var(--color-text-muted)]">Get notified before weekly quizzes and deadlines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quizReminders}
                onChange={() => handleToggle('quizReminders')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
            </label>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Department Announcements</p>
              <p className="text-xs text-[var(--color-text-muted)]">Alerts for college schedules, exams, and symposium events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcementAlerts}
                onChange={() => handleToggle('announcementAlerts')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
            </label>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Email Notifications</p>
              <p className="text-xs text-[var(--color-text-muted)]">Receive important notifications at your registered email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
            </label>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Weekly Performance Reports</p>
              <p className="text-xs text-[var(--color-text-muted)]">Summary digest of completed quizzes and topic masteries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.performanceReports}
                onChange={() => handleToggle('performanceReports')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
            </label>
          </div>
        </div>
      </Card>

      {/* Learning & Interface Preferences */}
      <Card>
        <CardHeader
          title="Learning Experience"
          subtitle="Customize your interactive study interface"
          action={<Volume2 className="w-4 h-4 text-[var(--color-accent)]" />}
        />
        <div className="divide-y divide-[var(--color-border)]">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Interactive Sound Effects</p>
              <p className="text-xs text-[var(--color-text-muted)]">Play audio feedback during quiz actions and submissions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={() => handleToggle('soundEffects')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
            </label>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Auto-Save Topic Progress</p>
              <p className="text-xs text-[var(--color-text-muted)]">Automatically save completed course syllabus units across sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSaveProgress}
                onChange={() => handleToggle('autoSaveProgress')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent)]"></div>
            </label>
          </div>

          <div className="py-3.5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Display Language</p>
              <p className="text-xs text-[var(--color-text-muted)]">Language for courses, questions, and dashboard UI</p>
            </div>
            <select
              value={settings.language}
              onChange={e => setSettings({ ...settings, language: e.target.value })}
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-1.5 bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="English">English (US/UK)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
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
