import api from '../lib/apiClient';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  token?: string;
  student?: {
    id: string;
    rollNo: string;
    sectionId: string;
    section?: {
      id: string;
      semester: number;
      name: string;
      departmentId?: string;
    };
  };
  faculty?: {
    id: string;
  };
}

export const authService = {
  login: async (email: string, password: string, role: UserRole): Promise<AuthUser> => {
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
      student: user.student,
      faculty: user.faculty,
    };
    authService.setCurrentUser(authUser);
    return authUser;
  },

  fetchCurrentUserProfile: async (): Promise<AuthUser | null> => {
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const u = res.data;
        const current = authService.getCurrentUser();
        const updated: AuthUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role.toLowerCase() as UserRole,
          avatarUrl: u.avatarUrl,
          token: current?.token,
          student: u.student,
          faculty: u.faculty,
        };
        authService.setCurrentUser(updated);
        return updated;
      }
    } catch {
      // ignore
    }
    return authService.getCurrentUser();
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
