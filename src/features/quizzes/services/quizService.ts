// ============================================================================
// ACADEXA QUIZ SERVICE
// CRUD operations, publishing, scheduling, duplicating with resilient storage
// ============================================================================
import api from '../../../lib/apiClient';
import type { Quiz, QuizStatus, QuizQuestion } from '../types/quizTypes';

const LOCAL_STORAGE_KEY = 'acadexa_quizzes_v2';

const LEGACY_MOCK_IDS = new Set([
  'quiz_cie1_ds',
  'quiz_practice_dbms',
  'quiz_sched_os',
  'quiz_draft_cn',
  'quiz_prac_dbms',
  'quiz_mid_os',
  'quiz_draft_remedial',
]);

const mapBackendQuizToFrontend = (dbQuiz: any): Quiz => {
  const statusLower = (dbQuiz.status || 'draft').toLowerCase() as QuizStatus;
  const isExam = dbQuiz.type === 'WEEKLY' || dbQuiz.type === 'REMEDIAL';
  return {
    id: dbQuiz.id,
    title: dbQuiz.title,
    description: `Curriculum assessment for ${dbQuiz.subject?.name || 'Subject'} (${dbQuiz.subject?.code || ''})`,
    category: dbQuiz.type === 'WEEKLY' ? 'Weekly Assessment' : dbQuiz.type === 'REMEDIAL' ? 'Remedial Practice' : 'Practice Quiz',
    mode: isExam ? 'exam' : 'practice',
    status: statusLower,
    department: 'Computer Science and Engineering',
    semester: dbQuiz.section?.semester || dbQuiz.subject?.semester || 1,
    subjectId: dbQuiz.subjectId || dbQuiz.subject?.id || '',
    subjectCode: dbQuiz.subject?.code || 'CS',
    subjectName: dbQuiz.subject?.name || 'Computer Science',
    unitIds: [],
    unitNames: [],
    topicIds: [],
    topicNames: [],
    assignedClasses: dbQuiz.section
      ? [
          {
            id: dbQuiz.section.id,
            name: `Section ${dbQuiz.section.semester}${dbQuiz.section.name}`,
            semester: dbQuiz.section.semester,
            studentsCount: dbQuiz.section.studentsCount || 60,
          },
        ]
      : [],
    questions: [],
    totalMarks: (dbQuiz._count?.questions || 0) * 2,
    totalQuestions: dbQuiz._count?.questions || 0,
    settings: {
      mode: isExam ? 'exam' : 'practice',
      exam: {
        durationMinutes: dbQuiz.duration || 30,
        maxAttempts: 1,
        randomizeQuestions: false,
        randomizeOptions: false,
        allowNavigation: true,
        allowRevisit: true,
        allowMarkForReview: true,
        showCorrectAnswersAfterSubmission: true,
        showExplanationsAfterSubmission: true,
        resultRelease: 'immediate',
        negativeMarkingEnabled: false,
        negativeMarksValue: 0,
        autoSubmitOnTimeout: true,
        instructions: 'Please answer all questions before time expires.',
      },
      practice: {
        selfPaced: true,
        showInstantFeedback: true,
        showExplanationsImmediately: true,
        allowRetries: true,
        maxRetriesPerQuestion: 3,
        shuffleQuestions: false,
        enablePointsAndStreaks: true,
        enableLeaderboard: true,
        allowHints: true,
      },
    },
    scheduledStart: dbQuiz.scheduledAt || undefined,
    createdAt: dbQuiz.createdAt || new Date().toISOString(),
    updatedAt: dbQuiz.createdAt || new Date().toISOString(),
    publishedAt: statusLower === 'active' ? dbQuiz.createdAt : undefined,
    attemptsCount: dbQuiz._count?.attempts ?? 0,
  };
};

// Helper to get stored quizzes
const getLocalQuizzes = (): Quiz[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(q => q && !LEGACY_MOCK_IDS.has(q.id));
        if (cleaned.length !== parsed.length) {
          saveLocalQuizzes(cleaned);
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('Failed to parse local quizzes:', err);
  }
  return [];
};

const saveLocalQuizzes = (quizzes: Quiz[]): void => {
  try {
    const cleaned = quizzes.filter(q => q && !LEGACY_MOCK_IDS.has(q.id));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to persist quizzes locally:', err);
  }
};

