import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Search,
  Sparkles,
  Check,
  X,
  Edit3,
  Filter,
  CheckCircle2,
  Clock,
  BookOpen,
  Brain,
  HelpCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { questionService } from '../../services/quizService';
import type { Question, CognitiveLevel, Difficulty } from '../../types/quiz';

// ─── Bloom's Taxonomy Level Configuration ─────────────────────────────────────
export const BLOOM_LEVELS: {
  level: CognitiveLevel;
  code: string;
  name: string;
  actionVerb: string;
  color: string;
  bgLight: string;
}[] = [
  {
    level: 'CL1_REMEMBER',
    code: 'CL1',
    name: 'Remember',
    actionVerb: 'Recall & Recognize',
    color: '#3b82f6',
    bgLight: '#eff6ff',
  },
  {
    level: 'CL2_UNDERSTAND',
    code: 'CL2',
    name: 'Understand',
    actionVerb: 'Explain & Classify',
    color: '#06b6d4',
    bgLight: '#ecfeff',
  },
  {
    level: 'CL3_APPLY',
    code: 'CL3',
    name: 'Apply',
    actionVerb: 'Execute & Solve',
    color: '#10b981',
    bgLight: '#ecfdf5',
  },
  {
    level: 'CL4_ANALYZE',
    code: 'CL4',
    name: 'Analyze',
    actionVerb: 'Differentiate & Trace',
    color: '#f59e0b',
    bgLight: '#fffbeb',
  },
  {
    level: 'CL5_EVALUATE',
    code: 'CL5',
    name: 'Evaluate',
    actionVerb: 'Critique & Justify',
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
  },
  {
    level: 'CL6_CREATE',
    code: 'CL6',
    name: 'Create',
    actionVerb: 'Synthesize & Design',
    color: '#ec4899',
    bgLight: '#fdf2f8',
  },
];

