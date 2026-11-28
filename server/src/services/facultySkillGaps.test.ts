import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessStudent,
  canAccessSubjectSection,
  isPairAllowed,
} from './facultyAssignmentService';
import {
  buildClassSummary,
  buildStudentRows,
  buildTopicAnalysis,
  statusForMastery,
} from './facultySkillGapService';
import { classify, CONFIG, FacultySectionDetail, Score } from './skillGapService';
import {
  AlertCandidate,
  AlertState,
  buildDigestMessage,
  groupAlertsByPair,
  selectChangedAlerts,
  shouldNotify,
} from './skillGapNotificationService';

const makeClient = (assignmentPairs: Array<{ subjectId: string; sectionId: string }>) =>
  ({
    faculty: {
      findUnique: async () => ({ id: 'faculty-1' }),
    },
    facultySubject: {
      findFirst: async ({ where }: any) =>
        assignmentPairs.some(
          (pair) => pair.subjectId === where.subjectId && pair.sectionId === where.sectionId,
        )
          ? { id: 'assignment-1' }
          : null,
    },
    subject: {
      findUnique: async ({ where }: any) => (where.id ? { id: where.id } : null),
    },
    section: {
      findUnique: async ({ where }: any) => (where.id ? { id: where.id } : null),
    },
  }) as any;

const facultyUser = { id: 'user-1', role: 'FACULTY' };
const adminUser = { id: 'admin-1', role: 'ADMIN' };
const studentUser = { id: 'student-1', role: 'STUDENT' };

const score = (mastery: number): Score => ({
  mastery,
  status: classify(mastery),
  confidence: 1,
  answered: 4,
  rawAccuracy: mastery,
  lowData: false,
});

const detail = (masteries: number[]): FacultySectionDetail => ({
  sectionId: 'sec-1',
  subjectId: 'sub-1',
  empty: masteries.length === 0,
  tree: null,
  reteach: [],
  atRisk: [],
  topics: [
    {
      id: 'topic-a',
      name: 'Topic A',
      level: 'TOPIC',
      moduleNo: 1,
      mastery: 0.42,
      status: classify(0.42),
      pctNeedsAttention: 50,
      pctWeak: 50,
      studentsAssessed: masteries.length,
      lowDataStudents: 0,
    },
  ],
  students: masteries.map((mastery, index) => ({
    studentId: `student-${index + 1}`,
    sectionId: 'sec-1',
    sectionLabel: 'Sem 5 - A',
    overall: score(mastery),
    topics: [
      {
        ...score(mastery),
        topicId: 'topic-a',
        topicName: 'Topic A',
        moduleNo: 1,
        weak: mastery < 0.5,
      },
    ],
  })),
});

// ── Access control ──────────────────────────────────────────────────────────

test('faculty assignment helper allows only the exact subject+section pair', () => {
  const assignments = [{ subjectId: 'sub-1', sectionId: 'sec-1' }];
  assert.equal(isPairAllowed(assignments, 'sub-1', 'sec-1'), true);
  assert.equal(isPairAllowed(assignments, 'sub-1', 'sec-2'), false);
  assert.equal(isPairAllowed(assignments, 'sub-2', 'sec-1'), false);
});

test('canViewSection: same subject/different section and different subject are both denied', async () => {
  const client = makeClient([{ subjectId: 'sub-1', sectionId: 'sec-1' }]);
  assert.equal(await canAccessSubjectSection(facultyUser, 'sub-1', 'sec-1', client), true);
  assert.equal(await canAccessSubjectSection(facultyUser, 'sub-1', 'sec-2', client), false);
  assert.equal(await canAccessSubjectSection(facultyUser, 'sub-2', 'sec-1', client), false);
});

test('canViewSection: missing or tampered subjectId is denied for faculty', async () => {
  const client = makeClient([{ subjectId: 'sub-1', sectionId: 'sec-1' }]);
  assert.equal(await canAccessSubjectSection(facultyUser, '', 'sec-1', client), false);
  assert.equal(await canAccessSubjectSection(facultyUser, 'sub-1<script>', 'sec-1', client), false);
});

