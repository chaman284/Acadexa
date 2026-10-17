// ============================================
// COURSE & SUBJECT TYPES
// ============================================

export interface Topic {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted?: boolean;
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  name: string;
  topics: Topic[];
  isCompleted: boolean;
  unitProgress?: number; // percentage 0-100
}

export interface Course {
  id: string;
  name: string;
  code: string;
  semester: number;
  department: string;
  creditHours: number;
  facultyId: string;
  facultyName: string;
  icon?: string;
  color?: string;
  units: Unit[];
  progress: number;
  nextQuizDate?: string;
  nextQuizTopic?: string;
  enrollmentStatus?: 'Enrolled' | 'Available' | 'Not Available';
}

export interface CourseProgressRecord {
  courseId: string;
  completedUnitIds: string[];
  completedTopicIds: string[];
}
