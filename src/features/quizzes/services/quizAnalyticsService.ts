// ============================================================================
// ACADEXA LEARNING-GAP ANALYTICS INTEGRATION SERVICE
// Aggregates student responses by topic, computing mastery levels and flagging
// actionable learning gaps with statistical thresholds.
// ============================================================================
import type { QuizAttempt, TopicPerformance } from '../types/quizTypes';

const ATTEMPTS_STORAGE_KEY = 'acadexa_quiz_attempts_v2';

const SEED_ATTEMPTS: QuizAttempt[] = [];

const getStoredAttempts = (): QuizAttempt[] => {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((a: any) => a && !String(a.id).startsWith('att_seed_'));
      }
    }
  } catch (err) {
    console.warn('Failed to parse quiz attempts:', err);
  }
  return [];
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
