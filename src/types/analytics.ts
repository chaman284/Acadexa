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

export interface CognitiveMastery {
  level: string;
  name: string;
  bloomOrder: number;
  total: number;
  correct: number;
  accuracy: number;
  status: 'NEEDS_ATTENTION' | 'DEVELOPING' | 'PROFICIENT' | 'MASTERY';
}

export interface TopicMastery {
  topicId: string;
  topicName: string;
  subjectId?: string;
  subjectName?: string;
  totalAttempts: number;
  correctCount: number;
  mastery: number; // percentage 0 - 100
  isLearningGap: boolean; // mastery < 60
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MASTERED';
  cognitiveBreakdown: Record<string, { total: number; correct: number; accuracy: number }>;
  recommendedQuestionsCount: number;
}

export interface KnowledgeTracingProfile {
  studentId: string;
  studentName?: string;
  overallMastery: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  topicMastery: TopicMastery[];
  learningGaps: TopicMastery[];
  masteredTopics: TopicMastery[];
  cognitiveMastery: CognitiveMastery[];
  recommendations: {
    topicId: string;
    topicName: string;
    subjectName?: string;
    currentMastery: number;
    targetMastery: number;
    priority: 'CRITICAL' | 'HIGH' | 'MODERATE';
    recommendedQuestionsCount: number;
    reason: string;
  }[];
}
