// ============================================================================
// ACADEXA CURRICULUM & QUESTION BANK SEED DATA
// Real college curriculum models for Computer Science & Engineering
// ============================================================================
import type { Question, Quiz, AssignedClass } from '../types/quizTypes';

export interface SubjectCurriculum {
  id: string;
  code: string;
  name: string;
  semester: number;
  department: string;
  units: {
    id: string;
    name: string;
    topics: {
      id: string;
      name: string;
      subtopics?: string[];
    }[];
  }[];
}

export const CURRICULUM_DATA: SubjectCurriculum[] = [
  {
    id: 'sub_ds',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    semester: 3,
    department: 'Computer Science and Engineering',
    units: [
      {
        id: 'u_ds_1',
        name: 'Unit 1: Linear Data Structures',
        topics: [
          { id: 'top_arr', name: 'Arrays & Dynamic Sizing', subtopics: ['Contiguous Allocation', 'Row-major Order'] },
          { id: 'top_ll', name: 'Linked Lists', subtopics: ['Singly Linked List', 'Doubly Linked List', 'Circular List'] },
          { id: 'top_stk', name: 'Stacks & Applications', subtopics: ['Infix to Postfix', 'Recursion Simulation'] },
          { id: 'top_que', name: 'Queues & Circular Queues', subtopics: ['FIFO Operations', 'Priority Queue'] },
        ],
      },
      {
        id: 'u_ds_2',
        name: 'Unit 2: Non-Linear Trees',
        topics: [
          { id: 'top_tree_trav', name: 'Binary Tree Traversal', subtopics: ['Inorder Traversal', 'Preorder Traversal', 'Postorder Traversal', 'Level Order'] },
          { id: 'top_bst', name: 'Binary Search Trees (BST)', subtopics: ['Insertion & Search', 'Deletion in BST', 'Tree Balance'] },
          { id: 'top_avl', name: 'Balanced Trees (AVL & Red-Black)', subtopics: ['Rotations', 'Height Balancing'] },
        ],
      },
      {
        id: 'u_ds_3',
        name: 'Unit 3: Graphs & Graph Algorithms',
        topics: [
          { id: 'top_graph_rep', name: 'Graph Representation', subtopics: ['Adjacency Matrix', 'Adjacency List'] },
          { id: 'top_graph_trav', name: 'Graph Traversals (BFS & DFS)', subtopics: ['Breadth-First Search', 'Depth-First Search', 'Cycle Detection'] },
          { id: 'top_shortest_path', name: 'Shortest Path Algorithms', subtopics: ['Dijkstra Algorithm', 'Bellman-Ford'] },
        ],
      },
    ],
  },
  {
    id: 'sub_dbms',
    code: 'CS502',
    name: 'Database Management Systems',
    semester: 5,
    department: 'Computer Science and Engineering',
    units: [
      {
        id: 'u_db_1',
        name: 'Unit 1: Relational Model & SQL',
        topics: [
          { id: 'top_sql_ddl', name: 'DDL & DML Queries', subtopics: ['Table Creation', 'Constraints', 'Join Operations'] },
          { id: 'top_rel_alg', name: 'Relational Algebra', subtopics: ['Selection', 'Projection', 'Cartesian Product', 'Division'] },
        ],
      },
      {
        id: 'u_db_2',
        name: 'Unit 2: Normalization & Schema Refinement',
        topics: [
          { id: 'top_norm_form', name: 'Normal Forms (1NF, 2NF, 3NF, BCNF)', subtopics: ['Functional Dependencies', 'Lossless Decomposition', 'Dependency Preservation'] },
        ],
      },
      {
        id: 'u_db_3',
        name: 'Unit 3: Transaction Processing & ACID',
        topics: [
          { id: 'top_acid', name: 'ACID Properties & Concurrency', subtopics: ['Atomicity', 'Isolation Levels', 'Two-Phase Locking (2PL)'] },
          { id: 'top_deadlock', name: 'Deadlock Handling', subtopics: ['Wait-for Graph', 'Timestamp Ordering'] },
        ],
      },
    ],
  },
  {
    id: 'sub_os',
    code: 'CS403',
    name: 'Operating Systems',
    semester: 4,
    department: 'Computer Science and Engineering',
    units: [
      {
        id: 'u_os_1',
        name: 'Unit 1: Process Management',
        topics: [
          { id: 'top_cpu_sched', name: 'CPU Scheduling Algorithms', subtopics: ['Round Robin', 'SJF', 'FCFS', 'Multilevel Feedback'] },
          { id: 'top_proc_sync', name: 'Process Synchronization', subtopics: ['Semaphores', 'Peterson Solution', 'Monitors'] },
        ],
      },
      {
        id: 'u_os_2',
        name: 'Unit 2: Memory Management & Paging',
        topics: [
          { id: 'top_paging', name: 'Paging & Virtual Memory', subtopics: ['Page Tables', 'TLB', 'Page Replacement (FIFO, LRU)'] },
        ],
      },
    ],
  },
  {
    id: 'sub_cn',
    code: 'CS504',
    name: 'Computer Networks',
    semester: 5,
    department: 'Computer Science and Engineering',
    units: [
      {
        id: 'u_cn_1',
        name: 'Unit 1: Transport Layer Protocols',
        topics: [
          { id: 'top_tcp_udp', name: 'TCP vs UDP Protocols', subtopics: ['Three-Way Handshake', 'Flow Control', 'Congestion Control'] },
          { id: 'top_subnetting', name: 'IP Addressing & Subnetting', subtopics: ['CIDR Notation', 'Subnet Masks'] },
        ],
      },
    ],
  },
];

