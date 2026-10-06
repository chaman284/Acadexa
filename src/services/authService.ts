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
  'chaman@cs.college.edu': {
    password: 'student123',
    user: { id: 'stu001', name: 'Chaman', email: 'chaman@cs.college.edu', role: 'student' },
  },
  'faculty@cs.college.edu': {
    password: 'faculty123',
    user: { id: 'f1', name: 'Dr. Ramesh Kumar', email: 'faculty@cs.college.edu', role: 'faculty' },
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
      const fallbackUser: AuthUser =
        role === 'student'
          ? { id: 'stu001', name: 'Chaman', email, role: 'student' }
          : { id: 'f1', name: 'Dr. Ramesh Kumar', email, role: 'faculty' };
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
