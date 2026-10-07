// ============================================
// FACULTY CLASS TYPES & MOCK DATA
// ============================================

export interface FacultyClass {
  id: string;
  subject: string;
  subjectCode: string;
  semester: string;
  section: string;
  studentsCount: number;
  avgScore: number;          // latest quiz avg %
  activeQuizCount: number;
  pendingReviewCount: number;
  lastQuizDate: string;
  trend: 'improving' | 'stable' | 'declining';
  // per-class weekly performance for chart
  weeklyPerformance: { label: string; score: number }[];
  // weak topics for this class
  weakTopics: { topicName: string; score: number }[];
}

export const facultyClasses: FacultyClass[] = [
  {
    id: 'sec_5a_ds',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS3101',
    semester: '5th Sem',
    section: '5A',
    studentsCount: 72,
    avgScore: 74,
    activeQuizCount: 1,
    pendingReviewCount: 8,
    lastQuizDate: '2026-10-01',
    trend: 'improving',
    weeklyPerformance: [
      { label: 'Wk 1', score: 58 }, { label: 'Wk 2', score: 63 },
      { label: 'Wk 3', score: 65 }, { label: 'Wk 4', score: 69 },
      { label: 'Wk 5', score: 72 }, { label: 'Wk 6', score: 74 },
    ],
    weakTopics: [
      { topicName: 'Binary Trees', score: 48 },
      { topicName: 'Graphs', score: 56 },
      { topicName: 'Dynamic Programming', score: 61 },
      { topicName: 'Heap Sort', score: 65 },
      { topicName: 'Linked Lists', score: 71 },
    ],
  },
  {
    id: 'sec_5b_ds',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS3101',
    semester: '5th Sem',
    section: '5B',
    studentsCount: 68,
    avgScore: 68,
    activeQuizCount: 1,
    pendingReviewCount: 5,
    lastQuizDate: '2026-10-01',
    trend: 'stable',
    weeklyPerformance: [
      { label: 'Wk 1', score: 55 }, { label: 'Wk 2', score: 59 },
      { label: 'Wk 3', score: 61 }, { label: 'Wk 4', score: 64 },
      { label: 'Wk 5', score: 67 }, { label: 'Wk 6', score: 68 },
    ],
    weakTopics: [
      { topicName: 'Binary Trees', score: 44 },
      { topicName: 'Graphs', score: 51 },
      { topicName: 'Sorting Algorithms', score: 58 },
      { topicName: 'Recursion', score: 63 },
      { topicName: 'Stacks & Queues', score: 70 },
    ],
  },
  {
    id: 'sec_7c_cc',
    subject: 'Cloud Computing',
    subjectCode: 'CS7201',
    semester: '7th Sem',
    section: '7C',
    studentsCount: 70,
    avgScore: 81,
    activeQuizCount: 0,
    pendingReviewCount: 12,
    lastQuizDate: '2026-09-28',
    trend: 'improving',
    weeklyPerformance: [
      { label: 'Wk 1', score: 70 }, { label: 'Wk 2', score: 74 },
      { label: 'Wk 3', score: 76 }, { label: 'Wk 4', score: 78 },
      { label: 'Wk 5', score: 80 }, { label: 'Wk 6', score: 81 },
    ],
    weakTopics: [
      { topicName: 'Kubernetes', score: 54 },
      { topicName: 'Microservices', score: 62 },
      { topicName: 'Load Balancing', score: 68 },
      { topicName: 'CI/CD Pipelines', score: 71 },
      { topicName: 'Docker', score: 76 },
    ],
  },
  {
    id: 'sec_3a_db',
    subject: 'Database Management Systems',
    subjectCode: 'CS2201',
    semester: '3rd Sem',
    section: '3A',
    studentsCount: 75,
    avgScore: 62,
    activeQuizCount: 2,
    pendingReviewCount: 14,
    lastQuizDate: '2026-10-03',
    trend: 'declining',
    weeklyPerformance: [
      { label: 'Wk 1', score: 68 }, { label: 'Wk 2', score: 66 },
      { label: 'Wk 3', score: 65 }, { label: 'Wk 4', score: 64 },
      { label: 'Wk 5', score: 63 }, { label: 'Wk 6', score: 62 },
    ],
    weakTopics: [
      { topicName: 'Normalization (BCNF)', score: 41 },
      { topicName: 'Transactions & ACID', score: 49 },
      { topicName: 'Query Optimization', score: 55 },
      { topicName: 'ER Modeling', score: 63 },
      { topicName: 'SQL Joins', score: 69 },
    ],
  },
];
