// ============================================
// ANALYTICS SERVICE — Integrated with Backend API & Skill Gap Engine
// ============================================
import api from '../lib/apiClient';
import {
  studentWeeklyPerformance,
  studentMonthlyPerformance,
  studentSemesterPerformance,
  classWeeklyPerformance,
  classTopicPerformance,
  classPerformanceMatrix,
  studentsNeedingAttention,
  difficultQuestions,
  recentActivities,
  studentLearningGaps,
} from '../data/analytics';
import { facultyClasses, type FacultyClass } from '../data/facultyClasses';
import type { PerformancePoint } from '../types/analytics';

export interface StudentTopicSkill {
  topicId: string;
  topicName: string;
  subjectName: string;
  score: number;
  category: 'strong' | 'needs-practice' | 'improving';
  status?: 'MASTERED' | 'MODERATE' | 'NEEDS_ATTENTION';
  confidence?: number;
  rawAccuracy?: number;
  answered?: number;
  lowData?: boolean;
}

export interface StudentSkillGapRecommendation {
  topicId: string;
  topicName: string;
  courseName: string;
  gapSeverity: 'high' | 'medium' | 'low';
  currentScore: number;
  targetScore: number;
  recommendedQuestions: number;
}

export interface StudentSkillGapReport {
  studentId?: string;
  topics: StudentTopicSkill[];
  recommendations: StudentSkillGapRecommendation[];
  strongCount: number;
  needsPracticeCount: number;
  improvingCount: number;
  isFallback?: boolean;
}

export interface SectionTopicSkill {
  topicId: string;
  topicName: string;
  courseId?: string;
  courseName?: string;
  unitName?: string;
  averageScore: number;
  participationRate: number;
  trend: 'improving' | 'declining' | 'stable';
  attemptsCount?: number;
  pctNeedsAttention?: number;
  status?: 'MASTERED' | 'MODERATE' | 'NEEDS_ATTENTION';
  isReteachRecommended?: boolean;
}

export interface SectionSkillGapReport {
  sectionId?: string;
  topics: SectionTopicSkill[];
  reteachTopics: Array<{ id: string; name: string; pctNeedsAttention: number }>;
  atRiskCount: number;
  isFallback?: boolean;
}

// ───────────── Fallback Mock Datasets ─────────────
const fallbackStudentTopics: StudentTopicSkill[] = [
  { topicId: 'top-1', topicName: 'Binary Trees', subjectName: 'Data Structures', score: 48, category: 'needs-practice', status: 'NEEDS_ATTENTION', confidence: 85, answered: 14 },
  { topicId: 'top-2', topicName: 'Graphs & BFS/DFS', subjectName: 'Data Structures', score: 56, category: 'needs-practice', status: 'NEEDS_ATTENTION', confidence: 80, answered: 10 },
  { topicId: 'top-3', topicName: 'Dynamic Programming', subjectName: 'Data Structures', score: 62, category: 'improving', status: 'MODERATE', confidence: 75, answered: 8 },
  { topicId: 'top-4', topicName: 'Sorting Algorithms', subjectName: 'Data Structures', score: 85, category: 'strong', status: 'MASTERED', confidence: 90, answered: 18 },
  { topicId: 'top-5', topicName: 'Arrays & Strings', subjectName: 'Data Structures', score: 92, category: 'strong', status: 'MASTERED', confidence: 95, answered: 24 },
  { topicId: 'top-6', topicName: 'Stacks & Queues', subjectName: 'Data Structures', score: 78, category: 'strong', status: 'MASTERED', confidence: 88, answered: 16 },
  { topicId: 'top-7', topicName: 'Hash Tables', subjectName: 'Data Structures', score: 68, category: 'improving', status: 'MODERATE', confidence: 70, answered: 11 },
];

