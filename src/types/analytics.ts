// ============================================
// ANALYTICS TYPES
// ============================================

export interface PerformancePoint {
  label: string;
  score: number;
  average?: number;
}

export interface ClassTopicPerformance {
  topicId: string;
  topicName: string;
  courseId: string;
  courseName: string;
  unitName: string;
  averageScore: number;
  participationRate: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ClassPerformanceMatrix {
  courseId: string;
  courseName: string;
  units: {
    unitName: string;
    averageScore: number;
  }[];
}

export interface StudentNeedingAttention {
  studentId: string;
  displayId: string;
  weakTopics: string[];
  lastQuizScore: number;
  trend: 'declining' | 'stable';
}

export interface FacultyOverview {
  totalStudents: number;
  averagePerformance: number;
  activeQuizzes: number;
  classImprovement: number;
  participationRate: number;
}

export interface DifficultQuestion {
  questionId: string;
  questionText: string;
  courseName: string;
  topicName: string;
  correctRate: number;
  attempts: number;
}

export interface RecentActivity {
  id: string;
  type: 'quiz_submitted' | 'quiz_created' | 'question_added' | 'remedial_generated' | 'student_enrolled';
  description: string;
  timestamp: string;
  icon?: string;
}

export interface LearningGap {
  topicId: string;
  topicName: string;
  courseId: string;
  courseName: string;
  gapSeverity: 'low' | 'medium' | 'high';
  currentScore: number;
  targetScore: number;
  recommendedQuestions: number;
}
