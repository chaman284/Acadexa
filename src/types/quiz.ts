// ============================================
// QUIZ & QUESTION TYPES
// ============================================

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'mcq' | 'true-false' | 'short-answer' | 'fill-blank';
export type QuestionStatus = 'approved' | 'pending' | 'draft';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  courseId: string;
  courseName: string;
  unitId: string;
  unitName: string;
  topicId: string;
  topicName: string;
  difficulty: Difficulty;
  type: QuestionType;
  options: Option[];
  explanation?: string;
  status: QuestionStatus;
  isAiGenerated: boolean;
  createdBy: string;
  createdAt: string;
  attempts: number;
  correctRate: number;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  topicIds: string[];
  topicNames: string[];
  questionCount: number;
  duration: number; // minutes
  difficulty: Difficulty;
  scheduledDate: string;
  dueDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'scheduled';
  assignedStudents: number;
  type: 'weekly' | 'remedial' | 'practice';
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skipped: number;
  timeTaken: number; // seconds
  submittedAt: string;
  topicBreakdown: TopicBreakdown[];
}

export interface TopicBreakdown {
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  percentage: number;
}