const fallbackStudentRecommendations: StudentSkillGapRecommendation[] = [
  {
    topicId: 'top-1',
    topicName: 'Binary Trees',
    courseName: 'Data Structures',
    gapSeverity: 'high',
    currentScore: 48,
    targetScore: 80,
    recommendedQuestions: 6,
  },
  {
    topicId: 'top-2',
    topicName: 'Graphs & BFS/DFS',
    courseName: 'Data Structures',
    gapSeverity: 'high',
    currentScore: 56,
    targetScore: 80,
    recommendedQuestions: 5,
  },
  {
    topicId: 'top-3',
    topicName: 'Dynamic Programming',
    courseName: 'Data Structures',
    gapSeverity: 'medium',
    currentScore: 62,
    targetScore: 80,
    recommendedQuestions: 4,
  },
];

export const analyticsService = {
  /**
   * GET /api/skill-gaps/student/me
   * Retrieves fine-grained Bayesian skill gaps for the authenticated student.
   * Falls back to mock data gracefully when offline or without quiz history.
   */
  getStudentSkillGaps: async (subjectId?: string): Promise<StudentSkillGapReport> => {
    try {
      const res = await api.get('/skill-gaps/student/me', {
        params: subjectId ? { subjectId } : undefined,
      });

      if (res.data && res.data.empty) {
        return {
          studentId: res.data.studentId,
          topics: [],
          recommendations: [],
          strongCount: 0,
          needsPracticeCount: 0,
          improvingCount: 0,
          isFallback: false,
        };
      }

      if (res.data && !res.data.empty && res.data.tree) {
        const topics: StudentTopicSkill[] = [];
        const subjectMap = new Map<string, string>();

        // 1. Map subjects from tree children
        if (Array.isArray(res.data.tree.children)) {
          for (const subNode of res.data.tree.children) {
            subjectMap.set(subNode.id, subNode.name);

            // Subnode children are topics
            if (Array.isArray(subNode.children)) {
              for (const topNode of subNode.children) {
                const score = Math.round((topNode.mastery ?? 0) * 100);
                const category: 'strong' | 'needs-practice' | 'improving' =
                  topNode.status === 'MASTERED'
                    ? 'strong'
                    : topNode.status === 'NEEDS_ATTENTION'
                    ? 'needs-practice'
                    : 'improving';

                topics.push({
                  topicId: topNode.id,
                  topicName: topNode.name,
                  subjectName: subNode.name,
                  score,
                  category,
                  status: topNode.status,
                  confidence: Math.round((topNode.confidence ?? 0) * 100),
                  rawAccuracy: Math.round((topNode.rawAccuracy ?? 0) * 100),
                  answered: topNode.answered ?? 0,
                  lowData: !!topNode.lowData,
                });
              }
            }
          }
        }

        // 2. Build recommendations from weakestTopics
        const weakest = Array.isArray(res.data.weakestTopics) ? res.data.weakestTopics : [];
        const recommendations: StudentSkillGapRecommendation[] = weakest.map((w: any) => {
          const matchedTopic = topics.find(t => t.topicId === w.topicId);
          const score = Math.round((w.mastery ?? 0) * 100);
          const targetScore = w.targetMastery || 75;
          const availableQ = w.availableQuestions || matchedTopic?.answered || 4;
          return {
            topicId: w.topicId,
            topicName: w.topic,
            courseName: matchedTopic?.subjectName || subjectMap.values().next().value || 'Core Coursework',
            gapSeverity: w.status === 'NEEDS_ATTENTION' ? 'high' : 'medium',
            currentScore: score,
            targetScore,
            recommendedQuestions: availableQ,
          };
        });

        const strongCount = topics.filter(t => t.category === 'strong').length;
        const needsPracticeCount = topics.filter(t => t.category === 'needs-practice').length;
        const improvingCount = topics.filter(t => t.category === 'improving').length;

        return {
          studentId: res.data.studentId,
          topics,
          recommendations,
          strongCount,
          needsPracticeCount,
          improvingCount,
          isFallback: false,
        };
      }
    } catch (e) {
      console.warn('Skill gaps API offline or unreachable, falling back to mock dataset:', e);
    }

    // Resilient Mock Fallback
    const strongCount = fallbackStudentTopics.filter(t => t.category === 'strong').length;
    const needsPracticeCount = fallbackStudentTopics.filter(t => t.category === 'needs-practice').length;
    const improvingCount = fallbackStudentTopics.filter(t => t.category === 'improving').length;

    return {
      topics: fallbackStudentTopics,
      recommendations: studentLearningGaps.length > 0
        ? studentLearningGaps.map(g => ({
            topicId: g.topicId,
            topicName: g.topicName,
            courseName: g.courseName,
            gapSeverity: g.gapSeverity,
            currentScore: g.currentScore,
            targetScore: g.targetScore,
            recommendedQuestions: g.recommendedQuestions,
          }))
        : fallbackStudentRecommendations,
      strongCount,
      needsPracticeCount,
      improvingCount,
      isFallback: true,
    };
  },

  /**
   * GET /api/sections/faculty-classes
   * Retrieves assigned classes for faculty, with fallback to local mock classes.
   */
  getFacultyClasses: async (): Promise<FacultyClass[]> => {
    try {
      const res = await api.get('/sections/faculty-classes');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn('Faculty classes API fallback to mock:', e);
    }
    return facultyClasses;
  },

  /**
   * GET /api/skill-gaps/section/:sectionId
   * Retrieves class-wide topic mastery, reteach alerts, and at-risk student telemetry.
   */
  getSectionSkillGaps: async (sectionId: string, subjectId?: string): Promise<SectionSkillGapReport> => {
    try {
      const res = await api.get(`/skill-gaps/section/${sectionId}`, {
        params: subjectId ? { subjectId } : undefined,
      });

      if (res.data && !res.data.empty && res.data.tree) {
        const topics: SectionTopicSkill[] = [];
        const reteachTopics = Array.isArray(res.data.reteach) ? res.data.reteach : [];
        const reteachIdSet = new Set(reteachTopics.map((r: any) => r.id));

        // Flatten topic nodes from tree
        if (Array.isArray(res.data.tree.children)) {
          for (const subNode of res.data.tree.children) {
            if (Array.isArray(subNode.children)) {
              for (const [idx, topNode] of subNode.children.entries()) {
                const avg = Math.round((topNode.mastery ?? 0) * 100);
                const trend: 'improving' | 'declining' | 'stable' =
                  topNode.status === 'MASTERED'
                    ? 'improving'
                    : topNode.status === 'NEEDS_ATTENTION'
                    ? 'declining'
                    : 'stable';

                topics.push({
                  topicId: topNode.id,
                  topicName: topNode.name,
                  courseId: subNode.id,
                  courseName: subNode.name,
                  unitName: `Unit ${idx + 1}`,
                  averageScore: avg,
                  participationRate: Math.min(100, (topNode.studentsAssessed || 0) * 10),
                  trend,
                  attemptsCount: topNode.studentsAssessed ?? 0,
                  pctNeedsAttention: topNode.pctNeedsAttention ?? 0,
                  status: topNode.status,
                  isReteachRecommended: reteachIdSet.has(topNode.id),
                });
              }
            }
          }
        }

        if (topics.length > 0) {
          return {
            sectionId,
            topics,
            reteachTopics,
            atRiskCount: Array.isArray(res.data.atRisk) ? res.data.atRisk.length : 0,
            isFallback: false,
          };
        }
      }
    } catch (e) {
      console.warn('Section skill gaps API fallback to mock:', e);
    }

    // Fallback: derive from classTopicPerformance or facultyClasses
    const fallbackSection = facultyClasses.find(c => c.id === sectionId || c.sectionId === sectionId) || facultyClasses[0];
    const fallbackTopics: SectionTopicSkill[] = (fallbackSection?.weakTopics || []).map((wt, i) => ({
      topicId: `topic_${i + 1}`,
      topicName: wt.topicName,
      courseId: fallbackSection?.subjectId || 'subj_cs',
      courseName: fallbackSection?.subject || 'Computer Science',
      unitName: `Unit ${i + 1}`,
      averageScore: wt.score,
      participationRate: 85,
      trend: wt.score >= 70 ? 'improving' : wt.score < 55 ? 'declining' : 'stable',
      attemptsCount: 28,
      pctNeedsAttention: wt.score < 60 ? 45 : 15,
      status: wt.score >= 75 ? 'MASTERED' : wt.score >= 50 ? 'MODERATE' : 'NEEDS_ATTENTION',
      isReteachRecommended: wt.score < 55,
    }));

    return {
      sectionId,
      topics: fallbackTopics.length > 0 ? fallbackTopics : (classTopicPerformance as any),
      reteachTopics: fallbackTopics.filter(t => t.isReteachRecommended).map(t => ({ id: t.topicId, name: t.topicName, pctNeedsAttention: t.pctNeedsAttention || 45 })),
      atRiskCount: fallbackTopics.filter(t => t.status === 'NEEDS_ATTENTION').length,
      isFallback: true,
    };
  },

  /** GET /api/analytics/student/:id */
  getStudentPerformance: async (studentId: string, period: 'week' | 'month' | 'semester'): Promise<PerformancePoint[]> => {
    try {
      const res = await api.get(`/analytics/student/${studentId}`);
      if (res.data?.recentAttempts && res.data.recentAttempts.length > 0) {
        return res.data.recentAttempts.map((att: any, idx: number) => ({
          label: att.quiz?.title || `Quiz ${idx + 1}`,
          score: Math.round(att.score),
          average: 75,
        }));
      }
    } catch (e) {
      console.warn('API getStudentPerformance fallback to mock', e);
    }
    if (period === 'month') return studentMonthlyPerformance;
    if (period === 'semester') return studentSemesterPerformance;
    return studentWeeklyPerformance;
  },

  /** GET /api/analytics/gaps/:studentId */
  getStudentLearningGaps: async (studentId: string) => {
    try {
      const res = await api.get(`/analytics/gaps/${studentId}`);
      if (res.data && res.data.length > 0) {
        return res.data.map((g: any) => ({
          topicId: g.topicId,
          topicName: g.topicName,
          accuracy: 100 - g.gapScore,
          gapSeverity: g.gapScore >= 60 ? 'high' : g.gapScore >= 35 ? 'medium' : 'low',
          recommendedQuestions: Math.max(3, Math.round(g.incorrectQuestions * 1.5)),
        }));
      }
    } catch (e) {
      console.warn('API getStudentLearningGaps fallback to mock', e);
    }
    return studentLearningGaps;
  },

  /** GET /api/analytics/section/:id */
  getClassPerformance: async (_courseId: string) => {
    return classWeeklyPerformance;
  },

  /** GET /api/analytics/class/:courseId/topics */
  getClassTopicPerformance: async (_courseId: string) => {
    return classTopicPerformance;
  },

  /** GET /api/analytics/class/:courseId/matrix */
  getClassPerformanceMatrix: async (_courseId: string) => {
    return classPerformanceMatrix;
  },

  /** GET /api/analytics/class/:courseId/attention */
  getStudentsNeedingAttention: async (_courseId: string) => {
    return studentsNeedingAttention;
  },

  /** GET /api/analytics/class/:courseId/difficult-questions */
  getDifficultQuestions: async (_courseId: string) => {
    return difficultQuestions;
  },

  /** GET /api/activity/recent */
  getRecentActivity: async () => {
    return recentActivities;
  },
};

export const recommendationService = {
  getPersonalizedRecommendations: async (studentId: string) => {
    const gaps = await analyticsService.getStudentLearningGaps(studentId);
    return gaps.map((gap: any) => ({
      topicId: gap.topicId,
      topicName: gap.topicName,
      recommendedQuestions: gap.recommendedQuestions,
      priority: gap.gapSeverity,
      label: `Practice ${gap.topicName}`,
      questionCount: gap.recommendedQuestions,
      difficulty: gap.gapSeverity === 'high' ? 'easy' : 'medium',
    }));
  },
};
