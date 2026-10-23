import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Bell, ShieldCheck, Database, RefreshCw,
  Mail, Save, CheckCircle2, AlertCircle, FileSpreadsheet, Lock
} from 'lucide-react';

const ADMIN_SETTINGS_STORAGE_KEY = 'acadexa_admin_settings';

export interface AdminSettingsConfig {
  emailAlertsOnEnrollment: boolean;
  systemMaintenanceAlerts: boolean;
  autoSyncAcademicYears: boolean;
  quizReportNotifications: boolean;
  soundEffects: boolean;
  exportFormat: 'csv' | 'json';
}

const defaultAdminSettings: AdminSettingsConfig = {
  emailAlertsOnEnrollment: true,
  systemMaintenanceAlerts: true,
  autoSyncAcademicYears: true,
  quizReportNotifications: false,
  soundEffects: true,
  exportFormat: 'csv',
};

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettingsConfig>(() => {
    const stored = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultAdminSettings, ...JSON.parse(stored) };
      } catch {
        return defaultAdminSettings;
      }
    }
    return defaultAdminSettings;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggle = (key: keyof AdminSettingsConfig) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setFeedback({ type: 'success', message: 'Administrator preferences saved successfully!' });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultAdminSettings);
    localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(defaultAdminSettings));
    setFeedback({ type: 'success', message: 'Preferences reset to default values.' });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      <PageHeader
        title="Settings & Governance Preferences"
        subtitle="Configure institutional notifications, system alerts, and administrator preferences"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-4 rounded-[10px] border-2 border-[#171717] flex items-center gap-3 transition-all ${
            feedback.type === 'success'
              ? 'bg-[#E0FAF8] text-[#171717]'
              : 'bg-[#FFE8E8] text-[#171717]'
          }`}
          style={{ boxShadow: '3px 3px 0px #171717' }}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#0e6b64]" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#FF666B]" />
          )}
          <span className="text-sm font-bold">{feedback.message}</span>
        </div>
      )}

      {/* Notifications Card */}
      <Card className="p-6">
        <CardHeader
          title="Administrative Alert Preferences"
          subtitle="Choose what events trigger administrative notifications and emails"
        />
        <div className="divide-y divide-[#e5d8c7] mt-4">
          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-black text-[#171717]">
                Student Enrollment Alerts
              </span>
              <p className="text-xs text-[#696969] font-medium">
                Receive notifications when new students are enrolled or assigned sections
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlertsOnEnrollment}
                onChange={() => handleToggle('emailAlertsOnEnrollment')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-white border-2 border-[#171717] rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-[#FFE66D] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#171717] after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ boxShadow: '1.5px 1.5px 0px #171717' }} />
            </label>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-black text-[#171717]">
                System Maintenance & Database Alerts
              </span>
              <p className="text-xs text-[#696969] font-medium">
                Receive alerts on schema synchronizations and system status changes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.systemMaintenanceAlerts}
                onChange={() => handleToggle('systemMaintenanceAlerts')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-white border-2 border-[#171717] rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-[#FFE66D] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#171717] after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ boxShadow: '1.5px 1.5px 0px #171717' }} />
            </label>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-black text-[#171717]">
                Academic Year Auto-Mapping
              </span>
              <p className="text-xs text-[#696969] font-medium">
                Automatically map semester cohorts (1-2 Year 1, 3-4 Year 2, etc.) for analytics
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoSyncAcademicYears}
                onChange={() => handleToggle('autoSyncAcademicYears')}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-white border-2 border-[#171717] rounded-full peer peer-checked:after:translate-x-6 peer-checked:bg-[#FFE66D] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#171717] after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ boxShadow: '1.5px 1.5px 0px #171717' }} />
            </label>
          </div>
        </div>
      </Card>

      {/* Export Format */}
      <Card className="p-6">
        <CardHeader
          title="Data Export & Reporting"
          subtitle="Preferred file format when exporting institutional reports"
        />
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#171717]">
            <input
              type="radio"
              name="exportFormat"
              checked={settings.exportFormat === 'csv'}
              onChange={() => setSettings(s => ({ ...s, exportFormat: 'csv' }))}
              className="accent-[#FF666B] w-4 h-4 cursor-pointer"
            />
            CSV (Spreadsheets / Excel)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-[#171717]">
            <input
              type="radio"
              name="exportFormat"
              checked={settings.exportFormat === 'json'}
              onChange={() => setSettings(s => ({ ...s, exportFormat: 'json' }))}
              className="accent-[#FF666B] w-4 h-4 cursor-pointer"
            />
            JSON (Raw Data Archive)
          </label>
        </div>
      </Card>
    </div>
  );
};
