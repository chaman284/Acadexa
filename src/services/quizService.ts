// ============================================
// QUIZ & QUESTION SERVICE — Integrated with Backend API
// ============================================
import api from '../lib/apiClient';
import { mockQuizzes, mockQuizResults, mockQuestions } from '../data/quizzes';
import type { Quiz, QuizResult, Question } from '../types/quiz';

export const quizService = {
  /** GET /api/quizzes */
  getStudentQuizzes: async (_studentId: string): Promise<Quiz[]> => {
    try {
      const res = await api.get('/quizzes');
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {
      console.warn('API getStudentQuizzes fallback to mock', e);
    }
    return mockQuizzes;
  },

  /** GET /api/quizzes/:id */
  getQuizById: async (quizId: string): Promise<Quiz | undefined> => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data) return res.data;
    } catch (e) {
      console.warn('API getQuizById fallback to mock', e);
    }
    return mockQuizzes.find(q => q.id === quizId);
  },

  /** GET /api/quizzes/:id/questions */
  getQuizQuestions: async (quizId: string): Promise<Question[]> => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data?.questions) {
        return res.data.questions.map((item: any) => item.question);
      }
    } catch (e) {
      console.warn('API getQuizQuestions fallback to mock', e);
    }
    const quiz = mockQuizzes.find(q => q.id === quizId);
    if (!quiz) return [];
    return mockQuestions.filter(q => quiz.topicIds.includes(q.topicId));
  },

  /** POST /api/quizzes/:id/attempt */
  submitQuiz: async (quizId: string, answers: Record<string, string>): Promise<QuizResult> => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));
      const res = await api.post(`/quizzes/${quizId}/attempt`, {
        timeTaken: 120,
        answers: formattedAnswers,
      });
      if (res.data) {
        const total = Object.keys(answers).length;
        const correct = Math.round((res.data.score / 100) * total);
        const incorrect = total - correct;
        return {
          id: res.data.id,
          quizId: res.data.quizId,
          quizTitle: res.data.quizTitle ?? '',
          studentId: res.data.studentId,
          score: res.data.score,
          correctAnswers: correct,
          incorrectAnswers: incorrect,
          skipped: 0,
          timeTaken: res.data.timeTaken,
          submittedAt: res.data.submittedAt,
          topicBreakdown: res.data.topicBreakdown ?? [],
        } as QuizResult;
      }
    } catch (e) {
      console.warn('API submitQuiz fallback to mock', e);
    }
    return mockQuizResults[0];
  },

  /** GET /api/analytics/student/:id */
  getStudentResults: async (studentId: string): Promise<QuizResult[]> => {
    try {
      const res = await api.get(`/analytics/student/${studentId}`);
      if (res.data?.recentAttempts) return res.data.recentAttempts;
    } catch (e) {
      console.warn('API getStudentResults fallback to mock', e);
    }
    return mockQuizResults.filter(r => r.studentId === studentId);
  },

  /** Faculty: GET /api/quizzes */
  getFacultyQuizzes: async (_facultyId: string): Promise<Quiz[]> => {
    try {
      const res = await api.get('/quizzes');
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {
      console.warn('API getFacultyQuizzes fallback to mock', e);
    }
    return mockQuizzes;
  },

  /** Faculty: POST /api/quizzes */
  createQuiz: async (quiz: Partial<Quiz>): Promise<Quiz> => {
    try {
      const res = await api.post('/quizzes', quiz);
      if (res.data) return res.data;
    } catch (e) {
      console.warn('API createQuiz fallback to mock', e);
    }
    return { ...quiz, id: `q_${Date.now()}` } as Quiz;
  },
};

// Helper to map DB/API Question to Frontend Question
const mapApiQuestion = (q: any): Question => ({
  id: q.id,
  text: q.text,
  courseId: q.topic?.subjectId || q.courseId || 'c1',
  courseName: q.topic?.subject?.name || q.courseName || 'Data Structures & Algorithms',
  unitId: q.unitId || 'u1',
  unitName: q.unitName || 'Core Curriculum',
  topicId: q.topicId || 't1',
  topicName: q.topic?.name || q.topicName || 'General',
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
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map(mapApiQuestion);
      }
    } catch (e) {
      console.warn('API getQuestions fallback to mock', e);
    }
    return mockQuestions;
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
    try {
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
    } catch (e) {
      console.warn('API generateQuestions fallback to simulated generation', e);
    }

    // Fallback in case of network issues
    const fallbackCognitive = params.bloomsLevel || params.cognitiveLevel || 'CL2_UNDERSTAND';
    return [
      {
        id: `gen_${Date.now()}_1`,
        text: `In ${params.subject}, which principle best describes ${params.topic} under ${params.difficulty} requirements?`,
        courseId: 'c1',
        courseName: params.subject,
        unitId: 'u1',
        unitName: 'Unit 1',
        topicId: params.topicId || 't1',
        topicName: params.topic,
        difficulty: params.difficulty.toLowerCase() as any,
        type: 'mcq',
        options: [
          { id: 'opt_1', text: `Primary invariant property of ${params.topic}`, isCorrect: true },
          { id: 'opt_2', text: `Secondary non-deterministic condition`, isCorrect: false },
          { id: 'opt_3', text: `Degenerate boundary case without balancing`, isCorrect: false },
          { id: 'opt_4', text: `Asymptotic upper bound violation`, isCorrect: false },
        ],
        explanation: `Pedagogical analysis targeting Bloom's ${fallbackCognitive} demonstrates that evaluating structural invariants ensures correctness.`,
        status: 'pending',
        isAiGenerated: true,
        createdBy: 'Gemini 1.5 AI',
        createdAt: new Date().toISOString(),
        attempts: 0,
        correctRate: 0,
        cognitiveLevel: fallbackCognitive,
        examType: 'cie',
        marks: 2,
      },
    ];
  },

  /** PATCH /api/questions/:id/review (Approve Question) */
  approveQuestion: async (questionId: string): Promise<Question | null> => {
    try {
      const res = await api.patch(`/questions/${questionId}/review`, { status: 'APPROVED' });
      if (res.data?.question) {
        return mapApiQuestion(res.data.question);
      }
    } catch (e) {
      console.warn('API approveQuestion fallback', e);
    }
    return null;
  },

  /** PATCH /api/questions/:id/review (Reject Question) */
  rejectQuestion: async (questionId: string): Promise<boolean> => {
    try {
      await api.patch(`/questions/${questionId}/review`, { action: 'reject' });
      return true;
    } catch (e) {
      console.warn('API rejectQuestion fallback', e);
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
      console.warn('API reviewQuestion fallback', e);
    }
    return null;
  },

  /** DELETE /api/questions/:id */
  deleteQuestion: async (questionId: string): Promise<void> => {
    try {
      await api.delete(`/questions/${questionId}`);
    } catch (e) {
      console.warn('API deleteQuestion fallback', e);
    }
  },
};

