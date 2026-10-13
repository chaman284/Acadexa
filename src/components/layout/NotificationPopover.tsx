import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Bell, Check, CheckCheck, Trash2, ExternalLink, Sparkles, BookOpen, ClipboardList, Info, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import type { Notification, NotificationType } from '../../types/notification';

interface NotificationPopoverProps {
  onNotificationClick?: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'quiz':
      return <ClipboardList className="w-4 h-4 text-indigo-500" />;
    case 'course':
      return <BookOpen className="w-4 h-4 text-emerald-500" />;
    case 'learning_gap':
      return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case 'announcement':
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    case 'system':
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ onNotificationClick }) => {
  const { user } = useAuth();
  const role = user?.role;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications(role));
  };

  useEffect(() => {
    loadNotifications();

    // Listen for storage events across tabs or local updates
    const handleStorageChange = () => {
      loadNotifications();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead(role);
    setNotifications(updated);
  };

  const handleItemClick = (notification: Notification) => {
    if (!notification.isRead) {
      const updated = notificationService.markAsRead(notification.id, role);
      setNotifications(updated);
    }
    if (notification.actionUrl) {
      setIsOpen(false);
      if (onNotificationClick) onNotificationClick();
      navigate(notification.actionUrl);
    }
  };

  const handleDeleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = notificationService.clearNotification(id, role);
    setNotifications(updated);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          loadNotifications();
          setIsOpen(!isOpen);
        }}
        className={clsx(
          'relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
          isOpen
            ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
            : 'hover:bg-[var(--color-muted)] text-[var(--color-text-secondary)]'
        )}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[var(--color-accent)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-pulse-soft">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] z-50 overflow-hidden animate-fade-in"
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[var(--color-text-primary)]">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--color-border)]">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--color-muted)] flex items-center justify-center mx-auto mb-2.5 text-[var(--color-text-muted)]">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">No notifications</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  You are all caught up! New updates will show up here.
                </p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={clsx(
                    'p-3.5 flex items-start gap-3 transition-colors cursor-pointer group text-left',
                    item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[var(--color-border)] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={clsx('text-xs truncate font-medium', item.isRead ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-accent)] font-semibold')}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.actionUrl && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)]">
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="p-1 hover:bg-rose-100 rounded text-rose-500 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
