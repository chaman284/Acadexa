import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import {
  CONFIG,
  FacultySectionDetail,
  getDetailedSectionSkillReport,
  getStudentSkillReport,
  isWeakScore,
  Score,
  Status,
} from './skillGapService';

const THRESHOLD_PCT = Math.round(CONFIG.MODERATE_AT * 100);
const STRONG_PCT = Math.round(CONFIG.MASTERED_AT * 100);
const CACHE_TTL_MS = 60_000;

const cache = new Map<string, { expiresAt: number; value: unknown }>();

export const invalidateFacultySkillGapCache = (): void => {
  cache.clear();
};

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;
  const value = await load();
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, value });
  return value;
}

export interface FacultyFilters {
  topicId?: string;
  from?: Date;
  to?: Date;
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
}

export interface TopicRow {
  topicId: string;
  topicName: string;
  moduleNo: number | null;
  averageScore: number;
  pctWeak: number;
  studentsAssessed: number;
  status: Status;
  reteachRecommended: boolean;
}

export interface TopicAnalysis {
  topics: TopicRow[];
  highlightedTopicIds: string[];
  hasData: boolean;
}

export type StudentStatus = 'below-threshold' | 'average' | 'strong' | 'no-attempts';

export interface StudentRow {
  studentId: string;
  name: string;
  rollNo: string;
  sectionName: string;
  overallScore: number | null;
  weakTopicCount: number;
  status: StudentStatus;
  lastActivity: string | null;
  topicScores: Array<{ topicId: string; topicName: string; score: number | null; weak: boolean }>;
}

export interface TrendPoint {
  label: string;
  date: string;
  averageScore: number;
}

const pct = (mastery: number): number => Math.round(mastery * 100);

export const statusForMastery = (mastery: number): StudentStatus => {
  if (mastery >= CONFIG.MASTERED_AT) return 'strong';
  if (mastery >= CONFIG.MODERATE_AT) return 'average';
  return 'below-threshold';
};

/** Pure helper so aggregate tests do not need a database. */
export function buildClassSummary(detail: FacultySectionDetail, totalStudents: number): ClassSummary {
  const scores = detail.students.map((s) => s.overall);
  const distribution = [
    { label: '<40', count: 0 },
    { label: '40-60', count: 0 },
    { label: '60-75', count: 0 },
    { label: '75+', count: 0 },
  ];
  for (const score of scores) {
    const value = pct(score.mastery);
    if (value < 40) distribution[0].count++;
    else if (value < 60) distribution[1].count++;
    else if (value < 75) distribution[2].count++;
    else distribution[3].count++;
  }

  const below = scores.filter((s) => s.status === 'NEEDS_ATTENTION').length;
  const strong = scores.filter((s) => s.status === 'MASTERED').length;
  const average = scores.length ? scores.reduce((sum, s) => sum + pct(s.mastery), 0) / scores.length : 0;

  return {
    totalStudents,
    assessedStudents: scores.length,
    classAverage: scores.length ? Math.round(average) : 0,
    passPercent: scores.length ? Math.round(((scores.length - below) / scores.length) * 100) : 0,
    belowThresholdCount: below,
    thresholdPercent: THRESHOLD_PCT,
    strongPercent: scores.length ? Math.round((strong / scores.length) * 100) : 0,
    distribution,
    hasData: scores.length > 0,
  };
}

/** Pure helper: weakest first, with the three weakest highlighted. */
export function buildTopicAnalysis(detail: FacultySectionDetail): TopicAnalysis {
  const reteachIds = new Set(detail.reteach.map((r) => r.id));
  const topics: TopicRow[] = detail.topics
    .map((t) => ({
      topicId: t.id,
      topicName: t.name,
      moduleNo: t.moduleNo,
      averageScore: pct(t.mastery),
      pctWeak: t.pctWeak,
      studentsAssessed: t.studentsAssessed,
      status: t.status,
      reteachRecommended: reteachIds.has(t.id),
    }))
    // Weakest first; name breaks ties so the order is deterministic.
    .sort((a, b) => a.averageScore - b.averageScore || a.topicName.localeCompare(b.topicName));
  return {
    topics,
    highlightedTopicIds: topics.slice(0, 3).map((t) => t.topicId),
    hasData: topics.length > 0,
  };
}

const toStudentStatus = (score: Score | undefined): StudentStatus =>
  score ? statusForMastery(score.mastery) : 'no-attempts';

interface StudentMeta {
  id: string;
  name: string;
  rollNo: string;
  sectionId: string;
  sectionName: string;
  lastActivity: string | null;
}

