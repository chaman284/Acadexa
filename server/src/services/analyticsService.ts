import { prisma } from '../prisma';
import { analytics as knowledgeAnalytics } from './analytics';

export * from './analytics';

export const analyticsService = {
  ...knowledgeAnalytics,
  // Student performance summary
  async getStudentPerformance(studentId: string) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId },
      include: {
        quiz: {
          include: { subject: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalQuizzes = attempts.length;
    const avgScore =
      totalQuizzes > 0
        ? attempts.reduce((acc, a) => acc + a.score, 0) / totalQuizzes
        : 0;

    return {
      totalQuizzes,
      averageScore: Math.round(avgScore * 10) / 10,
      recentAttempts: attempts.slice(0, 5),
    };
  },

  // Section-level analytics
  async getSectionAnalytics(sectionId: string) {
    const quizzes = await prisma.quiz.findMany({
      where: { sectionId },
      include: {
        attempts: true,
        subject: true,
      },
    });

    const students = await prisma.student.findMany({
      where: { sectionId },
      include: {
        user: { select: { name: true, email: true } },
        quizAttempts: true,
      },
    });

    return {
      totalStudents: students.length,
      totalQuizzes: quizzes.length,
      quizzes: quizzes.map(q => ({
        id: q.id,
        title: q.title,
        subject: q.subject.name,
        attemptCount: q.attempts.length,
        averageScore:
          q.attempts.length > 0
            ? Math.round(
                (q.attempts.reduce((acc, curr) => acc + curr.score, 0) /
                  q.attempts.length) *
                  10
              ) / 10
            : 0,
      })),
    };
  },

  // Learning gap analysis
  async getLearningGaps(studentId: string) {
    const answers = await prisma.attemptAnswer.findMany({
      where: {
        attempt: { studentId },
      },
      include: {
        question: {
          include: { topic: true },
        },
      },
    });

    const topicStats: Record<
      string,
      { topicName: string; total: number; incorrect: number }
    > = {};

    answers.forEach(ans => {
      const topicId = ans.question.topicId;
      const topicName = ans.question.topic?.name || 'General';

      if (!topicStats[topicId]) {
        topicStats[topicId] = { topicName, total: 0, incorrect: 0 };
      }
      topicStats[topicId].total += 1;
      if (!ans.isCorrect) {
        topicStats[topicId].incorrect += 1;
      }
    });

    const gaps = Object.keys(topicStats).map(topicId => {
      const stat = topicStats[topicId];
      const gapPercentage =
        stat.total > 0 ? Math.round((stat.incorrect / stat.total) * 100) : 0;
      return {
        topicId,
        topicName: stat.topicName,
        totalQuestions: stat.total,
        incorrectQuestions: stat.incorrect,
        gapScore: gapPercentage,
        needsAttention: gapPercentage >= 40,
      };
    });

    return gaps.sort((a, b) => b.gapScore - a.gapScore);
  },

  // Section leaderboard
  async getLeaderboard(sectionId: string) {
    const students = await prisma.student.findMany({
      where: { sectionId },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        quizAttempts: {
          select: { score: true },
        },
      },
    });

    const leaderboard = students.map(student => {
      const attempts = student.quizAttempts;
      const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
      const avgScore = attempts.length > 0 ? totalScore / attempts.length : 0;
      return {
        studentId: student.id,
        name: student.user.name,
        avatarUrl: student.user.avatarUrl,
        quizzesTaken: attempts.length,
        averageScore: Math.round(avgScore * 10) / 10,
      };
    });

    return leaderboard.sort((a, b) => b.averageScore - a.averageScore);
  },

  // Faculty learning gap analytics for assigned classes and topics
  async getFacultyLearningGaps(userId: string, classId?: string) {
    let faculty = await prisma.faculty.findUnique({
      where: { userId },
      include: {
        assignments: {
          include: {
            subject: true,
            section: {
              include: {
                _count: { select: { students: true } },
              },
            },
          },
        },
      },
    });

    if (!faculty || faculty.assignments.length === 0) {
      faculty = await prisma.faculty.findFirst({
        where: { assignments: { some: {} } },
        include: {
          assignments: {
            include: {
              subject: true,
              section: {
                include: {
                  _count: { select: { students: true } },
                },
              },
            },
          },
        },
      });
    }

    if (!faculty || faculty.assignments.length === 0) {
      return { classes: [], selectedClass: null, topics: [] };
    }

    const classes = faculty.assignments.map(a => ({
      id: a.id,
      assignmentId: a.id,
      sectionId: a.sectionId,
      subjectId: a.subjectId,
      semester: `Sem ${a.subject.semester || a.section.semester}`,
      section: `${a.section.semester}${a.section.name}`,
      sectionName: `Section ${a.section.name}`,
      subject: a.subject.name,
      subjectCode: a.subject.code,
      studentsCount: a.section._count.students,
    }));

    const selectedClass =
      (classId
        ? classes.find(
            c =>
              c.id === classId ||
              c.sectionId === classId ||
              c.assignmentId === classId
          )
        : null) || classes[0];

    if (!selectedClass) {
      return { classes, selectedClass: null, topics: [] };
    }

    let topics = await prisma.topic.findMany({
      where: { subjectId: selectedClass.subjectId },
      orderBy: { name: 'asc' },
    });

    if (topics.length === 0) {
      const defaultTopics = [
        'Foundations & Core Principles',
        'Advanced Concepts & Paradigms',
        'System Architecture & Design',
        'Practical Implementations & Lab',
        'Optimization & Performance Analysis',
      ];
      for (const dName of defaultTopics) {
        const created = await prisma.topic.create({
          data: { name: dName, subjectId: selectedClass.subjectId },
        });
        topics.push(created);
      }
    }

    const topicPerformance = await Promise.all(
      topics.map(async (topic, index) => {
        const answers = await prisma.attemptAnswer.findMany({
          where: {
            question: { topicId: topic.id },
            attempt: {
              quiz: {
                sectionId: selectedClass.sectionId,
                subjectId: selectedClass.subjectId,
              },
            },
          },
          include: {
            attempt: {
              select: {
                studentId: true,
                submittedAt: true,
              },
            },
          },
          orderBy: {
            attempt: { submittedAt: 'asc' },
          },
        });

        const totalAttempts = answers.length;
        let averageScore = 0;
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        let participationRate = 0;

        if (totalAttempts > 0) {
          const correctAnswers = answers.filter(a => a.isCorrect).length;
          averageScore = Math.round((correctAnswers / totalAttempts) * 100);

          if (totalAttempts >= 4) {
            const mid = Math.floor(totalAttempts / 2);
            const firstHalf = answers.slice(0, mid);
            const secondHalf = answers.slice(mid);
            const score1 =
              (firstHalf.filter(a => a.isCorrect).length / firstHalf.length) * 100;
            const score2 =
              (secondHalf.filter(a => a.isCorrect).length / secondHalf.length) * 100;
            if (score2 > score1 + 5) trend = 'improving';
            else if (score2 < score1 - 5) trend = 'declining';
            else trend = 'stable';
          } else {
            trend =
              averageScore >= 75
                ? 'improving'
                : averageScore < 60
                ? 'declining'
                : 'stable';
          }

          const studentIds = new Set(answers.map(a => a.attempt.studentId));
          const totalStudents = selectedClass.studentsCount || 1;
          participationRate = Math.min(
            100,
            Math.round((studentIds.size / totalStudents) * 100)
          );
        }

        return {
          topicId: topic.id,
          topicName: topic.name,
          courseId: selectedClass.subjectId,
          courseName: selectedClass.subject,
          unitName: `Unit ${index + 1}`,
          averageScore,
          participationRate,
          trend,
          attemptsCount: totalAttempts,
        };
      })
    );

    return {
      classes,
      selectedClass,
      topics: topicPerformance,
    };
  },
};
