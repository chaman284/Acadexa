// ============================================================================
// ACADEXA QUESTION LIBRARY SERVICE
// Search, multi-facet filtering, deduplication check, and library addition
// ============================================================================
import type { Question, QuestionType, Difficulty } from '../types/quizTypes';
import { MOCK_LIBRARY_QUESTIONS } from '../constants/curriculumData';

const LIBRARY_STORAGE_KEY = 'acadexa_question_library_v2';

const getStoredLibrary = (): Question[] => {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse question library:', err);
  }
  localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(MOCK_LIBRARY_QUESTIONS));
  return MOCK_LIBRARY_QUESTIONS;
};

const saveStoredLibrary = (items: Question[]) => {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to library:', err);
  }
};

export interface LibraryFilterParams {
  search?: string;
  subjectId?: string;
  semester?: number;
  unitId?: string;
  topicId?: string;
  difficulty?: Difficulty | 'all';
  type?: QuestionType | 'all';
  minMarks?: number;
  maxMarks?: number;
}

export const questionLibraryService = {
  /**
   * Search & filter question library
   */
  getQuestions: async (filters?: LibraryFilterParams): Promise<Question[]> => {
    let questions = getStoredLibrary();

    if (!filters) return questions;

    if (filters.subjectId && filters.subjectId !== 'all') {
      questions = questions.filter(q => q.metadata.subjectId === filters.subjectId);
    }

    if (filters.semester) {
      questions = questions.filter(q => q.metadata.semester === filters.semester);
    }

    if (filters.unitId && filters.unitId !== 'all') {
      questions = questions.filter(q => q.metadata.unitId === filters.unitId);
    }

    if (filters.topicId && filters.topicId !== 'all') {
      questions = questions.filter(q => q.metadata.topicId === filters.topicId);
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      questions = questions.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.type && filters.type !== 'all') {
      questions = questions.filter(q => q.type === filters.type);
    }

    if (filters.minMarks !== undefined) {
      questions = questions.filter(q => q.marks >= filters.minMarks!);
    }

    if (filters.maxMarks !== undefined) {
      questions = questions.filter(q => q.marks <= filters.maxMarks!);
    }

    if (filters.search && filters.search.trim()) {
      const qLower = filters.search.toLowerCase().trim();
      questions = questions.filter(
        q =>
          q.text.toLowerCase().includes(qLower) ||
          q.metadata.topicName.toLowerCase().includes(qLower) ||
          q.metadata.subjectName.toLowerCase().includes(qLower) ||
          (q.explanation && q.explanation.toLowerCase().includes(qLower))
      );
    }

    return questions;
  },

  /**
   * Check for duplicate question text in an existing list
   */
  checkDuplicates: (
    candidateText: string,
    existingQuestions: { text: string; id?: string }[]
  ): { isDuplicate: boolean; similarQuestion?: string } => {
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const candidateClean = clean(candidateText);

    for (const eq of existingQuestions) {
      const eqClean = clean(eq.text);
      if (candidateClean === eqClean) {
        return { isDuplicate: true, similarQuestion: eq.text };
      }
      // Simple substring similarity
      if (candidateClean.length > 20 && eqClean.length > 20) {
        if (candidateClean.includes(eqClean) || eqClean.includes(candidateClean)) {
          return { isDuplicate: true, similarQuestion: eq.text };
        }
      }
    }
    return { isDuplicate: false };
  },

  /**
   * Add a question to the shared Question Library
   */
  saveToLibrary: async (question: Question): Promise<Question> => {
    const library = getStoredLibrary();
    const libraryItem: Question = {
      ...question,
      id: `lib_q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: 'library',
      createdAt: new Date().toISOString(),
    };
    saveStoredLibrary([libraryItem, ...library]);
    return libraryItem;
  },
};
