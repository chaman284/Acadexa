import api from '../lib/apiClient';
import type { Student, StudentSettings } from '../types/student';

const PROFILE_STORAGE_KEY = 'acadexa_student_profile_v2';
const SETTINGS_STORAGE_KEY = 'acadexa_student_settings_v2';

const defaultSettings: StudentSettings = {
  emailNotifications: true,
  quizReminders: true,
  announcementAlerts: true,
  performanceReports: false,
  theme: 'light',
  language: 'English',
  soundEffects: true,
  autoSaveProgress: true,
};

const defaultProfile: Student = {
  id: '',
  name: '',
  email: '',
  rollNumber: '',
  semester: 0,
  department: '',
  enrolledCourses: [],
  quizAverage: 0,
  streak: 0,
  learningProgress: 0,
  phone: '',
  bio: '',
  academicYear: '',
  section: '',
};

export const studentService = {
  getProfile: async (): Promise<Student> => {
    // Attempt to load from localStorage first or fallback
    let localData = defaultProfile;
    try {
      // Clear legacy storage keys if present
      localStorage.removeItem('acadexa_student_profile_v1');
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name === 'Rehan Patel' || parsed.name === 'Chaman') {
          localStorage.removeItem(PROFILE_STORAGE_KEY);
        } else {
          localData = { ...defaultProfile, ...parsed };
        }
      }
      
      const userStored = localStorage.getItem('acadexa_user');
      if (userStored) {
        const u = JSON.parse(userStored);
        if (u.name && u.name !== 'Rehan Patel' && u.name !== 'Chaman') {
          localData.name = u.name;
          localData.email = u.email || localData.email;
        }
      }
    } catch (e) {
      console.warn('Failed reading profile from storage:', e);
    }

    // Try fetching from backend if possible
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const u = res.data;
        const merged: Student = {
          ...localData,
          name: u.name || localData.name,
          email: u.email || localData.email,
          avatarUrl: u.avatarUrl || localData.avatarUrl,
          rollNumber: u.student?.rollNo || localData.rollNumber,
          department: u.student?.section?.department?.name || localData.department,
          semester: u.student?.section?.semester || localData.semester,
          section: u.student?.section?.name ? `Section ${u.student.section.name}` : localData.section,
        };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch {
      // Offline / fallback to local storage
    }

    return localData;
  },

  updateProfile: async (updates: Partial<Student>): Promise<Student> => {
    const current = await studentService.getProfile();
    const updated: Student = {
      ...current,
      ...updates,
    };

    // Save to localStorage
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));

    // Also update current user in authService if name or avatar changed
    const userStored = localStorage.getItem('acadexa_user');
    if (userStored) {
      try {
        const userObj = JSON.parse(userStored);
        if (updates.name) userObj.name = updates.name;
        if (updates.avatarUrl !== undefined) userObj.avatarUrl = updates.avatarUrl;
        localStorage.setItem('acadexa_user', JSON.stringify(userObj));
      } catch (e) {
        console.warn('Failed updating auth user object:', e);
      }
    }

    // Attempt to sync with backend
    try {
      const userStored = localStorage.getItem('acadexa_user');
      const userId = userStored ? JSON.parse(userStored).id : null;
      if (userId) {
        await api.put(`/users/${userId}`, {
          name: updates.name,
          avatarUrl: updates.avatarUrl,
        });
      }
    } catch (err) {
      console.warn('Backend sync failed, changes kept locally:', err);
    }

    return updated;
  },

  getSettings: (): StudentSettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed reading settings:', e);
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  updateSettings: (newSettings: Partial<StudentSettings>): StudentSettings => {
    const current = studentService.getSettings();
    const merged: StudentSettings = {
      ...current,
      ...newSettings,
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    return merged;
  },
};
