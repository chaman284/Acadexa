import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Department
  const dept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: { name: 'Computer Science', code: 'CS' },
  });
  console.log('✅ Department:', dept.name);

  // 2. Section
  const section = await prisma.section.upsert({
    where: { id: 'section-5a' },
    update: {},
    create: {
      id: 'section-5a',
      semester: 5,
      name: 'A',
      departmentId: dept.id,
    },
  });
  console.log('✅ Section: 5A');

  // 3. Demo Student (student@college.edu / student123)
  const studentHash = await bcrypt.hash('student123', 10);
  const demoStudentUser = await prisma.user.upsert({
    where: { email: 'student@college.edu' },
    update: {
      name: 'Demo Student',
      passwordHash: studentHash,
      role: 'STUDENT',
    },
    create: {
      email: 'student@college.edu',
      passwordHash: studentHash,
      name: 'Demo Student',
      role: 'STUDENT',
      student: {
        create: {
          rollNo: 'DEMO2026STU01',
          sectionId: section.id,
        },
      },
    },
    include: {
      student: true,
    },
  });

  if (!demoStudentUser.student) {
    await prisma.student.upsert({
      where: { userId: demoStudentUser.id },
      update: {
        sectionId: section.id,
      },
      create: {
        userId: demoStudentUser.id,
        rollNo: 'DEMO2026STU01',
        sectionId: section.id,
      },
    });
  }
  console.log('✅ Demo Student user:', demoStudentUser.email);

  // 4. Demo Faculty (faculty@college.edu / faculty123)
  const facultyHash = await bcrypt.hash('faculty123', 10);
  const demoFacultyUser = await prisma.user.upsert({
    where: { email: 'faculty@college.edu' },
    update: {
      name: 'Demo Faculty',
      passwordHash: facultyHash,
      role: 'FACULTY',
    },
    create: {
      email: 'faculty@college.edu',
      passwordHash: facultyHash,
      name: 'Demo Faculty',
      role: 'FACULTY',
      faculty: {
        create: {},
      },
    },
    include: {
      faculty: true,
    },
  });

  if (!demoFacultyUser.faculty) {
    await prisma.faculty.upsert({
      where: { userId: demoFacultyUser.id },
      update: {},
      create: {
        userId: demoFacultyUser.id,
      },
    });
  }
  console.log('✅ Demo Faculty user:', demoFacultyUser.email);

  // 4c. Demo Admin user (admin@college.edu / admin123)
  const adminHash = await bcrypt.hash('admin123', 10);
  const demoAdminUser = await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: {
      name: 'System Administrator',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@college.edu',
      passwordHash: adminHash,
      name: 'System Administrator',
      role: 'ADMIN',
    },
  });
  console.log('✅ Demo Admin user:', demoAdminUser.email);


  // 5. Subject
  const subject = await prisma.subject.upsert({
    where: { id: 'subj-ds' },
    update: {},
    create: {
      id: 'subj-ds',
      name: 'Data Structures',
      code: 'CS-201',
      departmentId: dept.id,
    },
  });
  console.log('✅ Subject:', subject.name);

  // 6. Topic
  const topic = await prisma.topic.upsert({
    where: { id: 'topic-arrays' },
    update: {},
    create: {
      id: 'topic-arrays',
      name: 'Arrays',
      subjectId: subject.id,
    },
  });
  console.log('✅ Topic:', topic.name);

  // 7. A few Questions
  const questions = [
    {
      id: 'q1',
      text: 'What is the time complexity of accessing an element in an array by index?',
      difficulty: 'EASY' as const,
      options: [
        { text: 'O(1)', isCorrect: true },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: false },
        { text: 'O(n²)', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      text: 'Which data structure uses LIFO (Last In, First Out) ordering?',
      difficulty: 'EASY' as const,
      options: [
        { text: 'Queue', isCorrect: false },
        { text: 'Stack', isCorrect: true },
        { text: 'Linked List', isCorrect: false },
        { text: 'Tree', isCorrect: false },
      ],
    },
    {
      id: 'q3',
      text: 'What is the worst-case time complexity of binary search?',
      difficulty: 'MEDIUM' as const,
      options: [
        { text: 'O(1)', isCorrect: false },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: true },
        { text: 'O(n log n)', isCorrect: false },
      ],
    },
  ];

  for (const q of questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        text: q.text,
        type: 'MCQ',
        difficulty: q.difficulty,
        topicId: topic.id,
        options: {
          create: q.options,
        },
      },
    });
  }
  console.log('✅ Questions seeded');

  // 8. Demo Active Quiz
  const quiz = await prisma.quiz.upsert({
    where: { id: 'quiz-demo-1' },
    update: {},
    create: {
      id: 'quiz-demo-1',
      title: 'Week 1 — Arrays & Stacks',
      type: 'WEEKLY',
      status: 'ACTIVE',
      duration: 30,
      subjectId: subject.id,
      sectionId: section.id,
      questions: {
        create: questions.map((q, i) => ({
          questionId: q.id,
          order: i + 1,
        })),
      },
    },
  });
  console.log('✅ Quiz:', quiz.title);

  // 9. FacultySubject assignment
  const demoFacultyRecord = await prisma.faculty.findUnique({ where: { userId: demoFacultyUser.id } });
  if (demoFacultyRecord) {
    await prisma.facultySubject.upsert({
      where: { id: 'fa-assign-demo' },
      update: {},
      create: {
        id: 'fa-assign-demo',
        facultyId: demoFacultyRecord.id,
        subjectId: subject.id,
        sectionId: section.id,
      },
    });
    console.log('✅ Faculty assignment created for Demo Faculty');
  }

  console.log('\n🎉 Seed complete!');
  console.log('Demo Admin:   admin@college.edu / admin123    (System Administrator)');
  console.log('Demo Student: student@college.edu / student123  (Demo Student)');
  console.log('Demo Faculty: faculty@college.edu / faculty123  (Demo Faculty)');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
