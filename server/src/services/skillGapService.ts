/**
 * Skill Gap Analysis
 * ------------------
 * Hierarchy:  Subject → Topic → Subtopic
 * Scopes:     student | section | year
 *
 * Per-answer evidence weight =
 *     difficultyWeight(correct/wrong)   – wrong on EASY hurts more, correct on HARD helps more
 *   × cohortFactor                      – if the whole section missed it, penalty shrinks;
 *                                         if only this student missed it, penalty grows
 *   × timeDecay                         – recent answers matter more
 *
 * Mastery(node) = (Σ w·correct + α·p0) / (Σ w + α)       (Bayesian shrinkage, so 1 answer ≠ verdict)
 * Evidence is POOLED up the hierarchy (not average-of-averages).
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// ───────────── Tunable constants ─────────────
export const CONFIG = {
  CORRECT_W: { EASY: 0.7, MEDIUM: 1.0, HARD: 1.4 } as Record<string, number>,
  WRONG_W: { EASY: 1.4, MEDIUM: 1.0, HARD: 0.7 } as Record<string, number>,
  HALF_LIFE_DAYS: 30,
  DECAY_FLOOR: 0.15,
  PRIOR_MASTERY: 0.5, // p0
  PRIOR_STRENGTH: 2, // α  (pseudo-weight of the prior)
  MASTERED_AT: 0.75,
  MODERATE_AT: 0.5,
  MIN_ANSWERS_CONFIDENT: 2, // below this → lowData flag
};

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type DiagnosisType =
  | 'FOUNDATION_GAP'
  | 'APPLICATION_GAP'
  | 'EDGE_CASE_ONLY'
  | 'MASTERED'
  | 'INSUFFICIENT_DATA';

export interface Band {
  correct: number;
  total: number;
}
export type BandStats = Record<Difficulty, Band>;

export const DIAG_CONFIG = {
  MIN_TOTAL_ANSWERS: 4, // fewer answers than this across all bands -> INSUFFICIENT_DATA
  BAND_PASS_AT: 0.5, // a band is "passed" if correct/total >= this
};

export interface Diagnosis {
  diagnosis: DiagnosisType;
  guessingSuspected: boolean; // true when EASY failed but HARD passed
  missingBands: Difficulty[]; // bands with total === 0
  bands: Record<Difficulty, { accuracy: number | null; total: number; passed: boolean | null }>;
  startDifficulty: Difficulty | null; // where a remedial quiz should start
}

export type Status = 'MASTERED' | 'MODERATE' | 'NEEDS_ATTENTION';
export type Level = 'OVERALL' | 'SUBJECT' | 'TOPIC' | 'SUBTOPIC';

export interface Scope {
  studentId?: string;
  sectionId?: string;
  year?: number; // 1..4  → semesters (2y-1, 2y)
  subjectId?: string;
  facultyId?: string; // restrict evidence to quizzes created by this faculty
  topicId?: string; // module filter (top-level Topic id)
  from?: Date; // submittedAt lower bound
  to?: Date; // submittedAt upper bound
}

interface Evidence {
  studentId: string;
  sectionId: string;
  semester: number;
  sectionName: string;
  questionId: string;
  difficulty: string;
  isCorrect: boolean;
  answeredAt: Date;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  subtopicId: string | null;
  subtopicName: string | null;
}

interface Acc {
  num: number; // Σ weight of correct answers
  den: number; // Σ weight of all answers
  count: number;
  correct: number;
}

interface NodeMeta {
  key: string;
  level: Level;
  id: string;
  name: string;
  parentKey: string | null;
}

export interface Score {
  mastery: number; // 0..1
  status: Status;
  confidence: number; // 0..1
  answered: number;
  rawAccuracy: number; // plain correct/answered
  lowData: boolean;
}

// ───────────── Pure functions (unit-testable) ─────────────
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function classify(mastery: number): Status {
  if (mastery >= CONFIG.MASTERED_AT) return 'MASTERED';
  if (mastery >= CONFIG.MODERATE_AT) return 'MODERATE';
  return 'NEEDS_ATTENTION';
}

/** cohortWrongRate: smoothed share of the student's section that got this question wrong (0..1) */
export function evidenceWeight(
  difficulty: string,
  isCorrect: boolean,
  cohortWrongRate: number,
  answeredAt: Date,
  now: Date,
): number {
  const d = (difficulty || 'MEDIUM').toUpperCase();
  const base = (isCorrect ? CONFIG.CORRECT_W : CONFIG.WRONG_W)[d] ?? 1;
  const cohort = isCorrect
    ? clamp(0.5 + cohortWrongRate, 0.5, 1.5) // right on a question most missed = strong signal
    : clamp(1.5 - cohortWrongRate, 0.5, 1.5); // wrong on a question most missed = weak signal
  const ageDays = Math.max(0, (now.getTime() - answeredAt.getTime()) / 86_400_000);
  const decay = Math.max(CONFIG.DECAY_FLOOR, Math.pow(0.5, ageDays / CONFIG.HALF_LIFE_DAYS));
  return base * cohort * decay;
}