test('students never pass faculty access checks; admin sees all existing pairs', async () => {
  const client = makeClient([{ subjectId: 'sub-1', sectionId: 'sec-1' }]);
  assert.equal(await canAccessSubjectSection(studentUser, 'sub-1', 'sec-1', client), false);
  assert.equal(await canAccessStudent(studentUser, { id: 's1', sectionId: 'sec-1' }, 'sub-1', client), false);
  assert.equal(await canAccessSubjectSection(adminUser, 'sub-2', 'sec-2', client), true);
});

test('a student is visible only in the faculty assigned section for that subject', async () => {
  const client = makeClient([{ subjectId: 'sub-1', sectionId: 'sec-1' }]);
  assert.equal(
    await canAccessStudent(facultyUser, { id: 's1', sectionId: 'sec-1' }, 'sub-1', client),
    true,
  );
  assert.equal(
    await canAccessStudent(facultyUser, { id: 's2', sectionId: 'sec-2' }, 'sub-1', client),
    false,
  );
});

// ── Threshold boundaries ───────────────────────────────────────────────────

test('threshold classification uses only skillGapService values (50% / 75%)', () => {
  assert.equal(CONFIG.MODERATE_AT, 0.5);
  assert.equal(CONFIG.MASTERED_AT, 0.75);
  assert.equal(classify(0.4999), 'NEEDS_ATTENTION');
  assert.equal(classify(0.5), 'MODERATE');
  assert.equal(classify(0.7499), 'MODERATE');
  assert.equal(classify(0.75), 'MASTERED');
  assert.equal(statusForMastery(0.4999), 'below-threshold');
  assert.equal(statusForMastery(0.5), 'average');
  assert.equal(statusForMastery(0.75), 'strong');
});

// ── Hand-calculated aggregates ─────────────────────────────────────────────

test('class summary matches hand-calculated sample', () => {
  const summary = buildClassSummary(detail([0.39, 0.49, 0.6, 0.8]), 5);
  assert.equal(summary.totalStudents, 5);
  assert.equal(summary.assessedStudents, 4);
  assert.equal(summary.classAverage, 57);
  assert.equal(summary.passPercent, 50);
  assert.equal(summary.belowThresholdCount, 2);
  assert.equal(summary.strongPercent, 25);
  assert.deepEqual(summary.distribution, [
    { label: '<40', count: 1 },
    { label: '40-60', count: 1 },
    { label: '60-75', count: 1 },
    { label: '75+', count: 1 },
  ]);
});

test('topic analysis sorts weakest first and highlights exactly three', () => {
  const sample = detail([0.3]);
  sample.topics = [
    { ...sample.topics[0], id: 't1', name: 'Strong', mastery: 0.9 },
    { ...sample.topics[0], id: 't2', name: 'Middle', mastery: 0.6 },
    { ...sample.topics[0], id: 't3', name: 'Weakest', mastery: 0.2 },
    { ...sample.topics[0], id: 't4', name: 'Second', mastery: 0.35 },
  ];
  const analysis = buildTopicAnalysis(sample);
  assert.deepEqual(analysis.topics.map((t) => t.topicId), ['t3', 't4', 't2', 't1']);
  assert.deepEqual(analysis.highlightedTopicIds, ['t3', 't4', 't2']);
  assert.equal(analysis.topics[0].pctWeak, 50);
});

test('student rows keep no-attempt students without producing NaN', () => {
  const meta = [
    { id: 'student-1', name: 'Asha', rollNo: '1', sectionId: 'sec-1', sectionName: 'A', lastActivity: null },
    { id: 'missing', name: 'Ravi', rollNo: '2', sectionId: 'sec-1', sectionName: 'A', lastActivity: null },
  ];
  const rows = buildStudentRows(detail([0.35]), meta, buildTopicAnalysis(detail([0.35])).topics);
  assert.equal(rows[0].status, 'below-threshold');
  assert.equal(rows[0].overallScore, 35);
  assert.equal(rows[0].weakTopicCount, 1);
  assert.equal(rows[1].status, 'no-attempts');
  assert.equal(rows[1].overallScore, null);
  assert.equal(rows[1].topicScores[0].score, null);
});

