import { prisma } from '../prisma';

export const quizService = {
  async getQuizzes(filters?: { sectionId?: string; subjectId?: string; status?: string; studentId?: string }) {
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
        ...(filters?.studentId ? {
          attempts: {
            where: { studentId: filters.studentId },
            select: { id: true, score: true, submittedAt: true, timeTaken: true },
          },
        } : {}),
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
    questionIds?: string[];
    questions?: { id?: string; text: string; difficulty?: string; topicName?: string }[];
  }) {
    // 1. Validate section or find fallback
    let targetSectionId = data.sectionId;
    const sectionExists = await prisma.section.findUnique({ where: { id: targetSectionId } });
    if (!sectionExists) {
      const anySection = await prisma.section.findFirst();
      if (!anySection) {
        throw new Error('No academic sections found in database. Please create a section first.');
      }
      targetSectionId = anySection.id;
    }

    // 2. Resolve question IDs
    let finalQuestionIds: string[] = [];
    const rawIds = Array.isArray(data.questionIds) ? data.questionIds : [];

    if (rawIds.length > 0) {
      const existingInDb = await prisma.question.findMany({
        where: { id: { in: rawIds } },
        select: { id: true },
      });
      const dbIds = new Set(existingInDb.map(q => q.id));
      const missingIds = rawIds.filter(id => !dbIds.has(id));

      if (missingIds.length > 0) {
        // Find or create default topic for this subject
        let topic = await prisma.topic.findFirst({
          where: { subjectId: data.subjectId },
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              name: 'General Curriculum',
              subjectId: data.subjectId,
            },
          });
        }

        for (let i = 0; i < missingIds.length; i++) {
          const clientQ = data.questions?.find(q => q.id === missingIds[i]);
          const qText = clientQ?.text || `Assessment Question ${i + 1} for curriculum evaluation`;
          const rawDiff = clientQ?.difficulty?.toUpperCase();
          const qDiff = rawDiff === 'HARD' ? 'HARD' : rawDiff === 'EASY' ? 'EASY' : 'MEDIUM';

          const createdQ = await prisma.question.create({
            data: {
              text: qText,
              type: 'MCQ',
              difficulty: qDiff as any,
              topicId: topic.id,
              options: {
                create: [
                  { text: 'Option A (Correct answer)', isCorrect: true },
                  { text: 'Option B', isCorrect: false },
                  { text: 'Option C', isCorrect: false },
                  { text: 'Option D', isCorrect: false },
                ],
              },
            },
          });
          dbIds.add(createdQ.id);
        }
      }

      finalQuestionIds = Array.from(dbIds);
    }

    const isFutureSchedule = !!data.scheduledAt && new Date(data.scheduledAt) > new Date();
    const initialStatus = isFutureSchedule ? 'DRAFT' : 'ACTIVE';

    return prisma.quiz.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
        sectionId: targetSectionId,
        duration: data.duration,
        type: data.type || 'WEEKLY',
        status: initialStatus,
        scheduledAt: data.scheduledAt,
        questions: {
          create: finalQuestionIds.map((qId, index) => ({
            questionId: qId,
            order: index + 1,
          })),
        },
      },
      include: {
        subject: true,
        section: true,
        questions: {
          include: {
            question: true,
          },
        },
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
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true },
            },
            section: true,
          },
        },
        answers: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalSubmissions = attempts.length;
    const avgScore = totalSubmissions > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalSubmissions)
      : 0;
    const highestScore = totalSubmissions > 0
      ? Math.max(...attempts.map(a => a.score))
      : 0;

    return {
      stats: {
        totalSubmissions,
        avgScore,
        highestScore,
      },
      attempts: attempts.map((a: any) => ({
        id: a.id,
        studentId: a.studentId,
        studentName: a.student?.user?.name || 'Student',
        studentEmail: a.student?.user?.email || '',
        rollNo: a.student?.rollNo || 'N/A',
        sectionName: a.student?.section
          ? `Semester ${a.student.section.semester} - Sec ${a.student.section.name}`
          : 'Section A',
        score: Math.round(a.score),
        timeTaken: a.timeTaken,
        submittedAt: a.submittedAt,
        totalAnswers: a.answers?.length || 0,
        correctAnswers: (a.answers || []).filter((ans: any) => ans.isCorrect).length,
      })),
    };
  },

  async updateQuizStatus(id: string, status: 'ACTIVE' | 'COMPLETED' | 'DRAFT') {
    return prisma.quiz.update({
      where: { id },
      data: { status: status as any },
      include: {
        subject: true,
        section: true,
      },
    });
  },

  async updateQuizSchedule(id: string, scheduledAt: Date | null, status?: 'ACTIVE' | 'DRAFT') {
    return prisma.quiz.update({
      where: { id },
      data: {
        scheduledAt,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        subject: true,
        section: true,
      },
    });
  },

  async deleteQuiz(id: string) {
    // Delete related attempts and answers
    const attempts = await prisma.quizAttempt.findMany({ where: { quizId: id }, select: { id: true } });
    const attemptIds = attempts.map(a => a.id);
    if (attemptIds.length > 0) {
      await prisma.attemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } });
      await prisma.quizAttempt.deleteMany({ where: { quizId: id } });
    }
    await prisma.quizQuestion.deleteMany({ where: { quizId: id } });

    return prisma.quiz.delete({
      where: { id },
    });
  },
};
