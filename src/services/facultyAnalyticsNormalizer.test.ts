import {
  asArray,
  normalizeAssignmentsResponse,
  normalizeClassSummary,
  normalizeNotificationsResponse,
  normalizeStudentList,
  normalizeTopicAnalysis,
} from './facultyAnalyticsNormalizer.ts';

/**
 * Plain assertion runner so the frontend normaliser can be exercised with the
 * server's existing ts-node test setup; no React or axios is involved.
 */
let passed = 0;
const check = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(`FAIL: ${message}`);
  passed += 1;
  console.log(`✔ ${message}`);
};

const badLists: unknown[] = [0, null, undefined, []];

for (const bad of badLists) {
  const label = JSON.stringify(bad) ?? 'undefined';

  check(Array.isArray(asArray(bad)), `asArray(${label}) returns an array`);
  check(asArray(bad).length === 0, `asArray(${label}) returns an empty array`);

  const summary = normalizeClassSummary({
    distribution: bad,
    trend: bad,
    totalStudents: bad,
    assessedStudents: bad,
    belowThresholdCount: bad,
    hasData: bad,
  });
  check(Array.isArray(summary.distribution), `summary distribution survives ${label}`);
  check(Array.isArray(summary.trend), `summary trend survives ${label}`);
  check(summary.totalStudents === 0 && summary.belowThresholdCount === 0, `summary counts survive ${label}`);
  check(summary.hasData === false, `summary hasData survives ${label}`);

  const analysis = normalizeTopicAnalysis({ topics: bad, highlightedTopicIds: bad });
  check(Array.isArray(analysis.topics), `topic list survives ${label}`);
  check(Array.isArray(analysis.highlightedTopicIds), `highlighted ids survive ${label}`);

  const students = normalizeStudentList({
    students: [{ studentId: 's1', name: 'Asha', topicScores: bad }],
    topics: bad,
    total: bad,
  });
  check(students.students.length === 1, `students list survives ${label}`);
  check(Array.isArray(students.students[0].topicScores), `nested topicScores survives ${label}`);
  check(Array.isArray(students.topics), `student topics survive ${label}`);
  check(students.total === 0, `student total survives ${label}`);

  const assignments = normalizeAssignmentsResponse({ assignments: bad, thresholds: bad });
  check(Array.isArray(assignments.assignments), `assignments survive ${label}`);
  check(assignments.thresholds.below === 50 && assignments.thresholds.strong === 75, `thresholds survive ${label}`);

  const notifications = normalizeNotificationsResponse({ notifications: bad, unreadCount: bad });
  check(Array.isArray(notifications.notifications), `notifications survive ${label}`);
  check(notifications.unreadCount === 0, `unread count survives ${label}`);
}

// Empty section / no attempts: still a fully iterable shape.
const empty = normalizeClassSummary(null);
check(Array.isArray(empty.distribution) && empty.distribution.length === 0, 'null summary gives empty distribution');
check(Array.isArray(empty.trend) && empty.trend.length === 0, 'null summary gives empty trend');
check(normalizeTopicAnalysis(undefined).topics.length === 0, 'undefined analysis gives empty topics');
check(normalizeStudentList(0).students.length === 0, 'numeric student payload gives empty students');
check(normalizeAssignmentsResponse(null).assignments.length === 0, 'null assignments gives empty list');
check(normalizeNotificationsResponse(null).notifications.length === 0, 'null notifications gives empty list');

// Single student with real data must be preserved unchanged.
const one = normalizeStudentList({
  students: [{
    studentId: 's1',
    name: 'Asha',
    rollNo: '5A-01',
    sectionName: '5A',
    overallScore: 42,
    weakTopicCount: 1,
    status: 'below-threshold',
    lastActivity: '2026-11-27T08:00:00.000Z',
    topicScores: [{ topicId: 't1', topicName: 'Digital Image Processing', score: 42, weak: true }],
  }],
  total: 1,
  topics: [{ topicId: 't1', topicName: 'Digital Image Processing', moduleNo: 1 }],
});
check(one.students.length === 1 && one.students[0].topicScores.length === 1, 'single student payload is preserved');
check(one.students[0].status === 'below-threshold', 'single student status is preserved');

console.log(`\n${passed} normaliser checks passed.`);
