import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { adminService } from '../../services/adminService';
import {
  Bell, Send, CheckCircle2,
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
          <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2 shadow-xs">
            <Send className="w-4 h-4" />
            Send Announcement
          </Button>
        }
      />

      {/* Action feedback */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-[12px] border text-xs font-medium flex items-center gap-2.5 transition-all shadow-xs ${
            actionMessage.type === 'success'
              ? 'bg-[#F0F4EF] border-[#D5DFD4] text-[#34483A]'
              : 'bg-[#FAF0F2] border-[#EAD5D9] text-[#542536]'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0 text-[#34483A]" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-[#542536]" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Notifications list */}
      <Card className="p-0 overflow-hidden border border-[#E1D4CA] shadow-xs">
        <div className="p-4 border-b border-[#E1D4CA] flex items-center justify-between bg-[#F7F1E8]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#542536]" />
            <span className="font-semibold text-xs text-[#302A2B] uppercase tracking-wider">
              Recent System & Course Assignment Notices
            </span>
          </div>

          <button
            onClick={loadNotifications}
            className="p-1.5 text-[#79666A] hover:text-[#542536] bg-white hover:bg-[#F7F1E8] rounded-[8px] border border-[#E1D4CA] transition-colors shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#79666A]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#542536]" />
            <p className="text-sm font-medium">Loading notifications log...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-[12px] bg-[#F7F1E8] border border-[#E1D4CA] flex items-center justify-center mx-auto mb-3 text-[#79666A]">
              <Bell className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm text-[#302A2B]">No notifications recorded yet</p>
            <p className="text-xs text-[#79666A] font-normal mt-1">
              Course allocations and announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E1D4CA]/60">
            {notifications.map(item => (
              <div key={item.id} className="p-4 flex items-start gap-3.5 hover:bg-[#F7F1E8]/50 transition-colors">
                <div
                  className="w-9 h-9 rounded-[10px] bg-[#F7F1E8] text-[#542536] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#E1D4CA]"
                >
                  {item.type === 'course' ? <BookOpen className="w-4 h-4 text-[#687B62]" /> : <Sparkles className="w-4 h-4 text-[#542536]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-[#302A2B]">{item.title}</p>
                    <span className="text-xs text-[#79666A] font-normal flex-shrink-0">
                      {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs text-[#79666A] font-normal leading-relaxed">{item.message}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Badge color={item.role === 'FACULTY' ? 'forest' : item.role === 'STUDENT' ? 'rose' : 'oxblood'} className="text-[10px]">
                      Target: {item.role || 'ALL'}
                    </Badge>
                    {item.user && (
                      <span className="text-[11px] text-[#79666A] font-normal">
                        Recipient: <strong className="text-[#302A2B] font-semibold">{item.user.name}</strong> ({item.user.email})
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
            <label className="block text-xs font-semibold text-[#302A2B] mb-1">
              Message Content
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter announcement details..."
              className="w-full text-sm font-normal bg-white border border-[#E1D4CA] rounded-[10px] p-3 text-[#302A2B] placeholder:text-[#79666A]/70 focus:border-[#542536] focus:outline-none focus:ring-2 focus:ring-[#542536]/10 transition-all resize-none shadow-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#302A2B] mb-1">
              Target Audience
            </label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="w-full text-sm font-medium bg-white border border-[#E1D4CA] rounded-[10px] px-3 py-2.5 text-[#302A2B] focus:border-[#542536] focus:outline-none focus:ring-2 focus:ring-[#542536]/10 transition-all shadow-xs"
            >
              <option value="ALL">Everyone (Faculty & Students)</option>
              <option value="FACULTY">Faculty Members Only</option>
              <option value="STUDENT">Students Only</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E1D4CA] mt-4">
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
