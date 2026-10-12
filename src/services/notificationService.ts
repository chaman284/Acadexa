import type { Notification } from '../types/notification';

const NOTIFICATIONS_STORAGE_KEY = 'acadexa_notifications_v1';

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Weekly Quiz',
    message: 'Week 6 Quiz on Graph Algorithms is scheduled for Oct 8. Review your preparation.',
    type: 'quiz',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
    isRead: false,
    actionUrl: '/student/quiz',
    targetRole: 'student',
  },
  {
    id: 'notif-2',
    title: 'New Syllabus Unit Available',
    message: 'Operating Systems Unit 2: Memory Management topics have been updated.',
    type: 'course',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    isRead: false,
    actionUrl: '/student/courses',
    targetRole: 'student',
  },
  {
    id: 'notif-3',
    title: 'Learning Gap Identified',
    message: 'You have a high-priority practice recommendation in Trees & Heaps (51% current accuracy).',
    type: 'learning_gap',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isRead: false,
    actionUrl: '/student/learning-gaps',
    targetRole: 'student',
  },
  {
    id: 'notif-4',
    title: 'Quiz Result Published',
    message: 'Your score for Week 5 Trees & Heaps is available (78%). Great job!',
    type: 'quiz',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isRead: true,
    actionUrl: '/student/quiz/q2/result',
    targetRole: 'student',
  },
  {
    id: 'notif-5',
    title: 'Department Tech Symposium',
    message: 'Annual CS Coding Fest registration is now open in the Department Portal.',
    type: 'announcement',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    isRead: true,
    actionUrl: '/student/department',
    targetRole: 'student',
  },
];

export const notificationService = {
  getNotifications: (): Notification[] => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    // Initialize default notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
    return initialNotifications;
  },

  markAsRead: (id: string): Notification[] => {
    const list = notificationService.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  markAllAsRead: (): Notification[] => {
    const list = notificationService.getNotifications();
    const updated = list.map(n => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  clearNotification: (id: string): Notification[] => {
    const list = notificationService.getNotifications();
    const updated = list.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification => {
    const list = notificationService.getNotifications();
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const updated = [newNotif, ...list];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return newNotif;
  },
};
