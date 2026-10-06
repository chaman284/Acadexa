// ============================================
// COURSE & SUBJECT TYPES
// ============================================

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
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  name: string;
  topics: Topic[];
  isCompleted: boolean;
}

export interface Topic {
  id: string;
  unitId: string;
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
