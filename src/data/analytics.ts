import type {
  PerformancePoint,
  ClassTopicPerformance,
  ClassPerformanceMatrix,
  StudentNeedingAttention,
  DifficultQuestion,
  RecentActivity,
  LearningGap,
} from '../types/analytics';

// Student weekly performance data
export const studentWeeklyPerformance: PerformancePoint[] = [
  { label: 'Week 1', score: 62, average: 60 },
  { label: 'Week 2', score: 68, average: 63 },
  { label: 'Week 3', score: 71, average: 65 },
  { label: 'Week 4', score: 75, average: 67 },
  { label: 'Week 5', score: 78, average: 70 },
  { label: 'Week 6', score: 82, average: 72 },
];

export const studentMonthlyPerformance: PerformancePoint[] = [
  { label: 'Jun', score: 58, average: 57 },
  { label: 'Jul', score: 63, average: 61 },
  { label: 'Aug', score: 69, average: 64 },
  { label: 'Sep', score: 74, average: 67 },
  { label: 'Oct', score: 78, average: 70 },
];

export const studentSemesterPerformance: PerformancePoint[] = [
  { label: 'Sem 1', score: 65 },
  { label: 'Sem 2', score: 68 },
  { label: 'Sem 3', score: 71 },
  { label: 'Sem 4', score: 74 },
  { label: 'Sem 5', score: 78 },
];

// Class performance data for faculty
export const classWeeklyPerformance: PerformancePoint[] = [
  { label: 'Week 1', score: 58 },
  { label: 'Week 2', score: 62 },
  { label: 'Week 3', score: 64 },
  { label: 'Week 4', score: 67 },
  { label: 'Week 5', score: 70 },
  { label: 'Week 6', score: 74 },
];

export const classTopicPerformance: ClassTopicPerformance[] = [
  { topicId: 't5', topicName: 'Binary Trees', courseId: 'c1', courseName: 'Data Structures', unitName: 'Unit 3', averageScore: 48, participationRate: 95, trend: 'declining' },
  { topicId: 't8', topicName: 'Graphs', courseId: 'c1', courseName: 'Data Structures', unitName: 'Unit 4', averageScore: 56, participationRate: 92, trend: 'improving' },
  { topicId: 't13', topicName: 'Normalization', courseId: 'c2', courseName: 'DBMS', unitName: 'Unit 2', averageScore: 61, participationRate: 94, trend: 'stable' },
  { topicId: 't15', topicName: 'CPU Scheduling', courseId: 'c3', courseName: 'Operating Systems', unitName: 'Unit 1', averageScore: 72, participationRate: 90, trend: 'stable' },
  { topicId: 't1', topicName: 'Arrays', courseId: 'c1', courseName: 'Data Structures', unitName: 'Unit 1', averageScore: 87, participationRate: 98, trend: 'improving' },
  { topicId: 't17', topicName: 'Paging & Segmentation', courseId: 'c3', courseName: 'Operating Systems', unitName: 'Unit 2', averageScore: 44, participationRate: 88, trend: 'declining' },
  { topicId: 't11', topicName: 'ER Modeling', courseId: 'c2', courseName: 'DBMS', unitName: 'Unit 1', averageScore: 78, participationRate: 96, trend: 'stable' },
];

export const classPerformanceMatrix: ClassPerformanceMatrix[] = [
  {
    courseId: 'c1',
    courseName: 'Data Structures',
    units: [
      { unitName: 'Unit 1 (Arrays)', averageScore: 82 },
      { unitName: 'Unit 2 (Linked Lists)', averageScore: 71 },
      { unitName: 'Unit 3 (Trees)', averageScore: 48 },
      { unitName: 'Unit 4 (Graphs)', averageScore: 56 },
    ],
  },
  {
    courseId: 'c2',
    courseName: 'DBMS',
    units: [
      { unitName: 'Unit 1 (ER Model)', averageScore: 78 },
      { unitName: 'Unit 2 (Normalization)', averageScore: 61 },
    ],
  },
  {
    courseId: 'c3',
    courseName: 'Operating Systems',
    units: [
      { unitName: 'Unit 1 (Processes)', averageScore: 72 },
      { unitName: 'Unit 2 (Memory)', averageScore: 44 },
    ],
  },
  {
    courseId: 'c4',
    courseName: 'Computer Networks',
    units: [
      { unitName: 'Unit 1 (Basics)', averageScore: 76 },
    ],
  },
];

