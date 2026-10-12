import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { mockQuestions } from '../../data/quizzes';
import { mockCourses } from '../../data/courses';
import type { Question, ExamType } from '../../types/quiz';
import { downloadQuestionsPdf } from '../../services/questionPdfGenerator';
import {
  Search, Filter, Sparkles, BookOpen, Download,
  CheckSquare, Square, FileText, CheckCircle2, AlertCircle, ChevronDown, Award
} from 'lucide-react';
import { clsx } from 'clsx';

const EXAM_TYPE_LABELS: Record<string, string> = {
  all: 'All Exam Types',
  cie: 'CIE / Internal Assessment',
  see: 'SEE / Semester End Exam',
  model: 'Model Examination',
  practice: 'Practice Test',
};

const EXAM_TYPE_BADGES: Record<string, 'indigo' | 'green' | 'amber' | 'gray'> = {
  cie: 'indigo',
  see: 'green',
  model: 'amber',
  practice: 'gray',
};

export const QuestionBank: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [filterExamType, setFilterExamType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Available units based on selected subject
  const availableUnits = useMemo(() => {
    if (filterSubject === 'all') {
      const unitsMap = new Map<string, string>();
      mockQuestions.forEach(q => {
        if (q.unitId && q.unitName) {
          unitsMap.set(q.unitId, q.unitName);
        }
      });
      return Array.from(unitsMap.entries()).map(([id, name]) => ({ id, name }));
    }
    const course = mockCourses.find(c => c.id === filterSubject);
    return course ? course.units.map(u => ({ id: u.id, name: `Unit ${u.unitNumber}: ${u.name}` })) : [];
  }, [filterSubject]);

  // Reset unit filter when subject changes
  const handleSubjectChange = (val: string) => {
    setFilterSubject(val);
    setFilterUnit('all');
  };

  // Filter questions
  const filtered = useMemo(() => {
    return mockQuestions.filter(q => {
      const matchSearch =
        q.text.toLowerCase().includes(search.toLowerCase()) ||
        q.topicName.toLowerCase().includes(search.toLowerCase()) ||
        q.unitName.toLowerCase().includes(search.toLowerCase());
      const matchSubject = filterSubject === 'all' || q.courseId === filterSubject;
      const matchUnit = filterUnit === 'all' || q.unitId === filterUnit;
      const matchExam = filterExamType === 'all' || q.examType === filterExamType;
      const matchDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;

      return matchSearch && matchSubject && matchUnit && matchExam && matchDiff;
    });
  }, [search, filterSubject, filterUnit, filterExamType, filterDifficulty]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedQuestionIds.length === filtered.length) {
      setSelectedQuestionIds([]);
    } else {
      setSelectedQuestionIds(filtered.map(q => q.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // PDF Download Handlers
  const handleDownloadAllFiltered = () => {
    try {
      if (filtered.length === 0) {
        setFeedback({ type: 'error', message: 'No questions match the current filters to download.' });
        return;
      }
      const courseName = filterSubject !== 'all'
        ? (mockCourses.find(c => c.id === filterSubject)?.name || 'Course')
        : 'All Subjects';
      const examLabel = EXAM_TYPE_LABELS[filterExamType] || 'All Exams';

      downloadQuestionsPdf(filtered, {
        title: `Question Bank — ${courseName}`,
        subtitle: `Exam Category: ${examLabel}`,
        filterSummary: `${filtered.length} questions matching [Subject: ${courseName}, Exam: ${examLabel}]`,
      });

      setFeedback({ type: 'success', message: `Downloaded PDF containing all ${filtered.length} filtered questions!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate PDF.' });
    }
  };

  const handleDownloadSelected = () => {
    try {
      const selectedQuestions = mockQuestions.filter(q => selectedQuestionIds.includes(q.id));
      if (selectedQuestions.length === 0) {
        setFeedback({ type: 'error', message: 'Please select at least one question to download.' });
        return;
      }

      downloadQuestionsPdf(selectedQuestions, {
        title: 'Selected Questions Assessment Sheet',
        subtitle: 'Acadexa Question Bank Export',
        filterSummary: `Selected ${selectedQuestions.length} questions`,
      });

      setFeedback({ type: 'success', message: `Downloaded PDF with ${selectedQuestions.length} selected questions!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate PDF.' });
    }
  };

  const handleDownloadSingle = (question: Question) => {
    try {
      downloadQuestionsPdf([question], {
        title: `Question ${question.id.toUpperCase()} — ${question.courseName}`,
        subtitle: `${question.unitName} · ${question.topicName}`,
        filterSummary: `Single Question [${question.marks || 2} Marks]`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate PDF.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Question Bank"
        subtitle="Organized subject, unit, and exam-level questions with academic PDF export"
        breadcrumbs={[{ label: 'Dashboard', to: '/student' }, { label: 'Question Bank' }]}
        action={
          <div className="flex items-center gap-2">
            {selectedQuestionIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSelected}
                leftIcon={<Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
              >
                Download Selected ({selectedQuestionIds.length})
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleDownloadAllFiltered}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download All ({filtered.length})
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={clsx(
            'p-3.5 rounded-xl border flex items-center gap-2.5 text-sm',
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          )}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1 min-w-[220px] flex items-center gap-2 bg-[var(--color-muted)] rounded-[10px] px-3 py-2">
              <Search className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions by topic, text, or unit..."
                className="bg-transparent text-sm outline-none w-full text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Exam Type Filter */}
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <select
                value={filterExamType}
                onChange={e => setFilterExamType(e.target.value)}
                className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] font-medium"
              >
                <option value="all">All Exam Types</option>
                <option value="cie">CIE / Internal Assessment</option>
                <option value="see">SEE / Semester End Exam</option>
                <option value="model">Model Examination</option>
                <option value="practice">Practice Tests</option>
              </select>
            </div>

            {/* Subject Filter */}
            <select
              value={filterSubject}
              onChange={e => handleSubjectChange(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="all">All Subjects</option>
              {mockCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Unit Filter */}
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] max-w-xs truncate"
            >
              <option value="all">All Units</option>
              {availableUnits.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-[10px] px-3 py-2 bg-white text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Quick Filter Status Bar */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]/60">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 font-semibold text-[var(--color-accent)] hover:underline"
              >
                {selectedQuestionIds.length === filtered.length && filtered.length > 0 ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>Select All Filtered</span>
              </button>
              {selectedQuestionIds.length > 0 && (
                <span>({selectedQuestionIds.length} of {filtered.length} selected)</span>
              )}
            </div>

            <span>Showing {filtered.length} of {mockQuestions.length} questions</span>
          </div>
        </div>
      </Card>

      {/* Question Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">No Questions Found</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-sm mx-auto">
              No questions match the current combination of subject, unit, and exam type filters. Try selecting "All Exam Types" or adjusting your search term.
            </p>
          </Card>
        ) : (
          filtered.map((q, idx) => {
            const isSelected = selectedQuestionIds.includes(q.id);
            const examBadge = q.examType ? EXAM_TYPE_BADGES[q.examType] || 'indigo' : 'indigo';

            return (
              <div
                key={q.id}
                className={clsx(
                  'card p-4 transition-all duration-150 border',
                  isSelected
                    ? 'border-[var(--color-accent)] bg-indigo-50/20'
                    : 'border-[var(--color-border)] hover:border-slate-300'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectOne(q.id)}
                      className={clsx(
                        'mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors flex-shrink-0',
                        isSelected
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'border border-[var(--color-border)] hover:border-[var(--color-accent)]'
                      )}
                    >
                      {isSelected && <CheckSquare className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">
                          Question #{idx + 1}
                        </span>
                        <Badge color={examBadge} className="text-[10px] uppercase tracking-wide">
                          {q.examType ? EXAM_TYPE_LABELS[q.examType] || q.examType : 'Assessment'}
                        </Badge>
                        <Badge color="gray" className="text-[10px]">
                          {q.courseName}
                        </Badge>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {q.unitName} · {q.topicName}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {q.marks || 2} Marks
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed mt-1">
                        {q.text}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadSingle(q)}
                    leftIcon={<Download className="w-3 h-3" />}
                    className="flex-shrink-0"
                  >
                    PDF
                  </Button>
                </div>

                {/* Question Options Grid */}
                {q.options && q.options.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-2 mt-3 pl-8">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt.id}
                        className={clsx(
                          'p-2 rounded-lg text-xs flex items-center gap-2 border',
                          opt.isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium'
                            : 'bg-[var(--color-muted)]/50 border-transparent text-[var(--color-text-secondary)]'
                        )}
                      >
                        <span className="w-5 h-5 rounded-md bg-white border border-[var(--color-border)] flex items-center justify-center font-bold text-[10px] text-slate-600 flex-shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="truncate">{opt.text}</span>
                        {opt.isCorrect && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-700">Correct Key</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Explanation note */}
                {q.explanation && (
                  <div className="mt-2.5 pl-8 text-xs text-[var(--color-text-muted)] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong className="text-slate-700">Academic Note:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
