
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Protect ALL admin routes with authenticateJWT and requireRole(['ADMIN'])
router.use(authenticateJWT, requireRole(['ADMIN']));

// Helper: Semester to Academic Year mapping (Sem 1-2 -> Year 1, Sem 3-4 -> Year 2, Sem 5-6 -> Year 3, Sem 7-8 -> Year 4)
export const semesterToYear = (semester: number): number => {
  if (semester <= 2) return 1;
  if (semester <= 4) return 2;
  if (semester <= 6) return 3;
  return 4;
};

// ============================================================
// 1. ADMIN DASHBOARD OVERVIEW & ANALYTICS
// ============================================================
router.get('/overview', async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalSections,
      activeQuizzesCount,
      allAttempts,
      sections,
      subjects,
      students,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.faculty.count(),
      prisma.subject.count(),
      prisma.section.count(),
      prisma.quiz.count({ where: { status: 'ACTIVE' } }),
      prisma.quizAttempt.findMany({
        select: {
          id: true,
          score: true,
          studentId: true,
          quizId: true,
          student: {
            select: {
              sectionId: true,
              section: {
                select: {
                  semester: true,
                  name: true,
                  department: { select: { code: true, name: true } },
                },
              },
            },
          },
          quiz: {
            select: {
              subjectId: true,
              subject: { select: { name: true, code: true } },
            },
          },
        },
      }),
      prisma.section.findMany({
        include: {
          department: true,
          students: { select: { id: true } },
          quizzes: {
            include: {
              attempts: { select: { score: true } },
            },
          },
        },
      }),
      prisma.subject.findMany({
        include: {
          department: true,
          assignments: true,
          quizzes: {
            include: {
              attempts: { select: { score: true } },
            },
          },
        },
      }),
      prisma.student.findMany({
        select: {
          id: true,
          sectionId: true,
          section: { select: { semester: true } },
          quizAttempts: { select: { id: true } },
        },
      }),
    ]);

    // Active courses = courses that have at least one assigned faculty or quiz
    const activeCourses = subjects.filter(s => s.assignments.length > 0 || s.quizzes.length > 0).length;

    // Overall academic performance (handling null if no attempts exist)
    const overallPerformance =
      allAttempts.length > 0
        ? Math.round((allAttempts.reduce((acc, a) => acc + a.score, 0) / allAttempts.length) * 10) / 10
        : null;

    // Pass rate: percentage of attempts with score >= 60
    const passCount = allAttempts.filter(a => a.score >= 60).length;
    const passRate =
      allAttempts.length > 0
        ? Math.round((passCount / allAttempts.length) * 100)
        : null;

    // --- Year-wise performance analytics ---
    const yearBuckets: Record<number, { studentCount: number; scores: number[]; attemptsCount: number }> = {
      1: { studentCount: 0, scores: [], attemptsCount: 0 },
      2: { studentCount: 0, scores: [], attemptsCount: 0 },
      3: { studentCount: 0, scores: [], attemptsCount: 0 },
      4: { studentCount: 0, scores: [], attemptsCount: 0 },
    };

    // Count students per year
    students.forEach(st => {
      const year = semesterToYear(st.section?.semester || 1);
      if (yearBuckets[year]) {
        yearBuckets[year].studentCount += 1;
      }
    });

    // Collate scores and attempts per year
    allAttempts.forEach(att => {
      const sem = att.student?.section?.semester || 1;
      const year = semesterToYear(sem);
      if (yearBuckets[year]) {
        yearBuckets[year].scores.push(att.score);
        yearBuckets[year].attemptsCount += 1;
      }
    });

    const yearWise = [1, 2, 3, 4].map(year => {
      const bucket = yearBuckets[year];
      const avg =
        bucket.scores.length > 0
          ? Math.round((bucket.scores.reduce((a, b) => a + b, 0) / bucket.scores.length) * 10) / 10
          : null; // Explicit null to not misrepresent missing data as 0

      return {
        year: `Year ${year}`,
        yearNumber: year,
        studentsCount: bucket.studentCount,
        attemptsCount: bucket.attemptsCount,
        averageScore: avg,
      };
    });

    // --- Section-wise performance analytics ---
    const sectionWise = sections.map(sec => {
      const secAttempts = sec.quizzes.flatMap(q => q.attempts);
      const avg =
        secAttempts.length > 0
          ? Math.round((secAttempts.reduce((a, b) => a + b.score, 0) / secAttempts.length) * 10) / 10
          : null;

      return {
        sectionId: sec.id,
        sectionName: `${sec.semester}${sec.name}`,
        semester: sec.semester,
        year: `Year ${semesterToYear(sec.semester)}`,
        department: sec.department.code,
        studentsCount: sec.students.length,
        attemptsCount: secAttempts.length,
        averageScore: avg,
      };
    });

    // --- Course-wise performance analytics ---
    const courseWise = subjects.map(sub => {
      const subAttempts = sub.quizzes.flatMap(q => q.attempts);
      const avg =
        subAttempts.length > 0
          ? Math.round((subAttempts.reduce((a, b) => a + b.score, 0) / subAttempts.length) * 10) / 10
          : null;

      return {
        courseId: sub.id,
        courseName: sub.name,
        courseCode: sub.code,
        department: sub.department.code,
        quizCount: sub.quizzes.length,
        attemptsCount: subAttempts.length,
        averageScore: avg,
      };
    });

    // --- Student Participation Rate ---
    const studentsWithAttempts = students.filter(s => s.quizAttempts.length > 0).length;
    const participationRate =
      totalStudents > 0
        ? Math.round((studentsWithAttempts / totalStudents) * 100)
        : null;

    res.json({
      summary: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalSections,
        activeCourses,
        overallPerformance,
        totalAttempts: allAttempts.length,
        passRate,
        participationRate,
      },
      analytics: {
        yearWise,
        sectionWise,
        courseWise,
        overall: {
          averageScore: overallPerformance,
          totalAttempts: allAttempts.length,
          passRate,
          participatingStudents: studentsWithAttempts,
          totalStudents,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/overview:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch admin overview' });
  }
});

