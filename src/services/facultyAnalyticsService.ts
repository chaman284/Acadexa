import api from '../lib/apiClient';
import {
  transformStudentSkillGapReport,
  type StudentSkillGapReport,
} from './analyticsService';
import {
  normalizeAssignmentsResponse,
  normalizeClassSummary,
  normalizeNotificationsResponse,
  normalizeStudentList,
  normalizeTopicAnalysis,
} from './facultyAnalyticsNormalizer';

export interface FacultyAssignment {
  id: string;
  facultyId: string;
  subjectId: string;
  sectionId: string;
  subjectName: string;
  subjectCode: string;
  sectionName: string;
  semester: number;
  departmentId: string;
  departmentName: string;
}

export interface FacultyAssignmentsResponse {
  assignments: FacultyAssignment[];
  thresholds: { below: number; strong: number };
}

export interface ClassSummary {
  totalStudents: number;
  assessedStudents: number;
  classAverage: number;
  passPercent: number;
  belowThresholdCount: number;
  thresholdPercent: number;
  strongPercent: number;
  distribution: Array<{ label: string; count: number }>;
  hasData: boolean;
  trend: Array<{ label: string; date: string; averageScore: number }>;
}

export interface TopicAnalysisRow {
  topicId: string;
  topicName: string;
  moduleNo: number | null;
  averageScore: number;
  pctWeak: number;
  studentsAssessed: number;
  status: 'MASTERED' | 'MODERATE' | 'NEEDS_ATTENTION';
  reteachRecommended: boolean;
}

export interface TopicAnalysis {
  topics: TopicAnalysisRow[];
  highlightedTopicIds: string[];
  hasData: boolean;
}

export interface SkillGapStudent {
  studentId: string;
  name: string;
  rollNo: string;
  sectionName: string;
  overallScore: number | null;
  weakTopicCount: number;
  status: 'below-threshold' | 'average' | 'strong' | 'no-attempts';
  lastActivity: string | null;
  topicScores: Array<{
    topicId: string;
    topicName: string;
    score: number | null;
    weak: boolean;
  }>;
}

export interface StudentListResponse {
  students: SkillGapStudent[];
  total: number;
  topics: Array<{ topicId: string; topicName: string; moduleNo: number | null }>;
}

export interface FacultyNotification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  role: string | null;
  createdAt: string;
}

export interface FacultyNotificationsResponse {
  notifications: FacultyNotification[];
  unreadCount: number;
}

export interface FacultyStudentQuery {
  topicId?: string;
  from?: string;
  to?: string;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  quickFilter?: 'below-threshold' | 'weak-topic' | 'no-attempts' | '';
}

const cleanParams = (params: FacultyStudentQuery): Record<string, string> =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => !!value)) as Record<string, string>;

export const facultyAnalyticsService = {
  getAssignments: async (): Promise<FacultyAssignmentsResponse> => {
    try {
      const res = await api.get('/faculty/assignments');
      return normalizeAssignmentsResponse(res.data);
    } catch (error) {
      console.warn('Faculty assignments request failed:', error);
      return normalizeAssignmentsResponse(null);
    }
  },

  getClassSummary: async (
    subjectId: string,
    sectionId: string,
    query: FacultyStudentQuery = {},
  ): Promise<ClassSummary> => {
    try {
      const res = await api.get(
        `/faculty/subjects/${encodeURIComponent(subjectId)}/sections/${encodeURIComponent(sectionId)}/class-summary`,
        { params: cleanParams(query) },
      );
      return normalizeClassSummary(res.data);
    } catch (error) {
      console.warn('Faculty class summary request failed:', error);
      return normalizeClassSummary(null);
    }
  },

  getTopicAnalysis: async (
    subjectId: string,
    sectionId: string,
    query: FacultyStudentQuery = {},
  ): Promise<TopicAnalysis> => {
    try {
      const res = await api.get(
        `/faculty/subjects/${encodeURIComponent(subjectId)}/sections/${encodeURIComponent(sectionId)}/topic-analysis`,
        { params: cleanParams(query) },
      );
      return normalizeTopicAnalysis(res.data);
    } catch (error) {
      console.warn('Faculty topic analysis request failed:', error);
      return normalizeTopicAnalysis(null);
    }
  },

  getStudents: async (
    subjectId: string,
    sectionId: string,
    query: FacultyStudentQuery = {},
  ): Promise<StudentListResponse> => {
    try {
      const res = await api.get(
        `/faculty/subjects/${encodeURIComponent(subjectId)}/sections/${encodeURIComponent(sectionId)}/students`,
        { params: cleanParams(query) },
      );
      return normalizeStudentList(res.data);
    } catch (error) {
      console.warn('Faculty student list request failed:', error);
      return normalizeStudentList(null);
    }
  },

  /** Same raw payload as /skill-gaps/student/me, transformed with the same mapper. */
  getStudentSkillGap: async (
    subjectId: string,
    sectionId: string,
    studentId: string,
  ): Promise<StudentSkillGapReport> => {
    try {
      const res = await api.get(
        `/faculty/subjects/${encodeURIComponent(subjectId)}/sections/${encodeURIComponent(sectionId)}/students/${encodeURIComponent(studentId)}/skill-gap`,
      );
      if (res.data?.tree) return transformStudentSkillGapReport(res.data);
    } catch (error) {
      console.warn('Faculty student skill-gap request failed:', error);
    }
    return {
      topics: [],
      recommendations: [],
      strongCount: 0,
      needsPracticeCount: 0,
      improvingCount: 0,
    };
  },

  getNotifications: async (): Promise<FacultyNotificationsResponse> => {
    try {
      const res = await api.get('/faculty/notifications');
      return normalizeNotificationsResponse(res.data);
    } catch (error) {
      console.warn('Faculty notifications request failed:', error);
      return normalizeNotificationsResponse(null);
    }
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await api.patch(`/faculty/notifications/${encodeURIComponent(id)}/read`);
  },
};
