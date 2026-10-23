import api from '../lib/apiClient';
import type { FacultyProfile, FacultySettings } from '../types/faculty';
import { authService } from './authService';

const PROFILE_STORAGE_KEY = 'acadexa_faculty_profile_v1';
const SETTINGS_STORAGE_KEY = 'acadexa_faculty_settings_v1';

export const defaultFacultySettings: FacultySettings = {
  emailNotifications: true,
  submissionAlerts: true,
  lowPerformanceAlerts: true,
  departmentAnnouncements: true,
  weeklyReportDigest: false,
  theme: 'light',
  language: 'English',
  soundEffects: true,
  autoExportFormat: 'csv',
};

export const defaultFacultyProfile: FacultyProfile = {
  id: 'cmvclxnlc0007x24jc9dot6ua',
  name: 'Demo Faculty',
  email: 'faculty@college.edu',
  phone: '+91 98451 23456',
  designation: 'Associate Professor',
  department: 'Computer Science',
  employeeId: 'FAC-CS-1042',
  joiningYear: '2018',
  officeLocation: 'Academic Complex Block 3, 2nd Floor',
  cabinNumber: 'Room 208-B',
  qualifications: 'Ph.D. in Computer Science (IIT Bombay), M.Tech (CS)',
  bio: 'Associate Professor specializing in Advanced Algorithms, Distributed Systems, and Database Architectures.',
  officeHours: 'Mon, Wed, Fri: 2:00 PM – 4:00 PM',
  subjectsTaught: [
    'CV (BAI501)',
    'Data Structures and Application (BAI303P)',
  ],
  assignedClasses: ['Semester 5 · Section A', 'Semester 3 · Section A'],
};

export const facultyService = {
  getProfile: async (): Promise<FacultyProfile> => {
    let localData = { ...defaultFacultyProfile };

    // Get current auth user to ensure faculty only views their own profile
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.role === 'faculty') {
      localData.id = currentUser.id || localData.id;
      localData.email = currentUser.email || localData.email;
      if (currentUser.name) localData.name = currentUser.name;
      if (currentUser.avatarUrl) localData.avatarUrl = currentUser.avatarUrl;
    }

    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only load if it matches current faculty user or fallback
        if (!currentUser || !parsed.id || parsed.id === currentUser.id || parsed.email === currentUser.email) {
          localData = { ...localData, ...parsed };
        }
      } else {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(localData));
      }
    } catch (e) {
      console.warn('Failed reading faculty profile from storage:', e);
    }

    // Try fetching latest details from backend if accessible
    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        const u = res.data;
        if (u.role === 'FACULTY' || (currentUser && currentUser.role === 'faculty')) {
          const assignments = u.faculty?.assignments || [];

          // Derive real subjects and classes if assignments exist
          const hasOldMockSubjects = Array.isArray(localData.subjectsTaught) &&
            localData.subjectsTaught.some(s => s.includes('CS3101') || s.includes('CS7201'));

          const realSubjects: string[] = assignments.length > 0
            ? Array.from(new Set<string>(assignments.map((a: any) => `${a.subject?.name} (${a.subject?.code})`)))
            : hasOldMockSubjects ? defaultFacultyProfile.subjectsTaught : localData.subjectsTaught;

          const hasOldMockClasses = Array.isArray(localData.assignedClasses) &&
            localData.assignedClasses.some(c => c.includes('5B') || c.includes('7C'));

          const realClasses: string[] = assignments.length > 0
            ? Array.from(new Set<string>(assignments.map((a: any) => `Semester ${a.section?.semester} · Section ${a.section?.name}`)))
            : hasOldMockClasses ? defaultFacultyProfile.assignedClasses : localData.assignedClasses;

          const realDepartment = assignments[0]?.subject?.department?.name ||
            assignments[0]?.section?.department?.name ||
            (localData.department === 'Computer Science & Engineering' ? 'Computer Science' : localData.department);

          const merged: FacultyProfile = {
            ...localData,
            id: u.id || localData.id,
            name: u.name || localData.name,
            email: u.email || localData.email,
            avatarUrl: u.avatarUrl || localData.avatarUrl,
            department: realDepartment,
            subjectsTaught: realSubjects,
            assignedClasses: realClasses,
          };
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {
      // Offline / fallback to localStorage data
    }

    return localData;
  },

  updateProfile: async (updates: Partial<FacultyProfile>): Promise<FacultyProfile> => {
    const current = await facultyService.getProfile();
    const currentUser = authService.getCurrentUser();

    // Prevent unauthorized cross-user modification
    if (currentUser && current.id && currentUser.id !== current.id) {
      throw new Error('Unauthorized: You can only modify your own faculty profile.');
    }

    const updated: FacultyProfile = {
      ...current,
      ...updates,
      // Immutable identity fields
      id: current.id,
      email: current.email,
    };

    // Save to localStorage immediately
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));

    // Update session AuthUser if name or avatar was updated
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
      };
      authService.setCurrentUser(updatedUser);
    }

    // Persist to backend database if API is available
    if (current.id) {
      try {
        await api.put(`/users/${current.id}`, {
          name: updated.name,
          avatarUrl: updated.avatarUrl,
        });
      } catch (err) {
        console.warn('Backend update failed or offline, changes saved locally:', err);
      }
    }

    return updated;
  },

  getSettings: (): FacultySettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...defaultFacultySettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed reading faculty settings:', e);
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultFacultySettings));
    return defaultFacultySettings;
  },

  updateSettings: (newSettings: FacultySettings): FacultySettings => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed saving faculty settings:', e);
    }
    return newSettings;
  },
};
