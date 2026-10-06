import { prisma } from '../prisma';

export const quizService = {
  async getQuizzes(filters?: { sectionId?: string; subjectId?: string; status?: string }) {
    return prisma.quiz.findMany({
      where: {
        ...(filters?.sectionId ? { sectionId: filters.sectionId } : {}),
        ...(filters?.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters?.status ? { status: filters.status as any } : {}),
      },
      include: {
        subject: true,
        section: true,
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getQuizById(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
      include: {
        subject: true,
        section: true,
        questions: {
          include: {
            question: {
              include: {
                options: true,
                topic: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  },

  async createQuiz(data: {
    title: string;
    subjectId: string;
    sectionId: string;
    duration: number;
    type?: 'WEEKLY' | 'REMEDIAL' | 'PRACTICE';
    scheduledAt?: Date;
    questionIds: string[];
  }) {
    return prisma.quiz.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
        sectionId: data.sectionId,
        duration: data.duration,
        type: data.type || 'WEEKLY',
        status: 'ACTIVE',
        scheduledAt: data.scheduledAt,
        questions: {
          create: data.questionIds.map((qId, index) => ({
            questionId: qId,
            order: index + 1,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
  },

  async submitAttempt(data: {
    quizId: string;
    studentId: string;
    timeTaken: number;
    answers: { questionId: string; optionId: string }[];
  }) {
    // Check which answers are correct
    const questionIds = data.answers.map(a => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { options: true },
    });

    let correctCount = 0;
    const evaluatedAnswers = data.answers.map(ans => {
      const q = questions.find(item => item.id === ans.questionId);
      const opt = q?.options.find(o => o.id === ans.optionId);
      const isCorrect = opt ? opt.isCorrect : false;
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId,
        optionId: ans.optionId,
        isCorrect,
      };
    });

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

    return prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        studentId: data.studentId,
        score,
        timeTaken: data.timeTaken,
        answers: {
          create: evaluatedAnswers,
        },
      },
      include: {
        answers: true,
        quiz: true,
      },
    });
  },

  async getQuizResults(quizId: string) {
    return prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
        answers: true,
      },
      orderBy: { score: 'desc' },
    });
  },
};
