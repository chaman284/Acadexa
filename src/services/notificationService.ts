import type { Notification } from '../types/notification';

const NOTIFICATIONS_STORAGE_KEY = 'acadexa_notifications_v1';

export const initialNotifications: Notification[] = [
  // Student notifications
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

  // Faculty notifications
  {
    id: 'notif-f1',
    title: 'Quiz Submissions Ready for Evaluation',
    message: '42 students in Section 5A submitted Week 6 Graph Algorithms Quiz. Ready for grading and performance review.',
    type: 'quiz',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    isRead: false,
    actionUrl: '/faculty/quizzes',
    targetRole: 'faculty',
  },
  {
    id: 'notif-f2',
    title: 'Critical Learning Gap Alert — Section 5A',
    message: '14 students showed critical difficulty in Binary Search Trees (Unit 3). Remedial quiz practice is recommended.',
    type: 'learning_gap',
    createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(), // 2.5 hours ago
    isRead: false,
    actionUrl: '/faculty/learning-gaps',
    targetRole: 'faculty',
  },
  {
    id: 'notif-f3',
    title: 'Class Performance Analytics Updated',
    message: 'Mid-term performance metrics, heatmaps, and attendance correlations for Section 5A have been compiled.',
    type: 'course',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    isRead: false,
    actionUrl: '/faculty/analytics',
    targetRole: 'faculty',
  },
  {
    id: 'notif-f4',
    title: 'Question Paper Bank Archive 2024–25',
    message: 'Previous year question papers and model exam templates are available for Computer Science subjects.',
    type: 'course',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isRead: true,
    actionUrl: '/faculty/paper-bank',
    targetRole: 'faculty',
  },
  {
    id: 'notif-f5',
    title: 'Faculty Board of Studies Meeting',
    message: 'Department meeting on autonomous syllabus revision scheduled for Friday at 3:00 PM in Seminar Hall 2.',
    type: 'announcement',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    isRead: true,
    actionUrl: '/faculty/department',
    targetRole: 'faculty',
  },
];

export const notificationService = {
  getAllStoredNotifications: (): Notification[] => {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        let list: Notification[] = JSON.parse(stored);
        // Ensure faculty notifications exist in stored data if seeded previously with only students
        const hasFaculty = list.some(n => n.targetRole === 'faculty');
        if (!hasFaculty) {
          const facultySeeds = initialNotifications.filter(n => n.targetRole === 'faculty');
          list = [...facultySeeds, ...list];
          localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
        }
        return list;
      }
    } catch (e) {
      console.warn('Failed to parse notifications from localStorage:', e);
    }
    // Initialize default notifications
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
    return initialNotifications;
  },

  getNotifications: (role?: string): Notification[] => {
    const list = notificationService.getAllStoredNotifications();
    if (!role) return list;
    return list.filter(n => !n.targetRole || n.targetRole === 'all' || n.targetRole === role);
  },

  markAsRead: (id: string, role?: string): Notification[] => {
    const all = notificationService.getAllStoredNotifications();
    const updated = all.map(n => (n.id === id ? { ...n, isRead: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return role ? updated.filter(n => !n.targetRole || n.targetRole === 'all' || n.targetRole === role) : updated;
  },

  markAllAsRead: (role?: string): Notification[] => {
    const all = notificationService.getAllStoredNotifications();
    const updated = all.map(n => {
      if (!role || !n.targetRole || n.targetRole === 'all' || n.targetRole === role) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return role ? updated.filter(n => !n.targetRole || n.targetRole === 'all' || n.targetRole === role) : updated;
  },

  clearNotification: (id: string, role?: string): Notification[] => {
    const all = notificationService.getAllStoredNotifications();
    const updated = all.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return role ? updated.filter(n => !n.targetRole || n.targetRole === 'all' || n.targetRole === role) : updated;
  },

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification => {
    const all = notificationService.getAllStoredNotifications();
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    const updated = [newNotif, ...all];
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    return newNotif;
  },
};
