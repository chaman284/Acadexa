// ============================================================================
// ACADEXA UNIFIED QUESTION BUILDER & LIST
// Integrates Manual, Library, AI, and Document sources into one cohesive list
// ============================================================================
import React, { useMemo } from 'react';
import {
  Plus, BookOpen, Sparkles, FileText, Edit2, Copy, Trash2,
  ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, Layers,
  BarChart2, Award, Hash,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { QuizQuestion, Question } from '../types/quizTypes';

interface QuestionListProps {
  questions: QuizQuestion[];
  onOpenManualEditor: () => void;
  onOpenLibrarySelector: () => void;
  onOpenAiGenerator: () => void;
  onOpenDocumentGenerator: () => void;
  onEditQuestion: (question: QuizQuestion) => void;
  onDuplicateQuestion: (quizQuestionId: string) => void;
  onRemoveQuestion: (quizQuestionId: string) => void;
  onMoveQuestion: (index: number, direction: 'up' | 'down') => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onOpenManualEditor,
  onOpenLibrarySelector,
  onOpenAiGenerator,
  onOpenDocumentGenerator,
  onEditQuestion,
  onDuplicateQuestion,
  onRemoveQuestion,
  onMoveQuestion,
}) => {
  // Live metric distributions
  const totalMarks = useMemo(
    () => questions.reduce((sum, q) => sum + (q.marks || 1), 0),
    [questions]
  );

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      counts[q.type] = (counts[q.type] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const difficultyDistribution = useMemo(() => {
    const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    questions.forEach(q => {
      counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const topicCoverage = useMemo(() => {
    const topics = new Set<string>();
    questions.forEach(q => {
      if (q.metadata?.topicName) topics.add(q.metadata.topicName);
    });
    return Array.from(topics);
  }, [questions]);

  const getSourceBadge = (source: Question['source'], docName?: string) => {
    switch (source) {
      case 'manual':
        return <Badge color="indigo">Manual</Badge>;
      case 'library':
        return <Badge color="green">Library</Badge>;
      case 'ai':
        return <Badge color="purple">AI Generated</Badge>;
      case 'document':
        return (
          <span title={docName ? `Source: ${docName}` : 'Document'}>
            <Badge color="blue">Document</Badge>
          </span>
        );
      default:
        return <Badge color="gray">Source</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Prominent Question Source Launchers */}
      <div className="bg-white p-5 rounded-2xl border border-[var(--color-border)] shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Add Questions to Assessment
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Manual */}
          <button
            type="button"
            onClick={onOpenManualEditor}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-700 mb-2 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Write Manually</p>
              <p className="text-[11px] text-slate-500">6 Question formats supported</p>
            </div>
          </button>

          {/* 2. Library */}
          <button
            type="button"
            onClick={onOpenLibrarySelector}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/30 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-800 mb-2 transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">From Question Bank</p>
              <p className="text-[11px] text-slate-500">Curriculum-verified items</p>
            </div>
          </button>

          {/* 3. AI */}
          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/30 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center text-purple-700 mb-2 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Generate with AI</p>
              <p className="text-[11px] text-slate-500">Bloom&apos;s Taxonomy alignment</p>
            </div>
          </button>

          {/* 4. Document */}
          <button
            type="button"
            onClick={onOpenDocumentGenerator}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-white hover:bg-teal-50/30 text-left transition-all group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-100 group-hover:bg-teal-200 flex items-center justify-center text-teal-700 mb-2 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">From Document</p>
              <p className="text-[11px] text-slate-500">PDF, DOCX, PPTX &amp; TXT</p>
            </div>
          </button>
        </div>
      </div>

      {/* Live Syllabus & Assessment Distribution Summary */}
      {questions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Questions
            </span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{questions.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">
              ~{Math.ceil(questions.length * 2)} min estimated
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Marks
            </span>
            <p className="text-2xl font-black text-[var(--color-accent)] mt-0.5">{totalMarks}</p>
            <span className="text-[11px] text-slate-500 font-medium">
              {(totalMarks / questions.length).toFixed(1)} avg marks / Q
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Difficulty Mix
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
              <span className="text-emerald-600">{difficultyDistribution.easy}E</span>
              <span className="text-slate-300">/</span>
              <span className="text-amber-600">{difficultyDistribution.medium}M</span>
              <span className="text-slate-300">/</span>
              <span className="text-rose-600">{difficultyDistribution.hard}H</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Easy / Med / Hard</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Topics Covered
            </span>
            <p className="text-2xl font-black text-indigo-600 mt-0.5">{topicCoverage.length}</p>
            <span className="text-[11px] text-slate-500 font-medium truncate block">
              {topicCoverage[0] || 'Unmapped'}
            </span>
          </div>
        </div>
      )}

      {/* Unified Question List */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          /* Empty state */
          <div className="card p-12 bg-white border border-dashed border-slate-300 rounded-2xl text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
              <Layers className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-slate-800 mb-1">
              Your Quiz Has No Questions Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
              Mix and match questions from any source: write manually, pull from the department library, synthesize with AI, or upload lecture notes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button size="sm" onClick={onOpenManualEditor} leftIcon={<Plus className="w-4 h-4" />}>
                Write Manually
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenLibrarySelector}>
                Browse Library
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenAiGenerator}>
                AI Generate
              </Button>
            </div>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.quizQuestionId || q.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getSourceBadge(q.source, q.sourceDocumentName)}
                      <Badge color="gray" className="uppercase text-[10px]">
                        {q.type}
                      </Badge>
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
                      <span className="text-xs font-semibold text-slate-700">
                        {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                      </span>

                      {/* Answer Key Status indicator */}
                      {q.hasValidAnswerKey ? (
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Key Set
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Missing Key
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.text}
                    </p>

                    {/* Metadata topic breadcrumb */}
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>{q.metadata?.subjectCode || 'CS'}:</span>
                      <strong className="text-slate-600 font-medium">
                        {q.metadata?.unitName}
                      </strong>{' '}
                      &rarr; <span>{q.metadata?.topicName}</span>
                      {q.sourceDocumentName && (
                        <span className="text-teal-700 font-semibold ml-1">
                          (Doc: {q.sourceDocumentName} · p.{q.sourcePageNumber})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Question Row Actions */}
                <div className="flex items-center gap-1">
                  {/* Up / Down reorder */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveQuestion(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === questions.length - 1}
                      onClick={() => onMoveQuestion(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEditQuestion(q)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDuplicateQuestion(q.quizQuestionId)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Duplicate Question"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveQuestion(q.quizQuestionId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