export function scoreFromAcc(a: Acc): Score {
  const { PRIOR_MASTERY: p0, PRIOR_STRENGTH: alpha } = CONFIG;
  const mastery = (a.num + alpha * p0) / (a.den + alpha);
  return {
    mastery,
    status: classify(mastery),
    confidence: a.den / (a.den + alpha),
    answered: a.count,
    rawAccuracy: a.count ? a.correct / a.count : 0,
    lowData: a.count < CONFIG.MIN_ANSWERS_CONFIDENT,
  };
}

/** Ranking helper: weak AND well-evidenced floats to the top */
export const priority = (s: Score) => (1 - s.mastery) * s.confidence;

export function diagnoseSubtopic(stats: BandStats, cfg = DIAG_CONFIG): Diagnosis {
  const diffs: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
  const missingBands: Difficulty[] = [];
  const bands = {} as Record<Difficulty, { accuracy: number | null; total: number; passed: boolean | null }>;

  let totalAnswers = 0;
  for (const d of diffs) {
    const b = stats[d] ?? { correct: 0, total: 0 };
    totalAnswers += b.total;
    if (b.total === 0) {
      missingBands.push(d);
      bands[d] = { accuracy: null, total: 0, passed: null };
    } else {
      const accuracy = b.correct / b.total;
      const passed = accuracy >= cfg.BAND_PASS_AT;
      bands[d] = { accuracy, total: b.total, passed };
    }
  }

  // 1. total = EASY.total + MEDIUM.total + HARD.total. If total < MIN_TOTAL_ANSWERS -> INSUFFICIENT_DATA
  let diagnosis: DiagnosisType;
  if (totalAnswers < cfg.MIN_TOTAL_ANSWERS) {
    diagnosis = 'INSUFFICIENT_DATA';
  } else if (bands.EASY.passed === false) {
    // 3. If EASY is assessed and failed -> FOUNDATION_GAP
    diagnosis = 'FOUNDATION_GAP';
  } else if (bands.MEDIUM.passed === false) {
    // 4. Else if MEDIUM is assessed and failed -> APPLICATION_GAP
    diagnosis = 'APPLICATION_GAP';
  } else if (bands.HARD.passed === false) {
    // 5. Else if HARD is assessed and failed -> EDGE_CASE_ONLY
    diagnosis = 'EDGE_CASE_ONLY';
  } else {
    // 6. Else -> MASTERED
    diagnosis = 'MASTERED';
  }

  // 7. guessingSuspected = EASY failed && HARD passed
  const guessingSuspected = bands.EASY.passed === false && bands.HARD.passed === true;

  // 8. startDifficulty: FOUNDATION_GAP -> 'EASY', APPLICATION_GAP -> 'MEDIUM', EDGE_CASE_ONLY -> 'HARD', otherwise null
  let startDifficulty: Difficulty | null = null;
  if (diagnosis === 'FOUNDATION_GAP') {
    startDifficulty = 'EASY';
  } else if (diagnosis === 'APPLICATION_GAP') {
    startDifficulty = 'MEDIUM';
  } else if (diagnosis === 'EDGE_CASE_ONLY') {
    startDifficulty = 'HARD';
  }

  return {
    diagnosis,
    guessingSuspected,
    missingBands,
    bands,
    startDifficulty,
  };
}

