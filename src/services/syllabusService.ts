import api from '../lib/apiClient';
import type { CourseSyllabus } from '../types/course';

interface FacultySyllabusResponse {
  class: {
    id: string;
    subject: string;
    subjectCode: string;
    section: string;
    sectionName: string;
    semester: number;
  };
  syllabus: CourseSyllabus;
}

export interface SyllabusSavePayload {
  modules: CourseSyllabus['modules'];
  isPublished: boolean;
}

export const syllabusService = {
  getFacultyClass: async (classId: string): Promise<FacultySyllabusResponse> => {
    const { data } = await api.get<FacultySyllabusResponse>(`/syllabus/class/${classId}`);
    return data;
  },

  saveFacultyClass: async (classId: string, payload: SyllabusSavePayload): Promise<CourseSyllabus> => {
    const { data } = await api.put<{ syllabus: CourseSyllabus }>(`/syllabus/class/${classId}`, payload);
    return data.syllabus;
  },

  getStudentSyllabi: async (): Promise<CourseSyllabus[]> => {
    const { data } = await api.get<{ syllabi: CourseSyllabus[] }>('/syllabus/student');
    return data.syllabi || [];
  },
};