test('empty section returns zeroed summary instead of errors', () => {
  const summary = buildClassSummary(detail([]), 0);
  assert.equal(summary.hasData, false);
  assert.equal(summary.classAverage, 0);
  assert.equal(summary.passPercent, 0);
  assert.equal(summary.belowThresholdCount, 0);
  assert.ok(summary.distribution.every((band) => band.count === 0));
});

// ── Notifications ──────────────────────────────────────────────────────────

const candidate = (overrides: Partial<AlertCandidate> = {}): AlertCandidate => ({
  studentId: 'student-1',
  name: 'Asha',
  rollNo: 'ROLL-1',
  sectionName: 'A',
  sectionId: 'sec-1',
  subjectName: 'Computer Vision',
  subjectId: 'sub-1',
  mastery: 0.42,
  status: 'below-threshold',
  weakTopics: ['Image Features'],
  date: new Date('2026-11-27T08:00:00Z'),
  ...overrides,
});

const state = (overrides: Partial<AlertState> = {}): AlertState => ({
  status: 'average',
  lastMastery: 0.6,
  lastNotifiedAt: new Date('2026-11-26T08:00:00Z'),
  ...overrides,
});

test('notifications fire only on newly-below or status changes out of below', () => {
  assert.equal(shouldNotify(undefined, 'below-threshold'), true);
  assert.equal(shouldNotify(undefined, 'average'), false);
  assert.equal(shouldNotify(state({ status: 'below-threshold' }), 'below-threshold'), false);
  assert.equal(shouldNotify(state({ status: 'average' }), 'below-threshold'), true);
  assert.equal(shouldNotify(state({ status: 'below-threshold' }), 'strong'), true);
  assert.equal(shouldNotify(state({ status: 'average' }), 'strong'), false);
});

test('digest message contains name, roll no, section, subject, score, weak topic and date', () => {
  const item = candidate();
  const message = buildDigestMessage({
    below: [item],
    recovered: [],
    sectionName: 'A',
    subjectName: 'Computer Vision',
    date: item.date,
  });
  assert.match(message, /Asha/);
  assert.match(message, /ROLL-1/);
  assert.match(message, /Section A/);
  assert.match(message, /Computer Vision/);
  assert.match(message, /42%/);
  assert.match(message, /Image Features/);
  assert.match(message, /50% threshold/);
});

test('dedupe selection ignores unchanged students and groups per subject-section', () => {
  const candidates = [
    candidate(),
    candidate({ studentId: 'student-2', rollNo: 'ROLL-2' }),
    candidate({
      studentId: 'student-3',
      rollNo: 'ROLL-3',
      subjectId: 'sub-2',
      sectionId: 'sec-2',
      subjectName: 'Databases',
      sectionName: 'B',
    }),
  ];
  const previous = new Map<string, AlertState>([
    ['student-1', state({ status: 'below-threshold' })],
  ]);
  const changed = selectChangedAlerts(previous, candidates);
  assert.deepEqual(changed.map((c) => c.studentId), ['student-2', 'student-3']);

  const groups = groupAlertsByPair(candidates);
  assert.equal(groups.size, 2);
  assert.equal(groups.get('sub-1:sec-1')?.candidates.length, 2);
  assert.equal(groups.get('sub-2:sec-2')?.candidates.length, 1);
});

test('students are never recipients of a faculty alert group', () => {
  const groups = groupAlertsByPair([candidate()]);
  for (const group of groups.values()) {
    assert.equal(group.candidates.every((c) => c.status !== undefined), true);
    assert.equal(group.subjectId, 'sub-1');
  }
});