// ───────────── Data loading ─────────────
function studentWhere(scope: Scope): Prisma.StudentWhereInput {
  if (scope.studentId) return { id: scope.studentId };
  if (scope.sectionId) return { sectionId: scope.sectionId };
  if (scope.year) return { section: { semester: { in: [scope.year * 2 - 1, scope.year * 2] } } };
  return {};
}

async function loadEvidence(scope: Scope): Promise<Evidence[]> {
  const submittedAt: Prisma.DateTimeFilter = {};
  if (scope.from) submittedAt.gte = scope.from;
  if (scope.to) submittedAt.lte = scope.to;

  const attemptWhere: Prisma.QuizAttemptWhereInput = {
    student: studentWhere(scope),
    ...(scope.facultyId ? { quiz: { is: { facultyId: scope.facultyId } } } : {}),
    ...(Object.keys(submittedAt).length ? { submittedAt } : {}),
  };
  const rows = await prisma.attemptAnswer.findMany({
    where: {
      attempt: attemptWhere,
      ...(scope.subjectId || scope.topicId
        ? {
            question: {
              topic: {
                ...(scope.subjectId ? { subjectId: scope.subjectId } : {}),
                ...(scope.topicId ? { id: scope.topicId } : {}),
              },
            },
          }
        : {}),
    },
    select: {
      questionId: true,
      isCorrect: true,
      attempt: {
        select: {
          studentId: true,
          submittedAt: true,
          student: {
            select: { sectionId: true, section: { select: { semester: true, name: true } } },
          },
        },
      },
      question: {
        select: {
          difficulty: true,
          subtopic: { select: { id: true, name: true } },
          topic: {
            select: { id: true, name: true, subjectId: true, subject: { select: { name: true } } },
          },
        },
      },
    },
  });

  return rows.map((r: any) => ({
    studentId: r.attempt.studentId,
    sectionId: r.attempt.student.sectionId,
    semester: r.attempt.student.section.semester,
    sectionName: r.attempt.student.section.name,
    questionId: r.questionId,
    difficulty: String(r.question.difficulty),
    isCorrect: !!r.isCorrect,
    answeredAt: r.attempt.submittedAt ?? new Date(),
    subjectId: r.question.topic.subjectId,
    subjectName: r.question.topic.subject.name,
    topicId: r.question.topic.id,
    topicName: r.question.topic.name,
    subtopicId: r.question.subtopic?.id ?? null,
    subtopicName: r.question.subtopic?.name ?? null,
  }));
}

/** Smoothed wrong-rate per (section, question), scoped to the faculty's quizzes when provided */
async function loadCohortRates(
  evs: Evidence[],
  facultyId?: string,
  dateFilter?: { from?: Date; to?: Date },
) {
  const tally = new Map<string, { n: number; wrong: number }>();
  const qIds = [...new Set(evs.map((e) => e.questionId))];
  const sIds = [...new Set(evs.map((e) => e.sectionId))];
  if (qIds.length) {
    const submittedAt: Prisma.DateTimeFilter = {};
    if (dateFilter?.from) submittedAt.gte = dateFilter.from;
    if (dateFilter?.to) submittedAt.lte = dateFilter.to;
    const attemptWhere: Prisma.QuizAttemptWhereInput = {
      student: { sectionId: { in: sIds } },
      ...(facultyId ? { quiz: { is: { facultyId } } } : {}),
      ...(Object.keys(submittedAt).length ? { submittedAt } : {}),
    };
    const rows = await prisma.attemptAnswer.findMany({
      where: { questionId: { in: qIds }, attempt: attemptWhere },
      select: {
        questionId: true,
        isCorrect: true,
        attempt: { select: { student: { select: { sectionId: true } } } },
      },
    });
    for (const r of rows as any[]) {
      const k = `${r.attempt.student.sectionId}:${r.questionId}`;
      const t = tally.get(k) ?? { n: 0, wrong: 0 };
      t.n++;
      if (!r.isCorrect) t.wrong++;
      tally.set(k, t);
    }
  }
  // Laplace smoothing: few attempts → rate ≈ 0.5 → neutral factor of 1.0
  return (sectionId: string, questionId: string) => {
    const t = tally.get(`${sectionId}:${questionId}`) ?? { n: 0, wrong: 0 };
    return (t.wrong + 1) / (t.n + 2);
  };
}

