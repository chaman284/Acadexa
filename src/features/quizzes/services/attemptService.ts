import api from '../../../lib/apiClient';
import type { ExamViolationType, QuestionResponse } from '../types/quizTypes';

export const attemptService = {
  startAttempt: (quizId: string) => api.post('/attempts', { quizId }),

  getAttempt: (attemptId: string) => api.get(`/attempts/${attemptId}`),

  saveAnswer: (
    attemptId: string,
    questionId: string,
    response: QuestionResponse
  ) => api.post(`/attempts/${attemptId}/answer`, { questionId, response }),

  recordViolation: (attemptId: string, type: ExamViolationType) =>
    api.post(`/attempts/${attemptId}/violation`, { type }),
};
