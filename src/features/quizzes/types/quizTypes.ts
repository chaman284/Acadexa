// ============================================================================
// ACADEXA DOMAIN TYPES — QUIZ & QUESTION SYSTEM
// Supports: Multi-source questions, Exam & Practice modes, Academic Metadata
// ============================================================================

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType =
  | 'mcq'              // Single-correct MCQ
  | 'multi-select'    // Multiple-select MCQ
  | 'true-false'       // True / False
  | 'fill-blank'       // Fill in the blanks
  | 'short-answer'     // Short answer (manual/rubric)
  | 'code-output';     // Code snippet / output prediction

export type QuestionSource = 'manual' | 'library' | 'ai' | 'document';

export type QuizMode = 'exam' | 'practice';

export type QuizCategory =
  | 'Weekly Assessment'
  | 'Practice Quiz'
  | 'Revision Quiz'
  | 'Remedial Practice'
  | 'Custom';

export type QuizStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';

export type CognitiveLevel =
  | 'CL1_REMEMBER'
  | 'CL2_UNDERSTAND'
  | 'CL3_APPLY'
  | 'CL4_ANALYZE'
  | 'CL5_EVALUATE'
  | 'CL6_CREATE';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AcademicMetadata {
  department: string;
  semester: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  unitId: string;
  unitName: string;
  topicId: string;
  topicName: string;
  subtopicId?: string;
  subtopicName?: string;
  cognitiveLevel?: CognitiveLevel;
  learningObjective?: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  negativeMarks?: number;
  options?: QuestionOption[];             // For MCQ, multi-select, true-false
  acceptedAnswers?: string[];             // For fill-blank
  expectedAnswer?: string;                // For short-answer rubric or code-output
  codeSnippet?: string;                   // For code-output or coding questions
  codeLanguage?: string;
  caseSensitive?: boolean;               // For fill-blank
  explanation?: string;
  hint?: string;

  // Academic metadata for Learning Gap Analysis
  metadata: AcademicMetadata;

  // Source attribution
  source: QuestionSource;
  sourceDocumentName?: string;
  sourcePageNumber?: number | string;
  libraryQuestionId?: string;

  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  hasValidAnswerKey: boolean;
}

export interface QuizQuestion extends Question {
  quizQuestionId: string; // Unique inside the quiz instance
  orderIndex: number;
  quizMarksOverride?: number;
}

export interface ExamSettings {
  durationMinutes: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowNavigation: boolean;
  allowRevisit: boolean;
  allowMarkForReview: boolean;
  showCorrectAnswersAfterSubmission: boolean;
  showExplanationsAfterSubmission: boolean;
  resultRelease: 'immediate' | 'manual' | 'scheduled';
  negativeMarkingEnabled: boolean;
  negativeMarksValue: number;
  autoSubmitOnTimeout: boolean;
  accessCode?: string;
  instructions: string;
}

export interface PracticeSettings {
  selfPaced: boolean;
  timeLimitMinutes?: number;
  showInstantFeedback: boolean;
  showExplanationsImmediately: boolean;
  allowRetries: boolean;
  maxRetriesPerQuestion: number;
  shuffleQuestions: boolean;
  enablePointsAndStreaks: boolean;
  enableLeaderboard: boolean;
  allowHints: boolean;
  topicSpecificPractice?: boolean;
}

export interface QuizSettings {
  mode: QuizMode;
  exam: ExamSettings;
  practice: PracticeSettings;
}

export interface AssignedClass {
  id: string;
  name: string;
  semester: number;
  studentsCount: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory;
  mode: QuizMode;
  status: QuizStatus;
  
  department: string;
  semester: number;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  unitIds: string[];
  unitNames: string[];
  topicIds: string[];
  topicNames: string[];
  
  assignedClasses: AssignedClass[];
  
  questions: QuizQuestion[];
  totalMarks: number;
  totalQuestions: number;
  
  settings: QuizSettings;
  
  scheduledStart?: string; // ISO date string
  scheduledEnd?: string;   // ISO date string
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  
  attemptsCount?: number;
  averageScore?: number;
  highestScore?: number;
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIds?: string[];
  textResponse?: string;
  timeTakenSeconds: number;
  isFlaggedForReview?: boolean;
  isAnswered: boolean;
}

export interface EvaluationResult {
  questionId: string;
  scoreAwarded: number;
  maxMarks: number;
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
  status: 'graded' | 'pending_manual';
  feedback?: string;
  topicId: string;
  topicName: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  className: string;
  mode: QuizMode;
  startedAt: string;
  submittedAt?: string;
  durationSeconds: number;
  responses: Record<string, QuestionResponse>;
  evaluations: Record<string, EvaluationResult>;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  hasPendingManualEvaluation: boolean;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  unitName: string;
  totalQuestionsAttempted: number;
  totalCorrect: number;
  averagePercentage: number;
  sampleSizeSufficient: boolean; // false if attempts < 3
  status: 'mastered' | 'proficient' | 'learning_gap' | 'insufficient_data';
  recommendedAction?: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  fileSize: number;
  fileType: string;
  extractedText: string;
  pages?: { pageNumber: number; text: string }[];
  uploadedAt: string;
}
