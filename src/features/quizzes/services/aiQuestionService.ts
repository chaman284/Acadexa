// ============================================================================
// ACADEXA AI QUESTION GENERATION SERVICE
// Replaceable provider for syllabus-aligned assessment item generation
// ============================================================================
import type { Question, QuestionType, Difficulty, CognitiveLevel } from '../types/quizTypes';

export interface AiGenerationConfig {
  subjectId: string;
  subjectName: string;
  semester: number;
  department: string;
  unitId: string;
  unitName: string;
  topicId: string;
  topicName: string;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty;
  marksPerQuestion: number;
  skillFocus: 'conceptual' | 'application' | 'problem_solving' | 'recall';
  includeExplanations: boolean;
  customPrompt?: string;
}

// Curriculum generation templates tailored to computer science concepts
const AI_QUESTION_TEMPLATES: Record<string, Partial<Question>[]> = {
  top_bst: [
    {
      text: 'In a Binary Search Tree (BST) containing keys {15, 10, 20, 8, 12, 18, 25}, what will be the in-order successor of key 15 after insertion?',
      type: 'mcq',
      difficulty: 'medium',
      marks: 2,
      options: [
        { id: 'opt_gen_1', text: '18', isCorrect: true },
        { id: 'opt_gen_2', text: '12', isCorrect: false },
        { id: 'opt_gen_3', text: '20', isCorrect: false },
        { id: 'opt_gen_4', text: '10', isCorrect: false },
      ],
      explanation: 'The in-order successor in a BST is the minimum key in the right subtree. The right subtree contains {20, 18, 25}, whose minimum is 18.',
      hint: 'Find the smallest key in the right subtree of node 15.',
    },
    {
      text: 'Which of the following operations takes O(h) time complexity in a BST of height h?',
      type: 'multi-select',
      difficulty: 'medium',
      marks: 3,
      options: [
        { id: 'opt_gen_a', text: 'Searching for a key', isCorrect: true },
        { id: 'opt_gen_b', text: 'Finding minimum element', isCorrect: true },
        { id: 'opt_gen_c', text: 'Inserting a new leaf node', isCorrect: true },
        { id: 'opt_gen_d', text: 'Inorder traversal of all n nodes', isCorrect: false },
      ],
      explanation: 'Search, minimum, and insertion follow a single downward path bounded by tree height h = O(h). Complete tree traversal visits all nodes taking O(n).',
    },
    {
      text: 'What is the minimum height of a Binary Search Tree containing 15 distinct nodes?',
      type: 'fill-blank',
      difficulty: 'easy',
      marks: 2,
      acceptedAnswers: ['3', 'height 3', 'h=3'],
      caseSensitive: false,
      explanation: 'For n = 15 nodes, a completely balanced binary tree has height ceil(log2(n+1)) - 1 = ceil(log2(16)) - 1 = 4 - 1 = 3.',
    },
  ],
  top_tree_trav: [
    {
      text: 'Given the preorder traversal [A, B, D, E, C, F] and inorder traversal [D, B, E, A, F, C], identify the root of the left subtree of node A.',
      type: 'mcq',
      difficulty: 'medium',
      marks: 2,
      options: [
        { id: 'opt_trav_1', text: 'Node B', isCorrect: true },
        { id: 'opt_trav_2', text: 'Node D', isCorrect: false },
        { id: 'opt_trav_3', text: 'Node E', isCorrect: false },
        { id: 'opt_trav_4', text: 'Node C', isCorrect: false },
      ],
      explanation: 'From preorder, A is root. In inorder, [D, B, E] form the left subtree. Preorder reveals B comes first in the left subtree, making B its root.',
    },
    {
      text: 'Can a unique binary tree always be reconstructed given ONLY its preorder and postorder traversals?',
      type: 'true-false',
      difficulty: 'hard',
      marks: 1,
      options: [
        { id: 'opt_tf_1', text: 'True', isCorrect: false },
        { id: 'opt_tf_2', text: 'False', isCorrect: true },
      ],
      explanation: 'False. Preorder and postorder alone cannot disambiguate left vs right single-child subtrees unless the tree is guaranteed to be a Full Binary Tree.',
    },
  ],
  top_norm_form: [
    {
      text: 'In relation R(A, B, C, D) with functional dependencies {A -> B, B -> C, C -> D}, what is the highest normal form satisfied by R?',
      type: 'mcq',
      difficulty: 'hard',
      marks: 3,
      options: [
        { id: 'opt_nf_1', text: '1NF', isCorrect: false },
        { id: 'opt_nf_2', text: '2NF', isCorrect: true },
        { id: 'opt_nf_3', text: '3NF', isCorrect: false },
        { id: 'opt_nf_4', text: 'BCNF', isCorrect: false },
      ],
      explanation: 'Candidate key is A. Transitive dependencies exist (A -> B -> C and B -> C -> D) with non-prime attributes, violating 3NF. Since no partial dependencies exist, R is in 2NF.',
    },
  ],
};

