// ============================================
// CHAT SERVICE — Stub for future AI/RAG backend
// ============================================
import type { ChatMessage } from '../types/department';

const tutorResponses: Record<string, string> = {
  'normalization': 'Normalization is the process of organizing a relational database to reduce data redundancy and improve data integrity. The main normal forms are 1NF, 2NF, 3NF, and BCNF. Each form eliminates specific types of anomalies.',
  'trees': 'A tree is a hierarchical data structure with a root node and subtrees of children. Key operations include insertion, deletion, and traversal (pre-order, in-order, post-order). Binary Search Trees maintain the property that left child < parent < right child.',
  'graphs': 'Graphs consist of vertices (nodes) and edges. They can be directed or undirected, weighted or unweighted. Common algorithms include BFS (uses queue), DFS (uses stack/recursion), Dijkstra\'s (shortest path), and Kruskal\'s (MST).',
  'default': 'That\'s a great question! I can help you understand that concept. Based on your recent quiz performance, I recommend reviewing the relevant chapter notes and attempting a few practice questions. Would you like me to suggest some specific topics to focus on?',
};

const departmentResponses: Record<string, string> = {
  'event': 'The next department event is the CS Department Symposium on October 22nd, 2026, at the Seminar Hall starting 10:00 AM. There\'s also a campus recruitment drive by Infosys on November 2nd.',
  'exam': 'The first internal examination is scheduled from October 15–22, 2026. The timetable has been posted on the department notice board. Please check the Examinations section for detailed slot timings.',
  'timetable': 'Today\'s schedule: 9:00 AM - Data Structures (CS-201), 10:00 AM - DBMS (CS-202), 11:15 AM - Operating Systems (CS-201). For the full weekly timetable, check the Timetable section.',
  'faculty': 'Dr. Ramesh Kumar teaches Data Structures & Algorithms (Room 405), Prof. Sunita Sharma handles DBMS (Room 406), Dr. Arvind Mehta covers Operating Systems (Room 402), and Prof. Meena Patel teaches Computer Networks (Room 407).',
  'office': 'The CS Department office is on the 4th floor of the CS Block (Room CS-401). Office hours are 9:00 AM to 5:00 PM, Monday through Friday.',
  'default': 'I can help you with information about the CS department. You can ask me about upcoming events, examinations, faculty, timetables, or general academic policies. What would you like to know?',
};

const getMockResponse = (input: string, type: 'tutor' | 'department'): string => {
  const lower = input.toLowerCase();
  const responses = type === 'tutor' ? tutorResponses : departmentResponses;
  for (const [key, response] of Object.entries(responses)) {
    if (key !== 'default' && lower.includes(key)) {
      return response;
    }
  }
  return responses['default'];
};

import api from '../lib/apiClient';

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
    } catch (e) {
      console.warn('Backend tutor chatbot unreachable, using local fallback:', e);
    }

    await new Promise(r => setTimeout(r, 600));
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: getMockResponse(message, 'tutor'),
      timestamp: new Date().toISOString(),
      type: 'tutor',
    };
  },

  /**
   * Future: POST /api/chat/department (RAG over college knowledge base)
   * Connect to: College Knowledge Base + RAG pipeline
   */
  sendDepartmentMessage: async (message: string, _conversationHistory: ChatMessage[]): Promise<ChatMessage> => {
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: getMockResponse(message, 'department'),
      timestamp: new Date().toISOString(),
      type: 'department',
    };
  },
};

// ============================================
// DEPARTMENT SERVICE — Stub for future backend
// ============================================
import { departmentEvents, announcements, timetable, facultyMembers, departmentFAQs } from '../data/collegeInfo';

export const departmentService = {
  /** GET /api/department/events */
  getEvents: async () => {
    await new Promise(r => setTimeout(r, 200));
    return departmentEvents;
  },

  /** GET /api/department/announcements */
  getAnnouncements: async () => {
    await new Promise(r => setTimeout(r, 200));
    return announcements;
  },

  /** GET /api/department/timetable?semester=5&section=A */
  getTimetable: async () => {
    await new Promise(r => setTimeout(r, 200));
    return timetable;
  },

  /** GET /api/department/faculty */
  getFaculty: async () => {
    await new Promise(r => setTimeout(r, 200));
    return facultyMembers;
  },

  /** GET /api/department/faqs */
  getFAQs: async () => {
    await new Promise(r => setTimeout(r, 200));
    return departmentFAQs;
  },
};