export const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCognitive, setSelectedCognitive] = useState<string>('all');

  // Notification Banner State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Generate Modal State
  const [isGenerateOpen, setIsGenerateOpen] = useState<boolean>(false);
  const [genSubject, setGenSubject] = useState<string>('Data Structures & Algorithms');
  const [genTopic, setGenTopic] = useState<string>('Binary Search Trees');
  const [genDifficulty, setGenDifficulty] = useState<string>('MEDIUM');
  const [genCognitive, setGenCognitive] = useState<CognitiveLevel>('CL3_APPLY');
  const [genCount, setGenCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [editExplanation, setEditExplanation] = useState<string>('');
  const [editCognitive, setEditCognitive] = useState<CognitiveLevel>('CL2_UNDERSTAND');
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>('medium');
  const [editOptions, setEditOptions] = useState<{ id: string; text: string; isCorrect: boolean }[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Load Questions
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionService.getQuestions();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load questions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ─── Human-in-the-Loop Actions ──────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      await questionService.approveQuestion(id);
      setQuestions(prev =>
        prev.map(q => (q.id === id ? { ...q, status: 'approved' } : q))
      );
      showToast('Question approved! It is now unlocked for weekly quiz selection.', 'success');
    } catch (e) {
      showToast('Failed to approve question', 'error');
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject and remove this question?')) return;
    try {
      await questionService.rejectQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      showToast('Question rejected and removed from bank.', 'info');
    } catch (e) {
      showToast('Failed to reject question', 'error');
    }
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setEditText(q.text);
    setEditExplanation(q.explanation || '');
    setEditCognitive((q.cognitiveLevel as CognitiveLevel) || 'CL2_UNDERSTAND');
    setEditDifficulty(q.difficulty);
    setEditOptions(q.options.map(opt => ({ ...opt })));
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setIsSavingEdit(true);
    try {
      await questionService.reviewQuestion(editingQuestion.id, {
        status: 'APPROVED',
        text: editText,
        explanation: editExplanation,
        cognitiveLevel: editCognitive,
        difficulty: editDifficulty.toUpperCase(),
        options: editOptions.map(o => ({ text: o.text, isCorrect: o.isCorrect })),
      });

      setQuestions(prev =>
        prev.map(q =>
          q.id === editingQuestion.id
            ? {
                ...q,
                text: editText,
                explanation: editExplanation,
                cognitiveLevel: editCognitive,
                difficulty: editDifficulty,
                options: editOptions,
                status: 'approved',
              }
            : q
        )
      );

      setEditingQuestion(null);
      showToast('Question edited and marked as APPROVED.', 'success');
    } catch (err) {
      showToast('Failed to save question edits', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ─── AI Question Generation ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await questionService.generateQuestions({
        subject: genSubject,
        topic: genTopic,
        difficulty: genDifficulty,
        bloomsLevel: genCognitive,
        count: genCount,
      });

      setQuestions(prev => [...generated, ...prev]);
      setIsGenerateOpen(false);
      setStatusFilter('pending');
      showToast(
        `Generated ${generated.length} questions mapped to Bloom's ${genCognitive}. Ready for review!`,
        'success'
      );
    } catch (err) {
      showToast('Error generating questions via Gemini API', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && q.status !== 'pending') return false;
        if (statusFilter === 'approved' && q.status !== 'approved') return false;
        if (statusFilter === 'draft' && q.status !== 'draft') return false;
      }

      // Subject filter
      if (selectedSubject !== 'all' && q.courseName !== selectedSubject) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      // Cognitive Level filter
      if (selectedCognitive !== 'all') {
        const qCog = (q.cognitiveLevel || '').toUpperCase();
        if (!qCog.includes(selectedCognitive.toUpperCase())) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inText = q.text.toLowerCase().includes(query);
        const inTopic = q.topicName.toLowerCase().includes(query);
        const inCourse = q.courseName.toLowerCase().includes(query);
        if (!inText && !inTopic && !inCourse) return false;
      }

      return true;
    });
  }, [questions, statusFilter, selectedSubject, selectedDifficulty, selectedCognitive, searchQuery]);

  // Statistics
  const pendingCount = useMemo(() => questions.filter(q => q.status === 'pending').length, [questions]);
  const approvedCount = useMemo(() => questions.filter(q => q.status === 'approved').length, [questions]);
  const higherOrderCount = useMemo(
    () =>
      questions.filter(q => {
        const cog = (q.cognitiveLevel || '').toUpperCase();
        return cog.includes('CL3') || cog.includes('CL4') || cog.includes('CL5') || cog.includes('CL6');
      }).length,
    [questions]
  );

  const subjectsList = useMemo(() => {
    const set = new Set(questions.map(q => q.courseName).filter(Boolean));
    return Array.from(set);
  }, [questions]);

  return (
    <div className="space-y-6 animate-fade-in-up pb-16">
      {/* ── Page Header ── */}
      <PageHeader
        title="Question Bank & Cognitive Review"
        breadcrumbs={[{ label: 'Faculty' }, { label: 'Question Bank' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadQuestions}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGenerateOpen(true)}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Generate with Gemini 1.5
            </Button>
          </div>
        }
      />

      {/* ── Notification Toast ── */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl shadow-lg border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : notification.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs hover:underline opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Summary Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)]">Total Repository</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{questions.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-3.5 relative overflow-hidden">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Pending Human Review</p>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)]">Approved & Quiz-Ready</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{approvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)]">Bloom's Higher-Order (CL3–CL6)</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {questions.length > 0 ? Math.round((higherOrderCount / questions.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Status Tabs & Filter Controls ── */}
      <Card padding="none">
        <div className="p-4 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--color-muted)] rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-amber-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Review ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-emerald-600'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Approved ({approvedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 bg-[var(--color-muted)] rounded-xl px-3 py-2 flex-1 md:max-w-xs">
            <Search className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search question, topic, or course..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs sm:text-sm outline-none w-full text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-[var(--color-text-muted)]">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Secondary Filters Bar */}
        <div className="px-4 py-3 bg-[var(--color-background)]/60 flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] text-xs">
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters:
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none text-[var(--color-text-primary)] focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjectsList.map(subj => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none text-[var(--color-text-primary)] focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Bloom's Level Filter */}
          <select
            value={selectedCognitive}
            onChange={e => setSelectedCognitive(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none text-[var(--color-text-primary)] focus:border-indigo-500"
          >
            <option value="all">All Cognitive Levels (Bloom's)</option>
            {BLOOM_LEVELS.map(b => (
              <option key={b.level} value={b.code}>
                {b.code}: {b.name} ({b.actionVerb})
              </option>
            ))}
          </select>

          {(selectedSubject !== 'all' || selectedDifficulty !== 'all' || selectedCognitive !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedDifficulty('all');
                setSelectedCognitive('all');
              }}
              className="text-xs text-indigo-600 hover:underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* ── Question Cards List ── */}
        <div className="divide-y divide-[var(--color-border)]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[var(--color-text-muted)]">Loading question repository...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 mx-auto flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-[var(--color-text-primary)]">No questions match your filter.</p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                Generate new curriculum-aligned questions using the Gemini 1.5 item generator above.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsGenerateOpen(true)}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              >
                Open AI Generator
              </Button>
            </div>
          ) : (
            filteredQuestions.map((q, index) => {
              const bloomInfo =
                BLOOM_LEVELS.find(b => (q.cognitiveLevel || '').toUpperCase().includes(b.code)) || BLOOM_LEVELS[1];
              const isPending = q.status === 'pending';

              return (
                <div
                  key={q.id || index}
                  className={`p-6 transition-colors hover:bg-[var(--color-background)]/40 ${
                    isPending ? 'bg-amber-50/25 dark:bg-amber-950/10' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Question Content & Options */}
                    <div className="flex-1 space-y-3">
                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Pending Human Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Approved for Weekly Quizzes
                          </span>
                        )}

                        {/* Bloom's Level Badge */}
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: bloomInfo.bgLight,
                            color: bloomInfo.color,
                            border: `1px solid ${bloomInfo.color}35`,
                          }}
                        >
                          <Brain className="w-3 h-3" />
                          {bloomInfo.code}: {bloomInfo.name} ({bloomInfo.actionVerb})
                        </span>

                        {/* Difficulty Badge */}
                        <Badge
                          color={
                            q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'
                          }
                          className="capitalize text-xs"
                        >
                          {q.difficulty}
                        </Badge>

                        {/* Subject & Topic */}
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {q.courseName} · <strong className="text-[var(--color-text-primary)]">{q.topicName}</strong>
                        </span>

                        {q.isAiGenerated && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-800">
                            <Sparkles className="w-2.5 h-2.5" /> Gemini 1.5
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-base font-semibold text-[var(--color-text-primary)] leading-relaxed">
                        {q.text}
                      </p>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={opt.id || optIdx}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                              opt.isCorrect
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-200 font-medium'
                                : 'bg-white dark:bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)]'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[var(--color-muted)] text-[var(--color-text-muted)]'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="flex-1 leading-snug">{opt.text}</span>
                            {opt.isCorrect && (
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[var(--color-muted)]/70 text-xs text-[var(--color-text-muted)] flex items-start gap-2 border border-[var(--color-border)]/60">
                          <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-[var(--color-text-primary)] font-semibold">
                              Pedagogical Justification:
                            </strong>{' '}
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Human-in-the-Loop Action Buttons */}
                    <div className="flex lg:flex-col items-center gap-2 lg:min-w-[140px] pt-2 lg:pt-0">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            fullWidth
                            variant="primary"
                            onClick={() => handleApprove(q.id)}
                            leftIcon={<Check className="w-4 h-4" />}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            fullWidth
                            variant="outline"
                            onClick={() => openEditModal(q)}
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            fullWidth
                            variant="ghost"
                            onClick={() => handleReject(q.id)}
                            leftIcon={<X className="w-4 h-4 text-rose-500" />}
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="w-full text-center py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Quiz Ready
                          </div>
                          <Button
                            size="sm"
                            fullWidth
                            variant="outline"
                            onClick={() => openEditModal(q)}
                            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            fullWidth
                            variant="ghost"
                            onClick={() => handleReject(q.id)}
                            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ── AI Question Generation Modal ── */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => !isGenerating && setIsGenerateOpen(false)}
        title="Automated Item Generation (Gemini 1.5)"
        size="lg"
      >
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Human-in-the-Loop AI Workflow</p>
              <p className="mt-0.5 opacity-90">
                Generated questions are automatically tagged with your requested Bloom's Taxonomy cognitive level and saved
                with <strong>PENDING_APPROVAL</strong> status. You must verify or edit them before they become available for weekly quizzes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Course / Subject
              </label>
              <input
                type="text"
                value={genSubject}
                onChange={e => setGenSubject(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Specific Topic
              </label>
              <input
                type="text"
                value={genTopic}
                onChange={e => setGenTopic(e.target.value)}
                placeholder="e.g. AVL Trees, Graph BFS/DFS, Normalization"
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
              />
            </div>
          </div>

          {/* Difficulty & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Difficulty
              </label>
              <select
                value={genDifficulty}
                onChange={e => setGenDifficulty(e.target.value)}
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Number of MCQs to Generate
              </label>
              <select
                value={genCount}
                onChange={e => setGenCount(parseInt(e.target.value, 10))}
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
              >
                <option value={1}>1 Question</option>
                <option value={2}>2 Questions</option>
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
              </select>
            </div>
          </div>

          {/* Bloom's Taxonomy Cognitive Level Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center justify-between">
              <span>Target Bloom's Taxonomy Cognitive Level</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-normal normal-case">
                Selected: {genCognitive}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BLOOM_LEVELS.map(item => {
                const selected = genCognitive === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setGenCognitive(item.level)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] hover:bg-[var(--color-muted)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: item.color }}>
                        {item.code}: {item.name}
                      </span>
                      {selected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-1">{item.actionVerb}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => setIsGenerateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isGenerating}
              isLoading={isGenerating}
              onClick={handleGenerate}
              leftIcon={!isGenerating ? <Sparkles className="w-4 h-4 text-amber-300" /> : undefined}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isGenerating ? 'Synthesizing with Gemini 1.5...' : `Generate ${genCount} Questions`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Question Modal ── */}
      <Modal
        isOpen={Boolean(editingQuestion)}
        onClose={() => !isSavingEdit && setEditingQuestion(null)}
        title="Edit & Verify Question"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Question Text
            </label>
            <textarea
              rows={3}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-xl p-3 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Difficulty
              </label>
              <select
                value={editDifficulty}
                onChange={e => setEditDifficulty(e.target.value as Difficulty)}
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Bloom's Cognitive Level
              </label>
              <select
                value={editCognitive}
                onChange={e => setEditCognitive(e.target.value as CognitiveLevel)}
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
              >
                {BLOOM_LEVELS.map(b => (
                  <option key={b.level} value={b.level}>
                    {b.code}: {b.name} ({b.actionVerb})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Options Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Options (Select radio button for the correct answer)
            </label>
            <div className="space-y-2">
              {editOptions.map((opt, idx) => (
                <div key={opt.id || idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={opt.isCorrect}
                    onChange={() => {
                      setEditOptions(prev =>
                        prev.map((o, i) => ({ ...o, isCorrect: i === idx }))
                      );
                    }}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-[var(--color-text-muted)] w-4">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => {
                      const newText = e.target.value;
                      setEditOptions(prev =>
                        prev.map((o, i) => (i === idx ? { ...o, text: newText } : o))
                      );
                    }}
                    className={`flex-1 border rounded-lg px-3 py-1.5 text-xs sm:text-sm outline-none ${
                      opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)]'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Pedagogical Explanation
            </label>
            <textarea
              rows={2}
              value={editExplanation}
              onChange={e => setEditExplanation(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-xl p-2.5 text-xs sm:text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-indigo-500 text-[var(--color-text-primary)]"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
            <Button
              variant="outline"
              disabled={isSavingEdit}
              onClick={() => setEditingQuestion(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={isSavingEdit}
              isLoading={isSavingEdit}
              onClick={handleSaveEdit}
              leftIcon={<Check className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save & Mark Approved
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
