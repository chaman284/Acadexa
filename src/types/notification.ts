export type NotificationType = 'quiz' | 'course' | 'announcement' | 'system' | 'learning_gap' | 'enrollment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  targetRole?: 'student' | 'faculty' | 'all';
}
