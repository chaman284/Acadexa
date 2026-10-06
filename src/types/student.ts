// ============================================
// STUDENT TYPES
// ============================================

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  semester: number;
  department: string;
  avatarUrl?: string;
  enrolledCourses: string[];
  quizAverage: number;
  streak: number;
  learningProgress: number;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  change: 'up' | 'down' | 'same';
  changeValue: number;
  avatarUrl?: string;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  score: number;
  category: 'strong' | 'needs-practice' | 'improving';
  questionsAttempted: number;
}
