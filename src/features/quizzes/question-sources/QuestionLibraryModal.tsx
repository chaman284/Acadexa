// ============================================================================
// ACADEXA QUESTION LIBRARY SELECTION MODAL
// Multi-facet filtering, deduplication warning, batch question selection
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Search, Filter, Check, BookOpen, Layers, Award,
  AlertTriangle, CheckSquare, Square, Eye, Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Question, Difficulty, QuestionType, QuizQuestion } from '../types/quizTypes';
import { questionLibraryService } from '../services/questionLibraryService';
import { CURRICULUM_DATA } from '../constants/curriculumData';

interface QuestionLibraryModalProps {
  currentQuizQuestions: QuizQuestion[];
  defaultSubjectId?: string;
  defaultSemester?: number;
  onAddQuestions: (selectedQuestions: Question[]) => void;
  onClose: () => void;
}

export const QuestionLibraryModal: React.FC<QuestionLibraryModalProps> = ({
  currentQuizQuestions,
  defaultSubjectId,
  defaultSemester,
  onAddQuestions,
  onClose,
}) => {
  const [libraryQuestions, setLibraryQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(defaultSubjectId || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');

  // Selected question IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  useEffect(() => {
    setLoading(true);
    questionLibraryService
      .getQuestions({
        subjectId: selectedSubjectId !== 'all' ? selectedSubjectId : undefined,
        difficulty: selectedDifficulty,
        type: selectedType,
        search,
      })
      .then(res => {
        setLibraryQuestions(res);
      })
      .finally(() => setLoading(false));
  }, [selectedSubjectId, selectedDifficulty, selectedType, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === libraryQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(libraryQuestions.map(q => q.id));
    }
  };

  const handleAdd = () => {
    const toAdd = libraryQuestions.filter(q => selectedIds.includes(q.id));
    onAddQuestions(toAdd);
  };

  // Check which library questions are already in the quiz
  const existingIdSet = useMemo(
    () => new Set(currentQuizQuestions.map(q => q.libraryQuestionId || q.id)),
    [currentQuizQuestions]
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-[var(--color-border)] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Question Bank Library</h3>
              <p className="text-xs text-slate-400">
                Browse verified academic questions and add directly to your quiz draft
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

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by keyword, topic, or concept..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
          >
            <option value="all">All Subjects</option>
            {CURRICULUM_DATA.map(s => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 capitalize"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
          >
            <option value="all">All Question Types</option>
            <option value="mcq">Single MCQ</option>
            <option value="multi-select">Multi-Select</option>
            <option value="true-false">True / False</option>
            <option value="fill-blank">Fill in Blanks</option>
            <option value="short-answer">Short Answer</option>
            <option value="code-output">Code Output</option>
          </select>

          {/* Select all toggle */}
          {libraryQuestions.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {selectedIds.length === libraryQuestions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {/* Question List View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Loading verified question library...
            </div>
          ) : libraryQuestions.length === 0 ? (
            <div className="py-16 text-center card bg-slate-50 border border-slate-200 rounded-xl p-8">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
              <p className="font-bold text-sm text-slate-700 mb-1">No matching questions found</p>
              <p className="text-xs text-slate-500">Try adjusting your keyword search or active filters.</p>
            </div>
          ) : (
            libraryQuestions.map(q => {
              const isSelected = selectedIds.includes(q.id);
              const isAlreadyInQuiz = existingIdSet.has(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 relative ${
                    isSelected
                      ? 'border-[var(--color-oxblood)] bg-rose-50/20 shadow-xs'
                      : isAlreadyInQuiz
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Checkbox button */}
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-oxblood)] text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  {/* Question details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-500">
                        {q.metadata.subjectCode}: {q.metadata.topicName}
                      </span>
                      {isAlreadyInQuiz && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Already in Quiz
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-snug mb-2">
                      {q.text}
                    </p>

                    {/* Options preview for MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-1.5 pt-1 text-xs text-slate-600">
                        {q.options.map((opt, i) => (
                          <div
                            key={opt.id}
                            className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                              opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="font-bold opacity-60">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            <span className="truncate">{opt.text}</span>
                            {opt.isCorrect && <Check className="w-3 h-3 text-emerald-600 ml-auto" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            <strong>{selectedIds.length}</strong> questions selected from library
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={handleAdd}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add {selectedIds.length > 0 ? `${selectedIds.length} Questions` : 'Questions'} to Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
