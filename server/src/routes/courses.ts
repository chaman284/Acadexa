import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/courses/faculty-curriculum - Dynamic semesters, subjects, and sections for the logged-in faculty
router.get('/faculty-curriculum', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Try finding faculty profile for current user
    let faculty = await prisma.faculty.findUnique({
      where: { userId: req.user.id },
      include: {
        assignments: {
          include: {
            subject: {
              include: {
                topics: true,
                department: true,
              },
            },
            section: {
              include: {
                _count: { select: { students: true } },
                department: true,
              },
            },
          },
        },
      },
    });

    // If logged-in user is ADMIN, allow seeing all curriculum assignments for testing/admin purposes
    if ((!faculty || faculty.assignments.length === 0) && req.user.role === 'ADMIN') {
      const allAssignments = await prisma.facultySubject.findMany({
        include: {
          subject: {
            include: {
              topics: true,
              department: true,
            },
          },
          section: {
            include: {
              _count: { select: { students: true } },
              department: true,
            },
          },
        },
      });

      const semesters = Array.from(
        new Set(allAssignments.map(a => a.section?.semester || a.subject?.semester || 1))
      ).sort((a, b) => a - b);

      return res.json({
        facultyId: faculty?.id || 'admin',
        facultyName: req.user.name,
        semesters,
        assignments: allAssignments.map(a => ({
          id: a.id,
          semester: a.section.semester || a.subject.semester || 1,
          subject: {
            id: a.subject.id,
            name: a.subject.name,
            code: a.subject.code,
            semester: a.subject.semester || a.section.semester || 1,
            department: a.subject.department?.name || 'Computer Science',
            topics: a.subject.topics.map(t => ({ id: t.id, name: t.name })),
          },
          section: {
            id: a.section.id,
            name: `Section ${a.section.name}`,
            sectionName: a.section.name,
            semester: a.section.semester,
            studentsCount: a.section._count.students,
            department: a.section.department?.name || 'Computer Science',
          },
        })),
      });
    }

    if (!faculty || faculty.assignments.length === 0) {
      return res.json({
        facultyId: faculty?.id || null,
        facultyName: req.user.name,
        semesters: [],
        assignments: [],
      });
    }

    // Extract unique semesters taught by this faculty
    const semesters = Array.from(
      new Set(faculty.assignments.map(a => a.section?.semester || a.subject?.semester || 1))
    ).sort((a, b) => a - b);

    const assignments = faculty.assignments.map(a => ({
      id: a.id,
      semester: a.section.semester || a.subject.semester || 1,
      subject: {
        id: a.subject.id,
        name: a.subject.name,
        code: a.subject.code,
        semester: a.subject.semester || a.section.semester || 1,
        department: a.subject.department?.name || 'Computer Science',
        topics: a.subject.topics.map(t => ({ id: t.id, name: t.name })),
      },
      section: {
        id: a.section.id,
        name: `Section ${a.section.name}`,
        sectionName: a.section.name,
        semester: a.section.semester,
        studentsCount: a.section._count.students,
        department: a.section.department?.name || 'Computer Science',
      },
    }));

    res.json({
      facultyId: faculty.id,
      facultyName: req.user.name,
      semesters,
      assignments,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/courses - List courses with enrollment status for students, or assignment info
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    let studentSectionId: string | null = null;
    let studentDeptId: string | null = null;
    let studentSemester: number | null = null;

    if (req.user && req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
        include: { section: true },
      });
      if (student && student.section) {
        studentSectionId = student.sectionId;
        studentDeptId = student.section.departmentId || null;
        studentSemester = student.section.semester || null;
      }
    }

    const where: any = {};
    if (req.user?.role === 'STUDENT' && studentSemester) {
      where.semester = studentSemester;
      if (studentDeptId) {
        where.departmentId = studentDeptId;
      }
    } else if (req.query.semester) {
      where.semester = parseInt(String(req.query.semester), 10);
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        assignments: {
          include: {
            faculty: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            section: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    const result = subjects.map(s => {
      let enrollmentStatus: 'Enrolled' | 'Available' | 'Not Available' = 'Available';

      if (req.user?.role === 'STUDENT') {
        const isEnrolled = s.assignments.some(a => a.sectionId === studentSectionId);
        if (isEnrolled) {
          enrollmentStatus = 'Enrolled';
        } else if (studentDeptId && s.departmentId === studentDeptId) {
          enrollmentStatus = 'Available';
        } else {
          enrollmentStatus = 'Not Available';
        }
      }

      return {
        id: s.id,
        code: s.code,
        name: s.name,
        semester: (s as any).semester || 1,
        departmentId: s.departmentId,
        departmentName: s.department?.name,
        departmentCode: s.department?.code,
        assignments: s.assignments.map(a => ({
          id: a.id,
          facultyId: a.facultyId,
          facultyName: a.faculty.user.name,
          facultyEmail: a.faculty.user.email,
          sectionId: a.sectionId,
          sectionName: `Semester ${a.section.semester} - Section ${a.section.name}`,
          semester: a.section.semester,
        })),
        enrollmentStatus,
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
