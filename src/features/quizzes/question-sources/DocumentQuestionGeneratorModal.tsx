// ============================================================================
// ACADEXA DOCUMENT-BASED QUESTION GENERATOR MODAL
// Extract questions from PDF, DOCX, PPTX, and TXT with page reference citations
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X, UploadCloud, FileText, Check, AlertCircle, FileCheck,
  BookOpen, Layers, RefreshCw, Trash2, ArrowRight, Pencil, Save,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type {
  Question,
  Difficulty,
  QuestionType,
  UploadedDocument,
} from '../types/quizTypes';
import {
  documentQuestionService,
  type DocumentQuestionConfig,
  type DocumentSubtopicSelection,
} from '../services/documentQuestionService';
import { CURRICULUM_DATA } from '../constants/curriculumData';
import {
  fetchDynamicCurriculum,
  type DynamicSubject,
} from '../services/curriculumService';

interface DocumentQuestionGeneratorModalProps {
  defaultSubjectId?: string;
  defaultSemester?: number;
  defaultTopicIds?: string[];
  onAddQuestions: (documentQuestions: Question[]) => void;
  onClose: () => void;
}

type DifficultyMix = Difficulty | 'mixed';
type DocumentUnitView = { unitNumber: number; label: string; text: string };

const MAX_UNITS_PER_GENERATION = 50;
const EMPTY_TOPIC_IDS: string[] = [];
const FALLBACK_SUBJECTS: DynamicSubject[] = CURRICULUM_DATA.map(subject => ({
  id: subject.id,
  code: subject.code,
  name: subject.name,
  semester: subject.semester,
  department: subject.department,
  units: subject.units.map(unit => ({
    id: unit.id,
    name: unit.name,
    topics: unit.topics.map(topic => ({
      id: topic.id,
      name: topic.name,
      topicId: topic.id,
    })),
  })),
}));

const isAbortError = (error: any): boolean =>
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError';

const findTopicSelection = (
  subject: DynamicSubject | undefined,
  topicIds: string[]
): { unitId: string; topicId: string } => {
  const unit =
    subject?.units.find(u =>
      u.topics.some(t => topicIds.includes(t.id) || topicIds.includes(String(t.topicId || '')))
    ) || subject?.units[0];
  const topic =
    unit?.topics.find(t => topicIds.includes(t.id) || topicIds.includes(String(t.topicId || ''))) ||
    unit?.topics[0];
  return { unitId: unit?.id || '', topicId: topic?.id || '' };
};

