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

export type Status = 'MASTERED' | 'MODERATE' | 'NEEDS_ATTENTION';
export type Level = 'OVERALL' | 'SUBJECT' | 'TOPIC' | 'SUBTOPIC';

export interface Scope {
  studentId?: string;
  sectionId?: string;
  year?: number; // 1..4  → semesters (2y-1, 2y)
  subjectId?: string;
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

// ───────────── Data loading ─────────────
function studentWhere(scope: Scope): Prisma.StudentWhereInput {
  if (scope.studentId) return { id: scope.studentId };
  if (scope.sectionId) return { sectionId: scope.sectionId };
  if (scope.year) return { section: { semester: { in: [scope.year * 2 - 1, scope.year * 2] } } };
  return {};
}

async function loadEvidence(scope: Scope): Promise<Evidence[]> {
  const rows = await prisma.attemptAnswer.findMany({
    where: {
      attempt: { student: studentWhere(scope) },
      ...(scope.subjectId ? { question: { topic: { subjectId: scope.subjectId } } } : {}),
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
    subtopicId: null,
    subtopicName: null,
  }));
}

/** Smoothed wrong-rate per (section, question), computed over the WHOLE section, not just the scope */
async function loadCohortRates(evs: Evidence[]) {
  const tally = new Map<string, { n: number; wrong: number }>();
  const qIds = [...new Set(evs.map((e) => e.questionId))];
  const sIds = [...new Set(evs.map((e) => e.sectionId))];
  if (qIds.length) {
    const rows = await prisma.attemptAnswer.findMany({
      where: { questionId: { in: qIds }, attempt: { student: { sectionId: { in: sIds } } } },
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
  return { meta, perStudent, studentSection };
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
export async function getStudentSkillReport(studentId: string, subjectId?: string) {
  const now = new Date();
  const evs = await loadEvidence({ studentId, subjectId });
  if (!evs.length) return { studentId, empty: true as const };

  const rate = await loadCohortRates(evs);
  const { meta, perStudent } = buildAccumulators(evs, rate, now);
  const accs = perStudent.get(studentId)!;

  const scores = new Map<string, Score>();
  for (const [k, a] of accs) scores.set(k, scoreFromAcc(a));

  const tree = toTree(scores, meta, (a, b) => a.mastery - b.mastery); // weakest first

  const weakestSubtopics = [...scores.entries()]
    .filter(([k, s]) => meta.get(k)!.level === 'SUBTOPIC' && s.status !== 'MASTERED')
    .sort((a, b) => priority(b[1]) - priority(a[1]))
    .slice(0, 5)
    .map(([k, s]) => {
      const m = meta.get(k)!;
      const parentTopic = meta.get(m.parentKey!)!;
      return { subtopicId: m.id, subtopic: m.name, topic: parentTopic.name, ...s };
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

  return { studentId, empty: false as const, tree, weakestSubtopics, weakestTopics };
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

  const rate = await loadCohortRates(evs);
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

  return { tree, reteach, atRisk, perStudent, studentSection };
}

export async function getSectionSkillReport(sectionId: string, subjectId?: string) {
  const r = await cohortReport({ sectionId, subjectId });
  if (!r) return { sectionId, empty: true as const };
  const { tree, reteach, atRisk } = r;
  return { sectionId, empty: false as const, tree, reteach, atRisk };
}

export async function getYearSkillReport(year: number, subjectId?: string) {
  const r = await cohortReport({ year, subjectId });
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