export const aiQuestionService = {
  /**
   * Generate questions from configured topic & parameters
   */
  generateQuestions: async (config: AiGenerationConfig): Promise<Question[]> => {
    // Realistic API generation delay simulation (800ms - 1500ms)
    await new Promise(r => setTimeout(r, 1000));

    // Simulate validation error if empty topic
    if (!config.topicName || !config.subjectName) {
      throw new Error('Subject and Topic metadata are required for curriculum question generation.');
    }

    const availableTemplates =
      AI_QUESTION_TEMPLATES[config.topicId] ||
      AI_QUESTION_TEMPLATES['top_bst'];

    const count = Math.min(Math.max(1, config.questionCount), 6);
    const generated: Question[] = [];

    for (let i = 0; i < count; i++) {
      const template = availableTemplates[i % availableTemplates.length];
      const qType = config.questionTypes.length > 0 ? config.questionTypes[i % config.questionTypes.length] : (template.type || 'mcq');

      let cognitiveLevel: CognitiveLevel = 'CL2_UNDERSTAND';
      if (config.skillFocus === 'problem_solving') cognitiveLevel = 'CL4_ANALYZE';
      else if (config.skillFocus === 'application') cognitiveLevel = 'CL3_APPLY';
      else if (config.skillFocus === 'recall') cognitiveLevel = 'CL1_REMEMBER';

      const question: Question = {
        id: `ai_gen_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        text: template.text
          ? template.text
          : `Analyze the core principles of ${config.topicName}: How does ${config.skillFocus} impact efficiency when applied to ${config.unitName}?`,
        type: qType,
        difficulty: config.difficulty || template.difficulty || 'medium',
        marks: config.marksPerQuestion || template.marks || 2,
        options: template.options || [
          { id: `opt_ai_${i}_1`, text: `Directly optimizes runtime complexity for ${config.topicName}`, isCorrect: true },
          { id: `opt_ai_${i}_2`, text: `Has no measurable effect on computational overhead`, isCorrect: false },
          { id: `opt_ai_${i}_3`, text: `Guarantees O(1) space across all arbitrary inputs`, isCorrect: false },
          { id: `opt_ai_${i}_4`, text: `Restricts concurrent access within memory bounds`, isCorrect: false },
        ],
        explanation: config.includeExplanations
          ? template.explanation || `Derived from ${config.subjectName} curriculum: applies standard ${config.topicName} theorems.`
          : undefined,
        hint: template.hint,
        acceptedAnswers: template.acceptedAnswers,
        expectedAnswer: template.expectedAnswer,
        metadata: {
          department: config.department || 'Computer Science and Engineering',
          semester: config.semester || 3,
          subjectId: config.subjectId,
          subjectCode: config.subjectId.toUpperCase(),
          subjectName: config.subjectName,
          unitId: config.unitId,
          unitName: config.unitName,
          topicId: config.topicId,
          topicName: config.topicName,
          cognitiveLevel,
          learningObjective: `Demonstrate ${config.skillFocus} in ${config.topicName}`,
        },
        source: 'ai',
        createdBy: 'Acadexa AI Generator (Gemini Curriculum Engine)',
        createdAt: new Date().toISOString(),
        hasValidAnswerKey: true,
      };

      generated.push(question);
    }

    return generated;
  },

  /**
   * Regenerate a single specific question
   */
  regenerateSingleQuestion: async (
    originalQuestion: Question,
    feedbackNote?: string
  ): Promise<Question> => {
    await new Promise(r => setTimeout(r, 700));

    return {
      ...originalQuestion,
      id: `ai_regen_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: feedbackNote
        ? `[Refined] ${originalQuestion.text.replace(/^[\[\(].*?[\]\)]\s*/, '')}`
        : `${originalQuestion.text} (Alternative variation)`,
      createdAt: new Date().toISOString(),
    };
  },
};