// ───────────── Aggregation ─────────────
function buildAccumulators(
  evs: Evidence[],
  rate: (sectionId: string, qId: string) => number,
  now: Date,
) {
  const meta = new Map<string, NodeMeta>();
  const perStudent = new Map<string, Map<string, Acc>>();
  const studentSection = new Map<string, { sectionId: string; label: string; semester: number }>();
  const subtopicBandStats = new Map<string, Map<string, BandStats>>();

  const reg = (key: string, level: Level, id: string, name: string, parentKey: string | null) => {
    if (!meta.has(key)) meta.set(key, { key, level, id, name, parentKey });
  };

  for (const e of evs) {
    const w = evidenceWeight(e.difficulty, e.isCorrect, rate(e.sectionId, e.questionId), e.answeredAt, now);
    studentSection.set(e.studentId, {
      sectionId: e.sectionId,
      label: `Sem ${e.semester} - ${e.sectionName}`,
      semester: e.semester,
    });

    const sKey = `SUBJECT:${e.subjectId}`;
    const tKey = `TOPIC:${e.topicId}`;
    reg('OVERALL', 'OVERALL', 'overall', 'Overall', null);
    reg(sKey, 'SUBJECT', e.subjectId, e.subjectName, 'OVERALL');
    reg(tKey, 'TOPIC', e.topicId, e.topicName, sKey);
    const keys = ['OVERALL', sKey, tKey];
    if (e.subtopicId) {
      const uKey = `SUBTOPIC:${e.subtopicId}`;
      reg(uKey, 'SUBTOPIC', e.subtopicId, e.subtopicName ?? 'Subtopic', tKey);
      keys.push(uKey);

      // Raw per-difficulty counts per student per subtopic
      const diffUpper = (e.difficulty || '').toUpperCase();
      if (diffUpper === 'EASY' || diffUpper === 'MEDIUM' || diffUpper === 'HARD') {
        let studentMap = subtopicBandStats.get(e.studentId);
        if (!studentMap) {
          studentMap = new Map<string, BandStats>();
          subtopicBandStats.set(e.studentId, studentMap);
        }
        let stats = studentMap.get(e.subtopicId);
        if (!stats) {
          stats = {
            EASY: { correct: 0, total: 0 },
            MEDIUM: { correct: 0, total: 0 },
            HARD: { correct: 0, total: 0 },
          };
          studentMap.set(e.subtopicId, stats);
        }
        stats[diffUpper as Difficulty].total++;
        if (e.isCorrect) {
          stats[diffUpper as Difficulty].correct++;
        }
      }
    }

    let m = perStudent.get(e.studentId);
    if (!m) perStudent.set(e.studentId, (m = new Map()));
    for (const k of keys) {
      const a = m.get(k) ?? { num: 0, den: 0, count: 0, correct: 0 };
      a.den += w;
      if (e.isCorrect) a.num += w;
      a.count++;
      if (e.isCorrect) a.correct++;
      m.set(k, a);
    }
  }
  return { meta, perStudent, studentSection, subtopicBandStats };
}

export type Tree<T> = T & { id: string; name: string; level: Level; children: Tree<T>[] };

