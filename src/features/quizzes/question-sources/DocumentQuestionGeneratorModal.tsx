// ============================================================================
// ACADEXA DOCUMENT-BASED QUESTION GENERATOR MODAL
// Extract questions from PDF, DOCX, PPTX, and TXT with page reference citations
// ============================================================================
import React, { useState } from 'react';
import {
  X, UploadCloud, FileText, Check, AlertCircle, FileCheck,
  BookOpen, Layers, RefreshCw, Trash2, ArrowRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Question, QuestionType, Difficulty, UploadedDocument } from '../types/quizTypes';
import { documentQuestionService } from '../services/documentQuestionService';
import { CURRICULUM_DATA } from '../constants/curriculumData';

interface DocumentQuestionGeneratorModalProps {
  defaultSubjectId?: string;
  defaultSemester?: number;
  onAddQuestions: (documentQuestions: Question[]) => void;
  onClose: () => void;
}

export const DocumentQuestionGeneratorModal: React.FC<DocumentQuestionGeneratorModalProps> = ({
  defaultSubjectId,
  defaultSemester,
  onAddQuestions,
  onClose,
}) => {
  // Wizard steps: 'upload' -> 'configure' -> 'review'
  const [step, setStep] = useState<'upload' | 'configure' | 'review'>('upload');

  const [document, setDocument] = useState<UploadedDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPages, setSelectedPages] = useState<number[]>([1, 2, 3]);

  // Curriculum mapping
  const initialSubj =
    CURRICULUM_DATA.find(s => s.id === defaultSubjectId) || CURRICULUM_DATA[0];
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubj.id);
  const currentSubject =
    CURRICULUM_DATA.find(s => s.id === selectedSubjectId) || CURRICULUM_DATA[0];

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    currentSubject.units[0]?.id || ''
  );
  const currentUnit =
    currentSubject.units.find(u => u.id === selectedUnitId) || currentSubject.units[0];

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    currentUnit?.topics[0]?.id || ''
  );
  const currentTopic =
    currentUnit?.topics.find(t => t.id === selectedTopicId) || currentUnit?.topics[0];

  // Parameters
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(2);

  // Review state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<Question[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = documentQuestionService.validateFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid file uploaded.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const doc = await documentQuestionService.processDocument(file);
      setDocument(doc);
      if (doc.pages && doc.pages.length > 0) {
        setSelectedPages(doc.pages.map(p => p.pageNumber));
      }
      setStep('configure');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract readable text from document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!document) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const questions = await documentQuestionService.generateFromDocument({
        document,
        selectedPageNumbers: selectedPages,
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        topicId: currentTopic.id,
        topicName: currentTopic.name,
        semester: currentSubject.semester,
        department: currentSubject.department,
        questionCount,
        questionTypes: ['mcq', 'true-false'],
        difficulty,
        marksPerQuestion,
      });

      setGeneratedBatch(questions);
      setSelectedIndices(questions.map((_, i) => i));
      setStep('review');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to synthesize questions from document.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePageSelection = (num: number) => {
    setSelectedPages(prev =>
      prev.includes(num) ? prev.filter(x => x !== num) : [...prev, num]
    );
  };

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleInsertQuestions = () => {
    const selected = generatedBatch.filter((_, i) => selectedIndices.includes(i));
    onAddQuestions(selected);
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
            onClick={onClose}
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
                    {(document.fileSize / 1024).toFixed(1)} KB · Extracted {document.pages?.length || 3} pages
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

            {/* Extracted preview & Page selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Select Pages &amp; Sections to Extract From
              </label>
              <div className="grid sm:grid-cols-3 gap-2">
                {document.pages?.map(p => {
                  const isChecked = selectedPages.includes(p.pageNumber);
                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => togglePageSelection(p.pageNumber)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50/30 ring-1 ring-teal-500/30'
                          : 'border-slate-200 bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          Page {p.pageNumber}
                        </span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            isChecked ? 'bg-teal-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                        {p.text}
                      </p>
                    </div>
                  );
                })}
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
                      setSelectedSubjectId(id);
                      const m = CURRICULUM_DATA.find(s => s.id === id);
                      if (m) {
                        setSelectedUnitId(m.units[0]?.id || '');
                        setSelectedTopicId(m.units[0]?.topics[0]?.id || '');
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    {CURRICULUM_DATA.map(s => (
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
                      setSelectedUnitId(id);
                      const u = currentSubject.units.find(x => x.id === id);
                      if (u) setSelectedTopicId(u.topics[0]?.id || '');
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    {currentSubject.units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic</label>
                  <select
                    value={selectedTopicId}
                    onChange={e => setSelectedTopicId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white"
                  >
                    {currentUnit?.topics.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Difficulty & Count */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all cursor-pointer ${
                        difficulty === d
                          ? d === 'easy'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : d === 'medium'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Count</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={questionCount}
                    onChange={e => setQuestionCount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-white text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks per Question</label>
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
                className="text-teal-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>

            <div className="space-y-3">
              {generatedBatch.map((q, idx) => {
                const isSelected = selectedIndices.includes(idx);
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
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
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
                              <FileText className="w-3 h-3" /> Page {q.sourcePageNumber}
                            </span>
                          </div>

                          <span className="text-xs font-semibold text-slate-500">
                            {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                          </span>
                        </div>

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
                            <strong>Citation:</strong> {q.explanation}
                          </p>
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
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          ) : step === 'configure' ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>
                Back to Upload
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                isLoading={isGenerating}
                leftIcon={<FileText className="w-4 h-4 text-teal-200" />}
                className="!bg-teal-700 hover:!bg-teal-800 !text-white"
              >
                Synthesize Questions from Document
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep('configure')}>
                Back to Document
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">
                  {selectedIndices.length} of {generatedBatch.length} selected
                </span>
                <Button
                  size="sm"
                  disabled={selectedIndices.length === 0}
                  onClick={handleInsertQuestions}
                  leftIcon={<Check className="w-4 h-4" />}
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