export const DocumentQuestionGeneratorModal: React.FC<DocumentQuestionGeneratorModalProps> = ({
  defaultSubjectId,
  defaultSemester,
  defaultTopicIds = EMPTY_TOPIC_IDS,
  onAddQuestions,
  onClose,
}) => {
  // Wizard steps: 'upload' -> 'configure' -> 'review'
  const [step, setStep] = useState<'upload' | 'configure' | 'review'>('upload');

  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(MAX_UNITS_PER_GENERATION);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Curriculum mapping (database-backed when available)
  const [subjects, setSubjects] = useState<DynamicSubject[]>(FALLBACK_SUBJECTS);
  const initialSubject =
    FALLBACK_SUBJECTS.find(s => s.id === defaultSubjectId) || FALLBACK_SUBJECTS[0];
  const initialSelection = findTopicSelection(initialSubject, defaultTopicIds);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubject.id);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialSelection.unitId);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialSelection.topicId);

  useEffect(() => {
    let active = true;
    fetchDynamicCurriculum()
      .then(loaded => {
        if (!active || loaded.length === 0) return;
        setSubjects(loaded);
        const match =
          loaded.find(s => s.id === defaultSubjectId) ||
          loaded.find(s => s.semester === defaultSemester) ||
          loaded[0];
        const selection = findTopicSelection(match, defaultTopicIds);
        setSelectedSubjectId(match.id);
        setSelectedUnitId(selection.unitId);
        setSelectedTopicId(selection.topicId);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [defaultSubjectId, defaultSemester, defaultTopicIds]);

  // Parameters
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyMix>('mixed');
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(2);

  // Review state
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [generatedBatch, setGeneratedBatch] = useState<Question[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Question | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const currentUnit =
    currentSubject?.units.find(u => u.id === selectedUnitId) || currentSubject?.units[0];
  const currentTopic =
    currentUnit?.topics.find(t => t.id === selectedTopicId) || currentUnit?.topics[0];

  const documentUnits = useMemo<DocumentUnitView[]>(() => {
    if (document?.units && document.units.length > 0) return document.units;
    return (document?.pages || []).map(page => ({
      unitNumber: page.pageNumber,
      label: `Page ${page.pageNumber}`,
      text: page.text,
    }));
  }, [document]);

  const unitNoun = useMemo(() => {
    const label = documentUnits[0]?.label || '';
    if (/slide/i.test(label)) return 'Slides';
    if (/section/i.test(label)) return 'Sections';
    return 'Pages';
  }, [documentUnits]);

  const selectedUnits = useMemo(
    () => documentUnits.filter(unit => unit.unitNumber >= rangeStart && unit.unitNumber <= rangeEnd),
    [documentUnits, rangeStart, rangeEnd]
  );
  const allSelected =
    generatedBatch.length > 0 && selectedIndices.length === generatedBatch.length;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = documentQuestionService.validateFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file uploaded.');
      e.target.value = '';
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const doc = await documentQuestionService.processDocument(file, controller.signal);
      setDocument(doc);
      const total = doc.units?.length || doc.pages?.length || 0;
      setRangeStart(1);
      setRangeEnd(Math.min(total, MAX_UNITS_PER_GENERATION));
      setGeneratedBatch([]);
      setSelectedIndices([]);
      setStep('configure');
    } catch (err: any) {
      setErrorMessage(
        isAbortError(err) ? 'Upload canceled.' : err.message || 'Failed to extract document text.'
      );
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
      e.target.value = '';
    }
  };

  const buildGenerationConfig = (
    count: number,
    previousQuestions: string[] = []
  ): DocumentQuestionConfig => {
    const subtopic: DocumentSubtopicSelection | undefined = currentTopic
      ? {
          id: currentTopic.id,
          name: currentTopic.name,
          topicId: currentTopic.topicId || (currentTopic.subtopicId ? undefined : currentTopic.id),
          subtopicId: currentTopic.subtopicId,
        }
      : undefined;

    return {
      document: document!,
      selectedPageNumbers: selectedUnits.map(unit => unit.unitNumber),
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      unitId: currentUnit?.id || '',
      unitName: currentUnit?.name || '',
      topicId: currentTopic?.topicId || currentTopic?.id || '',
      topicName: currentTopic?.name || '',
      semester: currentSubject.semester || defaultSemester || 3,
      department: currentSubject.department,
      questionCount: count,
      questionTypes: ['mcq' as QuestionType],
      difficulty,
      marksPerQuestion,
      subtopic,
      previousQuestions,
    };
  };

  const handleGenerate = async () => {
    if (!document || isGenerating || selectedUnits.length === 0) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const questions = await documentQuestionService.generateFromDocument(
        buildGenerationConfig(questionCount),
        controller.signal
      );
      setGeneratedBatch(questions);
      setSelectedIndices(questions.map((_, i) => i));
      setEditingIndex(null);
      setEditDraft(null);
      setStep('review');
    } catch (err: any) {
      setErrorMessage(
        isAbortError(err) ? 'Generation canceled.' : err.message || 'Failed to generate questions.'
      );
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerateQuestion = async (index: number) => {
    if (!document || isGenerating || regeneratingIndex !== null) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setRegeneratingIndex(index);
    setErrorMessage(null);
    try {
      const previous = generatedBatch.map(q => q.text);
      const [replacement] = await documentQuestionService.generateFromDocument(
        buildGenerationConfig(1, previous),
        controller.signal
      );
      if (replacement) {
        setGeneratedBatch(prev => prev.map((q, i) => (i === index ? replacement : q)));
        setEditingIndex(null);
        setEditDraft(null);
      }
    } catch (err: any) {
      setErrorMessage(
        isAbortError(err)
          ? 'Regeneration canceled.'
          : err.message || 'Could not regenerate this question.'
      );
    } finally {
      setRegeneratingIndex(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelRequest = () => {
    abortControllerRef.current?.abort();
  };

  const handleClose = () => {
    if (isProcessing || isGenerating || regeneratingIndex !== null) {
      if (!window.confirm('Cancel the current request and close this window?')) return;
      handleCancelRequest();
    }
    if (generatedBatch.length > 0) {
      const discard = window.confirm(
        'Discard the generated questions that have not been added to the quiz?'
      );
      if (!discard) return;
    }
    onClose();
  };

  const handleRangeChange = (field: 'start' | 'end', value: number) => {
    if (field === 'start') {
      setRangeStart(value);
      if (value > rangeEnd) setRangeEnd(value);
    } else {
      setRangeEnd(value);
      if (value < rangeStart) setRangeStart(value);
    }
  };

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIndices(allSelected ? [] : generatedBatch.map((_, i) => i));
  };

  const handleDeleteQuestion = (index: number) => {
    setGeneratedBatch(prev => prev.filter((_, i) => i !== index));
    setSelectedIndices(prev =>
      prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
    );
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditDraft(null);
    }
  };

  const startEditing = (index: number) => {
    const q = generatedBatch[index];
    setEditDraft({
      ...q,
      options: (q.options || []).map(opt => ({ ...opt })),
    });
    setEditingIndex(index);
  };

  const saveEdit = () => {
    if (editingIndex === null || !editDraft) return;
    const options = editDraft.options || [];
    if (!editDraft.text.trim()) {
      setErrorMessage('Question text cannot be empty.');
      return;
    }
    if (options.length !== 4 || options.some(opt => !opt.text.trim())) {
      setErrorMessage('A question must have exactly four non-empty options.');
      return;
    }
    if (!options.some(opt => opt.isCorrect)) {
      setErrorMessage('Select the correct answer before saving.');
      return;
    }
    setGeneratedBatch(prev =>
      prev.map((q, i) => (i === editingIndex ? { ...editDraft, hasValidAnswerKey: true } : q))
    );
    setEditingIndex(null);
    setEditDraft(null);
    setErrorMessage(null);
  };

  const handleInsertQuestions = () => {
    const selected = generatedBatch.filter((_, i) => selectedIndices.includes(i));
    if (selected.length === 0) return;
    onAddQuestions(selected);
  };

  const sourceLabel = (page: number | string | undefined): string => {
    const unit = documentUnits.find(u => u.unitNumber === Number(page));
    return unit?.label || `Page ${page ?? '?'}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Document-Based Question Generator
              </h3>
              <p className="text-xs text-slate-400">
                Extract curriculum questions directly from lecture notes, slides, and syllabus documents
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Document Upload */}
        {step === 'upload' && (
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-teal-50 border-2 border-dashed border-teal-300 flex items-center justify-center text-teal-600 mb-4 shadow-sm">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">
              Upload Course Material or Lecture Handout
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
              Upload PDF notes, DOCX worksheets, PPTX presentations, or plain TXT files. Questions generated will cite the source document and page number for verification.
            </p>

            <label className="relative cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.pptx,.txt"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors shadow-sm">
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Extracting Document Text...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Choose File from Computer
                  </>
                )}
              </span>
            </label>

            <div className="mt-8 flex items-center gap-4 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              <span>PDF Supported</span>
              <span>•</span>
              <span>DOCX Supported</span>
              <span>•</span>
              <span>PPTX Supported</span>
              <span>•</span>
              <span>Max 15MB</span>
            </div>
          </div>
        )}

        {/* Step 2: Configure & Inspect Extracted Document */}
        {step === 'configure' && document && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Document summary strip */}
            <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <div>
                  <p className="text-xs font-bold text-teal-950">{document.filename}</p>
                  <p className="text-[11px] text-teal-700">
                    {document.wordCount?.toLocaleString() || 0} words · {document.totalUnits || documentUnits.length} {unitNoun.toLowerCase()} extracted
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep('upload')}
                className="text-xs text-teal-800 font-semibold hover:underline"
              >
                Change File
              </button>
            </div>

            {document.warning && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-[11px] text-amber-800">
                {document.warning}
              </div>
            )}

            {/* Extracted preview & Range selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Select {unitNoun} to Extract From
              </label>
              <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="font-semibold">From</span>
                  <select
                    value={rangeStart}
                    onChange={e => handleRangeChange('start', Number(e.target.value))}
                    className="border border-slate-200 rounded-lg p-1.5 bg-white"
                  >
                    {documentUnits.map(unit => (
                      <option key={unit.unitNumber} value={unit.unitNumber}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="font-semibold">To</span>
                  <select
                    value={rangeEnd}
                    onChange={e => handleRangeChange('end', Number(e.target.value))}
                    className="border border-slate-200 rounded-lg p-1.5 bg-white"
                  >
                    {documentUnits.map(unit => (
                      <option key={unit.unitNumber} value={unit.unitNumber}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRangeStart(1);
                    setRangeEnd(Math.min(documentUnits.length, MAX_UNITS_PER_GENERATION));
                  }}
                  className="text-xs text-teal-800 font-semibold hover:underline"
                >
                  All{unitNoun.toLowerCase()}
                </button>
                <span className="text-[11px] text-slate-500 ml-auto">
                  {selectedUnits.length} selected · max {MAX_UNITS_PER_GENERATION} per generation
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-2 mt-3">
                {selectedUnits.map(unit => (
                  <div
                    key={unit.unitNumber}
                    onClick={() => {
                      setRangeStart(unit.unitNumber);
                      setRangeEnd(unit.unitNumber);
                    }}
                    className="p-3 rounded-xl border border-teal-500 bg-teal-50/30 ring-1 ring-teal-500/30 text-left cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">{unit.label}</span>
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                      {unit.text.slice(0, 300)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Mapping */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Map Extracted Material to Academic Syllabus
              </label>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={e => {
                      const id = e.target.value;
                      const subject = subjects.find(s => s.id === id);
                      setSelectedSubjectId(id);
                      setSelectedUnitId(subject?.units[0]?.id || '');
                      setSelectedTopicId(subject?.units[0]?.topics[0]?.id || '');
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <select
                    value={selectedUnitId}
                    onChange={e => {
                      const id = e.target.value;
                      const unit = currentSubject?.units.find(u => u.id === id);
                      setSelectedUnitId(id);
                      setSelectedTopicId(unit?.topics[0]?.id || '');
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    {(currentSubject?.units || []).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic / Subtopic</label>
                  <select
                    value={selectedTopicId}
                    onChange={e => setSelectedTopicId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    {(currentUnit?.topics || []).map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Generation controls */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Difficulty Mix
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as DifficultyMix)}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs capitalize"
                >
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-xs font-bold"
                >
                  {[5, 10, 15, 20].map(count => (
                    <option key={count} value={count}>
                      {count} questions
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Marks per Question
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={marksPerQuestion}
                  onChange={e => setMarksPerQuestion(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-center font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                Selected tag: <strong>{currentTopic?.name || 'None'}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Review Generated Questions */}
        {step === 'review' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
              <span>
                Generated {generatedBatch.length} questions from <strong>{document?.filename}</strong>. Review source citations before adding to quiz.
              </span>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-teal-800 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate All
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              Select all questions
            </label>

            <div className="space-y-3">
              {generatedBatch.map((q, idx) => {
                const isSelected = selectedIndices.includes(idx);
                const isEditing = editingIndex === idx && editDraft;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/20 shadow-xs'
                        : 'border-slate-200 bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(idx)}
                        className="w-4 h-4 mt-1 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              color={
                                q.difficulty === 'easy'
                                  ? 'green'
                                  : q.difficulty === 'medium'
                                  ? 'amber'
                                  : 'red'
                              }
                            >
                              {q.difficulty}
                            </Badge>
                            <Badge color="gray" className="uppercase text-[10px]">
                              {q.type}
                            </Badge>
                            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <FileText className="w-3 h-3" /> 📄 {document?.filename}, {sourceLabel(q.sourcePageNumber)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              title="Edit question"
                              onClick={() => startEditing(idx)}
                              disabled={regeneratingIndex !== null}
                              className="p-1 rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-40"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Regenerate this question"
                              onClick={() => handleRegenerateQuestion(idx)}
                              disabled={isGenerating || regeneratingIndex !== null}
                              className="p-1 rounded-md text-slate-500 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-40"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${regeneratingIndex === idx ? 'animate-spin' : ''}`}
                              />
                            </button>
                            <button
                              type="button"
                              title="Delete question"
                              onClick={() => handleDeleteQuestion(idx)}
                              disabled={regeneratingIndex !== null}
                              className="p-1 rounded-md text-slate-500 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isEditing && editDraft ? (
                          <div className="space-y-2">
                            <textarea
                              value={editDraft.text}
                              onChange={e =>
                                setEditDraft({ ...editDraft, text: e.target.value })
                              }
                              className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                              rows={2}
                            />
                            <div className="grid sm:grid-cols-2 gap-1.5">
                              {(editDraft.options || []).map((opt, optIdx) => (
                                <div key={opt.id} className="flex items-center gap-1.5">
                                  <input
                                    type="radio"
                                    name={`correct_${idx}`}
                                    checked={opt.isCorrect}
                                    onChange={() =>
                                      setEditDraft({
                                        ...editDraft,
                                        options: (editDraft.options || []).map((o, i) => ({
                                          ...o,
                                          isCorrect: i === optIdx,
                                        })),
                                      })
                                    }
                                    className="text-teal-600"
                                  />
                                  <input
                                    value={opt.text}
                                    onChange={e =>
                                      setEditDraft({
                                        ...editDraft,
                                        options: (editDraft.options || []).map((o, i) =>
                                          i === optIdx ? { ...o, text: e.target.value } : o
                                        ),
                                      })
                                    }
                                    className="flex-1 border border-slate-200 rounded-lg p-1.5 text-[11px]"
                                  />
                                </div>
                              ))}
                            </div>
                            <textarea
                              value={editDraft.explanation || ''}
                              onChange={e =>
                                setEditDraft({ ...editDraft, explanation: e.target.value })
                              }
                              className="w-full border border-slate-200 rounded-lg p-2 text-[11px]"
                              rows={2}
                              placeholder="Explanation"
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={editDraft.difficulty}
                                onChange={e =>
                                  setEditDraft({
                                    ...editDraft,
                                    difficulty: e.target.value as Difficulty,
                                  })
                                }
                                className="border border-slate-200 rounded-lg p-1.5 text-[11px]"
                              >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                              <Button size="sm" variant="forest" onClick={saveEdit} leftIcon={<Save className="w-3.5 h-3.5" />}>
                                Save Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingIndex(null);
                                  setEditDraft(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-slate-900 leading-snug mb-2">
                              {q.text}
                            </p>

                            {/* Options preview */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid sm:grid-cols-2 gap-1.5 mb-2 text-xs">
                                {q.options.map((opt, i) => (
                                  <div
                                    key={opt.id}
                                    className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                                      opt.isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <span className="font-bold opacity-60">
                                      {String.fromCharCode(65 + i)}.
                                    </span>
                                    <span className="truncate">{opt.text}</span>
                                    {opt.isCorrect && (
                                      <Check className="w-3 h-3 text-emerald-600 ml-auto" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {q.explanation && (
                              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <strong>Explanation:</strong> {q.explanation}
                              </p>
                            )}
                            {q.sourceSnippet && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                Source: “{q.sourceSnippet}”
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step === 'upload' ? (
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
          ) : step === 'configure' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('upload')}
                disabled={isProcessing || isGenerating}
              >
                Back to Upload
              </Button>
              <div className="flex items-center gap-2">
                {(isProcessing || isGenerating) && (
                  <Button variant="ghost" size="sm" onClick={handleCancelRequest}>
                    Cancel Request
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleGenerate}
                  disabled={selectedUnits.length === 0}
                  isLoading={isGenerating}
                  leftIcon={<FileText className="w-4 h-4 text-teal-200" />}
                  className="!bg-teal-700 hover:!bg-teal-800 !text-white"
                >
                  Generate Questions
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('configure')}
                disabled={isGenerating || regeneratingIndex !== null}
              >
                Back to Document
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  {selectedIndices.length} of {generatedBatch.length} selected
                </span>
                <Button
                  size="sm"
                  disabled={selectedIndices.length === 0 || isGenerating || regeneratingIndex !== null}
                  onClick={handleInsertQuestions}
                  leftIcon={<Layers className="w-4 h-4" />}
                >
                  Add Selected to Quiz
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
