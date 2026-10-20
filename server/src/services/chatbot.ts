import { prisma } from '../prisma';
import { config } from '../config';

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
  formattedContext: string;
}

// Built-in comprehensive syllabus documents (used as baseline and offline fallback)
const BASELINE_SYLLABUS = [
  {
    subject: 'Data Structures & Algorithms (CS-201)',
    topic: 'Trees & Binary Search Trees',
    content:
      'Binary Trees are hierarchical non-linear data structures where each node has at most two child nodes (left and right). A Binary Search Tree (BST) maintains the ordered invariant: all nodes in the left subtree have values less than the root, and all nodes in the right subtree have values greater than the root. Traversals: In-order (Left, Root, Right - yields sorted sequence in BST), Pre-order (Root, Left, Right), Post-order (Left, Right, Root), and Level-order (BFS using a Queue). Time Complexity: Search, Insertion, and Deletion are O(h) where h is tree height; O(log n) in balanced BSTs and O(n) worst case for skewed trees. Self-balancing trees such as AVL and Red-Black trees maintain O(log n) guarantees via tree rotations.',
  },
  {
    subject: 'Data Structures & Algorithms (CS-201)',
    topic: 'Arrays & Dynamic Arrays',
    content:
      'Arrays are contiguous memory data structures with O(1) random index access. Insertion and deletion at arbitrary indices require O(n) time due to element shifting. Dynamic arrays (e.g., ArrayList, Vector) double capacity when full, achieving amortized O(1) insertion at the end. Key algorithmic patterns include two pointers, sliding window technique, prefix sums, and binary search (O(log n) on sorted arrays). Cache spatial locality makes arrays highly efficient on modern hardware.',
  },
  {
    subject: 'Data Structures & Algorithms (CS-201)',
    topic: 'Graph Algorithms',
    content:
      'Graphs G = (V, E) model pairwise relationships between vertices. Representation: Adjacency Matrix requires O(V^2) space, optimal for dense graphs; Adjacency List requires O(V + E) space, optimal for sparse graphs. Breadth-First Search (BFS) uses a queue and finds single-source shortest paths in unweighted graphs in O(V + E). Depth-First Search (DFS) uses recursion/stack for cycle detection, topological sorting of DAGs, and connected components. Shortest path in weighted graphs: Dijkstra algorithm with min-heap takes O((V + E) log V). Minimum Spanning Tree (MST): Kruskal (with Disjoint Set Union) and Prim algorithms.',
  },
  {
    subject: 'Data Structures & Algorithms (CS-201)',
    topic: 'Dynamic Programming',
    content:
      'Dynamic Programming (DP) solves optimization problems exhibiting overlapping subproblems and optimal substructure. Two primary paradigms: Top-down with Memoization (caching recursive results) and Bottom-up Tabulation (iterative table filling). Core syllabus problems: 0/1 Knapsack Problem, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), Matrix Chain Multiplication, Coin Change, and Edit Distance. Space optimization often reduces memory from O(n^2) to O(n) by retaining only previous row/state.',
  },
  {
    subject: 'Data Structures & Algorithms (CS-201)',
    topic: 'Stacks & Queues',
    content:
      'Stacks follow LIFO (Last-In-First-Out) principle with push, pop, and peek in O(1). Applications: Expression evaluation (postfix/infix conversion), function call stack, undo operations, parenthesis matching, monotonic stack for nearest greater element. Queues follow FIFO (First-In-First-Out) principle with enqueue and dequeue in O(1). Variants: Circular Queue, Double-Ended Queue (Deque), and Priority Queue (Binary Heap).',
  },
  {
    subject: 'Database Management Systems (CS-202)',
    topic: 'Normalization & Functional Dependencies',
    content:
      'Normalization systematically organizes relations to minimize data redundancy and prevent update, insertion, and deletion anomalies. 1NF requires atomic attribute values. 2NF requires 1NF and no partial dependencies (every non-prime attribute is fully dependent on the primary key). 3NF requires 2NF and no transitive dependencies (X -> Y where neither is candidate key). BCNF (Boyce-Codd) strictly mandates that for every functional dependency X -> Y, X must be a superkey. Lossless join decomposition and dependency preservation are key evaluation criteria.',
  },
  {
    subject: 'Database Management Systems (CS-202)',
    topic: 'Transactions & ACID Properties',
    content:
      'A transaction is a logical unit of database processing. ACID Properties: Atomicity (all operations execute or none do, enforced by transaction log/undo), Consistency (database transitions from one valid state to another), Isolation (concurrent transactions execute independently without interference, controlled by concurrency protocols), Durability (committed modifications persist permanently even across system crashes, enforced by WAL / redo log). Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.',
  },
  {
    subject: 'Operating Systems (CS-203)',
    topic: 'Process Management & Deadlocks',
    content:
      'Processes transition through states: New, Ready, Running, Waiting, Terminated. Process Control Block (PCB) preserves process context. CPU Scheduling algorithms: First-Come-First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin (time quantum). Deadlock occurs when processes hold resources and wait indefinitely for others. Four necessary Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Handling methods: Prevention (negating a condition), Avoidance (Banker algorithm for safe state check), Detection and Recovery.',
  },
];