async function loadStudentMeta(sectionId: string, subjectId: string, filters: FacultyFilters): Promise<StudentMeta[]> {
  const submittedAt: Prisma.DateTimeFilter = {};
  if (filters.from) submittedAt.gte = filters.from;
  if (filters.to) submittedAt.lte = filters.to;

  const rows = await prisma.student.findMany({
    where: { sectionId },
    select: {
      id: true,
      rollNo: true,
      sectionId: true,
      section: { select: { name: true } },
      user: { select: { name: true } },
      quizAttempts: {
        where: {
          isSubmitted: true,
          quiz: { is: { subjectId } },
          ...(Object.keys(submittedAt).length ? { submittedAt } : {}),
        },
        select: { submittedAt: true },
        orderBy: { submittedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { rollNo: 'asc' },
  });

  return rows.map((row: any) => ({
    id: row.id,
    name: row.user?.name || row.rollNo,
    rollNo: row.rollNo,
    sectionId: row.sectionId,
    sectionName: row.section?.name || '',
    lastActivity: row.quizAttempts?.[0]?.submittedAt
      ? new Date(row.quizAttempts[0].submittedAt).toISOString()
      : null,
  }));
}

/** Pure helper combining service scores with roster metadata. */
export function buildStudentRows(
  detail: FacultySectionDetail,
  meta: StudentMeta[],
  topicRows: TopicRow[],
): StudentRow[] {
  const byStudent = new Map(detail.students.map((s) => [s.studentId, s]));
  return meta.map((m) => {
    const scored = byStudent.get(m.id);
    const byTopic = new Map(scored?.topics.map((t) => [t.topicId, t]) ?? []);
    return {
      studentId: m.id,
      name: m.name,
      rollNo: m.rollNo,
      sectionName: m.sectionName,
      overallScore: scored ? pct(scored.overall.mastery) : null,
      weakTopicCount: scored?.topics.filter((t) => isWeakScore(t)).length ?? 0,
      status: toStudentStatus(scored?.overall),
      lastActivity: m.lastActivity,
      topicScores: topicRows.map((t) => {
        const topicScore = byTopic.get(t.topicId);
        return {
          topicId: t.topicId,
          topicName: t.topicName,
          score: topicScore ? pct(topicScore.mastery) : null,
          weak: topicScore ? isWeakScore(topicScore) : false,
        };
      }),
    };
  });
}

async function loadTrend(sectionId: string, subjectId: string, filters: FacultyFilters): Promise<TrendPoint[]> {
  const submittedAt: Prisma.DateTimeFilter = {};
  if (filters.from) submittedAt.gte = filters.from;
  if (filters.to) submittedAt.lte = filters.to;

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      student: { sectionId },
      quiz: { is: { subjectId } },
      isSubmitted: true,
      ...(Object.keys(submittedAt).length ? { submittedAt } : {}),
    },
    select: {
      quizId: true,
      score: true,
      submittedAt: true,
      quiz: { select: { title: true } },
    },
    orderBy: { submittedAt: 'asc' },
    take: 500,
  });

  const groups = new Map<string, { label: string; date: string; total: number; count: number }>();
  for (const attempt of attempts as any[]) {
    const date = new Date(attempt.submittedAt).toISOString();
    const key = `${attempt.quizId}:${date.slice(0, 10)}`;
    const group = groups.get(key) ?? {
      label: attempt.quiz?.title || 'Assessment',
      date,
      total: 0,
      count: 0,
    };
    group.total += Number(attempt.score) || 0;
    group.count++;
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((g) => ({
      label: g.label,
      date: g.date,
      averageScore: g.count ? Math.round(g.total / g.count) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const parseFilters = (query: Record<string, unknown>): FacultyFilters => {
  const dateOrUndefined = (value: unknown, endOfDay = false): Date | undefined => {
    if (typeof value !== 'string' || !value) return undefined;
    const date = new Date(endOfDay ? `${value}T23:59:59.999Z` : value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  return {
    topicId: typeof query.topicId === 'string' && query.topicId ? query.topicId : undefined,
    from: dateOrUndefined(query.from),
    to: dateOrUndefined(query.to, true),
  };
};

export async function getFacultyClassData(
  sectionId: string,
  subjectId: string,
  query: Record<string, unknown>,
) {
  const filters = parseFilters(query);
  const key = `class:${sectionId}:${subjectId}:${JSON.stringify(filters)}`;
  return cached(key, async () => {
    const [detail, meta, trend] = await Promise.all([
      getDetailedSectionSkillReport({
        sectionId,
        subjectId,
        topicId: filters.topicId,
        from: filters.from,
        to: filters.to,
      }),
      loadStudentMeta(sectionId, subjectId, filters),
      loadTrend(sectionId, subjectId, filters),
    ]);

    // The calculation engine is authoritative, but never trust a non-array
    // for a list field even if a future change regresses its empty path.
    const safeDetail: FacultySectionDetail = {
      ...detail,
      reteach: Array.isArray(detail.reteach) ? detail.reteach : [],
      atRisk: Array.isArray(detail.atRisk) ? detail.atRisk : [],
      topics: Array.isArray(detail.topics) ? detail.topics : [],
      students: Array.isArray(detail.students) ? detail.students : [],
    };
    const safeMeta = Array.isArray(meta) ? meta : [];
    const safeTrend = Array.isArray(trend) ? trend : [];

    const summary = buildClassSummary(safeDetail, safeMeta.length);
    const analysis = buildTopicAnalysis(safeDetail);
    const students = buildStudentRows(safeDetail, safeMeta, analysis.topics);
    return { summary, analysis, students, trend: safeTrend, hasData: safeDetail.empty === false };
  });
}

export async function getFacultyStudentReport(
  studentId: string,
  subjectId: string,
  sectionId: string,
) {
  const [student, report] = await Promise.all([
    prisma.student.findFirst({
      where: { id: studentId, sectionId },
      select: { id: true },
    }),
    getStudentSkillReport(studentId, subjectId),
  ]);
  if (!student) return null;
  return report;
}

export const facultySkillGapService = {
  CONFIG,
  THRESHOLD_PCT,
  STRONG_PCT,
  invalidateFacultySkillGapCache,
  buildClassSummary,
  buildTopicAnalysis,
  buildStudentRows,
  getFacultyClassData,
  getFacultyStudentReport,
};
