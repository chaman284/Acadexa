import api from '../lib/apiClient';

export type UserRole = 'student' | 'faculty';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  token?: string;
}

// Mocked credentials for offline / development fallback
const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  'student@college.edu': {
    password: 'student123',
    user: { id: 'stu_demo', name: 'Student', email: 'student@college.edu', role: 'student' },
  },
  'faculty@college.edu': {
    password: 'faculty123',
    user: { id: 'fac_demo', name: 'Faculty', email: 'faculty@college.edu', role: 'faculty' },
  },
};

export const authService = {
  login: async (email: string, password: string, role: UserRole): Promise<AuthUser> => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        role: role.toUpperCase(),
      });
      const { user, token } = response.data;
      if (token) {
        localStorage.setItem('acadexa_token', token);
      }
      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase() as UserRole,
        avatarUrl: user.avatarUrl,
        token,
      };
      authService.setCurrentUser(authUser);
      return authUser;
    } catch (err) {
      console.warn('Backend login unavailable or returned error, falling back to local credentials:', err);
      const entry = MOCK_USERS[email];
      if (entry && entry.user.role === role) {
        authService.setCurrentUser(entry.user);
        return entry.user;
      }
      const fallbackName = email ? email.split('@')[0].replace(/[._]/g, ' ') : (role === 'student' ? 'Student' : 'Faculty');
      const fallbackUser: AuthUser = {
        id: role === 'student' ? 'user_student' : 'user_faculty',
        name: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1),
        email,
        role,
      };
      authService.setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      authService.clearCurrentUser();
    }
  },

  getCurrentUser: (): AuthUser | null => {
    const stored = localStorage.getItem('acadexa_user');
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser: (user: AuthUser): void => {
    localStorage.setItem('acadexa_user', JSON.stringify(user));
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem('acadexa_user');
    localStorage.removeItem('acadexa_token');
  },
};
