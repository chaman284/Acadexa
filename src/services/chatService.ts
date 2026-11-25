// ============================================
// CHAT & DEPARTMENT SERVICE — Database & AI Integrated
// ============================================
import api from '../lib/apiClient';
import type { ChatMessage } from '../types/department';
import { departmentInfo, departmentFAQs, departmentEvents } from '../data/collegeInfo';

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

      // If backend was reached and gave a meaningful reply
      if (nexusRes?.content && !nexusRes.content.includes('offline')) {
        return {
          id: nexusRes.id,
          role: 'assistant',
          content: nexusRes.content,
          timestamp: nexusRes.timestamp,
          type: 'department',
        };
      }
    } catch (e) {
      console.warn('sendDepartmentMessage backend call failed, falling back to local department knowledge:', e);
    }

    // High-accuracy client-side fallback from department info & calendar
    const mLower = message.toLowerCase();

    if (['hod', 'head of department', 'pushpalatha', 'contact hod'].some(k => mLower.includes(k))) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `🏛️ **Head of Department (HOD) — AIML**\n\n• **Name**: **${departmentInfo.hod.name}**\n• **Designation**: ${departmentInfo.hod.designation}\n• **Department**: ${departmentInfo.hod.department}\n• **Email**: [${departmentInfo.hod.email}](mailto:${departmentInfo.hod.email})\n• **Cabin**: ${departmentInfo.hod.office}\n• **Phone**: ${departmentInfo.hod.contact}`,
        timestamp: new Date().toISOString(),
        type: 'department',
      };
    }

    if (['vision', 'mission', 'about department', 'overview'].some(k => mLower.includes(k))) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `🌟 **Department of Artificial Intelligence & Machine Learning**\n\n**Vision:**\n> "${departmentInfo.vision}"\n\n**Overview:**\n${departmentInfo.overview}`,
        timestamp: new Date().toISOString(),
        type: 'department',
      };
    }

    if (['synergia', 'fest', 'annual fest', 'hackathon'].some(k => mLower.includes(k))) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `🎉 **SYNERGIA 2026 (Annual Mega Tech & Cultural Fest)**\n\n• **Dates**: November 12th – 14th, 2026\n• **Venue**: Sahyadri Campus & Auditoriums\n• **Events**: 36-hr GenAI Hackathon, Robotics Challenge, Paper Presentations & Cultural Gala.`,
        timestamp: new Date().toISOString(),
        type: 'department',
      };
    }

    const matchedFaq = departmentFAQs.find(f =>
      mLower.split(' ').some(w => w.length > 3 && f.question.toLowerCase().includes(w))
    );
    if (matchedFaq) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `📋 **${matchedFaq.question}**\n\n${matchedFaq.answer}`,
        timestamp: new Date().toISOString(),
        type: 'department',
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content:
        'I am the AI Assistant for the Department of Artificial Intelligence & Machine Learning. You can ask me about Dr. Pushpalatha K (HOD), 3rd & 5th sem CIE exam dates, SEE finals, Course Drop/Withdrawal cutoffs, and SYNERGIA 2026!',
      timestamp: new Date().toISOString(),
      type: 'department',
    };
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
  getDeptInfo: async (dept = 'AIML') => {
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