function toTree<T>(payload: Map<string, T>, meta: Map<string, NodeMeta>, sortFn: (a: T, b: T) => number) {
  const nodes = new Map<string, Tree<T>>();
  for (const [key, p] of payload) {
    const m = meta.get(key)!;
    nodes.set(key, { ...p, id: m.id, name: m.name, level: m.level, children: [] });
  }
  let root: Tree<T> | null = null;
  for (const [key, node] of nodes) {
    const parent = meta.get(key)!.parentKey;
    if (parent && nodes.has(parent)) nodes.get(parent)!.children.push(node);
    else if (key === 'OVERALL') root = node;
  }
  const sortRec = (n: Tree<T>) => {
    n.children.sort(sortFn);
    n.children.forEach(sortRec);
  };
  if (root) sortRec(root);
  return root;
}

// ───────────── Public API ─────────────
export async function getStudentSkillReport(studentId: string, subjectId?: string, facultyId?: string) {
  const now = new Date();
  const scope: Scope = { studentId, subjectId, facultyId };
  const evs = await loadEvidence(scope);
  if (!evs.length) return { studentId, empty: true as const };

  const rate = await loadCohortRates(evs, facultyId, scope);
  const { meta, perStudent, subtopicBandStats } = buildAccumulators(evs, rate, now);
  const accs = perStudent.get(studentId)!;

  const scores = new Map<string, Score>();
  for (const [k, a] of accs) scores.set(k, scoreFromAcc(a));

  const tree = toTree(scores, meta, (a, b) => a.mastery - b.mastery); // weakest first

  const studentSubtopics = subtopicBandStats.get(studentId) ?? new Map<string, BandStats>();
  const subtopicDiagnoses: Record<string, Diagnosis> = {};
  for (const [subId, stats] of studentSubtopics) {
    subtopicDiagnoses[subId] = diagnoseSubtopic(stats);
  }

  const weakestSubtopics = [...scores.entries()]
    .filter(([k, s]) => meta.get(k)!.level === 'SUBTOPIC' && s.status !== 'MASTERED')
    .sort((a, b) => priority(b[1]) - priority(a[1]))
    .slice(0, 5)
    .map(([k, s]) => {
      const m = meta.get(k)!;
      const parentTopic = m.parentKey ? meta.get(m.parentKey) : null;
      const stats = studentSubtopics.get(m.id) ?? {
        EASY: { correct: 0, total: 0 },
        MEDIUM: { correct: 0, total: 0 },
        HARD: { correct: 0, total: 0 },
      };
      const diagnosis = subtopicDiagnoses[m.id] ?? diagnoseSubtopic(stats);
      return { subtopicId: m.id, subtopic: m.name, topic: parentTopic?.name ?? 'Topic', ...s, diagnosis };
    });

  const topicIds = [...scores.entries()]
    .filter(([k]) => meta.get(k)!.level === 'TOPIC')
    .map(([k]) => meta.get(k)!.id);

  const questionCounts = await prisma.question.groupBy({
    by: ['topicId'],
    where: { topicId: { in: topicIds } },
    _count: { id: true },
  });

  const qCountMap = new Map<string, number>();
  for (const qc of questionCounts) {
    qCountMap.set(qc.topicId, qc._count.id);
  }

  // Only prioritize topics that actually require intervention (NEEDS_ATTENTION or low MODERATE)
  const weakestTopics = [...scores.entries()]
    .filter(([k, s]) => {
      const isTopic = meta.get(k)!.level === 'TOPIC';
      const hasGap = s.status === 'NEEDS_ATTENTION' || (s.status === 'MODERATE' && s.mastery < 0.65);
      return isTopic && hasGap;
    })
    .sort((a, b) => priority(b[1]) - priority(a[1]))
    .slice(0, 5)
    .map(([k, s]) => {
      const topicId = meta.get(k)!.id;
      const count = qCountMap.get(topicId) || s.answered || 4;
      return {
        topicId,
        topic: meta.get(k)!.name,
        availableQuestions: count,
        targetMastery: Math.round(CONFIG.MASTERED_AT * 100),
        ...s,
      };
    });

  return { studentId, empty: false as const, tree, weakestSubtopics, weakestTopics, subtopicDiagnoses };
}

export interface CohortStat {
  mastery: number;
  status: Status;
  pctNeedsAttention: number;
  studentsAssessed: number;
  lowDataStudents: number;
}

