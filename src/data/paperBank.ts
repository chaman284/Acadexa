// ============================================================
// QUESTION PAPER BANK — PREVIOUS YEAR PAPERS MOCK DATA
// ============================================================

export interface PreviousYearPaper {
  id: string;
  subject: string;
  subjectCode: string;
  semester: string;
  year: string;        // e.g. "2024-25"
  examType: 'mid-sem' | 'end-sem' | 'internal';
  totalMarks: number;
  duration: string;    // e.g. "3 Hours"
  questionCount: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];      // topics covered
  fileSize?: string;
}

export interface SubjectPaperGroup {
  subject: string;
  subjectCode: string;
  semester: string;
  accentColor: string;
  papers: PreviousYearPaper[];
}

export const paperBankGroups: SubjectPaperGroup[] = [
  {
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS3101',
    semester: '5th Sem',
    accentColor: '#6366f1',
    papers: [
      {
        id: 'p_ds_2425_end',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS3101',
        semester: '5th Sem',
        year: '2024-25',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Dr. Priya Menon',
        uploadedAt: '2025-05-12',
        tags: ['Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Hashing'],
        fileSize: '284 KB',
      },
      {
        id: 'p_ds_2425_mid',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS3101',
        semester: '5th Sem',
        year: '2024-25',
        examType: 'mid-sem',
        totalMarks: 50,
        duration: '2 Hours',
        questionCount: 6,
        uploadedBy: 'Dr. Priya Menon',
        uploadedAt: '2025-02-18',
        tags: ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Recursion'],
        fileSize: '156 KB',
      },
      {
        id: 'p_ds_2324_end',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS3101',
        semester: '5th Sem',
        year: '2023-24',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Dr. Rajan Nair',
        uploadedAt: '2024-05-10',
        tags: ['Heaps', 'AVL Trees', 'BFS/DFS', 'Backtracking'],
        fileSize: '312 KB',
      },
      {
        id: 'p_ds_2324_mid',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS3101',
        semester: '5th Sem',
        year: '2023-24',
        examType: 'mid-sem',
        totalMarks: 50,
        duration: '2 Hours',
        questionCount: 6,
        uploadedBy: 'Dr. Rajan Nair',
        uploadedAt: '2024-02-15',
        tags: ['Arrays', 'Strings', 'Searching'],
        fileSize: '142 KB',
      },
      {
        id: 'p_ds_2223_end',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS3101',
        semester: '5th Sem',
        year: '2022-23',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Dr. Rajan Nair',
        uploadedAt: '2023-05-08',
        tags: ['Trees', 'Graphs', 'Greedy Algorithms'],
        fileSize: '298 KB',
      },
    ],
  },
  {
    subject: 'Cloud Computing',
    subjectCode: 'CS7201',
    semester: '7th Sem',
    accentColor: '#10b981',
    papers: [
      {
        id: 'p_cc_2425_end',
        subject: 'Cloud Computing',
        subjectCode: 'CS7201',
        semester: '7th Sem',
        year: '2024-25',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Dr. Sunita Rao',
        uploadedAt: '2025-05-14',
        tags: ['Kubernetes', 'Microservices', 'Docker', 'CI/CD', 'Load Balancing'],
        fileSize: '268 KB',
      },
      {
        id: 'p_cc_2425_mid',
        subject: 'Cloud Computing',
        subjectCode: 'CS7201',
        semester: '7th Sem',
        year: '2024-25',
        examType: 'mid-sem',
        totalMarks: 50,
        duration: '2 Hours',
        questionCount: 6,
        uploadedBy: 'Dr. Sunita Rao',
        uploadedAt: '2025-02-20',
        tags: ['IaaS', 'PaaS', 'SaaS', 'Virtualization'],
        fileSize: '148 KB',
      },
      {
        id: 'p_cc_2324_end',
        subject: 'Cloud Computing',
        subjectCode: 'CS7201',
        semester: '7th Sem',
        year: '2023-24',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Dr. Sunita Rao',
        uploadedAt: '2024-05-16',
        tags: ['AWS', 'Azure', 'Serverless', 'Containers'],
        fileSize: '290 KB',
      },
    ],
  },
  {
    subject: 'Database Management Systems',
    subjectCode: 'CS2201',
    semester: '3rd Sem',
    accentColor: '#f97316',
    papers: [
      {
        id: 'p_db_2425_end',
        subject: 'Database Management Systems',
        subjectCode: 'CS2201',
        semester: '3rd Sem',
        year: '2024-25',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Prof. Amita Verma',
        uploadedAt: '2025-05-11',
        tags: ['Normalization', 'ACID', 'Transactions', 'Query Optimization', 'SQL Joins'],
        fileSize: '275 KB',
      },
      {
        id: 'p_db_2425_mid',
        subject: 'Database Management Systems',
        subjectCode: 'CS2201',
        semester: '3rd Sem',
        year: '2024-25',
        examType: 'mid-sem',
        totalMarks: 50,
        duration: '2 Hours',
        questionCount: 6,
        uploadedBy: 'Prof. Amita Verma',
        uploadedAt: '2025-02-22',
        tags: ['ER Modeling', 'SQL Basics', 'DDL/DML'],
        fileSize: '163 KB',
      },
      {
        id: 'p_db_2324_end',
        subject: 'Database Management Systems',
        subjectCode: 'CS2201',
        semester: '3rd Sem',
        year: '2023-24',
        examType: 'end-sem',
        totalMarks: 100,
        duration: '3 Hours',
        questionCount: 10,
        uploadedBy: 'Prof. Amita Verma',
        uploadedAt: '2024-05-09',
        tags: ['BCNF', 'Stored Procedures', 'Indexing', 'Concurrency Control'],
        fileSize: '310 KB',
      },
      {
        id: 'p_db_2324_mid',
        subject: 'Database Management Systems',
        subjectCode: 'CS2201',
        semester: '3rd Sem',
        year: '2023-24',
        examType: 'mid-sem',
        totalMarks: 50,
        duration: '2 Hours',
        questionCount: 6,
        uploadedBy: 'Prof. Amita Verma',
        uploadedAt: '2024-02-19',
        tags: ['ER Diagrams', 'Relational Algebra'],
        fileSize: '138 KB',
      },
    ],
  },
];
