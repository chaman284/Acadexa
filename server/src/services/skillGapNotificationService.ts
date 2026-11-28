import { randomUUID } from 'crypto';
import { prisma } from '../prisma';
import { createNotification } from './notificationService';
import {
  CONFIG,
  getStudentSkillReport,
} from './skillGapService';
import {
  getFacultyClassData,
  statusForMastery,
  StudentStatus,
} from './facultySkillGapService';

type DbClient = typeof prisma;

export type AlertStatus = Exclude<StudentStatus, 'no-attempts'>;

export interface AlertState {
  status: AlertStatus;
  lastMastery: number;
  lastNotifiedAt: Date | null;
}

export interface AlertCandidate {
  studentId: string;
  name: string;
  rollNo: string;
  sectionName: string;
  sectionId: string;
  subjectName: string;
  subjectId: string;
  mastery: number;
  status: AlertStatus;
  weakTopics: string[];
  date: Date;
}

export interface AlertPair {
  subjectId: string;
  sectionId: string;
  subjectName: string;
  sectionName: string;
}

const THRESHOLD_PCT = Math.round(CONFIG.MODERATE_AT * 100);
const STRONG_PCT = Math.round(CONFIG.MASTERED_AT * 100);

/**
 * Notify only when a student newly enters the below-threshold band or leaves it.
 * Transitions between average and strong do not generate performance alerts.
 */
export function shouldNotify(previous: AlertState | undefined, current: AlertStatus): boolean {
  if (!previous) return current === 'below-threshold';
  if (previous.status === current) return false;
  return previous.status === 'below-threshold' || current === 'below-threshold';
}

export function toAlertStatus(mastery: number): AlertStatus {
  const status = statusForMastery(mastery);
  return status === 'no-attempts' ? 'average' : status;
}

/** Candidates whose status changed in a way that warrants a fresh notification. */
export function selectChangedAlerts(
  previous: Map<string, AlertState>,
  candidates: AlertCandidate[],
): AlertCandidate[] {
  return candidates.filter((candidate) => shouldNotify(previous.get(candidate.studentId), candidate.status));
}

/** One digest group per subject+section, even when one faculty has several sections. */
export function groupAlertsByPair(
  candidates: AlertCandidate[],
): Map<string, AlertPair & { candidates: AlertCandidate[] }> {
  const groups = new Map<string, AlertPair & { candidates: AlertCandidate[] }>();
  for (const candidate of candidates) {
    const key = `${candidate.subjectId}:${candidate.sectionId}`;
    const group = groups.get(key) ?? {
      subjectId: candidate.subjectId,
      sectionId: candidate.sectionId,
      subjectName: candidate.subjectName,
      sectionName: candidate.sectionName,
      candidates: [],
    };
    group.candidates.push(candidate);
    groups.set(key, group);
  }
  return groups;
}

const formatStudent = (candidate: AlertCandidate): string => {
  const weak = candidate.weakTopics.slice(0, 3).join(', ') || 'none recorded';
  return `${candidate.name} (${candidate.rollNo}) — ${Math.round(candidate.mastery * 100)}%, weak: ${weak}`;
};

/** Pure message builder; used by tests to verify every required field is present. */
export function buildDigestMessage(input: {
  below: AlertCandidate[];
  recovered: AlertCandidate[];
  sectionName: string;
  subjectName: string;
  date: Date;
}): string {
  const dateLabel = input.date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const parts = [
    `${input.below.length} student${input.below.length === 1 ? '' : 's'} in Section ${input.sectionName}, ${input.subjectName} ${input.below.length === 1 ? 'is' : 'are'} below the ${THRESHOLD_PCT}% threshold (${dateLabel}):`,
    ...input.below.map((c, i) => `${i + 1}. ${formatStudent(c)}`),
  ];
  if (input.recovered.length) {
    parts.push(
      `Improved above ${THRESHOLD_PCT}%: ${input.recovered.map(formatStudent).join('; ')}.`,
    );
  }
  parts.push(`Strong mastery starts at ${STRONG_PCT}%. Section: ${input.sectionName}. Subject: ${input.subjectName}.`);
  return parts.join('\n');
}