async function cohortReport(scope: Scope) {
  const now = new Date();
  const evs = await loadEvidence(scope);
  if (!evs.length) return null;

  const rate = await loadCohortRates(evs, scope.facultyId, scope);
  const { meta, perStudent, studentSection } = buildAccumulators(evs, rate, now);

  // per node: collect each student's score
  const byNode = new Map<string, Score[]>();
  for (const accs of perStudent.values()) {
    for (const [k, a] of accs) {
      const arr = byNode.get(k) ?? [];
      arr.push(scoreFromAcc(a));
      byNode.set(k, arr);
    }
  }

  const stats = new Map<string, CohortStat>();
  for (const [k, arr] of byNode) {
    const mastery = arr.reduce((s, x) => s + x.mastery, 0) / arr.length;
    stats.set(k, {
      mastery,
      status: classify(mastery),
      pctNeedsAttention: Math.round((arr.filter((x) => x.status === 'NEEDS_ATTENTION').length / arr.length) * 100),
      studentsAssessed: arr.length,
      lowDataStudents: arr.filter((x) => x.lowData).length,
    });
  }

  const tree = toTree(stats, meta, (a, b) => a.mastery - b.mastery);

  // Which topics/subtopics should be re-taught: lots of students struggling
  const reteach = [...stats.entries()]
    .filter(([k, s]) => ['TOPIC', 'SUBTOPIC'].includes(meta.get(k)!.level) && s.pctNeedsAttention >= 40 && s.studentsAssessed >= 3)
    .sort((a, b) => b[1].pctNeedsAttention - a[1].pctNeedsAttention)
    .slice(0, 10)
    .map(([k, s]) => ({ level: meta.get(k)!.level, id: meta.get(k)!.id, name: meta.get(k)!.name, ...s }));

  // Students at risk (overall)
  const atRisk = [...perStudent.entries()]
    .map(([studentId, accs]) => ({ studentId, ...scoreFromAcc(accs.get('OVERALL')!) }))
    .filter((s) => s.status === 'NEEDS_ATTENTION')
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 20);

  return { tree, reteach, atRisk, perStudent, studentSection, stats, meta };
}

export async function getSectionSkillReport(sectionId: string, subjectId?: string, facultyId?: string) {
  const r = await cohortReport({ sectionId, subjectId, facultyId });
  if (!r) return { sectionId, empty: true as const };
  const { tree, reteach, atRisk } = r;
  return { sectionId, empty: false as const, tree, reteach, atRisk };
}

/** A score counts as weak using the same cut-offs the student report uses for remediation. */
export const isWeakScore = (s: Score): boolean =>
  s.status === 'NEEDS_ATTENTION' || (s.status === 'MODERATE' && s.mastery < 0.65);

export interface FacultyTopicScore extends Score {
  topicId: string;
  topicName: string;
  moduleNo: number | null;
  weak: boolean;
}

export interface FacultyStudentSkillRow {
  studentId: string;
  sectionId: string;
  sectionLabel: string;
  overall: Score;
  topics: FacultyTopicScore[];
}

export interface FacultySectionDetail {
  sectionId: string;
  subjectId?: string;
  empty: boolean;
  tree: Tree<CohortStat> | null;
  reteach: Array<{ level: Level; id: string; name: string } & CohortStat>;
  atRisk: Array<{ studentId: string } & Score>;
  topics: Array<CohortStat & { id: string; name: string; level: Level; moduleNo: number | null; pctWeak: number }>;
  students: FacultyStudentSkillRow[];
}

/**
 * Thin read-only projection over the existing cohort calculation. It exposes the
 * already-computed per-student/topic scores so faculty views never recalculate
 * skill gaps with a second implementation.
 */
