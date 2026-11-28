import type {
  ClassSummary,
  FacultyAssignmentsResponse,
  FacultyNotificationsResponse,
  SkillGapStudent,
  StudentListResponse,
  TopicAnalysis,
  TopicAnalysisRow,
} from './facultyAnalyticsService';

/**
 * Defensive response shaping for faculty skill-gap endpoints.
 *
 * `|| 0` / `?? 0` are deliberately avoided for list fields: an API that
 * returns `0`, `null` or `undefined` must become `[]`, never a number.
 * These helpers are pure so they can be unit tested without React or axios.
 */
export const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

export const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const asNullableNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export const asNullableString = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const asBool = (value: unknown): boolean => value === true;

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const asStudentStatus = (value: unknown): SkillGapStudent['status'] =>
  value === 'below-threshold' || value === 'average' || value === 'strong' || value === 'no-attempts'
    ? value
    : 'no-attempts';

const asTopicStatus = (value: unknown): TopicAnalysisRow['status'] =>
  value === 'MASTERED' || value === 'MODERATE' || value === 'NEEDS_ATTENTION'
    ? value
    : 'NEEDS_ATTENTION';

export const normalizeAssignmentsResponse = (value: unknown): FacultyAssignmentsResponse => {
  const raw = asObject(value);
  const thresholds = asObject(raw.thresholds);
  return {
    assignments: asArray<Record<string, unknown>>(raw.assignments).map((row) => ({
      id: asString(row?.id),
      facultyId: asString(row?.facultyId),
      subjectId: asString(row?.subjectId),
      sectionId: asString(row?.sectionId),
      subjectName: asString(row?.subjectName),
      subjectCode: asString(row?.subjectCode),
      sectionName: asString(row?.sectionName),
      semester: asNumber(row?.semester),
      departmentId: asString(row?.departmentId),
      departmentName: asString(row?.departmentName),
    })),
    thresholds: {
      below: asNumber(thresholds.below, 50),
      strong: asNumber(thresholds.strong, 75),
    },
  };
};

export const normalizeClassSummary = (value: unknown): ClassSummary => {
  const raw = asObject(value);
  const distribution = asArray<Record<string, unknown>>(raw.distribution).map((row) => ({
    label: asString(row?.label),
    count: asNumber(row?.count),
  }));
  const trend = asArray<Record<string, unknown>>(raw.trend).map((row) => ({
    label: asString(row?.label),
    date: asString(row?.date),
    averageScore: asNumber(row?.averageScore),
  }));
  return {
    totalStudents: asNumber(raw.totalStudents),
    assessedStudents: asNumber(raw.assessedStudents),
    classAverage: asNumber(raw.classAverage),
    passPercent: asNumber(raw.passPercent),
    belowThresholdCount: asNumber(raw.belowThresholdCount),
    thresholdPercent: asNumber(raw.thresholdPercent, 50),
    strongPercent: asNumber(raw.strongPercent),
    distribution,
    hasData: raw.hasData === true,
    trend,
  };
};

export const normalizeTopicAnalysis = (value: unknown): TopicAnalysis => {
  const raw = asObject(value);
  const topics: TopicAnalysisRow[] = asArray<Record<string, unknown>>(raw.topics).map((row) => ({
    topicId: asString(row?.topicId),
    topicName: asString(row?.topicName),
    moduleNo: asNullableNumber(row?.moduleNo),
    averageScore: asNumber(row?.averageScore),
    pctWeak: asNumber(row?.pctWeak),
    studentsAssessed: asNumber(row?.studentsAssessed),
    status: asTopicStatus(row?.status),
    reteachRecommended: asBool(row?.reteachRecommended),
  }));
  return {
    topics,
    highlightedTopicIds: asArray<unknown>(raw.highlightedTopicIds).map((id) => asString(id)),
    hasData: raw.hasData === true || topics.length > 0,
  };
};

export const normalizeStudentList = (value: unknown): StudentListResponse => {
  const raw = asObject(value);
  const students: SkillGapStudent[] = asArray<Record<string, unknown>>(raw.students).map((row) => ({
    studentId: asString(row?.studentId),
    name: asString(row?.name),
    rollNo: asString(row?.rollNo),
    sectionName: asString(row?.sectionName),
    overallScore: asNullableNumber(row?.overallScore),
    weakTopicCount: asNumber(row?.weakTopicCount),
    status: asStudentStatus(row?.status),
    lastActivity: asNullableString(row?.lastActivity),
    topicScores: asArray<Record<string, unknown>>(row?.topicScores).map((topic) => ({
      topicId: asString(topic?.topicId),
      topicName: asString(topic?.topicName),
      score: asNullableNumber(topic?.score),
      weak: asBool(topic?.weak),
    })),
  }));
  return {
    students,
    total: asNumber(raw.total),
    topics: asArray<Record<string, unknown>>(raw.topics).map((topic) => ({
      topicId: asString(topic?.topicId),
      topicName: asString(topic?.topicName),
      moduleNo: asNullableNumber(topic?.moduleNo),
    })),
  };
};

export const normalizeNotificationsResponse = (value: unknown): FacultyNotificationsResponse => {
  const raw = asObject(value);
  const notifications = asArray<Record<string, unknown>>(raw.notifications).map((row) => ({
    id: asString(row?.id),
    userId: asNullableString(row?.userId),
    title: asString(row?.title),
    message: asString(row?.message),
    type: asString(row?.type),
    isRead: asBool(row?.isRead),
    actionUrl: asNullableString(row?.actionUrl),
    role: asNullableString(row?.role),
    createdAt: asString(row?.createdAt),
  }));
  return {
    notifications,
    unreadCount: asNumber(raw.unreadCount, notifications.filter((n) => !n.isRead).length),
  };
};
