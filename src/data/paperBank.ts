export interface PreviousYearPaper {
  id: string;
  subject: string;
  subjectCode: string;
  semester: string;
  year: string;
  examType: 'mid-sem' | 'end-sem' | 'internal';
  totalMarks: number;
  duration: string;
  questionCount: number;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  fileSize?: string;
  fileName?: string;
  fileData?: string;
  fileType?: string;
}

export interface SubjectPaperGroup {
  subject: string;
  subjectCode: string;
  semester: string;
  accentColor: string;
  papers: PreviousYearPaper[];
}

export const paperBankGroups: SubjectPaperGroup[] = [];
