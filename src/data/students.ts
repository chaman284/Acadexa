import type { Student, LeaderboardEntry, TopicPerformance } from '../types/student';

export const mockCurrentStudent: Student = {
  id: '',
  name: 'Student',
  email: '',
  rollNumber: '',
  semester: 0,
  department: '',
  enrolledCourses: [],
  quizAverage: 0,
  streak: 0,
  learningProgress: 0,
};

export const mockStudents: Student[] = [];

export const mockLeaderboard: LeaderboardEntry[] = [];

export const mockTopicPerformance: TopicPerformance[] = [];
