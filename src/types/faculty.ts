// ============================================
// FACULTY TYPES
// ============================================

export interface FacultyProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  employeeId: string;
  joiningYear: string;
  officeLocation: string;
  cabinNumber: string;
  qualifications: string;
  bio: string;
  avatarUrl?: string;
  officeHours: string;
  subjectsTaught: string[];
  assignedClasses: string[];
}

export interface FacultySettings {
  emailNotifications: boolean;
  submissionAlerts: boolean;
  lowPerformanceAlerts: boolean;
  departmentAnnouncements: boolean;
  weeklyReportDigest: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  soundEffects: boolean;
  autoExportFormat: 'csv' | 'xlsx' | 'pdf';
}
