import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Bell, CheckCheck, Trash2, ExternalLink, Sparkles, BookOpen, ClipboardList, Info, AlertCircle } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import type { Notification, NotificationType } from '../../types/notification';

interface NotificationPopoverProps {
  onNotificationClick?: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'quiz':
      return <ClipboardList className="w-4 h-4 text-[#542536]" />;
    case 'course':
      return <BookOpen className="w-4 h-4 text-[#687B62]" />;
    case 'learning_gap':
      return <AlertCircle className="w-4 h-4 text-[#9E4A59]" />;
    case 'announcement':
      return <Sparkles className="w-4 h-4 text-[#8B6E3F]" />;
    case 'system':
    default:
      return <Info className="w-4 h-4 text-[#542536]" />;
  }
};

const typeColors: Record<NotificationType, string> = {
  quiz:         '#F9F1F2',
  course:       '#F0F4EF',
  learning_gap: '#FAF0F2',
  announcement: '#FBF6EB',
  system:       '#F7F1E8',
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
    const handleStorageChange = () => loadNotifications();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
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
          'relative w-9 h-9 rounded-[10px] flex items-center justify-center transition-all cursor-pointer border border-[#E1D4CA]',
          isOpen
            ? 'bg-[#F7F1E8] text-[#542536]'
            : 'bg-white text-[#79666A] hover:text-[#542536] hover:bg-[#F7F1E8]'
        )}
        style={{ boxShadow: '0 1px 3px rgba(84,37,54,0.04)' }}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#542536] text-white text-[10px] font-semibold rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-[14px] border border-[#E1D4CA] z-50 overflow-hidden animate-fade-in"
          style={{ boxShadow: '0 12px 36px rgba(50,25,35,0.12), 0 4px 12px rgba(50,25,35,0.06)', transformOrigin: 'top right' }}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-[#E1D4CA] flex items-center justify-between bg-[#F7F1E8]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#542536]" />
              <span className="font-semibold text-sm text-[#302A2B]">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-[#542536] text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#542536] hover:underline flex items-center gap-1 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E1D4CA]/60">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div
                  className="w-11 h-11 rounded-[12px] bg-[#F7F1E8] flex items-center justify-center mx-auto mb-3 border border-[#E1D4CA]"
                >
                  <Bell className="w-5 h-5 text-[#79666A]" />
                </div>
                <p className="text-sm font-semibold text-[#302A2B]">All caught up!</p>
                <p className="text-xs text-[#79666A] font-medium mt-0.5">New updates will show up here.</p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={clsx(
                    'p-3.5 flex items-start gap-3 transition-colors cursor-pointer group text-left',
                    item.isRead ? 'hover:bg-[#F7F1E8]' : 'bg-[#FAF4EE] hover:bg-[#F5EDE5]'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#E1D4CA]"
                    style={{ background: typeColors[item.type] }}
                  >
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={clsx('text-xs truncate', item.isRead ? 'text-[#302A2B] font-medium' : 'text-[#302A2B] font-semibold')}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#79666A] flex-shrink-0 font-medium">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#79666A] font-normal line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.actionUrl && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-[#542536]">
                        <span>View details</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="p-1 hover:bg-[#FAF0F2] text-[#79666A] hover:text-[#542536] rounded-[6px] transition-colors"
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
