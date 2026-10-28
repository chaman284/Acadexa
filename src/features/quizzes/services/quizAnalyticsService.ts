// ============================================================================
// ACADEXA LEARNING-GAP ANALYTICS INTEGRATION SERVICE
// Aggregates student responses by topic, computing mastery levels and flagging
// actionable learning gaps with statistical thresholds.
// ============================================================================
import type { QuizAttempt, TopicPerformance } from '../types/quizTypes';

const ATTEMPTS_STORAGE_KEY = 'acadexa_quiz_attempts_v2';

// Seed demo attempts for demonstration
const SEED_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_seed_1',
    quizId: 'quiz_cie1_ds',
    quizTitle: 'Unit 2 Assessment — Binary Trees & Traversal Techniques',
    studentId: 'stud_101',
    studentName: 'Aarav Sharma',
    studentRollNo: 'CS23B101',
    className: 'Section 3A',
    mode: 'exam',
    startedAt: '2026-10-23T10:00:00.000Z',
    submittedAt: '2026-10-23T10:22:00.000Z',
    durationSeconds: 1320,
    totalScore: 8,
    maxPossibleScore: 10,
    percentage: 80,
    hasPendingManualEvaluation: false,
    responses: {
      lib_q_1: { questionId: 'lib_q_1', selectedOptionIds: ['opt_1_b'], timeTakenSeconds: 90, isAnswered: true },
      lib_q_2: { questionId: 'lib_q_2', selectedOptionIds: ['opt_2_b'], timeTakenSeconds: 45, isAnswered: true },
      man_q_1: { questionId: 'man_q_1', selectedOptionIds: ['opt_h_1'], timeTakenSeconds: 110, isAnswered: true },
      lib_q_7: { questionId: 'lib_q_7', textResponse: '30 20 10', timeTakenSeconds: 140, isAnswered: true },
      ai_q_demo: { questionId: 'ai_q_demo', selectedOptionIds: ['opt_avl_2'], timeTakenSeconds: 160, isAnswered: true },
    },
    evaluations: {
      lib_q_1: { questionId: 'lib_q_1', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_bst', topicName: 'Binary Search Trees (BST)' },
      lib_q_2: { questionId: 'lib_q_2', scoreAwarded: 1, maxMarks: 1, isCorrect: true, status: 'graded', topicId: 'top_tree_trav', topicName: 'Binary Tree Traversal' },
      man_q_1: { questionId: 'man_q_1', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_bst', topicName: 'Binary Search Trees (BST)' },
      lib_q_7: { questionId: 'lib_q_7', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_tree_trav', topicName: 'Binary Tree Traversal' },
      ai_q_demo: { questionId: 'ai_q_demo', scoreAwarded: 0, maxMarks: 3, isCorrect: false, status: 'graded', topicId: 'top_avl', topicName: 'Balanced Trees (AVL & Red-Black)' },
    },
  },
  {
    id: 'att_seed_2',
    quizId: 'quiz_cie1_ds',
    quizTitle: 'Unit 2 Assessment — Binary Trees & Traversal Techniques',
    studentId: 'stud_102',
    studentName: 'Bhavna Reddy',
    studentRollNo: 'CS23B102',
    className: 'Section 3A',
    mode: 'exam',
    startedAt: '2026-10-23T10:02:00.000Z',
    submittedAt: '2026-10-23T10:24:00.000Z',
    durationSeconds: 1320,
    totalScore: 5,
    maxPossibleScore: 10,
    percentage: 50,
    hasPendingManualEvaluation: false,
    responses: {
      lib_q_1: { questionId: 'lib_q_1', selectedOptionIds: ['opt_1_c'], timeTakenSeconds: 120, isAnswered: true },
      lib_q_2: { questionId: 'lib_q_2', selectedOptionIds: ['opt_2_b'], timeTakenSeconds: 50, isAnswered: true },
      man_q_1: { questionId: 'man_q_1', selectedOptionIds: ['opt_h_2'], timeTakenSeconds: 130, isAnswered: true },
      lib_q_7: { questionId: 'lib_q_7', textResponse: '30 20 10', timeTakenSeconds: 150, isAnswered: true },
      ai_q_demo: { questionId: 'ai_q_demo', selectedOptionIds: ['opt_avl_3'], timeTakenSeconds: 180, isAnswered: true },
    },
    evaluations: {
      lib_q_1: { questionId: 'lib_q_1', scoreAwarded: 0, maxMarks: 2, isCorrect: false, status: 'graded', topicId: 'top_bst', topicName: 'Binary Search Trees (BST)' },
      lib_q_2: { questionId: 'lib_q_2', scoreAwarded: 1, maxMarks: 1, isCorrect: true, status: 'graded', topicId: 'top_tree_trav', topicName: 'Binary Tree Traversal' },
      man_q_1: { questionId: 'man_q_1', scoreAwarded: 0, maxMarks: 2, isCorrect: false, status: 'graded', topicId: 'top_bst', topicName: 'Binary Search Trees (BST)' },
      lib_q_7: { questionId: 'lib_q_7', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_tree_trav', topicName: 'Binary Tree Traversal' },
      ai_q_demo: { questionId: 'ai_q_demo', scoreAwarded: 0, maxMarks: 3, isCorrect: false, status: 'graded', topicId: 'top_avl', topicName: 'Balanced Trees (AVL & Red-Black)' },
    },
  },
  {
    id: 'att_seed_3',
    quizId: 'quiz_cie1_ds',
    quizTitle: 'Unit 2 Assessment — Binary Trees & Traversal Techniques',
    studentId: 'stud_103',
    studentName: 'Chirag Patil',
    studentRollNo: 'CS23B103',
    className: 'Section 3B',
    mode: 'exam',
    startedAt: '2026-10-23T10:05:00.000Z',
    submittedAt: '2026-10-23T10:20:00.000Z',
    durationSeconds: 900,
    totalScore: 9,
    maxPossibleScore: 10,
    percentage: 90,
    hasPendingManualEvaluation: false,
    responses: {
      lib_q_1: { questionId: 'lib_q_1', selectedOptionIds: ['opt_1_b'], timeTakenSeconds: 70, isAnswered: true },
      lib_q_2: { questionId: 'lib_q_2', selectedOptionIds: ['opt_2_b'], timeTakenSeconds: 30, isAnswered: true },
      man_q_1: { questionId: 'man_q_1', selectedOptionIds: ['opt_h_1'], timeTakenSeconds: 90, isAnswered: true },
      lib_q_7: { questionId: 'lib_q_7', textResponse: '30 20 10', timeTakenSeconds: 100, isAnswered: true },
      ai_q_demo: { questionId: 'ai_q_demo', selectedOptionIds: ['opt_avl_1'], timeTakenSeconds: 110, isAnswered: true },
    },
    evaluations: {
      lib_q_1: { questionId: 'lib_q_1', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_bst', topicName: 'Binary Search Trees (BST)' },
      lib_q_2: { questionId: 'lib_q_2', scoreAwarded: 1, maxMarks: 1, isCorrect: true, status: 'graded', topicId: 'top_tree_trav', topicName: 'Binary Tree Traversal' },
      man_q_1: { questionId: 'man_q_1', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_bst', topicName: 'Binary Search Trees (BST)' },
      lib_q_7: { questionId: 'lib_q_7', scoreAwarded: 2, maxMarks: 2, isCorrect: true, status: 'graded', topicId: 'top_tree_trav', topicName: 'Binary Tree Traversal' },
      ai_q_demo: { questionId: 'ai_q_demo', scoreAwarded: 3, maxMarks: 3, isCorrect: true, status: 'graded', topicId: 'top_avl', topicName: 'Balanced Trees (AVL & Red-Black)' },
    },
  },
];

const getStoredAttempts = (): QuizAttempt[] => {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse quiz attempts:', err);
  }
  localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(SEED_ATTEMPTS));
  return SEED_ATTEMPTS;
};

const saveStoredAttempts = (attempts: QuizAttempt[]) => {
  try {
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.error('Failed to save attempts:', err);
  }
};

export const quizAnalyticsService = {
  /**
   * Save a newly submitted quiz attempt
   */
  recordAttempt: async (attempt: QuizAttempt): Promise<void> => {
    const current = getStoredAttempts();
    saveStoredAttempts([attempt, ...current]);
  },

  /**
   * Get all attempts for a specific quiz
   */
  getQuizAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const all = getStoredAttempts();
    return all.filter(a => a.quizId === quizId);
  },

  /**
   * Calculate Topic Performance Summary for a quiz or subject
   * Enforces scientific threshold: requires >= 3 question interactions to flag
   * proficiency vs genuine learning gap, preventing premature labels.
   */
  getTopicPerformanceSummary: async (params: {
    quizId?: string;
    subjectId?: string;
  }): Promise<TopicPerformance[]> => {
    const attempts = getStoredAttempts().filter(a =>
      params.quizId ? a.quizId === params.quizId : true
    );

    const topicStats: Record<
      string,
      {
        topicId: string;
        topicName: string;
        unitName: string;
        totalAwarded: number;
        totalMax: number;
        questionAttempts: number;
        correctCount: number;
      }
    > = {};

    attempts.forEach(attempt => {
      Object.values(attempt.evaluations).forEach(evaluation => {
        const tId = evaluation.topicId || 'general';
        const tName = evaluation.topicName || 'General Topic';

        if (!topicStats[tId]) {
          topicStats[tId] = {
            topicId: tId,
            topicName: tName,
            unitName: 'Curriculum Unit',
            totalAwarded: 0,
            totalMax: 0,
            questionAttempts: 0,
            correctCount: 0,
          };
        }

        topicStats[tId].totalAwarded += evaluation.scoreAwarded;
        topicStats[tId].totalMax += evaluation.maxMarks;
        topicStats[tId].questionAttempts += 1;
        if (evaluation.isCorrect) {
          topicStats[tId].correctCount += 1;
        }
      });
    });

    return Object.values(topicStats).map(stat => {
      const percentage =
        stat.totalMax > 0
          ? Math.round((stat.totalAwarded / stat.totalMax) * 100)
          : 0;

      // Minimum 3 questions needed for statistical confidence
      const sampleSizeSufficient = stat.questionAttempts >= 3;

      let status: TopicPerformance['status'] = 'insufficient_data';
      let recommendedAction: string | undefined;

      if (!sampleSizeSufficient) {
        status = 'insufficient_data';
        recommendedAction = 'Assign further practice questions before drawing diagnostic conclusion.';
      } else if (percentage >= 75) {
        status = 'mastered';
        recommendedAction = 'Class exhibits strong concept mastery. Advance to higher-order applications.';
      } else if (percentage >= 55) {
        status = 'proficient';
        recommendedAction = 'Moderate understanding. Reinforce with 1-2 targeted examples during lecture.';
      } else {
        status = 'learning_gap';
        recommendedAction = `Active Learning Gap (${percentage}%): Faculty intervention recommended. Schedule remedial practice session.`;
      }

      return {
        topicId: stat.topicId,
        topicName: stat.topicName,
        unitName: stat.unitName,
        totalQuestionsAttempted: stat.questionAttempts,
        totalCorrect: stat.correctCount,
        averagePercentage: percentage,
        sampleSizeSufficient,
        status,
        recommendedAction,
      };
    });
  },
};
