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

  // 6. Topics
  const topicArrays = await prisma.topic.upsert({
    where: { id: 'topic-arrays' },
    update: {},
    create: { id: 'topic-arrays', name: 'Arrays', subjectId: subject.id },
  });

  const topicTrees = await prisma.topic.upsert({
    where: { id: 'topic-trees' },
    update: {},
    create: { id: 'topic-trees', name: 'Trees', subjectId: subject.id },
  });

  const topicStacks = await prisma.topic.upsert({
    where: { id: 'topic-stacks' },
    update: {},
    create: { id: 'topic-stacks', name: 'Stacks & Queues', subjectId: subject.id },
  });

  const topicGraphs = await prisma.topic.upsert({
    where: { id: 'topic-graphs' },
    update: {},
    create: { id: 'topic-graphs', name: 'Graph Algorithms', subjectId: subject.id },
  });

  const topicDP = await prisma.topic.upsert({
    where: { id: 'topic-dp' },
    update: {},
    create: { id: 'topic-dp', name: 'Dynamic Programming', subjectId: subject.id },
  });
  console.log('✅ Topics: Arrays, Trees, Stacks, Graphs, Dynamic Programming');

  // 7. Comprehensive Questions with Bloom Cognitive Levels
  const allQuestions = [
    // Arrays
    {
      id: 'q-arr-1',
      text: 'What is the time complexity of accessing an element in an array by index?',
      topicId: topicArrays.id,
      difficulty: 'EASY' as const,
      cognitiveLevel: 'CL1_REMEMBER' as const,
      options: [
        { text: 'O(1)', isCorrect: true },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: false },
        { text: 'O(n²)', isCorrect: false },
      ],
    },
    {
      id: 'q-arr-2',
      text: 'Which technique is optimal to find a pair with target sum in a sorted array?',
      topicId: topicArrays.id,
      difficulty: 'MEDIUM' as const,
      cognitiveLevel: 'CL2_UNDERSTAND' as const,
      options: [
        { text: 'Two-pointer technique', isCorrect: true },
        { text: 'Bubble sort', isCorrect: false },
        { text: 'Breadth-first search', isCorrect: false },
        { text: 'Brute-force nested loops', isCorrect: false },
      ],
    },
    {
      id: 'q-arr-3',
      text: 'What is the space complexity of Kadane’s algorithm for Maximum Subarray Sum?',
      topicId: topicArrays.id,
      difficulty: 'MEDIUM' as const,
      cognitiveLevel: 'CL3_APPLY' as const,
      options: [
        { text: 'O(1) auxiliary space', isCorrect: true },
        { text: 'O(n) auxiliary space', isCorrect: false },
        { text: 'O(n log n)', isCorrect: false },
        { text: 'O(n²)', isCorrect: false },
      ],
    },
    // Trees (Weak topic -> 45%)
    {
      id: 'q-tree-1',
      text: 'What is the maximum number of nodes at depth k in a binary tree?',
      topicId: topicTrees.id,
      difficulty: 'EASY' as const,
      cognitiveLevel: 'CL1_REMEMBER' as const,
      options: [
        { text: '2^k', isCorrect: true },
        { text: '2^(k+1) - 1', isCorrect: false },
        { text: 'k²', isCorrect: false },
        { text: 'log k', isCorrect: false },
      ],
    },
    {
      id: 'q-tree-2',
      text: 'In an AVL tree, what is the maximum allowed balance factor difference between child subtrees?',
      topicId: topicTrees.id,
      difficulty: 'MEDIUM' as const,
      cognitiveLevel: 'CL2_UNDERSTAND' as const,
      options: [
        { text: '1', isCorrect: true },
        { text: '0', isCorrect: false },
        { text: '2', isCorrect: false },
        { text: 'No limit', isCorrect: false },
      ],
    },
    {
      id: 'q-tree-3',
      text: 'Which tree traversal yields sorted keys for a Binary Search Tree (BST)?',
      topicId: topicTrees.id,
      difficulty: 'EASY' as const,
      cognitiveLevel: 'CL2_UNDERSTAND' as const,
      options: [
        { text: 'Inorder Traversal', isCorrect: true },
        { text: 'Preorder Traversal', isCorrect: false },
        { text: 'Postorder Traversal', isCorrect: false },
        { text: 'Level-order Traversal', isCorrect: false },
      ],
    },
    {
      id: 'q-tree-4',
      text: 'What is the worst-case search complexity in an unbalanced Binary Search Tree?',
      topicId: topicTrees.id,
      difficulty: 'HARD' as const,
      cognitiveLevel: 'CL4_ANALYZE' as const,
      options: [
        { text: 'O(n)', isCorrect: true },
        { text: 'O(log n)', isCorrect: false },
        { text: 'O(1)', isCorrect: false },
        { text: 'O(n log n)', isCorrect: false },
      ],
    },
    // Stacks
    {
      id: 'q-stack-1',
      text: 'Which data structure follows LIFO (Last In, First Out) ordering?',
      topicId: topicStacks.id,
      difficulty: 'EASY' as const,
      cognitiveLevel: 'CL1_REMEMBER' as const,
      options: [
        { text: 'Stack', isCorrect: true },
        { text: 'Queue', isCorrect: false },
        { text: 'Linked List', isCorrect: false },
        { text: 'Heap', isCorrect: false },
      ],
    },
    {
      id: 'q-stack-2',
      text: 'Which problem is typically solved using a monotonic stack in O(n) time?',
      topicId: topicStacks.id,
      difficulty: 'MEDIUM' as const,
      cognitiveLevel: 'CL3_APPLY' as const,
      options: [
        { text: 'Next Greater Element', isCorrect: true },
        { text: 'Binary Search', isCorrect: false },
        { text: 'Shortest Path in Graph', isCorrect: false },
        { text: 'Matrix Multiplication', isCorrect: false },
      ],
    },
  ];

  for (const q of allQuestions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        cognitiveLevel: q.cognitiveLevel,
      },
      create: {
        id: q.id,
        text: q.text,
        type: 'MCQ',
        difficulty: q.difficulty,
        cognitiveLevel: q.cognitiveLevel,
        status: 'APPROVED',
        topicId: q.topicId,
        options: {
          create: q.options,
        },
      },
    });
  }
  console.log('✅ Seeded questions with cognitive levels');

  // 8. Weekly Quizzes
  const weeklyQuiz1 = await prisma.quiz.upsert({
    where: { id: 'quiz-week-1' },
    update: {},
    create: {
      id: 'quiz-week-1',
      title: 'Week 1 — Arrays & Linear Sequences',
      type: 'WEEKLY',
      status: 'COMPLETED',
      duration: 30,
      subjectId: subject.id,
      sectionId: section.id,
      questions: {
        create: [
          { questionId: 'q-arr-1', order: 1 },
          { questionId: 'q-arr-2', order: 2 },
          { questionId: 'q-arr-3', order: 3 },
          { questionId: 'q-stack-1', order: 4 },
        ],
      },
    },
  });

  const weeklyQuiz2 = await prisma.quiz.upsert({
    where: { id: 'quiz-week-2' },
    update: {},
    create: {
      id: 'quiz-week-2',
      title: 'Week 2 — Binary Trees & BST Analysis',
      type: 'WEEKLY',
      status: 'ACTIVE',
      duration: 30,
      subjectId: subject.id,
      sectionId: section.id,
      questions: {
        create: [
          { questionId: 'q-tree-1', order: 1 },
          { questionId: 'q-tree-2', order: 2 },
          { questionId: 'q-tree-3', order: 3 },
          { questionId: 'q-tree-4', order: 4 },
        ],
      },
    },
  });
  console.log('✅ Quizzes: Week 1 & Week 2');

  // 8b. Seed realistic historical attempts for Student (Chaman & Rehan)
  // Arrays: 92% mastery (High), Trees: 45% mastery (Learning Gap < 60%)
  const studentRecord = await prisma.student.findUnique({ where: { userId: demoStudentUser.id } });
  if (studentRecord) {
    // Attempt 1: Arrays Quiz -> 100%
    const arrQuestions = await prisma.question.findMany({
      where: { topicId: topicArrays.id },
      include: { options: true },
    });
    const treeQuestions = await prisma.question.findMany({
      where: { topicId: topicTrees.id },
      include: { options: true },
    });

    const existingAttempts = await prisma.quizAttempt.count({
      where: { studentId: studentRecord.id },
    });

    if (existingAttempts === 0) {
      // Create Week 1 attempt (Arrays strong)
      const attempt1 = await prisma.quizAttempt.create({
        data: {
          studentId: studentRecord.id,
          quizId: weeklyQuiz1.id,
          score: 92,
          timeTaken: 1120,
          submittedAt: new Date(Date.now() - 7 * 86400000),
        },
      });

      for (const q of arrQuestions) {
        const correctOpt = q.options.find(o => o.isCorrect);
        if (correctOpt) {
          await prisma.attemptAnswer.create({
            data: {
              attemptId: attempt1.id,
              questionId: q.id,
              optionId: correctOpt.id,
              isCorrect: true,
            },
          });
        }
      }

      // Create Week 2 attempt (Trees weak -> 45%)
      const attempt2 = await prisma.quizAttempt.create({
        data: {
          studentId: studentRecord.id,
          quizId: weeklyQuiz2.id,
          score: 45,
          timeTaken: 1450,
          submittedAt: new Date(Date.now() - 2 * 86400000),
        },
      });

      for (let i = 0; i < treeQuestions.length; i++) {
        const q = treeQuestions[i];
        // 1st question correct, rest incorrect to simulate 45% / weak grasp
        const isRight = i === 0;
        const opt = isRight
          ? q.options.find(o => o.isCorrect)
          : q.options.find(o => !o.isCorrect) || q.options[0];

        if (opt) {
          await prisma.attemptAnswer.create({
            data: {
              attemptId: attempt2.id,
              questionId: q.id,
              optionId: opt.id,
              isCorrect: isRight,
            },
          });
        }
      }
      console.log('✅ Seeded student quiz attempts (Arrays: 92%, Trees: 45%)');
    }
  }

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

  // 10. Syllabus Documents for RAG Knowledge Base
  const syllabusData = [
    {
      subject: 'Data Structures & Algorithms',
      topic: 'Binary Search Trees',
      content: 'Binary Search Trees (BST) enforce left < root < right invariant. Traversals: In-order traversal yields sorted order. Search, insert, and delete operations take O(h) time, where h is height. Self-balancing AVL and Red-Black trees maintain O(log n) worst-case time by applying rotations.',
    },
    {
      subject: 'Data Structures & Algorithms',
      topic: 'Arrays & Two Pointers',
      content: 'Arrays store contiguous elements with O(1) index access. Two-pointer algorithms, sliding window techniques, and binary search (O(log n)) are fundamental algorithmic paradigms for linear structures.',
    },
    {
      subject: 'Data Structures & Algorithms',
      topic: 'Graph Algorithms & Shortest Path',
      content: 'Graphs are represented via Adjacency Matrix or Adjacency List. BFS uses queues for unweighted shortest paths. DFS uses recursion for cycle detection and topological sorting. Dijkstra algorithm finds shortest paths in weighted graphs using priority queues in O((V+E) log V).',
    },
    {
      subject: 'Data Structures & Algorithms',
      topic: 'Dynamic Programming',
      content: 'Dynamic Programming applies when problems exhibit optimal substructure and overlapping subproblems. Solved via top-down memoization or bottom-up tabulation. Classical examples: 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication.',
    },
    {
      subject: 'Database Management Systems',
      topic: 'Relational Normalization',
      content: 'Normalization eliminates data redundancy and update anomalies. 1NF mandates atomic values. 2NF removes partial key dependencies. 3NF removes transitive dependencies. BCNF strictly requires every determinant to be a candidate key.',
    },
  ];

  for (const s of syllabusData) {
    await prisma.syllabusDocument.create({
      data: {
        subject: s.subject,
        topic: s.topic,
        content: s.content,
      },
    });
  }
  console.log('✅ Seeded Syllabus Documents for RAG');

  // 11. Department Information & Calendar
  const deptInfoData = [
    {
      type: 'EVENT' as const,
      title: 'CS Department Annual Technical Symposium 2026',
      date: new Date('2026-10-22T10:00:00.000Z'),
      description: 'Annual technical symposium featuring keynote by Dr. Ramesh Kumar, student research presentations, and coding competitions in Seminar Hall.',
      targetDept: 'CS',
    },
    {
      type: 'EVENT' as const,
      title: 'Continuous Internal Evaluation (CIE-1) Exams',
      date: new Date('2026-10-15T09:30:00.000Z'),
      description: '5th Semester CIE-1 exam schedule: Data Structures (Oct 15), DBMS (Oct 17), Operating Systems (Oct 20) in Rooms CS-301 to CS-305.',
      targetDept: 'CS',
    },
    {
      type: 'HOLIDAY' as const,
      title: 'Diwali Institutional Holiday Break',
      date: new Date('2026-11-01T00:00:00.000Z'),
      description: 'University closed from November 1st to November 3rd, 2026 for Diwali celebrations. Normal academic classes resume November 4th.',
      targetDept: 'ALL',
    },
    {
      type: 'EVENT' as const,
      title: 'Faculty Advising & Office Hours Directory',
      date: new Date('2026-10-18T14:00:00.000Z'),
      description: 'Dr. Ramesh Kumar (HOD, CS-405, Mon/Wed 2-4 PM), Prof. Sunita Sharma (CS-406, Tue/Thu 11 AM-1 PM), Department Office: Room CS-401.',
      targetDept: 'CS',
    },
  ];

  for (const d of deptInfoData) {
    await prisma.deptInformation.create({
      data: {
        type: d.type,
        title: d.title,
        date: d.date,
        description: d.description,
        targetDept: d.targetDept,
      },
    });
  }
  console.log('✅ Seeded Department Information & Events');

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
