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

import type { FacultySettings } from './settings';

export type { FacultySettings };
