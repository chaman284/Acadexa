// ============================================================================
// ACADEXA DOCUMENT-BASED QUESTION GENERATION SERVICE
// Browser-side API client for deterministic extraction + Gemini MCQ generation.
// All extraction/generation happens on the server; no API keys are exposed here.
// ============================================================================
import api from '../../../lib/apiClient';
import type {
  Question,
  Difficulty,
  QuestionType,
  UploadedDocument,
} from '../types/quizTypes';

export interface DocumentSubtopicSelection {
  id?: string;
  name: string;
  topicId?: string;
  subtopicId?: string;
}

export interface DocumentQuestionConfig {
  document: UploadedDocument;
  selectedPageNumbers: number[];
  subjectId: string;
  subjectName: string;
  unitId: string;
  unitName: string;
  topicId: string;
  topicName: string;
  semester: number;
  department: string;
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: Difficulty | 'mixed';
  marksPerQuestion: number;
  /** The selected curriculum topic/subtopic tag from the quiz form. */
  subtopic?: DocumentSubtopicSelection;
  /** Used by per-card regeneration so Gemini avoids repeating questions. */
  previousQuestions?: string[];
}

export interface ExtractedUnit {
  unitNumber: number;
  label: string;
  text: string;
}

interface GenerationApiQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: string;
  sourcePage: number;
  sourceSnippet: string;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const friendlyMessage = (error: any, fallback: string): string => {
  if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
    throw error;
  }
  return error?.response?.data?.message || error?.message || fallback;
};

const normalizeDifficulty = (value: unknown): Difficulty => {
  const v = String(value || '').toLowerCase();
  return v === 'easy' || v === 'hard' ? v : 'medium';
};

export const documentQuestionService = {
  /** Validate uploaded file type and size before calling the server. */
  validateFile: (file: File): { isValid: boolean; error?: string } => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        error: `Unsupported file format "${ext}". Supported formats are PDF, DOCX, PPTX, and TXT.`,
      };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `File size exceeds the 15MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller document.`,
      };
    }
    if (file.size === 0) {
      return { isValid: false, error: 'The uploaded file is empty.' };
    }
    return { isValid: true };
  },

  /** Extract text units on the server. No AI is involved in extraction. */
  processDocument: async (file: File, signal?: AbortSignal): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/faculty/documents/extract', formData, {
        signal,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data || {};
      const units: ExtractedUnit[] = Array.isArray(data.units) ? data.units : [];

      return {
        id: String(data.documentId || `doc_${Date.now()}`),
        documentId: String(data.documentId || ''),
        filename: String(data.fileName || file.name),
        fileSize: file.size,
        fileType: file.type || file.name.split('.').pop() || 'unknown',
        extractedText: units.map(unit => unit.text).join('\n'),
        pages: units.map(unit => ({ pageNumber: unit.unitNumber, text: unit.text })),
        units,
        totalUnits: Number(data.totalUnits || units.length),
        wordCount: Number(data.wordCount || 0),
        preview: String(data.preview || ''),
        warning: data.warning ? String(data.warning) : undefined,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(
        friendlyMessage(error, 'Document text could not be extracted. Please try another file.')
      );
    }
  },

  /** Generate MCQs from the selected units via Gemini on the server. */
  generateFromDocument: async (
    config: DocumentQuestionConfig,
    signal?: AbortSignal
  ): Promise<Question[]> => {
    const allUnits = config.document.units || config.document.pages || [];
    const selected =
      config.selectedPageNumbers.length > 0
        ? allUnits.filter(unit => {
            const unitNumber = (unit as any).unitNumber ?? (unit as any).pageNumber;
            return config.selectedPageNumbers.includes(Number(unitNumber));
          })
        : allUnits;

    if (selected.length === 0) {
      throw new Error('Select at least one page or slide to generate from.');
    }

    const selectedTopicId =
      config.subtopic?.topicId || config.subtopic?.id || config.topicId;
    const selectedSubtopicId = config.subtopic?.subtopicId;

    try {
      const res = await api.post(
        '/faculty/documents/generate-questions',
        {
          units: selected.map(unit => ({
            unitNumber: (unit as any).unitNumber ?? (unit as any).pageNumber,
            label: (unit as any).label || `Page ${(unit as any).unitNumber ?? (unit as any).pageNumber}`,
            text: unit.text,
          })),
          numQuestions: config.questionCount,
          difficulty: config.difficulty,
          subtopic: config.subtopic || {
            name: config.topicName,
            topicId: config.topicId || undefined,
          },
          fileName: config.document.filename,
          previousQuestions: config.previousQuestions || [],
        },
        { signal }
      );

      const generated: GenerationApiQuestion[] = Array.isArray(res.data?.questions)
        ? res.data.questions
        : [];

      return generated.map((item, index) => {
        const options = (item.options || []).map((text, optIndex) => ({
          id: `doc_opt_${Date.now()}_${index}_${optIndex}`,
          text: String(text),
          isCorrect: optIndex === Number(item.correctIndex),
        }));
        const page = Number(item.sourcePage) || 1;

        return {
          id: String(item.id || `doc_q_${Date.now()}_${index}`),
          text: String(item.question || ''),
          type: 'mcq' as QuestionType,
          difficulty: normalizeDifficulty(item.difficulty),
          marks: config.marksPerQuestion || 2,
          options,
          explanation: String(item.explanation || ''),
          metadata: {
            department: config.department,
            semester: config.semester,
            subjectId: config.subjectId,
            subjectCode: '',
            subjectName: config.subjectName,
            unitId: config.unitId,
            unitName: config.unitName,
            topicId: selectedTopicId,
            topicName: config.subtopic?.name || config.topicName,
            subtopicId: selectedSubtopicId,
            subtopicName: selectedSubtopicId ? config.subtopic?.name : undefined,
            cognitiveLevel: 'CL2_UNDERSTAND',
            learningObjective: `Extracted from ${config.document.filename}`,
          },
          source: 'document' as const,
          sourceDocumentName: config.document.filename,
          sourcePageNumber: page,
          sourceSnippet: String(item.sourceSnippet || ''),
          documentSource: {
            fileName: config.document.filename,
            page,
            snippet: String(item.sourceSnippet || ''),
          },
          createdBy: `Document Generator: ${config.document.filename}`,
          createdAt: new Date().toISOString(),
          hasValidAnswerKey: options.some(opt => opt.isCorrect),
        };
      });
    } catch (error: any) {
      throw new Error(
        friendlyMessage(error, 'Questions could not be generated. Please try again.')
      );
    }
  },
};
