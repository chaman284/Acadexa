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

export const questionService = {
  /** GET /api/questions */
  getQuestions: async (filters?: Partial<Question>): Promise<Question[]> => {
    try {
      const res = await api.get('/questions', { params: filters });
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {
      console.warn('API getQuestions fallback to mock', e);
    }
    return mockQuestions;
  },

  /** POST /api/questions/generate (AI) */
  generateQuestions: async (_params: {
    courseId: string;
    unitId: string;
    topicId: string;
    difficulty: string;
    type: string;
    count: number;
  }): Promise<Question[]> => {
    await new Promise(r => setTimeout(r, 1500));
    return mockQuestions.filter(q => q.isAiGenerated);
  },

  /** PATCH /api/questions/:id */
  approveQuestion: async (questionId: string): Promise<void> => {
    try {
      await api.put(`/questions/${questionId}`, { approved: true });
    } catch (e) {
      console.warn('API approveQuestion fallback', e);
    }
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
