// ============================================================================
// ACADEXA MANUAL QUESTION EDITOR
// Rich editor supporting 6 question types and rigorous academic topic metadata
// ============================================================================
import React, { useState } from 'react';
import {
  X, Plus, Trash2, Check, AlertCircle, HelpCircle, Code,
  BookOpen, Layers, Award, Sparkles, CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type {
  Question,
  QuestionType,
  Difficulty,
  CognitiveLevel,
  QuestionOption,
} from '../types/quizTypes';
import { CURRICULUM_DATA } from '../constants/curriculumData';

interface ManualQuestionEditorProps {
  initialQuestion?: Partial<Question> | null;
  defaultSubjectId?: string;
  defaultSemester?: number;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export const ManualQuestionEditor: React.FC<ManualQuestionEditorProps> = ({
  initialQuestion,
  defaultSubjectId,
  defaultSemester,
  onSave,
  onCancel,
}) => {
  // Basic question state
  const [text, setText] = useState(initialQuestion?.text || '');
  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'mcq');
  const [difficulty, setDifficulty] = useState<Difficulty>(initialQuestion?.difficulty || 'medium');
  const [marks, setMarks] = useState<number>(initialQuestion?.marks || 2);
  const [negativeMarks, setNegativeMarks] = useState<number>(initialQuestion?.negativeMarks || 0);
  const [explanation, setExplanation] = useState(initialQuestion?.explanation || '');
  const [hint, setHint] = useState(initialQuestion?.hint || '');

  // Options for MCQ / Multi-select / True-False
  const [options, setOptions] = useState<QuestionOption[]>(
    initialQuestion?.options && initialQuestion.options.length > 0
      ? initialQuestion.options
      : type === 'true-false'
      ? [
          { id: 'opt_tf_true', text: 'True', isCorrect: true },
          { id: 'opt_tf_false', text: 'False', isCorrect: false },
        ]
      : [
          { id: 'opt_1', text: '', isCorrect: true },
          { id: 'opt_2', text: '', isCorrect: false },
          { id: 'opt_3', text: '', isCorrect: false },
          { id: 'opt_4', text: '', isCorrect: false },
        ]
  );

  // Fill in the blanks
  const [acceptedAnswersText, setAcceptedAnswersText] = useState<string>(
    initialQuestion?.acceptedAnswers ? initialQuestion.acceptedAnswers.join(', ') : ''
  );
  const [caseSensitive, setCaseSensitive] = useState<boolean>(initialQuestion?.caseSensitive || false);

  // Short answer
  const [expectedAnswer, setExpectedAnswer] = useState<string>(initialQuestion?.expectedAnswer || '');

  // Code output question
  const [codeSnippet, setCodeSnippet] = useState<string>(initialQuestion?.codeSnippet || '');
  const [codeLanguage, setCodeLanguage] = useState<string>(initialQuestion?.codeLanguage || 'cpp');

  // Academic Metadata
  const initialSubj = CURRICULUM_DATA.find(s => s.id === (initialQuestion?.metadata?.subjectId || defaultSubjectId)) || CURRICULUM_DATA[0];
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubj.id);
  const currentSubject = CURRICULUM_DATA.find(s => s.id === selectedSubjectId) || CURRICULUM_DATA[0];

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    initialQuestion?.metadata?.unitId || currentSubject.units[0]?.id || ''
  );
  const currentUnit = currentSubject.units.find(u => u.id === selectedUnitId) || currentSubject.units[0];

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialQuestion?.metadata?.topicId || currentUnit?.topics[0]?.id || ''
  );
  const currentTopic = currentUnit?.topics.find(t => t.id === selectedTopicId) || currentUnit?.topics[0];

  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(
    initialQuestion?.metadata?.subtopicName || currentTopic?.subtopics?.[0] || ''
  );

  const [cognitiveLevel, setCognitiveLevel] = useState<CognitiveLevel>(
    initialQuestion?.metadata?.cognitiveLevel || 'CL2_UNDERSTAND'
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  // Handle question type switch smoothly without data wipe
  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (newType === 'true-false') {
      setOptions([
        { id: 'opt_tf_true', text: 'True', isCorrect: true },
        { id: 'opt_tf_false', text: 'False', isCorrect: false },
      ]);
    } else if (newType === 'mcq' || newType === 'multi-select') {
      if (options.length < 2) {
        setOptions([
          { id: `opt_${Date.now()}_1`, text: '', isCorrect: true },
          { id: `opt_${Date.now()}_2`, text: '', isCorrect: false },
        ]);
      }
    }
  };

  // Option management
  const handleAddOption = () => {
    setOptions(prev => [
      ...prev,
      { id: `opt_${Date.now()}_${prev.length + 1}`, text: '', isCorrect: false },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const handleOptionTextChange = (id: string, newText: string) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, text: newText } : o)));
  };

  const handleSingleCorrectSelect = (id: string) => {
    setOptions(prev => prev.map(o => ({ ...o, isCorrect: o.id === id })));
  };

  const handleMultiCorrectToggle = (id: string) => {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)));
  };

  // Submission validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!text.trim()) {
      setValidationError('Question text is required.');
      return;
    }

    if (!selectedTopicId) {
      setValidationError('Please map this question to a syllabus topic for learning gap analytics.');
      return;
    }

    let hasValidAnswerKey = false;
    let acceptedAnswers: string[] | undefined = undefined;

    if (type === 'mcq' || type === 'true-false') {
      const correctCount = options.filter(o => o.isCorrect).length;
      const emptyOption = options.some(o => !o.text.trim());
      if (emptyOption) {
        setValidationError('All option labels must contain text.');
        return;
      }
      if (correctCount !== 1) {
        setValidationError('Please mark exactly one option as the correct answer.');
        return;
      }
      hasValidAnswerKey = true;
    } else if (type === 'multi-select') {
      const correctCount = options.filter(o => o.isCorrect).length;
      const emptyOption = options.some(o => !o.text.trim());
      if (emptyOption) {
        setValidationError('All option labels must contain text.');
        return;
      }
      if (correctCount < 1) {
        setValidationError('Please mark at least one option as correct for multiple-select MCQ.');
        return;
      }
      hasValidAnswerKey = true;
    } else if (type === 'fill-blank') {
      const parsed = acceptedAnswersText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      if (parsed.length === 0) {
        setValidationError('Please provide at least one accepted answer string.');
        return;
      }
      acceptedAnswers = parsed;
      hasValidAnswerKey = true;
    } else if (type === 'code-output') {
      if (!expectedAnswer.trim()) {
        setValidationError('Please provide the expected code output.');
        return;
      }
      acceptedAnswers = [expectedAnswer.trim()];
      hasValidAnswerKey = true;
    } else if (type === 'short-answer') {
      // Short answers require rubric
      if (!expectedAnswer.trim()) {
        setValidationError('Please provide an answer rubric or expected key for manual evaluation.');
        return;
      }
      hasValidAnswerKey = true;
    }

    const builtQuestion: Question = {
      id: initialQuestion?.id || `man_q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: text.trim(),
      type,
      difficulty,
      marks: Number(marks) || 1,
      negativeMarks: Number(negativeMarks) || 0,
      options: ['mcq', 'multi-select', 'true-false'].includes(type) ? options : undefined,
      acceptedAnswers,
      expectedAnswer: ['short-answer', 'code-output'].includes(type) ? expectedAnswer.trim() : undefined,
      codeSnippet: type === 'code-output' ? codeSnippet : undefined,
      codeLanguage: type === 'code-output' ? codeLanguage : undefined,
      caseSensitive: type === 'fill-blank' ? caseSensitive : undefined,
      explanation: explanation.trim() || undefined,
      hint: hint.trim() || undefined,
      metadata: {
        department: currentSubject.department,
        semester: currentSubject.semester,
        subjectId: currentSubject.id,
        subjectCode: currentSubject.code,
        subjectName: currentSubject.name,
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        topicId: currentTopic.id,
        topicName: currentTopic.name,
        subtopicName: selectedSubtopic || undefined,
        cognitiveLevel,
      },
      source: initialQuestion?.source || 'manual',
      sourceDocumentName: initialQuestion?.sourceDocumentName,
      sourcePageNumber: initialQuestion?.sourcePageNumber,
      libraryQuestionId: initialQuestion?.libraryQuestionId,
      createdBy: initialQuestion?.createdBy || 'Faculty Member',
      createdAt: initialQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasValidAnswerKey,
    };

    onSave(builtQuestion);
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      {/* Modal / Panel Top Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {initialQuestion?.id ? 'Edit Assessment Question' : 'Create Question Manually'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure question content, answer keys, and academic topic metadata
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Editor Body */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
        {validationError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* 1. Question Type Selector */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
            Question Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { id: 'mcq', label: 'Single MCQ' },
              { id: 'multi-select', label: 'Multi-Select' },
              { id: 'true-false', label: 'True / False' },
              { id: 'fill-blank', label: 'Fill Blanks' },
              { id: 'short-answer', label: 'Short Answer' },
              { id: 'code-output', label: 'Code Output' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeChange(t.id as QuestionType)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  type === t.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Question Text */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Question Prompt / Statement <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. What is the average runtime complexity of quicksort algorithm on an array of size n?"
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
            required
          />
        </div>

        {/* 3. Type-Specific Options & Answers */}
        {(type === 'mcq' || type === 'multi-select' || type === 'true-false') && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Answer Options &amp; Key{' '}
                <span className="text-slate-500 lowercase font-normal">
                  ({type === 'mcq' ? 'click radio for correct answer' : 'check all correct answers'})
                </span>
              </label>
              {type !== 'true-false' && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-[var(--color-accent)] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border bg-white transition-all ${
                    opt.isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-slate-200'
                  }`}
                >
                  {/* Select radio or checkbox */}
                  <button
                    type="button"
                    onClick={() =>
                      type === 'multi-select'
                        ? handleMultiCorrectToggle(opt.id)
                        : handleSingleCorrectSelect(opt.id)
                    }
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      opt.isCorrect ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt.isCorrect && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <span className="text-xs font-bold text-slate-400 w-4">
                    {String.fromCharCode(65 + idx)}
                  </span>

                  {type === 'true-false' ? (
                    <span className="flex-1 text-sm font-semibold text-slate-800">{opt.text}</span>
                  ) : (
                    <input
                      type="text"
                      value={opt.text}
                      onChange={e => handleOptionTextChange(opt.id, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      className="flex-1 text-sm bg-transparent border-0 focus:outline-none"
                    />
                  )}

                  {type !== 'true-false' && options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(opt.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fill in the Blanks Editor */}
        {type === 'fill-blank' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Accepted Answer Strings (comma-separated)
              </label>
              <input
                type="text"
                value={acceptedAnswersText}
                onChange={e => setAcceptedAnswersText(e.target.value)}
                placeholder="e.g. queue, FIFO queue, Queue"
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              <p className="text-xs text-slate-500 mt-1">
                Student responses matching any of these strings will be evaluated as correct.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="case-sensitive-cb"
                checked={caseSensitive}
                onChange={e => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="case-sensitive-cb" className="text-xs text-slate-700 cursor-pointer">
                Strict case sensitivity (e.g. exact uppercase/lowercase match)
              </label>
            </div>
          </div>
        )}

        {/* Code / Output Question Editor */}
        {type === 'code-output' && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-600" />
                Code Snippet
              </label>
              <select
                value={codeLanguage}
                onChange={e => setCodeLanguage(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <textarea
              rows={4}
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              placeholder={`int x = 5;\nfor (int i = 0; i < 3; i++) x += i;\ncout << x;`}
              className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3 rounded-xl border border-slate-800 focus:outline-none"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Expected Console Output
              </label>
              <input
                type="text"
                value={expectedAnswer}
                onChange={e => setExpectedAnswer(e.target.value)}
                placeholder="e.g. 8"
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-mono focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Short Answer Rubric */}
        {type === 'short-answer' && (
          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Manual Evaluation Rubric / Key
            </div>
            <p className="text-amber-800">
              Descriptive responses are submitted for faculty review. Provide grading criteria or sample answer key below:
            </p>
            <textarea
              rows={3}
              value={expectedAnswer}
              onChange={e => setExpectedAnswer(e.target.value)}
              placeholder="e.g. Full marks for stating 3-phase commit protocol, partial marks for basic 2PL outline."
              className="w-full bg-white border border-amber-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        )}

        {/* 4. Academic Metadata (Crucial for Learning-Gap Analytics) */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Academic Syllabus Mapping (Learning-Gap Tracking)
            </h4>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={e => {
                  const sId = e.target.value;
                  setSelectedSubjectId(sId);
                  const matched = CURRICULUM_DATA.find(s => s.id === sId);
                  if (matched) {
                    setSelectedUnitId(matched.units[0]?.id || '');
                    setSelectedTopicId(matched.units[0]?.topics[0]?.id || '');
                  }
                }}
                className="w-full border border-slate-200 rounded-xl p-2 bg-white"
              >
                {CURRICULUM_DATA.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.code}] {s.name} (Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={selectedUnitId}
                onChange={e => {
                  const uId = e.target.value;
                  setSelectedUnitId(uId);
                  const matchedUnit = currentSubject.units.find(u => u.id === uId);
                  if (matchedUnit) {
                    setSelectedTopicId(matchedUnit.topics[0]?.id || '');
                  }
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
                onChange={e => {
                  const tId = e.target.value;
                  setSelectedTopicId(tId);
                  const matchedTopic = currentUnit?.topics.find(t => t.id === tId);
                  setSelectedSubtopic(matchedTopic?.subtopics?.[0] || '');
                }}
                className="w-full border border-slate-200 rounded-xl p-2 bg-white"
              >
                {currentUnit?.topics.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bloom's Taxonomy / Skill</label>
              <select
                value={cognitiveLevel}
                onChange={e => setCognitiveLevel(e.target.value as CognitiveLevel)}
                className="w-full border border-slate-200 rounded-xl p-2 bg-white"
              >
                <option value="CL1_REMEMBER">CL1 — Remember / Recall</option>
                <option value="CL2_UNDERSTAND">CL2 — Conceptual Understand</option>
                <option value="CL3_APPLY">CL3 — Application</option>
                <option value="CL4_ANALYZE">CL4 — Analytical / Problem-Solving</option>
                <option value="CL5_EVALUATE">CL5 — Evaluate</option>
                <option value="CL6_CREATE">CL6 — Design / Create</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
              <div className="flex gap-1.5">
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

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-semibold text-slate-700 mb-1">Marks</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={marks}
                  onChange={e => setMarks(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-center font-bold"
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold text-slate-700 mb-1">Neg. Marks</label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={negativeMarks}
                  onChange={e => setNegativeMarks(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2 bg-white text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Pedagogical Explanation & Hint */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Pedagogical Explanation (for student review)
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="Why this answer is correct..."
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Hint (Optional for Practice Mode)
            </label>
            <textarea
              rows={2}
              value={hint}
              onChange={e => setHint(e.target.value)}
              placeholder="Guiding prompt without giving away answer..."
              className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<Check className="w-4 h-4" />}>
            Save Question to Quiz
          </Button>
        </div>
      </form>
    </div>
  );
};
