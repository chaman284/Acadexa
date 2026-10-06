// ============================================
// DEPARTMENT & CHAT TYPES
// ============================================

export interface DepartmentEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'event' | 'exam' | 'deadline' | 'announcement';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  postedAt: string;
  isPinned: boolean;
  category: 'general' | 'exam' | 'placement' | 'academic';
}

export interface TimetableEntry {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  facultyName: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial';
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  subjects: string[];
  email: string;
  office?: string;
}

export interface DepartmentFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'tutor' | 'department';
}
