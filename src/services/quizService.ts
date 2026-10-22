// ============================================
// QUIZ & QUESTION SERVICE — Fully Database Driven
// ============================================
import api from '../lib/apiClient';
import type { Quiz, QuizResult, Question } from '../types/quiz';

export const quizService = {
  /** GET /api/quizzes */
  getStudentQuizzes: async (_studentId?: string): Promise<Quiz[]> => {
    try {
      const res = await api.get('/quizzes');
      if (Array.isArray(res.data)) return res.data;
    } catch (e) {
      console.warn('API getStudentQuizzes error:', e);
    }
    return [];
  },

  /** GET /api/quizzes/:id */
  getQuizById: async (quizId: string): Promise<Quiz | undefined> => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data) return res.data;
    } catch (e) {
      console.warn('API getQuizById error:', e);
    }
    return undefined;
  },

  /** GET /api/quizzes/:id/questions */
  getQuizQuestions: async (quizId: string): Promise<Question[]> => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data?.questions) {
        return res.data.questions.map((item: any) => item.question);
      }
    } catch (e) {
      console.warn('API getQuizQuestions error:', e);
    }
    return [];
  },

  /** POST /api/quizzes/:id/attempt */
  submitQuiz: async (quizId: string, answers: Record<string, string>): Promise<QuizResult> => {
    const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      optionId,
    }));
    const res = await api.post(`/quizzes/${quizId}/attempt`, {
      timeTaken: 120,
      answers: formattedAnswers,
    });
    const total = Object.keys(answers).length;
    const correct = Math.round(((res.data?.score || 0) / 100) * total);
    const incorrect = total - correct;
    return {
      id: res.data?.id || `att_${Date.now()}`,
      quizId: res.data?.quizId || quizId,
      quizTitle: res.data?.quizTitle ?? '',
      studentId: res.data?.studentId || '',
      score: res.data?.score || 0,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      skipped: 0,
      timeTaken: res.data?.timeTaken || 120,
      submittedAt: res.data?.submittedAt || new Date().toISOString(),
      topicBreakdown: res.data?.topicBreakdown ?? [],
    } as QuizResult;
  },

  /** GET /api/analytics/student/:id */
  getStudentResults: async (studentId: string): Promise<QuizResult[]> => {
    try {
      const res = await api.get(`/analytics/student/${studentId}`);
      if (Array.isArray(res.data?.recentAttempts)) return res.data.recentAttempts;
    } catch (e) {
      console.warn('API getStudentResults error:', e);
    }
    return [];
  },

  /** Faculty: GET /api/quizzes */
  getFacultyQuizzes: async (_facultyId?: string): Promise<Quiz[]> => {
    try {
      const res = await api.get('/quizzes');
      if (Array.isArray(res.data)) return res.data;
    } catch (e) {
      console.warn('API getFacultyQuizzes error:', e);
    }
    return [];
  },

  /** Faculty: POST /api/quizzes */
  createQuiz: async (quiz: Partial<Quiz>): Promise<Quiz> => {
    const res = await api.post('/quizzes', quiz);
    return res.data;
  },
};