async function readStates(
  client: DbClient,
  facultyId: string,
  subjectId: string,
  sectionId: string,
): Promise<Map<string, AlertState>> {
  const rows = await client.$queryRaw<Array<{
    studentId: string;
    status: string;
    lastMastery: number;
    lastNotifiedAt: Date | null;
  }>>`
    SELECT "studentId", "status", "lastMastery", "lastNotifiedAt"
    FROM "SkillGapAlertState"
    WHERE "facultyId" = ${facultyId} AND "subjectId" = ${subjectId} AND "sectionId" = ${sectionId}
  `;
  const map = new Map<string, AlertState>();
  for (const row of rows) {
    map.set(row.studentId, {
      status: row.status === 'strong' || row.status === 'below-threshold' ? row.status : 'average',
      lastMastery: Number(row.lastMastery) || 0,
      lastNotifiedAt: row.lastNotifiedAt ? new Date(row.lastNotifiedAt) : null,
    });
  }
  return map;
}

async function upsertState(
  client: DbClient,
  data: {
    facultyId: string;
    studentId: string;
    subjectId: string;
    sectionId: string;
    status: AlertStatus;
    mastery: number;
    notifiedAt: Date | null;
  },
): Promise<void> {
  const now = new Date();
  await client.$executeRaw`
    INSERT INTO "SkillGapAlertState"
      ("id", "facultyId", "studentId", "subjectId", "sectionId", "status", "lastMastery", "lastNotifiedAt", "createdAt", "updatedAt")
    VALUES
      (${randomUUID()}, ${data.facultyId}, ${data.studentId}, ${data.subjectId}, ${data.sectionId},
       ${data.status}, ${data.mastery}, ${data.notifiedAt}, ${now}, ${now})
    ON CONFLICT ("facultyId", "studentId", "subjectId", "sectionId")
    DO UPDATE SET
      "status" = EXCLUDED."status",
      "lastMastery" = EXCLUDED."lastMastery",
      "lastNotifiedAt" = EXCLUDED."lastNotifiedAt",
      "updatedAt" = EXCLUDED."updatedAt"
  `;
}

async function loadPairCandidates(pair: AlertPair): Promise<AlertCandidate[]> {
  const data = await getFacultyClassData(pair.sectionId, pair.subjectId, {});
  const date = new Date();
  return data.students
    .filter((student) => student.status !== 'no-attempts')
    .map((student) => ({
      studentId: student.studentId,
      name: student.name,
      rollNo: student.rollNo,
      sectionName: student.sectionName || pair.sectionName,
      sectionId: pair.sectionId,
      subjectName: pair.subjectName,
      subjectId: pair.subjectId,
      mastery: (student.overallScore ?? 0) / 100,
      status: student.status as AlertStatus,
      weakTopics: student.topicScores.filter((t) => t.weak).map((t) => t.topicName),
      date,
    }));
}

async function loadSingleCandidate(
  studentId: string,
  pair: AlertPair,
): Promise<AlertCandidate | null> {
  const [student, report] = await Promise.all([
    prisma.student.findFirst({
      where: { id: studentId, sectionId: pair.sectionId },
      select: {
        id: true,
        rollNo: true,
        user: { select: { name: true } },
        section: { select: { name: true } },
      },
    }),
    getStudentSkillReport(studentId, pair.subjectId),
  ]);
  if (!student || !report || report.empty || !report.tree) return null;

  const mastery = report.tree.mastery;
  return {
    studentId,
    name: student.user?.name || student.rollNo,
    rollNo: student.rollNo,
    sectionName: student.section?.name || pair.sectionName,
    sectionId: pair.sectionId,
    subjectName: pair.subjectName,
    subjectId: pair.subjectId,
    mastery,
    status: toAlertStatus(mastery),
    weakTopics: report.weakestTopics.map((w) => w.topic),
    date: new Date(),
  };
}

