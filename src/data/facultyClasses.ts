export interface FacultyClass {
  id: string;
  subject: string;
  subjectCode: string;
  semester: string;
  section: string;
  studentsCount: number;
  avgScore: number;
  activeQuizCount: number;
  pendingReviewCount: number;
  lastQuizDate: string;
  trend: 'improving' | 'stable' | 'declining';
  weeklyPerformance: { label: string; score: number }[];
  weakTopics: { topicName: string; score: number }[];
}

export const facultyClasses: FacultyClass[] = [];