// Helper to map DB/API Question to Frontend Question
const mapApiQuestion = (q: any): Question => ({
  id: q.id,
  text: q.text,
  courseId: q.topic?.subjectId || q.courseId || '',
  courseName: q.topic?.subject?.name || q.courseName || '',
  unitId: q.unitId || '',
  unitName: q.unitName || '',
  topicId: q.topicId || '',
  topicName: q.topic?.name || q.topicName || '',
  difficulty: (q.difficulty || 'MEDIUM').toLowerCase() as any,
  type: q.type === 'MCQ' ? 'mcq' : (q.type?.toLowerCase() || 'mcq') as any,
  options: (q.options || []).map((opt: any) => ({
    id: opt.id,
    text: opt.text,
    isCorrect: Boolean(opt.isCorrect),
  })),
  explanation: q.explanation || '',
  status:
    (q.status || 'APPROVED').toLowerCase().includes('pending')
      ? 'pending'
      : (q.status || 'APPROVED').toLowerCase().includes('draft')
      ? 'draft'
      : 'approved',
  isAiGenerated: q.status === 'PENDING_APPROVAL' || q.status === 'pending' || Boolean(q.isAiGenerated),
  createdBy: q.createdBy || (q.status === 'PENDING_APPROVAL' ? 'Gemini 1.5 AI' : 'Faculty Member'),
  createdAt: q.createdAt || new Date().toISOString(),
  attempts: q.attempts || 0,
  correctRate: q.correctRate || 0,
  cognitiveLevel: q.cognitiveLevel || 'CL2_UNDERSTAND',
  examType: q.examType || 'cie',
  marks: q.marks || 2,
});

export const questionService = {
  /** GET /api/questions */
  getQuestions: async (filters?: {
    topicId?: string;
    difficulty?: string;
    status?: string;
    cognitiveLevel?: string;
    subjectId?: string;
    search?: string;
  }): Promise<Question[]> => {
    try {
      const res = await api.get('/questions', { params: filters });
      if (res.data && Array.isArray(res.data)) {
        return res.data.map(mapApiQuestion);
      }
    } catch (e) {
      console.warn('API getQuestions error:', e);
    }
    return [];
  },

  /** POST /api/questions/generate (Gemini 1.5 AIG) */
  generateQuestions: async (params: {
    subject: string;
    topic: string;
    difficulty: string;
    bloomsLevel?: string;
    cognitiveLevel?: string;
    count?: number;
    topicId?: string;
  }): Promise<Question[]> => {
    const res = await api.post('/questions/generate', {
      subject: params.subject,
      topic: params.topic,
      difficulty: params.difficulty,
      bloomsLevel: params.bloomsLevel || params.cognitiveLevel,
      cognitiveLevel: params.cognitiveLevel || params.bloomsLevel,
      count: params.count || 3,
      topicId: params.topicId,
    });

    if (res.data?.questions && Array.isArray(res.data.questions)) {
      return res.data.questions.map(mapApiQuestion);
    }
    return [];
  },

  /** PATCH /api/questions/:id/review (Approve Question) */
  approveQuestion: async (questionId: string): Promise<Question | null> => {
    try {
      const res = await api.patch(`/questions/${questionId}/review`, { status: 'APPROVED' });
      if (res.data?.question) {
        return mapApiQuestion(res.data.question);
      }
    } catch (e) {
      console.warn('API approveQuestion error:', e);
    }
    return null;
  },

  /** PATCH /api/questions/:id/review (Reject Question) */
  rejectQuestion: async (questionId: string): Promise<boolean> => {
    try {
      await api.patch(`/questions/${questionId}/review`, { action: 'reject' });
      return true;
    } catch (e) {
      console.warn('API rejectQuestion error:', e);
      return false;
    }
  },

  /** PATCH /api/questions/:id/review (Edit & Review) */
  reviewQuestion: async (
    questionId: string,
    data: {
      status?: string;
      text?: string;
      difficulty?: string;
      cognitiveLevel?: string;
      bloomsLevel?: string;
      explanation?: string;
      options?: { text: string; isCorrect: boolean }[];
      action?: 'approve' | 'reject';
    }
  ): Promise<Question | null> => {
    try {
      const res = await api.patch(`/questions/${questionId}/review`, data);
      if (res.data?.question) {
        return mapApiQuestion(res.data.question);
      }
    } catch (e) {
      console.warn('API reviewQuestion error:', e);
    }
    return null;
  },

  /** DELETE /api/questions/:id */
  deleteQuestion: async (questionId: string): Promise<void> => {
    try {
      await api.delete(`/questions/${questionId}`);
    } catch (e) {
      console.warn('API deleteQuestion error:', e);
    }
  },
};
