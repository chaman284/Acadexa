import { prisma } from '../prisma';

export const analyticsService = {
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
};