export const MOCK_CLASSES: AssignedClass[] = [
  { id: 'sec_5a', name: 'Section 5A', semester: 5, studentsCount: 64 },
  { id: 'sec_5b', name: 'Section 5B', semester: 5, studentsCount: 62 },
  { id: 'sec_3a', name: 'Section 3A', semester: 3, studentsCount: 68 },
  { id: 'sec_3b', name: 'Section 3B', semester: 3, studentsCount: 65 },
  { id: 'sec_4a', name: 'Section 4A', semester: 4, studentsCount: 60 },
];

export const MOCK_LIBRARY_QUESTIONS: Question[] = [
  {
    id: 'lib_q_1',
    text: 'What is the time complexity of searching for a value in a balanced Binary Search Tree (AVL tree) with n nodes?',
    type: 'mcq',
    difficulty: 'medium',
    marks: 2,
    options: [
      { id: 'opt_1_a', text: 'O(1)', isCorrect: false },
      { id: 'opt_1_b', text: 'O(log n)', isCorrect: true },
      { id: 'opt_1_c', text: 'O(n)', isCorrect: false },
      { id: 'opt_1_d', text: 'O(n log n)', isCorrect: false },
    ],
    explanation: 'A balanced BST guarantees height h = O(log n). Each comparison cuts the search space in half.',
    hint: 'Think about the relationship between height and number of nodes in a balanced tree.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 3,
      subjectId: 'sub_ds',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      unitId: 'u_ds_2',
      unitName: 'Unit 2: Non-Linear Trees',
      topicId: 'top_bst',
      topicName: 'Binary Search Trees (BST)',
      cognitiveLevel: 'CL2_UNDERSTAND',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_1',
    createdBy: 'Prof. Ramesh Rao (Faculty)',
    createdAt: '2026-09-15T10:00:00.000Z',
    hasValidAnswerKey: true,
  },
  {
    id: 'lib_q_2',
    text: 'Which of the following binary tree traversals yields the elements of a Binary Search Tree in sorted ascending order?',
    type: 'mcq',
    difficulty: 'easy',
    marks: 1,
    options: [
      { id: 'opt_2_a', text: 'Preorder traversal (Root, Left, Right)', isCorrect: false },
      { id: 'opt_2_b', text: 'Inorder traversal (Left, Root, Right)', isCorrect: true },
      { id: 'opt_2_c', text: 'Postorder traversal (Left, Right, Root)', isCorrect: false },
      { id: 'opt_2_d', text: 'Level order traversal (Breadth-First)', isCorrect: false },
    ],
    explanation: 'Inorder traversal processes Left Subtree (smaller) -> Root (median) -> Right Subtree (larger), generating sorted output.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 3,
      subjectId: 'sub_ds',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      unitId: 'u_ds_2',
      unitName: 'Unit 2: Non-Linear Trees',
      topicId: 'top_tree_trav',
      topicName: 'Binary Tree Traversal',
      cognitiveLevel: 'CL1_REMEMBER',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_2',
    createdBy: 'Dr. Neha Kulkarni',
    createdAt: '2026-09-18T14:30:00.000Z',
    hasValidAnswerKey: true,
  },
  {
    id: 'lib_q_3',
    text: 'Select ALL the functional dependency properties that must hold for a relation to be in Boyce-Codd Normal Form (BCNF):',
    type: 'multi-select',
    difficulty: 'hard',
    marks: 3,
    options: [
      { id: 'opt_3_a', text: 'For every functional dependency X -> Y, X must be a superkey', isCorrect: true },
      { id: 'opt_3_b', text: 'Every non-prime attribute is fully functionally dependent on candidate key', isCorrect: true },
      { id: 'opt_3_c', text: 'Y can be a prime attribute even if X is not a superkey', isCorrect: false },
      { id: 'opt_3_d', text: 'No transitive dependencies exist for non-prime attributes', isCorrect: true },
    ],
    explanation: 'BCNF is strictly stricter than 3NF: it requires that for every non-trivial FD X -> Y, X is a superkey without exception.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 5,
      subjectId: 'sub_dbms',
      subjectCode: 'CS502',
      subjectName: 'Database Management Systems',
      unitId: 'u_db_2',
      unitName: 'Unit 2: Normalization & Schema Refinement',
      topicId: 'top_norm_form',
      topicName: 'Normal Forms (1NF, 2NF, 3NF, BCNF)',
      cognitiveLevel: 'CL4_ANALYZE',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_3',
    createdBy: 'Dr. Anand Verma',
    createdAt: '2026-10-02T11:15:00.000Z',
    hasValidAnswerKey: true,
  },
  {
    id: 'lib_q_4',
    text: 'In the Two-Phase Locking (2PL) protocol, a transaction can release locks during its expanding (growing) phase.',
    type: 'true-false',
    difficulty: 'medium',
    marks: 1,
    options: [
      { id: 'opt_4_true', text: 'True', isCorrect: false },
      { id: 'opt_4_false', text: 'False', isCorrect: true },
    ],
    explanation: 'False. In 2PL, locks can only be acquired in the Growing Phase and released in the Shrinking Phase. No lock can be released during the Growing Phase.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 5,
      subjectId: 'sub_dbms',
      subjectCode: 'CS502',
      subjectName: 'Database Management Systems',
      unitId: 'u_db_3',
      unitName: 'Unit 3: Transaction Processing & ACID',
      topicId: 'top_acid',
      topicName: 'ACID Properties & Concurrency',
      cognitiveLevel: 'CL2_UNDERSTAND',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_4',
    createdBy: 'Dr. Anand Verma',
    createdAt: '2026-10-05T09:00:00.000Z',
    hasValidAnswerKey: true,
  },
  {
    id: 'lib_q_5',
    text: 'What data structure is utilized in Breadth-First Search (BFS) of a graph to store visited adjacent vertices in first-in first-out order?',
    type: 'fill-blank',
    difficulty: 'easy',
    marks: 2,
    acceptedAnswers: ['queue', 'FIFO queue', 'Queue'],
    caseSensitive: false,
    explanation: 'Breadth-First Search uses a Queue to explore all immediate neighbors before delving into deeper levels.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 3,
      subjectId: 'sub_ds',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      unitId: 'u_ds_3',
      unitName: 'Unit 3: Graphs & Graph Algorithms',
      topicId: 'top_graph_trav',
      topicName: 'Graph Traversals (BFS & DFS)',
      cognitiveLevel: 'CL1_REMEMBER',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_5',
    createdBy: 'Prof. Ramesh Rao (Faculty)',
    createdAt: '2026-10-10T16:00:00.000Z',
    hasValidAnswerKey: true,
  },
  {
    id: 'lib_q_6',
    text: 'Explain how the Peterson Algorithm ensures Mutual Exclusion between two concurrent processes, identifying the role of the "turn" and "flag" variables.',
    type: 'short-answer',
    difficulty: 'hard',
    marks: 5,
    expectedAnswer: 'Peterson algorithm uses flag[2] boolean array (indicating intent to enter critical section) and turn variable (indicating whose priority it is). Mutual exclusion is ensured because process P0 only enters if (flag[1] == false || turn == 0), preventing simultaneous entry.',
    explanation: 'Strict 2-process software synchronization algorithm satisfying mutual exclusion, progress, and bounded waiting.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 4,
      subjectId: 'sub_os',
      subjectCode: 'CS403',
      subjectName: 'Operating Systems',
      unitId: 'u_os_1',
      unitName: 'Unit 1: Process Management',
      topicId: 'top_proc_sync',
      topicName: 'Process Synchronization',
      cognitiveLevel: 'CL3_APPLY',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_6',
    createdBy: 'Prof. S. Murali',
    createdAt: '2026-09-20T12:00:00.000Z',
    hasValidAnswerKey: true,
  },
  {
    id: 'lib_q_7',
    text: 'Predict the console output of the following recursive tree traversal function when called with the root of a BST containing [20, 10, 30]:',
    type: 'code-output',
    difficulty: 'medium',
    marks: 2,
    codeSnippet: `void traverse(Node* root) {\n    if (root == nullptr) return;\n    traverse(root->right);\n    cout << root->data << " ";\n    traverse(root->left);\n}`,
    codeLanguage: 'cpp',
    expectedAnswer: '30 20 10',
    acceptedAnswers: ['30 20 10', '30 20 10 '],
    explanation: 'Reverse inorder traversal (Right -> Root -> Left) prints elements of a BST in strictly descending order: 30, then 20, then 10.',
    metadata: {
      department: 'Computer Science and Engineering',
      semester: 3,
      subjectId: 'sub_ds',
      subjectCode: 'CS301',
      subjectName: 'Data Structures & Algorithms',
      unitId: 'u_ds_2',
      unitName: 'Unit 2: Non-Linear Trees',
      topicId: 'top_tree_trav',
      topicName: 'Binary Tree Traversal',
      cognitiveLevel: 'CL3_APPLY',
    },
    source: 'library',
    libraryQuestionId: 'lib_q_7',
    createdBy: 'Dr. Neha Kulkarni',
    createdAt: '2026-10-12T08:45:00.000Z',
    hasValidAnswerKey: true,
  },
];

export const INITIAL_QUIZZES: Quiz[] = [];
