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
    };
    authService.setCurrentUser(authUser);
    return authUser;
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