// Built-in comprehensive department information
const BASELINE_DEPT_INFO = [
  {
    type: 'EVENT',
    title: 'CS Department Annual Technical Symposium 2026',
    date: '2026-10-22T10:00:00.000Z',
    description:
      'The Computer Science Department Annual Technical Symposium will take place on October 22nd, 2026, in the Main Seminar Hall (CS Block 1st Floor). Includes keynote address by Dr. Ramesh Kumar, student research paper presentations, project showcase, and algorithmic coding challenge. Timings: 10:00 AM to 5:00 PM.',
    targetDept: 'CS',
  },
  {
    type: 'EVENT',
    title: 'Continuous Internal Evaluation (CIE-1) Examination Schedule',
    date: '2026-10-15T09:30:00.000Z',
    description:
      'CIE-1 examinations for 5th Semester Section A: Oct 15 - Data Structures (CS-201), Oct 17 - DBMS (CS-202), Oct 20 - Operating Systems (CS-203). Timing: 9:30 AM - 11:30 AM in Rooms CS-301 to CS-305. Students must carry valid college identity cards.',
    targetDept: 'CS',
  },
  {
    type: 'EVENT',
    title: 'Campus Recruitment Drive — Infosys & Tech Mahindra',
    date: '2026-11-02T09:00:00.000Z',
    description:
      'On-campus placement drive for 5th and 7th semester students with CGPA >= 7.0 and no active backlogs. Online coding assessments will be held in CS Computer Labs 1, 2, and 3 from 9:00 AM onwards.',
    targetDept: 'CS',
  },
  {
    type: 'HOLIDAY',
    title: 'Diwali Institutional Holiday Break',
    date: '2026-11-01T00:00:00.000Z',
    description:
      'The university and all departmental laboratories will remain closed from November 1st, 2026 to November 3rd, 2026, on account of Deepavali / Diwali celebrations. Regular classes resume November 4th.',
    targetDept: 'ALL',
  },
  {
    type: 'EVENT',
    title: 'Department Faculty Directory & Advising Office Hours',
    date: '2026-10-18T14:00:00.000Z',
    description:
      'Faculty Office Locations and Hours: Dr. Ramesh Kumar (HOD, Data Structures & Algorithms): Room CS-405, Mon & Wed 2:00 PM - 4:00 PM; Prof. Sunita Sharma (DBMS & SQL): Room CS-406, Tue & Thu 11:00 AM - 1:00 PM; Dr. Arvind Mehta (Operating Systems): Room CS-402, Fri 3:00 PM - 5:00 PM; Soumya (Assistant Professor, Programming Labs): Room CS-408, Mon-Fri 10:00 AM - 12:00 PM. Department Office: Room CS-401 (Operating hours: 9:00 AM - 5:00 PM).',
    targetDept: 'CS',
  },
  {
    type: 'ACHIEVEMENT',
    title: 'Smart India Hackathon 2026 — 1st Prize Winners',
    date: '2026-09-28T00:00:00.000Z',
    description:
      'CS 5th Semester team "Acadexa Innovators" won the 1st prize at National SIH 2026, receiving a trophy and ₹1,00,000 cash grant for developing an AI-powered Knowledge Tracing platform for engineering universities.',
    targetDept: 'CS',
  },
];

