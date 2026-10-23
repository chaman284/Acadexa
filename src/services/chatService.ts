// ============================================
// CHAT & DEPARTMENT SERVICE — Database & AI Integrated
// ============================================
import api from '../lib/apiClient';
import type { ChatMessage } from '../types/department';

export const chatService = {
  /**
   * POST /api/chatbot (Gemini LLM proxy)
   */
  sendTutorMessage: async (message: string, conversationHistory: ChatMessage[]): Promise<ChatMessage> => {
    try {
      const res = await api.post('/chatbot', {
        message,
        history: conversationHistory.map(h => ({
          sender: h.role === 'user' ? 'user' : 'model',
          text: h.content,
        })),
      });
      if (res.data?.reply) {
        return {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toISOString(),
          type: 'tutor',
        };
      }
    } catch (e: any) {
      console.warn('Backend tutor chatbot error:', e);
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: e?.response?.data?.message || 'I am currently unable to process your request. Please ensure the backend server and AI service are active.',
        timestamp: new Date().toISOString(),
        type: 'tutor',
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: 'No response received from tutor service.',
      timestamp: new Date().toISOString(),
      type: 'tutor',
    };
  },

  /**
   * POST /api/chatbot (Nexus RAG Department AI Assistant)
   */
  sendNexusMessage: async (
    message: string,
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<{ id: string; role: 'assistant'; content: string; timestamp: string; sources?: { syllabus: string[]; dept: string[] } }> => {
    try {
      const res = await api.post('/chatbot', {
        message,
        history: conversationHistory.map(h => ({
          sender: h.role === 'user' ? 'user' : 'model',
          text: h.content,
        })),
      });
      if (res.data?.reply) {
        return {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: res.data.reply,
          timestamp: new Date().toISOString(),
          sources: res.data.contextSources,
        };
      }
    } catch (e: any) {
      console.warn('Backend Nexus chatbot error:', e);
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: e?.response?.data?.message || 'Department AI Assistant is currently offline. Please try again later.',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: 'No response from department AI assistant.',
      timestamp: new Date().toISOString(),
    };
  },

  sendDepartmentMessage: async (
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatMessage> => {
    try {
      const nexusRes = await chatService.sendNexusMessage(
        message,
        conversationHistory.map(h => ({ role: h.role, content: h.content }))
      );
      return {
        id: nexusRes.id,
        role: 'assistant',
        content: nexusRes.content,
        timestamp: nexusRes.timestamp,
        type: 'department',
      };
    } catch (e) {
      console.warn('sendDepartmentMessage fallback:', e);
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'I can help you with information about the CS department. You can ask me about upcoming events, examinations, faculty, timetables, or general academic policies.',
        timestamp: new Date().toISOString(),
        type: 'department',
      };
    }
  },
};

export const departmentService = {
  /** POST /api/dept/upload-calendar (Gemini Vision Extractor) */
  uploadCalendar: async (fileOrFormData: File | FormData) => {
    let formData: FormData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('calendar', fileOrFormData);
    }

    const res = await api.post('/dept/upload-calendar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /** GET /api/dept/info */
  getDeptInfo: async (dept = 'CS') => {
    try {
      const res = await api.get(`/dept/info?dept=${dept}`);
      if (res.data?.data) return res.data.data;
    } catch (e) {
      console.warn('API getDeptInfo error:', e);
    }
    return [];
  },

  /** GET /api/dept/events */
  getEvents: async () => {
    try {
      const res = await api.get('/dept/info');
      if (Array.isArray(res.data?.data)) return res.data.data;
    } catch (e) {
      console.warn('API getEvents error:', e);
    }
    return [];
  },

  getAnnouncements: async () => [],
  getTimetable: async () => [],
  getFaculty: async () => [],
  getFAQs: async () => [],
};
