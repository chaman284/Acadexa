// ============================================================================
// ACADEXA QUIZ MANAGEMENT DASHBOARD
// Complete management page with filtering, scheduling, duplication, and results
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Filter, Calendar, BookOpen, Clock, Users,
  Award, Eye, Play, Copy, Trash2, Edit2, CheckCircle2,
  AlertTriangle, Shield, Flame, MoreVertical, StopCircle, ArrowLeft,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Quiz, QuizStatus, QuizMode } from '../types/quizTypes';
import { quizService } from '../services/quizService';
import { CURRICULUM_DATA, MOCK_CLASSES } from '../constants/curriculumData';

const STATUS_TABS = [
  { id: 'all', label: 'All Quizzes' },
  { id: 'active', label: 'Active & Open' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'completed', label: 'Completed' },
  { id: 'draft', label: 'Drafts' },
];

export const QuizListPage: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [tab, setTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<QuizMode | 'all'>('all');

  // Confirmation modal states
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.warn('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Filtered dataset
  const filteredQuizzes = quizzes.filter(q => {
    const statusMatch =
      tab === 'all' ||
      (tab === 'active' && q.status === 'active') ||
      (tab === 'scheduled' && q.status === 'scheduled') ||
      (tab === 'completed' && q.status === 'completed') ||
      (tab === 'draft' && q.status === 'draft');

    const subjectMatch =
      selectedSubject === 'all' || q.subjectId === selectedSubject;

    const modeMatch =
      selectedMode === 'all' || q.mode === selectedMode;

    const searchMatch =
      !search.trim() ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      q.subjectCode.toLowerCase().includes(search.toLowerCase());

    return statusMatch && subjectMatch && modeMatch && searchMatch;
  });

  const handleDuplicate = async (quizId: string) => {
    try {
      const copy = await quizService.duplicateQuiz(quizId);
      setQuizzes(prev => [copy, ...prev]);
      showToast(`Duplicated "${copy.title}" as a draft.`);
    } catch (err) {
      showToast('Failed to duplicate quiz.');
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    try {
      await quizService.deleteQuiz(quizToDelete.id);
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      showToast(`Quiz "${quizToDelete.title}" removed.`);
      setQuizToDelete(null);
    } catch (err) {
      showToast('Failed to delete quiz.');
    }
  };

  const handleEndQuiz = async (quiz: Quiz) => {
    try {
      const updated = await quizService.setQuizStatus(quiz.id, 'completed');
      setQuizzes(prev => prev.map(q => (q.id === quiz.id ? updated : q)));
      showToast(`Quiz "${quiz.title}" ended and finalized.`);
    } catch (err) {
      showToast('Failed to end quiz.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/faculty/select-class');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-[var(--color-oxblood)] hover:bg-[var(--color-oxblood)]/10 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Return to Class Selection / Overview"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="h-5 w-px bg-[var(--color-border)] hidden sm:block" />

          <div>
            <h1 className="font-serif font-bold text-xl text-[var(--color-text-primary)]">Quizzes</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Create assessments, manage practice sessions, and track student performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/faculty/quiz/create')}
            className="!bg-[var(--color-oxblood)] hover:!bg-[#3f1927] !text-white font-bold"
          >
            Create Quiz
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex gap-1 border-b border-[var(--color-border)]">
            {STATUS_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px cursor-pointer"
                style={{
                  borderColor: tab === t.id ? 'var(--color-oxblood)' : 'transparent',
                  color: tab === t.id ? 'var(--color-oxblood)' : 'var(--color-text-muted)',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Subject & Mode */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, subject..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Subjects</option>
              {CURRICULUM_DATA.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.code}] {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedMode}
              onChange={e => setSelectedMode(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Modes</option>
              <option value="exam">Exam Mode</option>
              <option value="practice">Practice Mode</option>
            </select>
          </div>
        </div>

        {/* Quiz Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading assessment quizzes...
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-16 text-center card bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-base text-slate-800 mb-1">No Assessments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              There are no quizzes matching your current filters. Create a new curriculum assessment to get started.
            </p>
            <Button size="sm" onClick={() => navigate('/faculty/quiz/create')} leftIcon={<Plus className="w-4 h-4" />}>
              Create Quiz
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.map(q => {
              const isExam = q.mode === 'exam';
              const isActive = q.status === 'active';
              const isScheduled = q.status === 'scheduled';
              const isCompleted = q.status === 'completed';
              const isDraft = q.status === 'draft';

              return (
                <div
                  key={q.id}
                  className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div>
                    {/* Top status chips */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        {isActive && <Badge color="green" dot>Active Now</Badge>}
                        {isScheduled && <Badge color="amber">Scheduled</Badge>}
                        {isCompleted && <Badge color="gray">Completed</Badge>}
                        {isDraft && <Badge color="gray">Draft</Badge>}

                        <Badge color={isExam ? 'oxblood' : 'amber'} className="text-[10px] uppercase">
                          {isExam ? 'Exam' : 'Practice'}
                        </Badge>
                      </div>

                      {/* Duplicate & Delete row */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDuplicate(q.id)}
                          title="Duplicate Quiz"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setQuizToDelete(q)}
                          title="Delete Quiz"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Subject */}
                    <h3 className="font-serif font-bold text-base text-slate-900 line-clamp-1 mb-1">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-3">
                      [{q.subjectCode}] {q.subjectName}
                    </p>

                    {/* Metrics Panel */}
                    <div className="grid grid-cols-2 gap-2 mb-3.5 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{q.questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        <span>{q.totalMarks} marks</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isExam ? `${q.settings.exam.durationMinutes}m duration` : 'Self-Paced'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold">{q.attemptsCount || 0} attempts</span>
                      </div>
                    </div>

                    {/* Section allocation */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span>Assigned Class:</span>
                      <span className="font-bold text-slate-700">
                        {q.assignedClasses.length > 0
                          ? q.assignedClasses.map(c => c.name).join(', ')
                          : 'Unassigned (Draft)'}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {isDraft ? (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/faculty/quiz/${q.id}/edit`)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit Draft
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 !bg-[var(--color-accent)] hover:!opacity-95 !text-white"
                          onClick={() => navigate(`/faculty/quiz/${q.id}/results`)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Results ({q.attemptsCount || 0})
                        </Button>
                      )}

                      {/* Preview Button */}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/faculty/quiz/${q.id}/preview`)}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                        title="Preview as student"
                      >
                        Preview
                      </Button>

                      {/* End Quiz action if currently active */}
                      {isActive && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="!border-amber-200 !text-amber-700 hover:!bg-amber-50"
                          onClick={() => handleEndQuiz(q)}
                          title="End quiz"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Bottom timestamp */}
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>
                        {q.scheduledStart
                          ? `Scheduled: ${new Date(q.scheduledStart).toLocaleDateString()}`
                          : `Created: ${new Date(q.createdAt).toLocaleDateString()}`}
                      </span>
                      {!isCompleted && !isDraft && (
                        <span className="text-emerald-700 font-semibold">Active Assessment</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h4 className="font-bold text-base text-slate-900">Confirm Deletion</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete assessment <strong>&quot;{quizToDelete.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setQuizToDelete(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white font-bold"
              >
                Delete Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
