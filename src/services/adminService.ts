import api from '../lib/apiClient';

export interface AdminSummary {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalSections: number;
  activeCourses: number;
  overallPerformance: number | null;
  totalAttempts: number;
  passRate: number | null;
  participationRate: number;
}

export interface YearWiseData {
  year: string;
  yearNumber: number;
  studentsCount: number;
  attemptsCount: number;
  averageScore: number | null;
}

export interface SectionWiseData {
  sectionId: string;
  sectionName: string;
  semester: number;
  year: number;
  department: string;
  studentCount: number;
  attemptsCount: number;
  averageScore: number | null;
}

export interface CourseWiseData {
  subjectId: string;
  name: string;
  code: string;
  department: string;
  assignmentsCount: number;
  attemptsCount: number;
  averageScore: number | null;
  passRate: number | null;
}

export interface ParticipationData {
  totalEligibleStudents: number;
  totalParticipatingStudents: number;
  participationRate: number;
  totalAttempts: number;
}

export interface OverviewResponse {
  summary: AdminSummary;
  analytics: {
    yearWise: YearWiseData[];
    sectionWise: SectionWiseData[];
    courseWise: CourseWiseData[];
    participation: ParticipationData;
  };
  departments: { id: string; name: string; code: string }[];
}

export interface FacultyAssignment {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  sectionId: string;
  sectionName: string;
  semester: number;
  department: string;
}

export interface FacultyRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  coursesCount: number;
  sectionsCount: number;
  assignments: FacultyAssignment[];
}

export interface CourseRecord {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  status: 'Assigned' | 'Awaiting Assignment';
  facultyCount: number;
  sectionsCount: number;
  assignments: {
    id: string;
    facultyId: string;
    facultyName: string;
    facultyEmail: string;
    sectionId: string;
    sectionName: string;
    semester: number;
  }[];
  quizzesCount: number;
}

export interface StudentRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  rollNo: string;
  avatarUrl?: string;
  semester: number;
  year: number;
  sectionId: string;
  sectionName: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  createdAt: string;
  quizAttemptsCount: number;
  averageScore: number | null;
}

export interface SectionRecord {
  id: string;
  name: string;
  semester: number;
  year: number;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  studentsCount: number;
  assignmentsCount: number;
  quizzesCount: number;
  faculty: string[];
}

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
}

export const adminService = {
  getOverview: async (departmentId?: string, timeRange?: string): Promise<OverviewResponse> => {
    const params: any = {};
    if (departmentId) params.departmentId = departmentId;
    if (timeRange) params.timeRange = timeRange;
    const res = await api.get('/admin/overview', { params });
    return res.data;
  },

  getFaculty: async (params?: { search?: string; departmentId?: string; subjectId?: string; sectionId?: string }): Promise<FacultyRecord[]> => {
    const res = await api.get('/admin/faculty', { params });
    return res.data;
  },

  getFacultyDetails: async (id: string): Promise<FacultyRecord> => {
    const res = await api.get(`/admin/faculty/${id}`);
    return res.data;
  },

  assignFaculty: async (data: { facultyId: string; subjectId: string; sectionId: string }) => {
    const res = await api.post('/admin/faculty/assign', data);
    return res.data;
  },

  removeAssignment: async (id: string) => {
    const res = await api.delete(`/admin/faculty/assignment/${id}`);
    return res.data;
  },

  getCourses: async (params?: { search?: string; departmentId?: string }): Promise<CourseRecord[]> => {
    const res = await api.get('/admin/courses', { params });
    return res.data;
  },

  createCourse: async (data: { name: string; code: string; departmentId: string }) => {
    const res = await api.post('/admin/courses', data);
    return res.data;
  },

  updateCourse: async (id: string, data: { name?: string; code?: string; departmentId?: string }) => {
    const res = await api.put(`/admin/courses/${id}`, data);
    return res.data;
  },

  getStudents: async (params?: { search?: string; year?: number | string; semester?: number | string; departmentId?: string; sectionId?: string }): Promise<StudentRecord[]> => {
    const res = await api.get('/admin/students', { params });
    return res.data;
  },

  createStudent: async (data: { name: string; email: string; rollNo: string; sectionId: string; password?: string }) => {
    const res = await api.post('/admin/students', data);
    return res.data;
  },

  updateStudentSection: async (studentId: string, sectionId: string) => {
    const res = await api.put(`/admin/students/${studentId}/section`, { sectionId });
    return res.data;
  },

  getSections: async (departmentId?: string): Promise<SectionRecord[]> => {
    const params = departmentId ? { departmentId } : {};
    const res = await api.get('/admin/sections', { params });
    return res.data;
  },

  createSection: async (data: { name: string; semester: number; departmentId: string }) => {
    const res = await api.post('/admin/sections', data);
    return res.data;
  },

  getDepartments: async (): Promise<DepartmentRecord[]> => {
    const res = await api.get('/admin/departments');
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/admin/notifications');
    return res.data;
  },

  createNotification: async (data: { title: string; message: string; type?: string; role?: string; targetUserId?: string }) => {
    const res = await api.post('/admin/notifications', data);
    return res.data;
  },
};