async function notifyFacultyForPair(
  pair: AlertPair,
  candidates: AlertCandidate[],
  client: DbClient = prisma,
): Promise<number> {
  const assignments = await client.facultySubject.findMany({
    where: { subjectId: pair.subjectId, sectionId: pair.sectionId },
    select: { faculty: { select: { id: true, userId: true } } },
  });
  const facultyUsers = assignments
    .map((a: any) => a.faculty)
    .filter((f: any) => !!f?.userId && !!f?.id);

  let sent = 0;
  for (const faculty of facultyUsers) {
    const previous = await readStates(client, faculty.id, pair.subjectId, pair.sectionId);
    const changed = selectChangedAlerts(previous, candidates);
    const notifiedAt = changed.length ? new Date() : null;

    for (const candidate of candidates) {
      const prior = previous.get(candidate.studentId);
      await upsertState(client, {
        facultyId: faculty.id,
        studentId: candidate.studentId,
        subjectId: pair.subjectId,
        sectionId: pair.sectionId,
        status: candidate.status,
        mastery: candidate.mastery,
        notifiedAt: shouldNotify(prior, candidate.status) ? notifiedAt : (prior?.lastNotifiedAt ?? null),
      });
    }

    if (!changed.length) continue;

    const below = candidates.filter((c) => c.status === 'below-threshold');
    const recovered = changed.filter((c) => c.status !== 'below-threshold');
    await createNotification(
      {
        userId: faculty.userId,
        title: `Below-threshold students — Section ${pair.sectionName}, ${pair.subjectName}`,
        message: buildDigestMessage({
          below,
          recovered,
          sectionName: pair.sectionName,
          subjectName: pair.subjectName,
          date: notifiedAt!,
        }),
        type: 'learning_gap',
        role: 'FACULTY',
        actionUrl: `/faculty/skill-gaps?subjectId=${encodeURIComponent(pair.subjectId)}&sectionId=${encodeURIComponent(pair.sectionId)}&tab=alerts`,
      },
      client,
    );
    sent++;
  }
  return sent;
}

const logAlertFailure = (error: unknown): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    `Skill-gap notifications skipped (apply the SkillGapAlertState migration): ${message}`,
  );
};

/** Event trigger after a submitted result. Only the quiz's exact subject+section is visited. */
export async function notifySkillGapAlertsForResult(
  studentId: string,
  subjectId: string,
  sectionId: string,
  client: DbClient = prisma,
): Promise<number> {
  try {
    const pairRow = await client.facultySubject.findFirst({
      where: { subjectId, sectionId },
      select: { id: true },
    });
    if (!pairRow) return 0;

    const [subject, section, candidate] = await Promise.all([
      client.subject.findUnique({ where: { id: subjectId }, select: { name: true } }),
      client.section.findUnique({ where: { id: sectionId }, select: { name: true } }),
      loadSingleCandidate(studentId, { subjectId, sectionId, subjectName: '', sectionName: '' }),
    ]);
    if (!candidate || !subject || !section) return 0;

    const pair: AlertPair = {
      subjectId,
      sectionId,
      subjectName: subject.name,
      sectionName: section.name,
    };
    return await notifyFacultyForPair(pair, [{ ...candidate, subjectName: subject.name, sectionName: section.name }], client);
  } catch (error) {
    logAlertFailure(error);
    return 0;
  }
}

/** Daily digest: one notification per faculty per assigned subject+section. */
export async function runSkillGapDigest(client: DbClient = prisma): Promise<number> {
  try {
    const links = await client.facultySubject.findMany({
      select: { subjectId: true, sectionId: true },
    });
    const unique = new Map<string, AlertPair>();
    for (const link of links) {
      unique.set(`${link.subjectId}:${link.sectionId}`, {
        subjectId: link.subjectId,
        sectionId: link.sectionId,
        subjectName: '',
        sectionName: '',
      });
    }

    let sent = 0;
    for (const pair of unique.values()) {
      const [subject, section] = await Promise.all([
        client.subject.findUnique({ where: { id: pair.subjectId }, select: { name: true } }),
        client.section.findUnique({ where: { id: pair.sectionId }, select: { name: true } }),
      ]);
      if (!subject || !section) continue;
      const resolved = { ...pair, subjectName: subject.name, sectionName: section.name };
      const candidates = await loadPairCandidates(resolved);
      sent += await notifyFacultyForPair(resolved, candidates, client);
    }
    return sent;
  } catch (error) {
    logAlertFailure(error);
    return 0;
  }
}

export const skillGapNotificationService = {
  shouldNotify,
  toAlertStatus,
  buildDigestMessage,
  notifySkillGapAlertsForResult,
  runSkillGapDigest,
};