export const chatbotService = {
  /**
   * Search SyllabusDocument and DeptInformation for context matching the query.
   */
  async retrieveContext(query: string): Promise<RagContextResult> {
    const rawTokens = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['what', 'when', 'where', 'which', 'who', 'how', 'why', 'the', 'and', 'for', 'about', 'can', 'you', 'tell', 'give', 'show'].includes(w));

    let dbSyllabus: any[] = [];
    let dbDeptInfo: any[] = [];

    try {
      // 1. Query SyllabusDocument in Database
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
    } catch (e) {
      // Database query error or offline fallback
      dbSyllabus = [];
    }

    try {
      // 2. Query DeptInformation in Database
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
    } catch (e) {
      dbDeptInfo = [];
    }

    // Merge DB results with baseline documents, ranking by relevance
    const combinedSyllabus = [...dbSyllabus, ...BASELINE_SYLLABUS];
    const scoredSyllabus = combinedSyllabus.map(doc => {
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

    const combinedDept = [...dbDeptInfo, ...BASELINE_DEPT_INFO];
    const scoredDept = combinedDept.map(info => {
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
      targetDept: d.info.targetDept || 'CS',
    }));

    // Build structured context string
    let formattedContext = '=== OFFICIAL DEPARTMENT & SYLLABUS KNOWLEDGE BASE ===\n\n';

    formattedContext += '--- [SYLLABUS DOCUMENTS] ---\n';
    topSyllabus.forEach((s, idx) => {
      formattedContext += `[Syllabus #${idx + 1}] Subject: ${s.subject} | Topic: ${s.topic}\nContent: ${s.content}\n\n`;
    });

    formattedContext += '--- [DEPARTMENT INFORMATION & CALENDAR] ---\n';
    topDept.forEach((d, idx) => {
      formattedContext += `[Dept Record #${idx + 1}] Type: ${d.type} | Title: ${d.title} | Date: ${d.date} | Target: ${d.targetDept}\nDetails: ${d.description}\n\n`;
    });

    return {
      syllabusChunks: topSyllabus,
      deptChunks: topDept,
      formattedContext,
    };
  },

  /**
   * Generates a RAG response for student query using Nexus system prompt and retrieved context.
   */
  async askNexus(
    query: string,
    history: ChatHistoryItem[] = [],
    studentName?: string
  ): Promise<{ reply: string; contextSources: { syllabus: string[]; dept: string[] } }> {
    const ragData = await this.retrieveContext(query);

    // Exact system prompt required by prompt specification
    const systemPrompt =
      'You are Nexus, the official Department AI Assistant. Use only the provided context to answer. Do not hallucinate or provide direct code solutions.';

    const contextSources = {
      syllabus: ragData.syllabusChunks.map(s => `${s.subject}: ${s.topic}`),
      dept: ragData.deptChunks.map(d => `${d.type}: ${d.title}`),
    };

    // If Gemini API Key is configured, use Gemini 1.5 Flash
    if (config.geminiApiKey) {
      try {
        const contentsPayload = [
          // Format conversation history
          ...history.slice(-6).map(h => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${ragData.formattedContext}\n\nStudent Query: "${query}"\n\nInstructions:\n1. Base your answer strictly on the provided context above.\n2. If the user asks for direct programming code (e.g., C/C++/Java/Python/JS), politely decline to give the copy-paste code solution and instead explain the underlying algorithm, concept, step-by-step logic, or complexity.\n3. If the answer cannot be determined from the context, state: "Based on official department records and syllabus documents, I do not have enough verified details on that query. Please consult the CS Department Office (Room CS-401) or your course instructor."\n4. Address the student in a clear, supportive, and professional academic manner.`,
              },
            ],
          },
        ];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contentsPayload }),
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
        console.warn('Gemini live call error, falling back to local RAG generator:', geminiErr);
      }
    }

    // Local RAG generator conforming strictly to the prompt constraints
    const reply = this.generateLocalRagReply(query, ragData, studentName);
    return {
      reply,
      contextSources,
    };
  },

  /**
   * High-fidelity local RAG response generator
   * Respects system prompt: "You are Nexus, the official Department AI Assistant. Use only the provided context to answer. Do not hallucinate or provide direct code solutions."
   */
  generateLocalRagReply(query: string, ragData: RagContextResult, studentName?: string): string {
    const qLower = query.toLowerCase();

    // Guardrail against direct code solutions
    const codeKeywords = ['write code', 'code for', 'implement code', 'java code', 'c++ code', 'python code', 'give code', 'give me code', 'program for'];
    const isAskingForDirectCode = codeKeywords.some(k => qLower.includes(k));

    if (isAskingForDirectCode) {
      // Find relevant topic
      const matchedSyllabus = ragData.syllabusChunks[0];
      return `Hello ${studentName || 'there'}, as Nexus, your Department AI Assistant, I cannot provide direct code solutions. However, I can explain the conceptual approach and algorithmic principles from your syllabus:\n\n` +
        `**Concept Focus: ${matchedSyllabus.topic} (${matchedSyllabus.subject})**\n\n` +
        `${matchedSyllabus.content}\n\n` +
        `**Algorithmic Steps to Implement Yourself:**\n` +
        `1. Identify your base case and state representation.\n` +
        `2. Choose suitable data structures (e.g., contiguous arrays for index lookups, or nodes with pointers for trees/graphs).\n` +
        `3. Follow standard invariants (e.g. In BST: left < parent < right).\n` +
        `4. Analyze your time and space complexity against the benchmark.\n\n` +
        `Would you like to review practice questions or test your understanding on this topic?`;
    }

    // Department Calendar / Events query
    if (qLower.includes('event') || qLower.includes('symposium') || qLower.includes('hackathon') || qLower.includes('seminar') || qLower.includes('calendar') || qLower.includes('upcoming')) {
      const events = ragData.deptChunks.filter(d => d.type === 'EVENT' || d.type === 'ACHIEVEMENT');
      if (events.length > 0) {
        let text = `Here are the upcoming department events and notices from our verified records:\n\n`;
        events.forEach(e => {
          const dateStr = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          text += `📅 **${e.title}** (${dateStr})\n${e.description}\n\n`;
        });
        text += `For further assistance, visit the CS Department Office in Room CS-401.`;
        return text;
      }
    }

    // Exam / CIE Schedule query
    if (qLower.includes('exam') || qLower.includes('cie') || qLower.includes('internal') || qLower.includes('test') || qLower.includes('timetable') || qLower.includes('schedule')) {
      const examItem = ragData.deptChunks.find(d => d.title.toLowerCase().includes('cie') || d.title.toLowerCase().includes('exam') || d.description.toLowerCase().includes('exam'));
      if (examItem) {
        return `Here is the official examination and assessment schedule on record:\n\n` +
          `📝 **${examItem.title}**\n` +
          `${examItem.description}\n\n` +
          `Please make sure to arrive 15 minutes before your scheduled slot with your college ID card.`;
      }
    }

    // Holiday query
    if (qLower.includes('holiday') || qLower.includes('diwali') || qLower.includes('break') || qLower.includes('vacation')) {
      const holiday = ragData.deptChunks.find(d => d.type === 'HOLIDAY');
      if (holiday) {
        const dateStr = new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `Regarding upcoming institutional holidays:\n\n` +
          `🌴 **${holiday.title}** (${dateStr})\n` +
          `${holiday.description}`;
      }
    }

    // Faculty info / office hours query
    if (qLower.includes('faculty') || qLower.includes('professor') || qLower.includes('hod') || qLower.includes('ramesh') || qLower.includes('office hour') || qLower.includes('cabin') || qLower.includes('room')) {
      const facultyInfo = ragData.deptChunks.find(d => d.title.toLowerCase().includes('faculty') || d.description.toLowerCase().includes('office'));
      if (facultyInfo) {
        return `Here is the verified faculty and departmental directory:\n\n` +
          `🏛️ **${facultyInfo.title}**\n` +
          `${facultyInfo.description}\n\n` +
          `Office hours are held during normal working days.`;
      }
    }

    // Academic / Syllabus topics query (Trees, BST, Graphs, DP, DBMS, OS, Normalization, etc.)
    const matchedSyllabus = ragData.syllabusChunks[0];
    if (matchedSyllabus) {
      return `According to the official **${matchedSyllabus.subject}** syllabus for **${matchedSyllabus.topic}**:\n\n` +
        `${matchedSyllabus.content}\n\n` +
        `*(Note: As Nexus, I do not provide direct code solutions, but I can guide you through any conceptual or complexity questions regarding this topic).*`;
    }

    return (
      `Hello! I am Nexus, your official Department AI Assistant. I can assist you with official syllabus guidelines, department events, examination schedules, faculty office hours, and academic policies.\n\n` +
      `Based on official department records and syllabus documents, I do not have enough verified details on that query. Please consult the CS Department Office (Room CS-401) or your course instructor.`
    );
  },
};