// ============================================================
// 2. FACULTY MANAGEMENT
// ============================================================

// List all faculty with assignment details
router.get('/faculty', async (req, res) => {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        assignments: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                department: { select: { id: true, name: true, code: true } },
              },
            },
            section: {
              select: {
                id: true,
                name: true,
                semester: true,
                department: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const formatted = faculty.map(f => ({
      id: f.id,
      userId: f.userId,
      name: f.user.name,
      email: f.user.email,
      avatarUrl: f.user.avatarUrl,
      joinedAt: f.user.createdAt,
      totalCourses: new Set(f.assignments.map(a => a.subjectId)).size,
      totalSections: f.assignments.length,
      assignments: f.assignments.map(a => ({
        id: a.id,
        subjectId: a.subject.id,
        subjectName: a.subject.name,
        subjectCode: a.subject.code,
        sectionId: a.section.id,
        sectionName: `${a.section.semester}${a.section.name}`,
        semester: a.section.semester,
        department: a.section.department.code,
      })),
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Assign Faculty to Course and Section
router.post(['/faculty/assignments', '/faculty/assign'], async (req, res) => {
  try {
    const { facultyId, subjectId, sectionId } = req.body;

    if (!facultyId || !subjectId || !sectionId) {
      return res.status(400).json({ message: 'facultyId, subjectId, and sectionId are required' });
    }

    // Verify faculty, subject, and section exist
    const [faculty, subject, section] = await Promise.all([
      prisma.faculty.findUnique({
        where: { id: facultyId },
        include: { user: true },
      }),
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.section.findUnique({ where: { id: sectionId } }),
    ]);

    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // Prevent duplicate assignment
    const existing = await prisma.facultySubject.findFirst({
      where: {
        facultyId,
        subjectId,
        sectionId,
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Faculty is already assigned to this course and section' });
    }

    // Create assignment and in-app notification in transaction
    const [assignment, notification] = await prisma.$transaction([
      prisma.facultySubject.create({
        data: {
          facultyId,
          subjectId,
          sectionId,
        },
        include: {
          subject: true,
          section: true,
        },
      }),
      prisma.notification.create({
        data: {
          userId: faculty.userId,
          title: 'New Course Assignment',
          message: `You have been assigned to teach ${subject.name} (${subject.code}) for Section ${section.semester}${section.name}.`,
          type: 'course',
          role: 'FACULTY',
          actionUrl: '/faculty',
        },
      }),
    ]);

    res.status(201).json({
      assignment,
      notificationSent: !!notification,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove Faculty Assignment
router.delete(['/faculty/assignments/:id', '/faculty/assignment/:id'], async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const existing = await prisma.facultySubject.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await prisma.facultySubject.delete({ where: { id } });
    res.json({ message: 'Assignment removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove Faculty Member
router.delete('/faculty/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: {
        user: true,
        assignments: true,
      },
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Remove all faculty subject/section assignments
      await tx.facultySubject.deleteMany({
        where: { facultyId: id },
      });

      // 2. Remove notifications targeted to this user
      await tx.notification.deleteMany({
        where: { userId: faculty.userId },
      });

      // 3. Remove faculty profile
      await tx.faculty.delete({
        where: { id },
      });

      // 4. Remove underlying user account
      await tx.user.delete({
        where: { id: faculty.userId },
      });
    });

    res.json({
      message: `Faculty member "${faculty.user.name}" (${faculty.user.email}) removed successfully.`,
      deletedFacultyId: id,
    });
  } catch (error: any) {
    console.error('Error removing faculty:', error);
    res.status(500).json({ message: error.message || 'Failed to remove faculty member' });
  }
});

// ============================================================
// 3. COURSE / SUBJECT MANAGEMENT
// ============================================================

// List all courses
router.get('/courses', async (req, res) => {
  try {
    const { departmentId, semester, search } = req.query;

    const where: any = {};
    if (departmentId) where.departmentId = String(departmentId);
    if (semester) where.semester = parseInt(String(semester), 10);
    if (search) {
      where.OR = [
        { code: { contains: String(search), mode: 'insensitive' } },
        { name: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        assignments: {
          include: {
            faculty: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            section: true,
          },
        },
        _count: {
          select: { quizzes: true, topics: true },
        },
      },
      orderBy: [{ semester: 'asc' }, { code: 'asc' }],
    });

    const formatted = courses.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      semester: (c as any).semester || 1,
      departmentId: c.departmentId,
      departmentName: c.department.name,
      departmentCode: c.department.code,
      quizCount: c._count.quizzes,
      topicCount: c._count.topics,
      status: c.assignments.length > 0 ? 'Assigned' : 'Awaiting Faculty',
      assignments: c.assignments.map(a => ({
        id: a.id,
        facultyId: a.facultyId,
        facultyName: a.faculty.user.name,
        facultyEmail: a.faculty.user.email,
        sectionId: a.sectionId,
        sectionName: `${a.section.semester}${a.section.name}`,
      })),
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add new course
router.post('/courses', async (req, res) => {
  try {
    const { name, code, departmentId, semester } = req.body;

    if (!name || !code || !departmentId) {
      return res.status(400).json({ message: 'Course name, unique code, and department are required' });
    }

    const semNumber = semester ? parseInt(String(semester), 10) : 1;

    // Check duplicate course code
    const existing = await prisma.subject.findFirst({
      where: { code: code.trim().toUpperCase() },
    });

    if (existing) {
      return res.status(409).json({ message: `A course with code "${code.trim().toUpperCase()}" already exists` });
    }

    // Check department exists
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) return res.status(404).json({ message: 'Selected department does not exist' });

    const newCourse = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        departmentId,
        semester: semNumber,
      },
      include: { department: true },
    });

    res.status(201).json(newCourse);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Edit course details
router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { name, code, departmentId, semester } = req.body;

    const course = await prisma.subject.findUnique({ where: { id } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (code && code.trim().toUpperCase() !== course.code) {
      const duplicate = await prisma.subject.findFirst({
        where: {
          code: code.trim().toUpperCase(),
          id: { not: id },
        },
      });
      if (duplicate) {
        return res.status(409).json({ message: `Course code "${code}" is already in use by another course` });
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim().toUpperCase() } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(semester !== undefined ? { semester: parseInt(String(semester), 10) } : {}),
      },
      include: { department: true },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Delete course (remove course registered by admin)
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    const course = await prisma.subject.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete faculty assignments
      await tx.facultySubject.deleteMany({
        where: { subjectId: id },
      });

      // 2. Delete syllabus documents linked to this subject
      await tx.syllabusDocument.deleteMany({
        where: { subjectId: id },
      });

      // 3. Handle quizzes linked to this course
      const quizzes = await tx.quiz.findMany({
        where: { subjectId: id },
        select: { id: true },
      });
      const quizIds = quizzes.map((q) => q.id);

      if (quizIds.length > 0) {
        // Delete attempt answers for quiz attempts
        await tx.attemptAnswer.deleteMany({
          where: {
            attempt: {
              quizId: { in: quizIds },
            },
          },
        });

        // Delete quiz attempts
        await tx.quizAttempt.deleteMany({
          where: { quizId: { in: quizIds } },
        });

        // Delete quiz questions
        await tx.quizQuestion.deleteMany({
          where: { quizId: { in: quizIds } },
        });

        // Delete quizzes
        await tx.quiz.deleteMany({
          where: { id: { in: quizIds } },
        });
      }

      // 4. Handle topics and questions
      const topics = await tx.topic.findMany({
        where: { subjectId: id },
        select: { id: true },
      });
      const topicIds = topics.map((t) => t.id);

      if (topicIds.length > 0) {
        // Delete syllabus documents linked to topics
        await tx.syllabusDocument.deleteMany({
          where: { topicId: { in: topicIds } },
        });

        const questions = await tx.question.findMany({
          where: { topicId: { in: topicIds } },
          select: { id: true },
        });
        const questionIds = questions.map((q) => q.id);

        if (questionIds.length > 0) {
          await tx.attemptAnswer.deleteMany({
            where: { questionId: { in: questionIds } },
          });

          await tx.quizQuestion.deleteMany({
            where: { questionId: { in: questionIds } },
          });

          await tx.option.deleteMany({
            where: { questionId: { in: questionIds } },
          });

          await tx.question.deleteMany({
            where: { id: { in: questionIds } },
          });
        }

        await tx.topic.deleteMany({
          where: { id: { in: topicIds } },
        });
      }

      // 5. Finally delete the subject
      await tx.subject.delete({
        where: { id },
      });
    });

    res.json({
      message: `Course "${course.code} - ${course.name}" removed successfully.`,
      deletedCourseId: id,
    });
  } catch (error: any) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: error.message || 'Failed to remove course' });
  }
});


// ============================================================
// 4. STUDENT AND SECTION MANAGEMENT
// ============================================================

// List all students
router.get('/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        section: {
          include: {
            department: true,
          },
        },
        _count: {
          select: { quizAttempts: true },
        },
      },
      orderBy: { rollNo: 'asc' },
    });

    const formatted = students.map(s => ({
      id: s.id,
      userId: s.userId,
      name: s.user.name,
      email: s.user.email,
      rollNo: s.rollNo,
      sectionId: s.sectionId,
      sectionName: `${s.section.semester}${s.section.name}`,
      semester: s.section.semester,
      year: `Year ${semesterToYear(s.section.semester)}`,
      yearNumber: semesterToYear(s.section.semester),
      departmentName: s.section.department.name,
      departmentCode: s.section.department.code,
      attemptsCount: s._count.quizAttempts,
      createdAt: s.user.createdAt,
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Add new student (creates User + Student profile atomically)
router.post('/students', async (req, res) => {
  try {
    const { name, email, password, rollNo, sectionId } = req.body;

    if (!name || !email || !rollNo || !sectionId) {
      return res.status(400).json({ message: 'Name, email, roll number, and section are required' });
    }

    // Check unique email
    const existingUser = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email address already exists' });
    }

    // Check unique roll number
    const existingRoll = await prisma.student.findUnique({ where: { rollNo: rollNo.trim().toUpperCase() } });
    if (existingRoll) {
      return res.status(409).json({ message: `Roll number "${rollNo}" is already assigned to another student` });
    }

    // Verify section exists
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) return res.status(404).json({ message: 'Selected section does not exist' });

    const passwordHash = await bcrypt.hash(password || 'student123', 10);

    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
          role: 'STUDENT',
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          rollNo: rollNo.trim().toUpperCase(),
          sectionId,
        },
        include: {
          section: { include: { department: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      return student;
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update student section (preserves all existing quiz attempts and academic history)
router.put('/students/:id/section', async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const { sectionId } = req.body;

    if (!sectionId) {
      return res.status(400).json({ message: 'New sectionId is required' });
    }

    const [student, section] = await Promise.all([
      prisma.student.findUnique({ where: { id } }),
      prisma.section.findUnique({ where: { id: sectionId } }),
    ]);

    if (!student) return res.status(404).json({ message: 'Student record not found' });
    if (!section) return res.status(404).json({ message: 'Target section not found' });

    const updated = await prisma.student.update({
      where: { id },
      data: { sectionId },
      include: {
        section: { include: { department: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove Student
router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        section: { include: { department: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Find quiz attempts
      const attempts = await tx.quizAttempt.findMany({
        where: { studentId: id },
        select: { id: true },
      });
      const attemptIds = attempts.map(a => a.id);

      if (attemptIds.length > 0) {
        await tx.attemptAnswer.deleteMany({
          where: { attemptId: { in: attemptIds } },
        });
        await tx.quizAttempt.deleteMany({
          where: { studentId: id },
        });
      }

      // 2. Remove notifications targeted to this user
      await tx.notification.deleteMany({
        where: { userId: student.userId },
      });

      // 3. Remove student record
      await tx.student.delete({
        where: { id },
      });

      // 4. Remove underlying user account
      await tx.user.delete({
        where: { id: student.userId },
      });
    });

    res.json({
      message: `Student "${student.user.name}" (${student.rollNo}) removed successfully.`,
      deletedStudentId: id,
    });
  } catch (error: any) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: error.message || 'Failed to remove student record' });
  }
});

// ============================================================
// 5. DEPARTMENT AND SECTION ORGANIZATION
// ============================================================

// List departments and their sections
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        sections: {
          include: {
            _count: { select: { students: true, assignments: true, quizzes: true } },
          },
          orderBy: [{ semester: 'asc' }, { name: 'asc' }],
        },
        subjects: {
          include: {
            _count: { select: { assignments: true, quizzes: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// List all sections
router.get('/sections', async (req, res) => {
  try {
    const { departmentId } = req.query;
    const sections = await prisma.section.findMany({
      where: departmentId ? { departmentId: String(departmentId) } : {},
      include: {
        department: true,
        assignments: {
          include: {
            faculty: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        _count: {
          select: { students: true, assignments: true, quizzes: true },
        },
      },
      orderBy: [{ semester: 'asc' }, { name: 'asc' }],
    });

    const formatted = sections.map(s => ({
      id: s.id,
      name: s.name,
      semester: s.semester,
      year: semesterToYear(s.semester),
      departmentId: s.departmentId,
      departmentName: s.department.name,
      departmentCode: s.department.code,
      studentsCount: s._count.students,
      assignmentsCount: s._count.assignments,
      quizzesCount: s._count.quizzes,
      faculty: Array.from(new Set(s.assignments.map(a => a.faculty.user.name))),
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create new section under department
router.post('/sections', async (req, res) => {
  try {
    const { departmentId, semester, name } = req.body;

    if (!departmentId || !semester || !name) {
      return res.status(400).json({ message: 'departmentId, semester (number), and section name are required' });
    }

    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    const semNumber = parseInt(semester, 10);
    const cleanName = name.trim().toUpperCase();

    // Check if section with same department, semester, and name already exists
    const existing = await prisma.section.findFirst({
      where: {
        departmentId,
        semester: semNumber,
        name: cleanName,
      },
    });

    if (existing) {
      return res.status(409).json({ message: `Section ${semNumber}${cleanName} already exists in ${dept.name}` });
    }

    const section = await prisma.section.create({
      data: {
        departmentId,
        semester: semNumber,
        name: cleanName,
      },
      include: { department: true },
    });

    res.status(201).json(section);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Remove Section
router.delete('/sections/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };

    const section = await prisma.section.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete faculty assignments for this section
      await tx.facultySubject.deleteMany({
        where: { sectionId: id },
      });

      // 2. Delete quizzes associated with this section
      const quizzes = await tx.quiz.findMany({
        where: { sectionId: id },
        select: { id: true },
      });
      const quizIds = quizzes.map(q => q.id);

      if (quizIds.length > 0) {
        await tx.attemptAnswer.deleteMany({
          where: { attempt: { quizId: { in: quizIds } } },
        });
        await tx.quizAttempt.deleteMany({
          where: { quizId: { in: quizIds } },
        });
        await tx.quizQuestion.deleteMany({
          where: { quizId: { in: quizIds } },
        });
        await tx.quiz.deleteMany({
          where: { id: { in: quizIds } },
        });
      }

      // 3. Delete students in this section
      const students = await tx.student.findMany({
        where: { sectionId: id },
        select: { id: true, userId: true },
      });
      const studentIds = students.map(s => s.id);
      const studentUserIds = students.map(s => s.userId);

      if (studentIds.length > 0) {
        const attempts = await tx.quizAttempt.findMany({
          where: { studentId: { in: studentIds } },
          select: { id: true },
        });
        const attemptIds = attempts.map(a => a.id);
        if (attemptIds.length > 0) {
          await tx.attemptAnswer.deleteMany({
            where: { attemptId: { in: attemptIds } },
          });
          await tx.quizAttempt.deleteMany({
            where: { studentId: { in: studentIds } },
          });
        }
        await tx.notification.deleteMany({
          where: { userId: { in: studentUserIds } },
        });
        await tx.student.deleteMany({
          where: { id: { in: studentIds } },
        });
        await tx.user.deleteMany({
          where: { id: { in: studentUserIds } },
        });
      }

      // 4. Finally delete the section
      await tx.section.delete({
        where: { id },
      });
    });

    res.json({
      message: `Section Sem ${section.semester}-${section.name} (${section.department.name}) removed successfully.`,
      deletedSectionId: id,
    });
  } catch (error: any) {
    console.error('Error removing section:', error);
    res.status(500).json({ message: error.message || 'Failed to remove section' });
  }
});

// ============================================================
// 6. NOTIFICATIONS LOG
// ============================================================
router.get('/notifications', async (req, res) => {
  try {
    if (!(prisma as any).notification) {
      return res.json([]);
    }
    const notifications = await (prisma as any).notification.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error: any) {
    // Return empty list gracefully if table is not yet migrated in database
    res.json([]);
  }
});

export default router;
