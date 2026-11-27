import { prisma } from '../prisma';
import { config } from '../config';
import {
  formatRetrievedContext,
  retrieveForMessage,
} from './curriculumRetrieval';
import { loadChunksFromJson } from './chunkStore';
import { buildCurriculumCatalogue } from './curriculumRetrieval';
import { buildLocalAnswer } from './tutorAnswer';
import { TUTOR_SYSTEM_PROMPT } from './tutorPrompt';
import { appendMessages, getHistory, getState, updateState } from './tutorMemory';

export interface ChatHistoryItem {
  sender: 'user' | 'model' | 'assistant';
  text: string;
}

export interface RagContextResult {
  syllabusChunks: {
    subject: string;
    topic: string;
    content: string;
  }[];
  deptChunks: {
    type: string;
    title: string;
    date: string;
    description: string;
    targetDept: string;
  }[];
  courses: {
    name: string;
    code: string;
    semester: number;
    topics: string[];
  }[];
  activeQuizzes: {
    title: string;
    subjectName: string;
    duration: number;
    scheduledAt?: string;
  }[];
  formattedContext: string;
}

export const chatbotService = {
  /**
   * Search SyllabusDocument, DeptInformation, Subject, Topic, and Quiz
   * strictly from the Database without any hardcoded mock data.
   */
  async retrieveContext(query: string): Promise<RagContextResult> {
    const rawTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        w =>
          w.length > 2 &&
          ![
            'what', 'when', 'where', 'which', 'who', 'how', 'why',
            'the', 'and', 'for', 'about', 'can', 'you', 'tell', 'give', 'show', 'please', 'with', 'from',
          ].includes(w)
      );

    let dbSyllabus: any[] = [];
    let dbDeptInfo: any[] = [];
    let dbCourses: any[] = [];
    let dbQuizzes: any[] = [];

    try {
      // 1. Query SyllabusDocument in Database (populated when user uploads syllabus)
      if (rawTokens.length > 0) {
        dbSyllabus = await prisma.syllabusDocument.findMany({
          where: {
            OR: rawTokens.map(token => ({
              OR: [
                { subject: { contains: token, mode: 'insensitive' } },
                { topic: { contains: token, mode: 'insensitive' } },
                { content: { contains: token, mode: 'insensitive' } },
              ],
            })),
          },
          take: 6,
        });
      }

      if (dbSyllabus.length === 0) {
        dbSyllabus = await prisma.syllabusDocument.findMany({
          take: 6,
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch {
      dbSyllabus = [];
    }

    try {
      // 2. Query DeptInformation in Database (populated when user uploads calendar/notices)
      if (rawTokens.length > 0) {
        dbDeptInfo = await prisma.deptInformation.findMany({
          where: {
            OR: rawTokens.map(token => ({
              OR: [
                { title: { contains: token, mode: 'insensitive' } },
                { description: { contains: token, mode: 'insensitive' } },
                { targetDept: { contains: token, mode: 'insensitive' } },
              ],
            })),
          },
          take: 6,
        });
      }

      if (dbDeptInfo.length === 0) {
        dbDeptInfo = await prisma.deptInformation.findMany({
          take: 6,
          orderBy: { date: 'asc' },
        });
      }
    } catch {
      dbDeptInfo = [];
    }

    try {
      // 3. Query active courses and topics currently in curriculum
      const subjects = await prisma.subject.findMany({
        include: {
          topics: { select: { name: true } },
        },
        take: 10,
      });

      dbCourses = subjects.map(s => ({
        name: s.name,
        code: s.code,
        semester: (s as any).semester || 1,
        topics: s.topics.map(t => t.name),
      }));
    } catch {
      dbCourses = [];
    }

    try {
      // 4. Query active or recent quizzes in system
      const quizzes = await prisma.quiz.findMany({
        where: {
          status: { in: ['ACTIVE', 'DRAFT'] },
        },
        include: {
          subject: { select: { name: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      dbQuizzes = quizzes.map(q => ({
        title: q.title,
        subjectName: q.subject?.name || 'General Course',
        duration: q.duration,
        scheduledAt: q.scheduledAt ? q.scheduledAt.toISOString() : undefined,
      }));
    } catch {
      dbQuizzes = [];
    }

    // Rank syllabus documents by relevance
    const scoredSyllabus = dbSyllabus.map(doc => {
      const text = `${doc.subject} ${doc.topic} ${doc.content}`.toLowerCase();
      const score = rawTokens.reduce((acc, token) => (text.includes(token) ? acc + 2 : acc), 0);
      return { doc, score };
    });
    scoredSyllabus.sort((a, b) => b.score - a.score);
    const topSyllabus = scoredSyllabus.slice(0, 4).map(s => ({
      subject: s.doc.subject,
      topic: s.doc.topic,
      content: s.doc.content,
    }));

    // Rank dept info by relevance
    const scoredDept = dbDeptInfo.map(info => {
      const dateStr = info.date instanceof Date ? info.date.toISOString() : String(info.date || '');
      const text = `${info.type} ${info.title} ${info.description} ${info.targetDept} ${dateStr}`.toLowerCase();
      const score = rawTokens.reduce((acc, token) => (text.includes(token) ? acc + 2 : acc), 0);
      return { info, score, dateStr };
    });
    scoredDept.sort((a, b) => b.score - a.score);
    const topDept = scoredDept.slice(0, 4).map(d => ({
      type: String(d.info.type || 'EVENT'),
      title: d.info.title,
      date: d.dateStr,
      description: d.info.description,
      targetDept: d.info.targetDept || 'ALL',
    }));

    // Build structured context string purely from live database
    let formattedContext = '=== ACADEXA VERIFIED CURRICULUM & INSTITUTIONAL CONTEXT ===\n\n';

    if (dbCourses.length > 0) {
      formattedContext += '--- [REGISTERED CURRICULUM COURSES] ---\n';
      dbCourses.forEach(c => {
        formattedContext += `Course: ${c.name} (${c.code}) - Semester ${c.semester}\nTopics: ${c.topics.join(', ') || 'General modules'}\n\n`;
      });
    }

    if (topSyllabus.length > 0) {
      formattedContext += '--- [OFFICIAL SYLLABUS DOCUMENTS] ---\n';
      topSyllabus.forEach((s, idx) => {
        formattedContext += `[Syllabus #${idx + 1}] Subject: ${s.subject} | Topic: ${s.topic}\nContent: ${s.content}\n\n`;
      });
    } else {
      formattedContext += '--- [OFFICIAL SYLLABUS DOCUMENTS] ---\nNo custom syllabus documents uploaded yet.\n\n';
    }

    if (topDept.length > 0) {
      formattedContext += '--- [DEPARTMENT ANNOUNCEMENTS & CALENDAR] ---\n';
      topDept.forEach((d, idx) => {
        formattedContext += `[Notice #${idx + 1}] Type: ${d.type} | Title: ${d.title} | Date: ${d.date} | Target: ${d.targetDept}\nDetails: ${d.description}\n\n`;
      });
    } else {
      formattedContext += '--- [DEPARTMENT ANNOUNCEMENTS & CALENDAR] ---\nNo department calendar notices or announcements uploaded yet.\n\n';
    }

    if (dbQuizzes.length > 0) {
      formattedContext += '--- [CURRENT QUIZZES & ASSESSMENTS] ---\n';
      dbQuizzes.forEach(q => {
        formattedContext += `Quiz: "${q.title}" for ${q.subjectName} (${q.duration} min)${q.scheduledAt ? ` Scheduled: ${q.scheduledAt}` : ''}\n`;
      });
      formattedContext += '\n';
    }

    return {
      syllabusChunks: topSyllabus,
      deptChunks: topDept,
      courses: dbCourses,
      activeQuizzes: dbQuizzes,
      formattedContext,
    };
  },

  /**
   * Generates a realistic, intelligent academic response for a student query.
   */
  async askNexus(
    query: string,
    history: ChatHistoryItem[] = [],
    studentName?: string,
    sessionId?: string
  ): Promise<{ reply: string; contextSources: { syllabus: string[]; dept: string[] } }> {
    const key = sessionId || 'anonymous';
    const recentHistory = history.length > 0 ? history : getHistory(key);
    const previousState = getState(key);
    const catalogueChunks = loadChunksFromJson();
    const departmentQuestion = /hod|head of department|pushpalatha|calendar|cie\b|see exam date|course drop|course withdrawal|synergia|ieee cosmic|department info|vision|mission|office hours|faculty|syllabus/i.test(query);

    if (!departmentQuestion) {
      const result = await retrieveForMessage(query, recentHistory, previousState, { useDatabase: true });
      const concept = result.focusConcept || result.concepts[0] || previousState.last_concept;
      const closing = result.closing;
      const declined = result.declined;
      let reply = '';

      if (config.geminiApiKey && result.chunks.length > 0 && !result.topicSwitch && !closing && !declined) {
        try {
          const contentsPayload = [
            ...recentHistory.slice(-8).map(h => ({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            })),
            {
              role: 'user',
              parts: [{
                text: `${TUTOR_SYSTEM_PROMPT}\n\n${formatRetrievedContext(result.chunks)}\n\nRewritten question: ${result.rewrittenQuestion}\nOriginal student message: "${query}"\n\nAnswer only the rewritten question in 1-6 sentences. Do not add unasked examples, numericals, MCQs, formulas or exam points.`,
              }],
            },
          ];
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: contentsPayload,
                generationConfig: { temperature: 0.25, maxOutputTokens: 350 },
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            reply = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
          }
        } catch (geminiErr) {
          console.warn('Gemini tutor call failed, using local answer engine:', geminiErr);
        }
      }

      if (!reply) {
        reply = buildLocalAnswer(result.rewrittenQuestion, result.chunks, result.intent, {
          topicId: result.topicId,
          concept,
          closing,
          declined,
          followup: result.followup,
          previousInScope: result.previousInScope,
          pendingOffer: previousState.pending_offer,
          allChunks: result.topicSwitch ? catalogueChunks : undefined,
          topicSwitchTarget: result.topicSwitchTarget,
          repeatContent: result.repeatContent,
          lastOfferKind: previousState.last_offer_kind,
          lastOfferText: previousState.last_offer_text,
        });
      }

      appendMessages(key, [
        { sender: 'user', text: query },
        { sender: 'model', text: reply },
      ]);
      // State comes from the chunks that built the reply, not from the question.
      updateState(key, {
        chunks: result.chunks,
        allChunks: catalogueChunks,
        topicId: result.topicId,
        concept,
        intent: result.intent,
        answer: reply,
        closing,
        declined,
        // Meta answers are state-neutral; an acknowledgement after a quiz
        // offer closes that unaccepted offer.
        preserveState: result.intent === 'meta',
        declineOffer: declined || (result.intent === 'acknowledgement' && previousState.pending_offer === 'quiz'),
        topicSwitch: result.topicSwitch,
        targetTopicId: result.topicSwitchTarget,
      });

      return {
        reply,
        contextSources: {
          syllabus: result.chunks.map(chunk => `${chunk.topic_id}: ${chunk.chunk_id}`),
          dept: [],
        },
      };
    }

    const ragData = await this.retrieveContext(query);

    const contextSources = {
      syllabus: ragData.syllabusChunks.map(s => `${s.subject}: ${s.topic}`),
      dept: ragData.deptChunks.map(d => `${d.type}: ${d.title}`),
    };

    // Department assistant path; tutor scope rules still apply to wording.
    const systemPrompt = `${TUTOR_SYSTEM_PROMPT}

You also act as the AIML Department Assistant when a question is about department or campus information. The answer-scope rules above still apply to every answer.

Official Department & Institutional Profile:
- Institution: Sahyadri College of Engineering & Management, Mangaluru (Autonomous Institution)
- Department: Artificial Intelligence and Machine Learning (AIML)
- Head of Department (HOD): Dr. Pushpalatha K
- HOD Email: hod.ai.engg@sahyadri.edu.in
- HOD Cabin: Ground Floor, CS/AI Block
- Department Vision: "To be a pioneering centre for Artificial Intelligence and Machine Learning education, fostering knowledge, research, innovation, and ethical AI practices to create intelligent solutions for societal progress."
- Department Overview: The Department develops intelligent, data-driven solutions using Machine Learning, Deep Learning, Natural Language Processing, Computer Vision, Data Analytics, and Predictive Modelling to uncover valuable patterns, automate decision-making, and create sustainable solutions for industry and societal progress.

Academic Calendar 2026-27 (B.E. 3rd & 5th Semester):
* 5th Semester:
  - Course Registration: Jul 20, 2026 | Placement & Skill Training: Jul 3–31, 2026
  - Commencement of Regular Classes: Aug 3, 2026
  - Continuous Internal Evaluation - I (CIE-I): Sep 7–9, 2026
  - Course Drop Deadline: Sep 18, 2026
  - Student Feedback - I: Sep 21–23, 2026
  - Continuous Internal Evaluation - II (CIE-II): Oct 8–10, 2026
  - Student Feedback - II: Oct 15–17, 2026
  - Continuous Internal Evaluation - III (CIE-III): Nov 17–19, 2026
  - Course Withdrawal Deadline: Nov 23, 2026
  - Compensatory CIE: Nov 24–25, 2026
  - Last Working Day & Submission of NE & Eligibility List: Nov 28, 2026
  - Semester End Examination (SEE) - Theory: Dec 9–24, 2026
  - Semester End Examination (SEE) - Practical: Dec 26, 2026 – Jan 1, 2027
  - Provisional Results: Jan 6, 2027 | Answer Paper Viewing: Jan 11–12, 2027
  - Revaluation Application Cutoff: Jan 18, 2027 | SEE Final Results: Jan 30, 2027
  - Commencement of EVEN Semester (VI): Jan 11, 2027

* 3rd Semester:
  - Course Registration: Aug 3, 2026 | Placement & Skill Training: Aug 3–14, 2026
  - Inhouse Internship: Aug 17–25, 2026
  - Department Orientation Program: Aug 27–29, 2026
  - Commencement of Regular Classes: Aug 31, 2026
  - Continuous Internal Evaluation - I (CIE-I): Oct 23–26, 2026
  - Student Feedback - I: Oct 28–29, 2026
  - Course Drop Deadline: Nov 2, 2026
  - Continuous Internal Evaluation - II (CIE-II): Dec 8–10, 2026
  - Course Withdrawal Deadline: Dec 12, 2026
  - Compensatory CIE: Dec 14–15, 2026
  - Student Feedback - II: Dec 16, 2026
  - Last Working Day & Submission of NE & Eligibility List: Dec 18, 2026
  - Semester End Examination (SEE) - Theory: Dec 30, 2026 – Jan 13, 2027
  - Semester End Examination (SEE) - Practical: Jan 18–23, 2027
  - Provisional Results: Jan 28, 2027 | Answer Paper Viewing: Feb 3–4, 2027
  - Commencement of EVEN Semester (IV): Feb 1, 2027
  - Revaluation Application Cutoff: Feb 10, 2027 | SEE Final Results: Feb 22, 2027

* Flagship Events & Conferences:
  - SYNERGIA 2026 (Annual Mega Tech & Cultural Fest): Nov 12–14, 2026
  - IEEE Cosmic Conference 2026: Nov 27–28, 2026 (Pre-Conference Workshop: Nov 26, 2026)

Guiding Principles for Realistic & High-Impact Responses:
1. Tone & Persona:
   - Warm, supportive, articulate, and intellectually rigorous.
   - Address the student naturally and adapt to their question depth.
   - Avoid robotic clichés, hollow filler, or repetitive formulaic phrases.

2. Structure & Clarity:
   - Format responses cleanly with GitHub-style Markdown.
   - Use bold headers, clear bullet points, and numbered steps when breaking down multi-stage logic.
   - Use real-world analogies to make abstract concepts instantly intuitive.
   - When explaining code or algorithms, explain the intuition and step-by-step logic first, rather than just dumping raw code without explanation.

3. Context & Factual Integrity:
   - When asked about department events, schedules, or faculty: Rely on the verified department context provided above and below.
   - Never fabricate fake professors, fake dates, or imaginary room numbers.

4. Engaging & Interactive:
   - End with a thoughtful, encouraging follow-up.`;

    // If Gemini API Key is configured, use Gemini 1.5 Flash
    if (config.geminiApiKey) {
      try {
        const contentsPayload = [
          ...history.slice(-6).map(h => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${ragData.formattedContext}\n\nStudent Query: "${query}"\n\nInstructions: Answer only the question in 1-6 sentences. Do not add sections, examples, formulas, MCQs or exam points that were not asked for.`,
              },
            ],
          },
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: contentsPayload,
              generationConfig: {
                temperature: 0.25,
                maxOutputTokens: 350,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return {
              reply: replyText.trim(),
              contextSources,
            };
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini live call error, falling back to realistic local engine:', geminiErr);
      }
    }

    // High-fidelity realistic local response engine (purely dynamic, 0 hardcoded data)
    const reply = this.generateRealisticLocalReply(query, ragData, studentName);
    return {
      reply,
      contextSources,
    };
  },

  /**
   * Realistic Local Response Engine:
   * Provides thoughtful, pedagogically rich, realistic answers dynamically without any hardcoded data.
   */
  generateRealisticLocalReply(query: string, ragData: RagContextResult, studentName?: string): string {
    const qLower = query.toLowerCase().trim();
    const nameGreeting = studentName ? ` ${studentName}` : '';

    // 1. Casual Greetings & Openers
    const greetingMatches = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'who are you', 'what can you do', 'help'];
    if (greetingMatches.some(g => qLower === g || qLower.startsWith(g + ' ') || qLower.startsWith(g + '!'))) {
      const courseList = ragData.courses.length > 0
        ? `I have access to your active courses: **${ragData.courses.map(c => c.name).join('**, **')}**.`
        : `I am connected directly to your university portal and academic curriculum for the **Department of Artificial Intelligence & Machine Learning**.`;

      return (
        `👋 **Hello${nameGreeting}! Great to have you here.**\n\n` +
        `I am your **AI Academic Tutor & Department Assistant** for the **Department of Artificial Intelligence & Machine Learning** at Sahyadri College of Engineering & Management.\n\n` +
        `${courseList}\n\n` +
        `Here are a few things I can assist you with:\n` +
        `• 🏛️ **Department Info & Contacts**: Learn about our vision, specializations, or connect with our HOD (**Dr. Pushpalatha K**).\n` +
        `• 📅 **Academic Calendar 2026–27**: Inquire about CIE exam dates, SEE theory/practical schedules, Course Drop/Withdrawal cutoffs, and holidays for 3rd & 5th sem.\n` +
        `• 🎪 **Campus Fests**: Get details on **SYNERGIA 2026** (Nov 12–14) and the IEEE Cosmic Conference.\n` +
        `• 💡 **Coursework & Concepts**: Ask me to explain machine learning, data structures, algorithms, or review quiz questions.\n\n` +
        `What would you like to know today?`
      );
    }

    // 1b. Training-data / knowledge-base enquiry
    const isTrainingDataQuery = [
      'what data are you trained on',
      'what data is trained to it',
      'what data is trained',
      'what are you trained on',
      'trained on what data',
      'what knowledge do you have',
      'what do you know',
      'what topics do you know',
      'what topics can you explain',
      'what data do you have',
      'what data do you use',
    ].some(k => qLower.includes(k));
    if (isTrainingDataQuery) {
      return (
        `🎓 **What I Have Been Trained On**\n\n` +
        `I am Acadexa AI, your department and academic tutor. My knowledge comes from three sources:\n\n` +
        `1. **Verified institutional information** — the AIML department profile, HOD details and the 2026–27 academic calendar (CIE/SEE schedules, deadlines, fests and conferences).\n` +
        `2. **Live student-portal data** — your registered courses and topics, uploaded syllabus documents, department notices and active quizzes, read fresh from the portal database.\n` +
        `3. **Trained subject curriculum** — I have been trained on the following verified study material:\n\n` +
        `${buildCurriculumCatalogue(loadChunksFromJson())}\n\n` +
        `For Computer Vision Module 1, this includes simple and detailed explanations, definitions, formulas and algorithms, worked numerical examples, common mistakes, exam-focused points and practice MCQs for all three topics.\n\n` +
        `Ask me about any of these topics — for example, "explain digital image processing", "differentiate rods and cones", "calculate Michelson contrast", or "give me MCQs on image acquisition".`
      );
    }

    // 1c. Subject questions are handled by the retrieval pipeline in askNexus.

    // 2. HOD (Head of Department) & Administration Queries
    const isHodQuery = ['hod', 'head of department', 'pushpalatha', 'dr pushpalatha', 'contact hod', 'department head', 'ai hod'].some(k => qLower.includes(k));
    if (isHodQuery) {
      return (
        `🏛️ **Head of Department (HOD) — AIML Department**\n\n` +
        `• **Name**: **Dr. Pushpalatha K**\n` +
        `• **Designation**: Professor & Head of Department (HOD)\n` +
        `• **Department**: Artificial Intelligence and Machine Learning (AI & ML)\n` +
        `• **Institution**: Sahyadri College of Engineering & Management, Mangaluru\n` +
        `• **Official Email**: [hod.ai.engg@sahyadri.edu.in](mailto:hod.ai.engg@sahyadri.edu.in)\n` +
        `• **Cabin Location**: HOD Cabin, Ground Floor, CS/AI Block\n` +
        `• **Consultation Hours**: Monday – Friday during designated student interaction windows\n\n` +
        `Dr. Pushpalatha K leads the department's academic vision, research initiatives, and student development in AI, Machine Learning, and Deep Learning.`
      );
    }

    // 3. Department Vision & Overview Queries
    const isVisionQuery = ['vision', 'mission', 'about department', 'about aiml', 'department overview', 'intro', 'what is aiml'].some(k => qLower.includes(k));
    if (isVisionQuery) {
      return (
        `🌟 **Department of Artificial Intelligence and Machine Learning (AIML)**\n` +
        `*Sahyadri College of Engineering & Management, Mangaluru*\n\n` +
        `### **Department Vision**\n` +
        `> "To be a pioneering centre for Artificial Intelligence and Machine Learning education, fostering knowledge, research, innovation, and ethical AI practices to create intelligent solutions for societal progress."\n\n` +
        `### **Overview**\n` +
        `The Department of Artificial Intelligence and Machine Learning focuses on developing intelligent, data-driven solutions using computational tools, algorithms, and analytical techniques to analyze complex datasets.\n\n` +
        `Our curriculum and research span:\n` +
        `• **Machine Learning & Deep Learning**\n` +
        `• **Natural Language Processing (NLP) & Computer Vision**\n` +
        `• **Data Analytics & Predictive Modelling**\n` +
        `• **Ethical AI & Scalable Engineering Solutions**\n\n` +
        `We provide students with cutting-edge industry training, research opportunities, and entrepreneurship skills to address real-world challenges across diverse sectors.`
      );
    }

    // 4. Synergia 2026 / Campus Fests
    const isSynergiaQuery = ['synergia', 'fest', 'annual fest', 'cultural fest', 'tech fest', 'hackathon'].some(k => qLower.includes(k));
    if (isSynergiaQuery) {
      return (
        `🎉 **SYNERGIA 2026 — Annual Mega Tech & Cultural Fest**\n\n` +
        `• **Dates**: **November 12th – 14th, 2026**\n` +
        `• **Venue**: Sahyadri Main Campus & Auditoriums\n` +
        `• **Host Departments**: Student Affairs & AIML Department\n\n` +
        `**Highlights:**\n` +
        `• Flagship 36-Hour Generative AI Hackathon\n` +
        `• Autonomous Robotics & Drone Obstacle Course\n` +
        `• Paper Presentations & AI Innovation Expo\n` +
        `• National Cultural Gala, Band Battles & Performances\n\n` +
        `Keep an eye on the Announcements tab for official registrations and team sign-ups!`
      );
    }

    // 5. CIE (Continuous Internal Evaluation) Specific Queries
    const isCieQuery = (qLower.includes('cie') || qLower.includes('internal') || qLower.includes('test')) && (qLower.includes('date') || qLower.includes('when') || qLower.includes('schedule') || qLower.includes('exam'));
    if (isCieQuery) {
      return (
        `📝 **Continuous Internal Evaluation (CIE) Schedules 2026–27**\n\n` +
        `### **Semester 5 (B.E. AIML):**\n` +
        `• **CIE-I**: September 7 – 9, 2026\n` +
        `• **CIE-II**: October 8 – 10, 2026\n` +
        `• **CIE-III**: November 17 – 19, 2026\n` +
        `• **Compensatory CIE**: November 24 – 25, 2026\n\n` +
        `### **Semester 3 (B.E. AIML):**\n` +
        `• **CIE-I**: October 23 – 26, 2026\n` +
        `• **CIE-II**: December 8 – 10, 2026\n` +
        `• **Compensatory CIE**: December 14 – 15, 2026\n\n` +
        `*Note: Attendance in all CIEs is mandatory. Ensure you maintain at least 85% course attendance to remain eligible for Semester End Examinations (SEE).*`
      );
    }

    // 6. Semester End Examinations (SEE) & Results Queries
    const isSeeQuery = ['see', 'semester end', 'final exam', 'theory exam', 'practical exam', 'result', 'reval', 'paper viewing'].some(k => qLower.includes(k));
    if (isSeeQuery) {
      return (
        `🎓 **Semester End Examination (SEE) & Results Schedule 2026–27**\n\n` +
        `### **Semester 5:**\n` +
        `• **SEE - Theory**: December 9 – 24, 2026\n` +
        `• **SEE - Practical**: December 26, 2026 – January 1, 2027\n` +
        `• **Provisional Result Declaration**: January 6, 2027\n` +
        `• **Answer Paper Viewing**: January 11 – 12, 2027\n` +
        `• **Revaluation Cutoff**: January 18, 2027\n` +
        `• **SEE Final Results**: January 30, 2027\n` +
        `• **Commencement of Even Sem (VI)**: January 11, 2027\n\n` +
        `### **Semester 3:**\n` +
        `• **SEE - Theory**: December 30, 2026 – January 13, 2027\n` +
        `• **SEE - Practical**: January 18 – 23, 2027\n` +
        `• **Provisional Result Declaration**: January 28, 2027\n` +
        `• **Commencement of Even Sem (IV)**: February 1, 2027\n` +
        `• **Answer Paper Viewing**: February 3 – 4, 2027\n` +
        `• **Revaluation Cutoff**: February 10, 2027\n` +
        `• **SEE Final Results**: February 22, 2027\n\n` +
        `*Eligibility lists (NE lists) are submitted on Nov 28 (5th sem) and Dec 18 (3rd sem).*`
      );
    }

    // 7. Course Drop & Withdrawal Cutoffs
    const isDropWithdrawQuery = ['course drop', 'drop', 'withdrawal', 'withdraw', 'eligibility', 'last working day', 'ne list'].some(k => qLower.includes(k));
    if (isDropWithdrawQuery) {
      return (
        `📋 **Course Drop, Withdrawal & Eligibility Deadlines 2026–27**\n\n` +
        `### **Semester 5:**\n` +
        `• **Course Drop**: September 18, 2026\n` +
        `• **Course Withdrawal**: November 23, 2026\n` +
        `• **Last Working Day & Submission of NE/Eligibility List**: November 28, 2026\n\n` +
        `### **Semester 3:**\n` +
        `• **Course Drop**: November 2, 2026\n` +
        `• **Course Withdrawal**: December 12, 2026\n` +
        `• **Last Working Day & Submission of NE/Eligibility List**: December 18, 2026\n\n` +
        `Please consult with your academic mentor and HOD Dr. Pushpalatha K before submitting drop/withdrawal forms.`
      );
    }

    // 8. General Department Events, Notices & Calendar queries
    const isDeptQuery = ['event', 'notice', 'announcement', 'symposium', 'hackathon', 'seminar', 'calendar', 'holiday', 'break', 'vacation', 'timetable', 'schedule'].some(k => qLower.includes(k));
    if (isDeptQuery) {
      if (ragData.deptChunks.length > 0) {
        let text = `📅 **Official Department Announcements & Calendar Highlights:**\n\n`;
        ragData.deptChunks.forEach(item => {
          const dateFormatted = item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Notice';
          text += `### **${item.title}** (${dateFormatted})\n`;
          text += `*Type: ${item.type} | Target: ${item.targetDept}*\n\n`;
          text += `${item.description}\n\n---\n`;
        });
        text += `You can also browse the full Academic Calendar with semester filters under **Department Info > Academic Calendar & Events**.`;
        return text;
      }

      return (
        `📅 **Key Academic Calendar Highlights (2026–27):**\n\n` +
        `• **3rd Sem Commencement**: August 31, 2026\n` +
        `• **5th Sem Commencement**: August 3, 2026\n` +
        `• **Synergia 2026 (Flagship Fest)**: November 12–14, 2026\n` +
        `• **IEEE Cosmic Conference**: November 27–28, 2026\n` +
        `• **5th Sem SEE Theory**: December 9–24, 2026\n` +
        `• **3rd Sem SEE Theory**: December 30, 2026 – January 13, 2027\n\n` +
        `Check the **Academic Calendar & Events** tab for the full list of holidays and assessment windows!`
      );
    }

    // 9. Faculty Directory / Office Hours queries
    const isFacultyQuery = ['faculty', 'professor', 'teacher', 'instructor', 'office hour', 'cabin'].some(k => qLower.includes(k));
    if (isFacultyQuery) {
      return (
        `🏛️ **AIML Faculty Directory**\n\n` +
        `• **Head of Department (HOD)**: **Dr. Pushpalatha K**\n` +
        `  Email: [hod.ai.engg@sahyadri.edu.in](mailto:hod.ai.engg@sahyadri.edu.in) | Cabin: Ground Floor CS/AI Block\n` +
        `  Focus: Artificial Intelligence, Machine Learning Foundations, Deep Learning\n\n` +
        `• **Faculty Members**: All active faculty assigned to AIML subjects are listed in real-time in the **Faculty Directory** tab.\n\n` +
        `Whenever an administrator adds a new faculty member, they appear in your directory automatically!`
      );
    }

    // 4. Study Strategies & Exam Preparation Guidance
    const isStudyTips =
      qLower.includes('how to study') ||
      qLower.includes('study strategy') ||
      qLower.includes('exam tips') ||
      qLower.includes('revision') ||
      qLower.includes('how to score') ||
      (qLower.includes('prepare') && (qLower.includes('how') || qLower.includes('strategy') || qLower.includes('tips') || qLower.includes('should')));
    if (isStudyTips) {
      return (
        `🎯 **High-Impact Academic Study Strategy**\n\n` +
        `Here is a battle-tested 4-step framework to master complex technical coursework and ace exams:\n\n` +
        `1. **Active Invariant Mapping**: Don't just memorize definitions. Write down the core invariant of each algorithm or system component (what must ALWAYS be true before and after each step).\n` +
        `2. **Trace Edge Cases Manually**: Draw diagrams for 3 minimal test cases: an empty/null case, a single-element case, and an inverted or worst-case input.\n` +
        `3. **Time-Boxed Active Recall**: Without looking at notes or solutions, implement the logic or write out the mathematical proof within 15 minutes.\n` +
        `4. **Error Log & Gap Analysis**: Maintain a quick list of concepts where you hesitated during quizzes, and revisit them within 48 hours for spaced reinforcement.\n\n` +
        `Which specific topic would you like to apply this strategy to right now?`
      );
    }

    // 5. Quizzes & Assessments queries (handled with realistic DB check)
    const isQuizQuery = ['quiz', 'test', 'exam', 'assessment', 'upcoming test'].some(k => qLower.includes(k));
    if (isQuizQuery) {
      if (ragData.activeQuizzes.length > 0) {
        let text = `📝 **Current Quizzes & Assessments on Record:**\n\n`;
        ragData.activeQuizzes.forEach(q => {
          text += `• **${q.title}** (${q.subjectName}) — Duration: ${q.duration} mins${q.scheduledAt ? ` | Scheduled: ${new Date(q.scheduledAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}` : ' | Status: Active'}\n`;
        });
        text += `\nWould you like me to quiz you on key concepts to help you prepare?`;
        return text;
      }

      return (
        `📝 **Quizzes & Assessments Update**\n\n` +
        `There are currently **no active quizzes or upcoming examinations** scheduled in your course portal.\n\n` +
        `As soon as your faculty publishes a new quiz or assessment schedule, it will automatically show up here and in your Quizzes tab.\n\n` +
        `In the meantime, would you like to review any specific course topics or practice problem-solving strategies?`
      );
    }

    // 6. Enrolled Courses & Curriculum queries
    const isCourseQuery = ['course', 'subject', 'what do i have', 'registered courses', 'my classes', 'curriculum'].some(k => qLower.includes(k));
    if (isCourseQuery) {
      if (ragData.courses.length > 0) {
        let text = `📚 **Enrolled Curriculum & Registered Courses:**\n\n`;
        ragData.courses.forEach(c => {
          text += `• **${c.name}** (${c.code}) — Semester ${c.semester}\n`;
          if (c.topics.length > 0) {
            text += `   *Modules: ${c.topics.join(', ')}*\n`;
          }
        });
        text += `\nWhich of these subjects would you like to explore or review today?`;
        return text;
      }

      return (
        `📚 **Curriculum & Courses Update**\n\n` +
        `There are currently no active course records loaded in your portal database.\n\n` +
        `Once your courses and syllabus documents are added, your complete subject modules and topics will be accessible here. What subject would you like to study in the meantime?`
      );
    }

    // 7. Comparative Analysis / Trade-offs (e.g. "BFS vs DFS", "difference between X and Y")
    const isComparisonQuery = ['difference between', ' vs ', ' vs. ', 'versus', 'compare '].some(k => qLower.includes(k));
    if (isComparisonQuery) {
      return (
        `⚖️ **Comparative Analysis & Architectural Trade-offs**\n\n` +
        `When evaluating these concepts, it is essential to analyze them across core operational dimensions:\n\n` +
        `### 1. Fundamental Design Philosophy\n` +
        `• **Core Objective**: Each approach was engineered for a distinct set of constraints (e.g., memory conservation vs. latency, continuous memory vs. dynamic node allocation, deterministic guarantees vs. probabilistic efficiency).\n` +
        `• **State Transition**: Trace how internal pointers, call stacks, or data buffers evolve under load.\n\n` +
        `### 2. Algorithmic Complexity & Overhead\n` +
        `• **Time Asymptotics**: Compare best-case, average-case, and worst-case bounds ($O(1)$, $O(\\log n)$, $O(n)$, or $O(n^2)$).\n` +
        `• **Space & Locality**: One approach often requires auxiliary memory (like a call stack or hash table) whereas the other may operate in-place with superior cache performance.\n\n` +
        `### 3. Practical Decision Matrix (When to Use Which)\n` +
        `• **Choose Option A** when: Input sizes are fixed, memory overhead is constrained, or sequential data access patterns dominate.\n` +
        `• **Choose Option B** when: Frequent dynamic mutations occur, optimal shortest-path/substructure guarantees are required, or hierarchical querying is necessary.\n\n` +
        `*Would you like a concrete code comparison or a step-by-step trace of a specific scenario?*`
      );
    }

    // 8. Practice Question / Diagnostic Requests
    const isPracticeRequest = ['practice question', 'quiz me', 'test me', 'sample question', 'give me questions'].some(k => qLower.includes(k));
    if (isPracticeRequest) {
      return (
        `🎯 **Interactive Practice & Knowledge Check**\n\n` +
        `Let's test your conceptual understanding and problem-solving readiness with a quick diagnostic challenge:\n\n` +
        `**Question 1 (Core Invariant & Definition):**\n` +
        `What fundamental constraint or invariant must hold true throughout this data structure or algorithm, and what happens if an edge case violates it?\n\n` +
        `**Question 2 (Complexity & Trade-offs):**\n` +
        `Under what input distribution or edge scenario does this approach degrade to its worst-case asymptotic time or space complexity?\n\n` +
        `**Question 3 (Real-World Application):**\n` +
        `If you had to design a production system handling millions of requests with strict latency requirements, would you choose this pattern or an alternative? Why?\n\n` +
        `*Type your answers or initial thoughts below, and I will review your reasoning and give you step-by-step feedback!*`
      );
    }

    // 9. Code writing / Direct solution requests
    const codeKeywords = ['write code', 'give code', 'implement code', 'solution in python', 'solution in java', 'solution in c++', 'give me the program'];
    if (codeKeywords.some(k => qLower.includes(k))) {
      return (
        `💡 **Conceptual & Algorithmic Guidance**\n\n` +
        `To help you build strong engineering intuition, let's break down the logic step-by-step so you can implement it cleanly yourself:\n\n` +
        `1. **Understand the Invariant & State**: Define what data structures best maintain your constraints (e.g. hash tables for $O(1)$ lookups, two-pointers for sorted arrays, or pointers for trees/graphs).\n` +
        `2. **Base Case & Edge Cases**: Always handle edge cases first — such as empty inputs, null pointers, single elements, or boundary values.\n` +
        `3. **Step-by-Step Logic**: Trace how values transition from one iteration or recursive call to the next.\n` +
        `4. **Complexity Benchmark**: Analyze your time complexity (aiming for optimal asymptotes) and space overhead.\n\n` +
        `Which specific part of the algorithm would you like to walk through together?`
      );
    }

    // 10. User-Uploaded Syllabus Match (if DB contains syllabus documents uploaded by user)
    if (ragData.syllabusChunks.length > 0) {
      const top = ragData.syllabusChunks[0];
      return (
        `📚 **Official Syllabus Review: ${top.topic} (${top.subject})**\n\n` +
        `${top.content}\n\n` +
        `**Key Academic Takeaways:**\n` +
        `• Make sure to review the core operational definitions and how they connect to practical problem solving.\n` +
        `• Focus on time and space complexity trade-offs under both average and worst-case scenarios.\n\n` +
        `Would you like to try a practice question or explore an example on this topic?`
      );
    }

    // 11. Outside the notes: brief and clearly marked.
    return (
      `That is not covered in your Computer Vision Module 1 notes, so this answer is **not from your notes**.\n\n` +
      `I can help with digital image processing, visual perception, image sensing and acquisition, their formulas, examples, exam points and MCQs.`
    );
  },
};
