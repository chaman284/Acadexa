import dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../prisma';
import { getStudentSkillReport } from '../services/skillGapService';

async function main() {
  console.log('🔍 Running Part A Verification Check...');

  // 1. Verify Subtopic CV-M3-05 exists
  const subtopic = await prisma.subtopic.findUnique({
    where: { id: 'CV-M3-05' },
    include: { topic: { include: { subject: true } } },
  });

  if (!subtopic) {
    throw new Error('Subtopic CV-M3-05 not found in database. Make sure seed:taxonomy was run.');
  }

  console.log(`✅ Found subtopic: ${subtopic.name} (${subtopic.id}) under topic: ${subtopic.topic.name}`);

  // 2. Find or create Section
  let section = await prisma.section.findFirst();
  if (!section) {
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({ data: { name: 'AIML', code: 'AIML' } });
    }
    section = await prisma.section.create({
      data: { name: 'A', semester: 5, departmentId: dept.id },
    });
  }

  // 3. Find or create Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'test.student.parta@college.edu' },
    update: {},
    create: {
      email: 'test.student.parta@college.edu',
      name: 'Part A Verification Student',
      passwordHash: 'dummyhash',
      role: 'STUDENT',
    },
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: { sectionId: section.id },
    create: {
      userId: studentUser.id,
      rollNo: 'TEST_PARTA_001',
      sectionId: section.id,
    },
  });

  console.log(`✅ Test student ready: ${student.id} (${studentUser.email})`);

  // 4. Create 3 questions tagged to CV-M3-05 with EASY, MEDIUM, HARD difficulty
  const difficulties = ['EASY', 'MEDIUM', 'HARD'] as const;
  const questions = [];

  for (const diff of difficulties) {
    const q = await prisma.question.create({
      data: {
        text: `Test Question for K-Means (${diff})?`,
        type: 'MCQ',
        difficulty: diff,
        cognitiveLevel: 'CL2_UNDERSTAND',
        status: 'APPROVED',
        topicId: subtopic.topicId,
        subtopicId: subtopic.id,
        options: {
          create: [
            { text: `Correct Option for ${diff}`, isCorrect: true },
            { text: `Incorrect Option for ${diff}`, isCorrect: false },
          ],
        },
      },
      include: { options: true },
    });
    questions.push(q);
  }

  console.log(`✅ Created 3 questions tagged to subtopic ${subtopic.id} (EASY, MEDIUM, HARD).`);

  // 5. Create a Quiz containing these questions
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Verification Quiz - K-Means Segmentation',
      type: 'PRACTICE',
      status: 'COMPLETED',
      duration: 15,
      subjectId: subtopic.topic.subjectId,
      sectionId: section.id,
      questions: {
        create: questions.map((q, idx) => ({
          questionId: q.id,
          order: idx + 1,
        })),
      },
    },
  });

  // 6. Create a QuizAttempt and submit answers
  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId: student.id,
      quizId: quiz.id,
      score: 2,
      timeTaken: 120,
      submittedAt: new Date(),
      answers: {
        create: [
          // EASY -> Correct
          {
            questionId: questions[0].id,
            optionId: questions[0].options.find(o => o.isCorrect)!.id,
            isCorrect: true,
          },
          // MEDIUM -> Correct
          {
            questionId: questions[1].id,
            optionId: questions[1].options.find(o => o.isCorrect)!.id,
            isCorrect: true,
          },
          // HARD -> Incorrect
          {
            questionId: questions[2].id,
            optionId: questions[2].options.find(o => !o.isCorrect)!.id,
            isCorrect: false,
          },
        ],
      },
    },
  });

  console.log(`✅ Submitted quiz attempt: ${attempt.id}`);

  // 7. Call getStudentSkillReport(studentId)
  const report: any = await getStudentSkillReport(student.id);

  if (report.empty) {
    throw new Error('Report was empty!');
  }

  // Find the topic node in the tree
  function findTopicWithSubtopics(node: any): any {
    if (node.level === 'TOPIC' && node.id === subtopic!.topicId) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findTopicWithSubtopics(child);
        if (found) return found;
      }
    }
    return null;
  }

  const topicNode = findTopicWithSubtopics(report.tree);

  console.log('\n📊 === Part A Verification Output ===');
  console.log('Found Topic Node in tree:');
  console.log(JSON.stringify({
    level: topicNode?.level,
    id: topicNode?.id,
    name: topicNode?.name,
    children: topicNode?.children?.map((c: any) => ({
      level: c.level,
      id: c.id,
      name: c.name,
      mastery: c.mastery,
      answered: c.answered,
    })),
  }, null, 2));

  console.log('\nWeakest Subtopics in Report:');
  console.log(JSON.stringify(report.weakestSubtopics, null, 2));

  console.log('\n✅ Verification of Part A SUCCESSFUL!');
}

main()
  .catch(e => {
    console.error('❌ Verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