export async function getDetailedSectionSkillReport(scope: Scope): Promise<FacultySectionDetail> {
  const empty: FacultySectionDetail = {
    sectionId: scope.sectionId || '',
    subjectId: scope.subjectId,
    empty: true,
    tree: null,
    reteach: [],
    atRisk: [],
    topics: [],
    students: [],
  };
  const r = await cohortReport(scope);
  if (!r) return empty;

  const { stats, meta, perStudent, studentSection } = r;
  const topicMeta = new Map<string, { id: string; name: string; moduleNo: number | null }>();
  const topicIds = [...meta.entries()]
    .filter(([, m]) => m.level === 'TOPIC')
    .map(([, m]) => m.id);

  if (topicIds.length) {
    const rows = await prisma.topic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true, name: true, moduleNo: true },
    });
    for (const row of rows) topicMeta.set(row.id, row);
  }

  const topicScoreByKey = new Map<string, Score>();
  const topicScoresByStudent = new Map<string, FacultyTopicScore[]>();
  for (const [studentId, accs] of perStudent) {
    const topicScores: FacultyTopicScore[] = [];
    for (const [key, acc] of accs) {
      const m = meta.get(key);
      if (!m || m.level !== 'TOPIC') continue;
      const score = scoreFromAcc(acc);
      topicScoreByKey.set(`${studentId}|${key}`, score);
      topicScores.push({
        ...score,
        topicId: m.id,
        topicName: topicMeta.get(m.id)?.name || m.name,
        moduleNo: topicMeta.get(m.id)?.moduleNo ?? null,
        weak: isWeakScore(score),
      });
    }
    topicScoresByStudent.set(studentId, topicScores);
  }

  const topics = [...stats.entries()]
    .filter(([key]) => meta.get(key)?.level === 'TOPIC')
    .map(([key, stat]) => {
      const m = meta.get(key)!;
      const perTopic = [...perStudent.keys()]
        .map((studentId) => topicScoreByKey.get(`${studentId}|${key}`))
        .filter((s): s is Score => !!s);
      const pctWeak = perTopic.length
        ? Math.round((perTopic.filter(isWeakScore).length / perTopic.length) * 100)
        : 0;
      return {
        ...stat,
        id: m.id,
        name: topicMeta.get(m.id)?.name || m.name,
        level: m.level,
        moduleNo: topicMeta.get(m.id)?.moduleNo ?? null,
        pctWeak,
      };
    })
    .sort((a, b) => a.mastery - b.mastery);

  const students: FacultyStudentSkillRow[] = [...perStudent.entries()]
    .map(([studentId, accs]) => {
      const overallAcc = accs.get('OVERALL');
      const sec = studentSection.get(studentId);
      return {
        studentId,
        sectionId: sec?.sectionId || scope.sectionId || '',
        sectionLabel: sec?.label || '',
        overall: scoreFromAcc(overallAcc ?? { num: 0, den: 0, count: 0, correct: 0 }),
        topics: (topicScoresByStudent.get(studentId) ?? []).sort((a, b) => a.mastery - b.mastery),
      };
    })
    .sort((a, b) => a.overall.mastery - b.overall.mastery);

  return {
    sectionId: scope.sectionId || '',
    subjectId: scope.subjectId,
    empty: false,
    tree: r.tree,
    reteach: r.reteach,
    atRisk: r.atRisk,
    topics,
    students,
  };
}

export async function getYearSkillReport(year: number, subjectId?: string, facultyId?: string) {
  const r = await cohortReport({ year, subjectId, facultyId });
  if (!r) return { year, empty: true as const };
  const { tree, reteach, atRisk, perStudent, studentSection } = r;

  // Per-section comparison on overall mastery
  const bySection = new Map<string, { label: string; vals: number[] }>();
  for (const [sid, accs] of perStudent) {
    const sec = studentSection.get(sid)!;
    const b = bySection.get(sec.sectionId) ?? { label: sec.label, vals: [] };
    b.vals.push(scoreFromAcc(accs.get('OVERALL')!).mastery);
    bySection.set(sec.sectionId, b);
  }
  const sections = [...bySection.entries()].map(([id, b]) => ({
    sectionId: id,
    label: b.label,
    avgMastery: b.vals.reduce((a, c) => a + c, 0) / b.vals.length,
    students: b.vals.length,
  }));

  return { year, empty: false as const, tree, reteach, atRisk, sections };
}
