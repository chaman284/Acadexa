import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/courses - List courses with enrollment status for students, or assignment info
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const subjects = await prisma.subject.findMany({
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

    let studentSectionId: string | null = null;
    let studentDeptId: string | null = null;

    if (req.user && req.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: req.user.id },
        include: { section: true },
      });
      if (student) {
        studentSectionId = student.sectionId;
        studentDeptId = student.section?.departmentId || null;
      }
    }

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
