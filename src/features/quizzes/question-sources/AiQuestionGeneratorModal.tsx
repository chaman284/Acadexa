// ============================================================================
// ACADEXA AI QUESTION GENERATOR MODAL
// Curriculum-guided AI item generation with review, batch selection & regeneration
// ============================================================================
import React, { useState } from 'react';
import {
  X, Sparkles, Loader2, Check, RefreshCw, Trash2, Eye,
  BookOpen, Layers, Award, AlertCircle, HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type {
  Question,
  QuestionType,
  Difficulty,
} from '../types/quizTypes';
import { aiQuestionService } from '../services/aiQuestionService';
import { CURRICULUM_DATA } from '../constants/curriculumData';

interface AiQuestionGeneratorModalProps {
  defaultSubjectId?: string;
  defaultSemester?: number;
  onAddQuestions: (generatedQuestions: Question[]) => void;
  onClose: () => void;
}

export const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
  defaultSubjectId,
  defaultSemester,
  onAddQuestions,
  onClose,
}) => {
  // Step 1: Configuration; Step 2: Review generated questions
  const [currentStep, setCurrentStep] = useState<'configure' | 'review'>('configure');

  // Config parameters
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

  const [questionCount, setQuestionCount] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [marksPerQuestion, setMarksPerQuestion] = useState<number>(2);
  const [skillFocus, setSkillFocus] = useState<
    'conceptual' | 'application' | 'problem_solving' | 'recall'
  >('conceptual');
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['mcq']);
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(true);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<Question[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleType = (t: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(t)
        ? prev.length > 1
          ? prev.filter(x => x !== t)
          : prev
        : [...prev, t]
    );
  };

  const handleGenerate = async () => {
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const questions = await aiQuestionService.generateQuestions({
        subjectId: currentSubject.id,
        subjectName: currentSubject.name,
        semester: currentSubject.semester,
        department: currentSubject.department,
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        topicId: currentTopic.id,
        topicName: currentTopic.name,
        questionCount,
        questionTypes: selectedTypes,
        difficulty,
        marksPerQuestion,
        skillFocus,
        includeExplanations,
      });

      setGeneratedBatch(questions);
      setSelectedIndices(questions.map((_, i) => i)); // Select all by default
      setCurrentStep('review');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate assessment questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateItem = async (index: number) => {
    const item = generatedBatch[index];
    try {
      const refreshed = await aiQuestionService.regenerateSingleQuestion(item);
      setGeneratedBatch(prev => prev.map((q, i) => (i === index ? refreshed : q)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = (index: number) => {
    setGeneratedBatch(prev => prev.filter((_, i) => i !== index));
    setSelectedIndices(prev =>
      prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
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
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AI Assessment Question Generator</h3>
              <p className="text-xs text-slate-400">
                Synthesize curriculum-aligned questions mapped to Bloom&apos;s Taxonomy
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

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Configuration Step */}
        {currentStep === 'configure' ? (
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Syllabus Target Grid */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1. Target Syllabus Topic
                </h4>
              </div>

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

            {/* Pedagogy & Difficulty Configuration */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Cognitive Skill Focus
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'conceptual', label: 'Conceptual Understanding' },
                    { id: 'application', label: 'Practical Application' },
                    { id: 'problem_solving', label: 'Problem-Solving' },
                    { id: 'recall', label: 'Recall & Theorems' },
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkillFocus(s.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                        skillFocus === s.id
                          ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-500/30'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
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

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Number of Questions</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
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

            {/* Question Types Multi-Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Included Question Formats
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'mcq', label: 'Single MCQ' },
                  { id: 'multi-select', label: 'Multi-Select' },
                  { id: 'true-false', label: 'True / False' },
                  { id: 'fill-blank', label: 'Fill in Blanks' },
                ].map(t => {
                  const isChecked = selectedTypes.includes(t.id as QuestionType);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleType(t.id as QuestionType)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-purple-50 text-purple-900 border-purple-500 font-bold'
                          : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 text-purple-600" />}
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation Toggle */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                id="inc-exp"
                checked={includeExplanations}
                onChange={e => setIncludeExplanations(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="inc-exp" className="text-xs text-slate-700 cursor-pointer">
                Generate pedagogical explanations &amp; learning hints alongside answer keys
              </label>
            </div>
          </div>
        ) : (
          /* Step 2: Review Generated Questions */
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900">
              <span className="font-semibold">
                Generated {generatedBatch.length} questions for {currentTopic?.name} ({skillFocus}). Review and select before adding to quiz.
              </span>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate Batch
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
                        ? 'border-purple-500 bg-purple-50/20 shadow-xs'
                        : 'border-slate-200 bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(idx)}
                        className="w-4 h-4 mt-1 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
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
                            <span className="text-xs font-semibold text-slate-600">
                              {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRegenerateItem(idx)}
                              title="Regenerate this specific question"
                              className="p-1 text-slate-400 hover:text-purple-600 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(idx)}
                              title="Discard question"
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                            <strong>Explanation:</strong> {q.explanation}
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

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {currentStep === 'configure' ? (
            <>
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleGenerate}
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4 text-purple-200" />}
                className="!bg-purple-700 hover:!bg-purple-800 !text-white"
              >
                Generate Assessment Batch
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep('configure')}
              >
                Back to Configuration
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
