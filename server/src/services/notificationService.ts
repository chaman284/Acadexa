import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

type DbClient = typeof prisma | Prisma.TransactionClient;

export type NotificationRole = 'ALL' | 'ADMIN' | 'FACULTY' | 'STUDENT';
export type NotificationType = 'info' | 'course' | 'announcement' | 'quiz' | 'system' | 'learning_gap' | 'enrollment';

const ROLES: NotificationRole[] = ['ALL', 'ADMIN', 'FACULTY', 'STUDENT'];

export const normalizeNotificationRole = (role?: string | null): NotificationRole => {
  const upper = (role || 'ALL').trim().toUpperCase();
  return ROLES.find(r => r === upper) || 'ALL';
};

/** Rows a given user is allowed to see: personal, role-based, or broadcast. */
export const visibleNotificationWhere = (user: { id: string; role: string }) => {
  const role = (user.role || '').toUpperCase();
  return {
    OR: [
      { userId: user.id },
      { role: { in: [...new Set([role, role.toLowerCase(), 'ALL', 'all'])] } },
    ],
  };
};

export const createNotification = async (
  data: {
    userId?: string | null;
    title: string;
    message: string;
    type?: NotificationType | string;
    role?: NotificationRole | string | null;
    actionUrl?: string | null;
  },
  client: DbClient = prisma,
) => {
  return client.notification.create({
    data: {
      userId: data.userId ?? null,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      role: normalizeNotificationRole(data.role),
      actionUrl: data.actionUrl ?? null,
    },
  });
};

/** Sent whenever a faculty account is created, through any registration path. */
export const notifyFacultyRegistered = async (userId: string, client: DbClient = prisma) => {
  return createNotification({
    userId,
    title: 'Welcome to Acadexa',
    message: 'Your faculty account has been created. You can now manage your classes, quizzes and academic analytics.',
    type: 'info',
    role: 'FACULTY',
    actionUrl: '/faculty',
  }, client);
};

/** Sent whenever a course/section is assigned to a faculty member. */
export const notifyCourseAssigned = async (
  data: {
    userId: string;
    subjectName: string;
    subjectCode?: string | null;
    sectionLabel: string;
  },
  client: DbClient = prisma,
) => {
  const code = data.subjectCode ? ` (${data.subjectCode})` : '';
  return createNotification({
    userId: data.userId,
    title: 'New Course Assignment',
    message: `You have been assigned to teach ${data.subjectName}${code} for Section ${data.sectionLabel}.`,
    type: 'course',
    role: 'FACULTY',
    actionUrl: '/faculty',
  }, client);
};

export const notificationService = {
  createNotification,
  notifyFacultyRegistered,
  notifyCourseAssigned,
  normalizeNotificationRole,
  visibleNotificationWhere,
};
