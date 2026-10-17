import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { adminService } from '../../services/adminService';
import {
  Bell, Send, Plus, CheckCircle2,
  AlertCircle, RefreshCw, Sparkles, BookOpen
} from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadNotifications = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const res = await adminService.getNotifications();
      setNotifications(res);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to load notifications.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setActionMessage({ type: 'error', text: 'Title and message are required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createNotification({
        title: title.trim(),
        message: message.trim(),
        type: 'announcement',
        role: targetRole,
      });
      setIsModalOpen(false);
      setTitle('');
      setMessage('');
      setActionMessage({ type: 'success', text: 'Announcement broadcasted successfully!' });
      loadNotifications();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to send announcement.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Notifications & Audit Logs"
        subtitle="Review automated course assignment alerts and broadcast institution-wide announcements"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Notifications' }]}
        action={
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2 shadow-sm">
            <Send className="w-4 h-4" />
            Send Announcement
          </Button>
        }
      />

      {/* Action feedback */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Notifications list */}
      <Card className="border border-[var(--color-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
              Recent System & Course Assignment Notices
            </span>
          </div>

          <button
            onClick={loadNotifications}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm">Loading notifications log...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-[var(--color-text-primary)]">No notifications recorded yet</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Course allocations and announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {notifications.map(item => (
              <div key={item.id} className="p-4 flex items-start gap-3.5 hover:bg-slate-50/70 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-100">
                  {item.type === 'course' ? <BookOpen className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--color-text-primary)]">{item.title}</p>
                    <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge color={item.role === 'FACULTY' ? 'indigo' : item.role === 'STUDENT' ? 'green' : 'purple'} className="text-[10px]">
                      Target: {item.role || 'ALL'}
                    </Badge>
                    {item.user && (
                      <span className="text-[11px] text-slate-500">
                        Recipient: <strong className="text-slate-700">{item.user.name}</strong> ({item.user.email})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Broadcast Announcement Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
      >
        <form onSubmit={handleSendAnnouncement} className="space-y-4">
          <Input
            id="announcement-title"
            label="Title"
            placeholder="e.g. Midterm Examination Schedule Released"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter announcement details..."
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
              Target Audience
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full text-sm bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="ALL">Everyone (Faculty & Students)</option>
              <option value="FACULTY">Faculty Members Only</option>
              <option value="STUDENT">Students Only</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Send Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
