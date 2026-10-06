import type { Student, LeaderboardEntry, TopicPerformance } from '../types/student';

export const mockCurrentStudent: Student = {
  id: 'stu001',
  name: 'Chaman',
  email: 'chaman@cs.college.edu',
  rollNumber: '21CS045',
  semester: 5,
  department: 'Computer Science',
  enrolledCourses: ['c1', 'c2', 'c3', 'c4'],
  quizAverage: 78,
  streak: 7,
  learningProgress: 12,
};

export const mockStudents: Student[] = [
  mockCurrentStudent,
  {
    id: 'stu002', name: 'Priya Nair', email: 'priya@cs.college.edu', rollNumber: '21CS046',
    semester: 5, department: 'Computer Science', enrolledCourses: ['c1', 'c2', 'c3', 'c4'],
    quizAverage: 82, streak: 12, learningProgress: 18,
  },
  {
    id: 'stu003', name: 'Arjun Verma', email: 'arjun@cs.college.edu', rollNumber: '21CS047',
    semester: 5, department: 'Computer Science', enrolledCourses: ['c1', 'c2', 'c3', 'c4'],
    quizAverage: 74, streak: 5, learningProgress: 8,
  },
  {
    id: 'stu004', name: 'Sneha Kapoor', email: 'sneha@cs.college.edu', rollNumber: '21CS048',
    semester: 5, department: 'Computer Science', enrolledCourses: ['c1', 'c2', 'c3', 'c4'],
    quizAverage: 91, streak: 21, learningProgress: 24,
  },
  {
    id: 'stu005', name: 'Rohit Singh', email: 'rohit@cs.college.edu', rollNumber: '21CS049',
    semester: 5, department: 'Computer Science', enrolledCourses: ['c1', 'c2', 'c3', 'c4'],
    quizAverage: 69, streak: 3, learningProgress: 5,
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, studentId: 'stu004', studentName: 'Sneha Kapoor', score: 91, change: 'same', changeValue: 0 },
  { rank: 2, studentId: 'stu002', studentName: 'Priya Nair', score: 82, change: 'up', changeValue: 1 },
  { rank: 3, studentId: 'stu001', studentName: 'Chaman', score: 78, change: 'up', changeValue: 2 },
  { rank: 4, studentId: 'stu003', studentName: 'Arjun Verma', score: 74, change: 'down', changeValue: 1 },
  { rank: 5, studentId: 'stu005', studentName: 'Rohit Singh', score: 69, change: 'down', changeValue: 1 },
  { rank: 6, studentId: 'stu006', studentName: 'Divya Rao', score: 65, change: 'up', changeValue: 3 },
  { rank: 7, studentId: 'stu007', studentName: 'Manish Gupta', score: 61, change: 'same', changeValue: 0 },
  { rank: 8, studentId: 'stu008', studentName: 'Anjali Reddy', score: 58, change: 'down', changeValue: 2 },
];

export const mockTopicPerformance: TopicPerformance[] = [
  { topicId: 't1', topicName: 'Arrays', subjectName: 'Data Structures', score: 92, category: 'strong', questionsAttempted: 24 },
  { topicId: 't2', topicName: 'Linked Lists', subjectName: 'Data Structures', score: 78, category: 'strong', questionsAttempted: 18 },
  { topicId: 't4', topicName: 'Stacks & Queues', subjectName: 'Data Structures', score: 84, category: 'strong', questionsAttempted: 16 },
  { topicId: 't5', topicName: 'Trees', subjectName: 'Data Structures', score: 51, category: 'needs-practice', questionsAttempted: 22 },
  { topicId: 't8', topicName: 'Graphs', subjectName: 'Data Structures', score: 63, category: 'improving', questionsAttempted: 14 },
  { topicId: 't13', topicName: 'Normalization', subjectName: 'DBMS', score: 58, category: 'needs-practice', questionsAttempted: 20 },
  { topicId: 't11', topicName: 'ER Modeling', subjectName: 'DBMS', score: 81, category: 'strong', questionsAttempted: 15 },
  { topicId: 't15', topicName: 'CPU Scheduling', subjectName: 'OS', score: 69, category: 'improving', questionsAttempted: 12 },
  { topicId: 't17', topicName: 'Paging', subjectName: 'OS', score: 44, category: 'needs-practice', questionsAttempted: 10 },
  { topicId: 't19', topicName: 'OSI Model', subjectName: 'Networks', score: 76, category: 'strong', questionsAttempted: 13 },
];
