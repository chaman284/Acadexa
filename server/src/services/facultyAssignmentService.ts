import { prisma } from '../prisma';

type DbClient = typeof prisma;

export interface AuthUserLike {
  id: string;
  role: string;
}

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

export const isAdmin = (user?: AuthUserLike | null): boolean =>
  String(user?.role || '').toUpperCase() === 'ADMIN';

export const isFaculty = (user?: AuthUserLike | null): boolean =>
  String(user?.role || '').toUpperCase() === 'FACULTY';

export const getFacultyId = async (
  user: AuthUserLike,
  client: DbClient = prisma,
): Promise<string | null> => {
  if (!isFaculty(user)) return null;
  const faculty = await client.faculty.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  return faculty?.id ?? null;
};

const toAssignment = (row: any): FacultyAssignment => ({
  id: row.id,
  facultyId: row.facultyId,
  subjectId: row.subjectId,
  sectionId: row.sectionId,
  subjectName: row.subject?.name || 'Subject',
  subjectCode: row.subject?.code || '',
  sectionName: row.section?.name || '',
  semester: row.section?.semester ?? 0,
  departmentId: row.section?.departmentId || row.subject?.departmentId || '',
  departmentName: row.section?.department?.name || '',
});

/** Subject+section pairs visible to the user. Admin sees every pair in the system. */
export async function listFacultyAssignments(
  user: AuthUserLike,
  client: DbClient = prisma,
): Promise<FacultyAssignment[]> {
  const include = {
    subject: true,
    section: { include: { department: true } },
  } as const;

  if (isAdmin(user)) {
    const rows = await client.facultySubject.findMany({ include });
    return rows.map(toAssignment);
  }

  const facultyId = await getFacultyId(user, client);
  if (!facultyId) return [];

  const rows = await client.facultySubject.findMany({
    where: { facultyId },
    include,
  });
  return rows.map(toAssignment);
}

/** Pure check used by both the new faculty routes and the legacy skill-gap routes. */
export const isPairAllowed = (
  assignments: Array<{ subjectId: string; sectionId: string }>,
  subjectId: string,
  sectionId: string,
): boolean =>
  assignments.some((a) => a.subjectId === subjectId && a.sectionId === sectionId);

/**
 * Faculty may only access an exact assigned subject+section pair. Admin may
 * access any existing pair. Students never pass this check.
 */
export async function canAccessSubjectSection(
  user: AuthUserLike | undefined,
  subjectId: string,
  sectionId: string,
  client: DbClient = prisma,
): Promise<boolean> {
  if (!user || (!subjectId && !isAdmin(user))) return false;

  if (isAdmin(user)) {
    const section = await client.section.findUnique({ where: { id: sectionId }, select: { id: true } });
    if (!section) return false;
    if (!subjectId) return true;
    const subject = await client.subject.findUnique({ where: { id: subjectId }, select: { id: true } });
    return !!subject;
  }

  if (!isFaculty(user) || !subjectId || !sectionId) return false;
  const facultyId = await getFacultyId(user, client);
  if (!facultyId) return false;

  const link = await client.facultySubject.findFirst({
    where: { facultyId, subjectId, sectionId },
    select: { id: true },
  });
  return !!link;
}

/** A student is visible only inside the faculty's assigned section for that subject. */
export async function canAccessStudent(
  user: AuthUserLike | undefined,
  student: { id: string; sectionId: string } | null,
  subjectId: string,
  client: DbClient = prisma,
): Promise<boolean> {
  if (!user || !student || !subjectId) return false;
  if (isAdmin(user)) {
    const subject = await client.subject.findUnique({ where: { id: subjectId }, select: { id: true } });
    return !!subject;
  }
  return canAccessSubjectSection(user, subjectId, student.sectionId, client);
}

export const facultyAssignmentService = {
  isAdmin,
  isFaculty,
  getFacultyId,
  listFacultyAssignments,
  isPairAllowed,
  canAccessSubjectSection,
  canAccessStudent,
};
