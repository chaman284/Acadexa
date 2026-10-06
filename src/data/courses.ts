import type { Course } from '../types/course';

export const mockCourses: Course[] = [
  {
    id: 'c1',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    semester: 5,
    department: 'Computer Science',
    creditHours: 4,
    facultyId: 'f1',
    facultyName: 'Dr. Ramesh Kumar',
    color: '#6366f1',
    progress: 72,
    nextQuizDate: '2026-10-08',
    nextQuizTopic: 'Graph Algorithms',
    units: [
      {
        id: 'u1', courseId: 'c1', unitNumber: 1, name: 'Arrays & Strings', isCompleted: true,
        topics: [
          { id: 't1', unitId: 'u1', name: 'Array Operations', difficulty: 'easy' },
          { id: 't2', unitId: 'u1', name: 'String Manipulation', difficulty: 'medium' },
        ],
      },
      {
        id: 'u2', courseId: 'c1', unitNumber: 2, name: 'Linked Lists & Stacks', isCompleted: true,
        topics: [
          { id: 't3', unitId: 'u2', name: 'Singly Linked List', difficulty: 'medium' },
          { id: 't4', unitId: 'u2', name: 'Stack & Queue', difficulty: 'medium' },
        ],
      },
      {
        id: 'u3', courseId: 'c1', unitNumber: 3, name: 'Trees & Heaps', isCompleted: false,
        topics: [
          { id: 't5', unitId: 'u3', name: 'Binary Trees', difficulty: 'hard' },
          { id: 't6', unitId: 'u3', name: 'Tree Traversals', difficulty: 'hard' },
          { id: 't7', unitId: 'u3', name: 'Heaps', difficulty: 'hard' },
        ],
      },
      {
        id: 'u4', courseId: 'c1', unitNumber: 4, name: 'Graphs', isCompleted: false,
        topics: [
          { id: 't8', unitId: 'u4', name: 'Graph Representation', difficulty: 'medium' },
          { id: 't9', unitId: 'u4', name: 'BFS & DFS', difficulty: 'hard' },
          { id: 't10', unitId: 'u4', name: 'Shortest Paths', difficulty: 'hard' },
        ],
      },
    ],
  },
  {
    id: 'c2',
    name: 'Database Management Systems',
    code: 'CS302',
    semester: 5,
    department: 'Computer Science',
    creditHours: 4,
    facultyId: 'f2',
    facultyName: 'Prof. Sunita Sharma',
    color: '#22c55e',
    progress: 58,
    nextQuizDate: '2026-10-10',
    nextQuizTopic: 'Query Optimization',
    units: [
      {
        id: 'u5', courseId: 'c2', unitNumber: 1, name: 'ER Modeling', isCompleted: true,
        topics: [
          { id: 't11', unitId: 'u5', name: 'Entity Relationships', difficulty: 'easy' },
          { id: 't12', unitId: 'u5', name: 'Schema Design', difficulty: 'medium' },
        ],
      },
      {
        id: 'u6', courseId: 'c2', unitNumber: 2, name: 'Normalization', isCompleted: false,
        topics: [
          { id: 't13', unitId: 'u6', name: '1NF to 3NF', difficulty: 'medium' },
          { id: 't14', unitId: 'u6', name: 'BCNF', difficulty: 'hard' },
        ],
      },
    ],
  },
  {
    id: 'c3',
    name: 'Operating Systems',
    code: 'CS303',
    semester: 5,
    department: 'Computer Science',
    creditHours: 3,
    facultyId: 'f3',
    facultyName: 'Dr. Arvind Mehta',
    color: '#f59e0b',
    progress: 45,
    nextQuizDate: '2026-10-12',
    nextQuizTopic: 'Memory Management',
    units: [
      {
        id: 'u7', courseId: 'c3', unitNumber: 1, name: 'Process Management', isCompleted: true,
        topics: [
          { id: 't15', unitId: 'u7', name: 'Processes & Threads', difficulty: 'easy' },
          { id: 't16', unitId: 'u7', name: 'CPU Scheduling', difficulty: 'medium' },
        ],
      },
      {
        id: 'u8', courseId: 'c3', unitNumber: 2, name: 'Memory Management', isCompleted: false,
        topics: [
          { id: 't17', unitId: 'u8', name: 'Paging & Segmentation', difficulty: 'hard' },
          { id: 't18', unitId: 'u8', name: 'Virtual Memory', difficulty: 'hard' },
        ],
      },
    ],
  },
  {
    id: 'c4',
    name: 'Computer Networks',
    code: 'CS304',
    semester: 5,
    department: 'Computer Science',
    creditHours: 3,
    facultyId: 'f4',
    facultyName: 'Prof. Meena Patel',
    color: '#ef4444',
    progress: 38,
    nextQuizDate: '2026-10-14',
    nextQuizTopic: 'TCP/IP Stack',
    units: [
      {
        id: 'u9', courseId: 'c4', unitNumber: 1, name: 'Network Basics', isCompleted: true,
        topics: [
          { id: 't19', unitId: 'u9', name: 'OSI Model', difficulty: 'easy' },
          { id: 't20', unitId: 'u9', name: 'TCP/IP', difficulty: 'medium' },
        ],
      },
    ],
  },
];