export const studentsNeedingAttention: StudentNeedingAttention[] = [
  { studentId: 'stu005', displayId: 'STU-049', weakTopics: ['Trees', 'Paging', 'Normalization'], lastQuizScore: 41, trend: 'declining' },
  { studentId: 'stu008', displayId: 'STU-052', weakTopics: ['Graphs', 'BCNF'], lastQuizScore: 48, trend: 'stable' },
  { studentId: 'stu010', displayId: 'STU-054', weakTopics: ['Trees', 'Graphs', 'Memory Mgmt'], lastQuizScore: 38, trend: 'declining' },
  { studentId: 'stu011', displayId: 'STU-056', weakTopics: ['Normalization', 'Paging'], lastQuizScore: 52, trend: 'stable' },
];

export const difficultQuestions: DifficultQuestion[] = [
  { questionId: 'qs3', questionText: 'A relation is in BCNF if for every non-trivial FD X → Y, X is a ___', courseName: 'DBMS', topicName: 'BCNF', correctRate: 43, attempts: 58 },
  { questionId: 'qs6', questionText: 'Explain the difference between paging and segmentation.', courseName: 'OS', topicName: 'Memory Mgmt', correctRate: 38, attempts: 55 },
  { questionId: 'qs7', questionText: 'What is the worst-case time complexity of AVL tree insertion?', courseName: 'Data Structures', topicName: 'Trees', correctRate: 47, attempts: 62 },
  { questionId: 'qs8', questionText: 'Describe Dijkstra\'s algorithm for shortest path.', courseName: 'Data Structures', topicName: 'Graphs', correctRate: 51, attempts: 60 },
];

export const recentActivities: RecentActivity[] = [
  { id: 'ra1', type: 'quiz_submitted', description: 'Week 5 Quiz — Trees & Heaps submitted by 59/62 students', timestamp: '2026-10-01T10:30:00Z' },
  { id: 'ra2', type: 'quiz_created', description: 'Week 6 Quiz scheduled for Data Structures', timestamp: '2026-09-30T14:00:00Z' },
  { id: 'ra3', type: 'remedial_generated', description: 'Remedial quiz generated for Trees topic (18 students)', timestamp: '2026-09-30T09:00:00Z' },
  { id: 'ra4', type: 'question_added', description: '5 new AI-generated questions added to question bank', timestamp: '2026-09-29T16:45:00Z' },
];

export const studentLearningGaps: LearningGap[] = [
  { topicId: 't5', topicName: 'Binary Trees', courseId: 'c1', courseName: 'Data Structures', gapSeverity: 'high', currentScore: 51, targetScore: 75, recommendedQuestions: 8 },
  { topicId: 't17', topicName: 'Paging & Segmentation', courseId: 'c3', courseName: 'OS', gapSeverity: 'high', currentScore: 44, targetScore: 70, recommendedQuestions: 6 },
  { topicId: 't13', topicName: 'Normalization', courseId: 'c2', courseName: 'DBMS', gapSeverity: 'medium', currentScore: 58, targetScore: 75, recommendedQuestions: 5 },
  { topicId: 't8', topicName: 'Graphs', courseId: 'c1', courseName: 'Data Structures', gapSeverity: 'medium', currentScore: 63, targetScore: 75, recommendedQuestions: 4 },
  { topicId: 't15', topicName: 'CPU Scheduling', courseId: 'c3', courseName: 'OS', gapSeverity: 'low', currentScore: 69, targetScore: 80, recommendedQuestions: 3 },
];
