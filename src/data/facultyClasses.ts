export interface FacultyClass {
  id: string;
  sectionId?: string;
  subjectId?: string;
  subject: string;
  subjectCode: string;
  semester: string;
  section: string;
  sectionName?: string;
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
