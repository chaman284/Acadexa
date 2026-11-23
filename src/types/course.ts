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
  publishedSyllabus?: CourseSyllabus;
}

export interface CourseProgressRecord {
  courseId: string;
  completedUnitIds: string[];
  completedTopicIds: string[];
}

// ============================================
// DYNAMIC FACULTY-PUBLISHED SYLLABUS TYPES
// ============================================

export interface SyllabusTopic {
  id: string;
  name: string;
}

export interface SyllabusModule {
  id: string;
  title: string;
  moduleNumber?: number;
  hours?: string;
  description?: string;
  topics: SyllabusTopic[];
  completedTopicIds: string[];
  progress: number; // 0–100, derived from completed topics
}

export interface CourseSyllabus {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  sectionName: string;
  semester: number;
  facultyId?: string | null;
  modules: SyllabusModule[];
  overallProgress: number;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