export const quizService = {
  /**
   * Fetch all quizzes with optional status/subject/semester filters
   */
  getQuizzes: async (filters?: {
    status?: string;
    subjectId?: string;
    semester?: number;
    search?: string;
  }): Promise<Quiz[]> => {
    let quizzes: Quiz[] = [];

    // 1. Fetch real quizzes from backend API (database)
    try {
      const res = await api.get('/quizzes');
      if (Array.isArray(res.data)) {
        quizzes = res.data.map(mapBackendQuizToFrontend);
      }
    } catch (err) {
      console.warn('Backend API offline or unavailable, fallback to local storage:', err);
      quizzes = getLocalQuizzes();
    }

    // Merge with any offline-created local quizzes not yet in backend
    const local = getLocalQuizzes();
    const existingIds = new Set(quizzes.map(q => q.id));
    for (const lq of local) {
      if (!existingIds.has(lq.id)) {
        quizzes.unshift(lq);
      }
    }

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        quizzes = quizzes.filter(q => q.status === filters.status);
      }
      if (filters.subjectId && filters.subjectId !== 'all') {
        quizzes = quizzes.filter(q => q.subjectId === filters.subjectId);
      }
      if (filters.semester) {
        quizzes = quizzes.filter(q => q.semester === filters.semester);
      }
      if (filters.search && filters.search.trim()) {
        const qLower = filters.search.toLowerCase().trim();
        quizzes = quizzes.filter(
          q =>
            q.title.toLowerCase().includes(qLower) ||
            q.subjectName.toLowerCase().includes(qLower) ||
            q.subjectCode.toLowerCase().includes(qLower)
        );
      }
    }

    return quizzes;
  },

  /**
   * Get a quiz by ID
   */
  getQuizById: async (id: string): Promise<Quiz | null> => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      if (res.data) {
        const dbQuiz = res.data;
        const mapped = mapBackendQuizToFrontend(dbQuiz);
        if (Array.isArray(dbQuiz.questions)) {
          mapped.questions = dbQuiz.questions.map((qItem: any, idx: number) => {
            const q = qItem.question || qItem;
            return {
              id: q.id,
              quizQuestionId: qItem.id || `qq_${idx}`,
              orderIndex: qItem.order ?? idx,
              text: q.text || '',
              type: ((q.type || 'MCQ').toLowerCase().replace('_', '-')) as any,
              difficulty: ((q.difficulty || 'MEDIUM').toLowerCase()) as any,
              marks: 2,
              explanation: q.explanation || '',
              options: (q.options || []).map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                isCorrect: Boolean(opt.isCorrect),
              })),
              metadata: {
                department: 'Computer Science and Engineering',
                semester: dbQuiz.section?.semester || dbQuiz.subject?.semester || 1,
                subjectId: dbQuiz.subjectId,
                subjectCode: dbQuiz.subject?.code || '',
                subjectName: dbQuiz.subject?.name || '',
                unitId: '',
                unitName: '',
                topicId: q.topicId || '',
                topicName: q.topic?.name || '',
              },
              source: 'library',
              hasValidAnswerKey: true,
              createdAt: q.createdAt || new Date().toISOString(),
            };
          });
          mapped.totalQuestions = mapped.questions.length;
          mapped.totalMarks = mapped.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        }
        return mapped;
      }
    } catch {
      // Offline fallback
    }

    const quizzes = getLocalQuizzes();
    const found = quizzes.find(q => q.id === id);
    return found || null;
  },

  /**
   * Create a new quiz
   */
  createQuiz: async (quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attemptsCount: 0,
      totalQuestions: quizData.questions.length,
      totalMarks: quizData.questions.reduce((sum, q) => sum + (q.marks || 1), 0),
    };

    // Try posting to backend
    try {
      const res = await api.post('/quizzes', {
        title: newQuiz.title,
        subjectId: newQuiz.subjectId,
        sectionId: newQuiz.assignedClasses[0]?.id || '',
        duration: newQuiz.settings.exam.durationMinutes,
        type: newQuiz.category === 'Weekly Assessment' ? 'WEEKLY' : 'PRACTICE',
        scheduledAt: newQuiz.scheduledStart,
        questionIds: newQuiz.questions.map(q => q.id),
      });
      if (res.data?.id) {
        newQuiz.id = res.data.id;
      }
    } catch {
      // Persist in local repository
    }

    const quizzes = getLocalQuizzes();
    const updated = [newQuiz, ...quizzes];
    saveLocalQuizzes(updated);
    return newQuiz;
  },

  /**
   * Update an existing quiz
   */
  updateQuiz: async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    const quizzes = getLocalQuizzes();
    const index = quizzes.findIndex(q => q.id === id);
    if (index === -1) {
      throw new Error(`Quiz with ID ${id} not found.`);
    }

    const updatedQuiz: Quiz = {
      ...quizzes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      totalQuestions: updates.questions ? updates.questions.length : quizzes[index].totalQuestions,
      totalMarks: updates.questions
        ? updates.questions.reduce((sum, q) => sum + (q.marks || 1), 0)
        : quizzes[index].totalMarks,
    };

    quizzes[index] = updatedQuiz;
    saveLocalQuizzes(quizzes);

    try {
      await api.patch(`/quizzes/${id}/schedule`, {
        scheduledAt: updatedQuiz.scheduledStart,
        status: updatedQuiz.status.toUpperCase(),
      });
    } catch {
      // Local fallback
    }

    return updatedQuiz;
  },

  /**
   * Duplicate a quiz into a fresh draft
   */
  duplicateQuiz: async (quizId: string): Promise<Quiz> => {
    const source = await quizService.getQuizById(quizId);
    if (!source) {
      throw new Error(`Quiz with ID ${quizId} not found.`);
    }

    const duplicatedQuestions: QuizQuestion[] = source.questions.map((q, idx) => ({
      ...q,
      quizQuestionId: `qq_dup_${Date.now()}_${idx}`,
    }));

    const newQuiz: Quiz = {
      ...source,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${source.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: undefined,
      scheduledStart: undefined,
      scheduledEnd: undefined,
      attemptsCount: 0,
      averageScore: undefined,
      highestScore: undefined,
      questions: duplicatedQuestions,
      totalQuestions: duplicatedQuestions.length,
      totalMarks: duplicatedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
    };

    const quizzes = getLocalQuizzes();
    saveLocalQuizzes([newQuiz, ...quizzes]);
    return newQuiz;
  },

  /**
   * Update quiz status (e.g. publish, archive, end)
   */
  setQuizStatus: async (id: string, status: QuizStatus): Promise<Quiz> => {
    return quizService.updateQuiz(id, {
      status,
      publishedAt: status === 'active' ? new Date().toISOString() : undefined,
    });
  },

  /**
   * Delete or archive a quiz
   */
  deleteQuiz: async (id: string): Promise<void> => {
    try {
      await api.delete(`/quizzes/${id}`);
    } catch {
      // Ignore if API not reachable
    }

    const quizzes = getLocalQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    saveLocalQuizzes(filtered);
  },
};
