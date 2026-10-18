import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../lib/apiClient';
import {
  Plus,
  Calendar as CalendarIcon,
  Filter,
  ChevronLeft,
  GraduationCap,
  Loader2,
  Trash2,
  Eye,
  StopCircle,
  Clock,
  BookOpen,
  Users,
  Award,
  X,
  Search,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  Play,
  Lock,
} from 'lucide-react';

interface DbQuiz {
  id: string;
  title: string;
  duration: number;
  type: string;
  status: string;
  scheduledAt?: string | null;
  createdAt: string;
  subjectId: string;
  sectionId: string;
  subject?: {
    id: string;
    name: string;
    code: string;
    semester: number;
  };
  section?: {
    id: string;
    name: string;
    semester: number;
  };
  _count?: {
    questions: number;
    attempts: number;
  };
}

interface SectionFilterItem {
  id: string;
  name: string;
  semester: number;
  studentsCount: number;
}

interface AttemptItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  sectionName: string;
  score: number;
  timeTaken: number;
  submittedAt: string;
  totalAnswers: number;
  correctAnswers: number;
}

interface QuizResultsData {
  stats: {
    totalSubmissions: number;
    avgScore: number;
    highestScore: number;
  };
  attempts: AttemptItem[];
}

const STATUS_TABS = [
  { id: 'all', label: 'All Quizzes' },
  { id: 'active', label: 'Active & Open' },
  { id: 'completed', label: 'Completed' },
  { id: 'scheduled', label: 'Scheduled' },
];

export const QuizManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [quizzes, setQuizzes] = useState<DbQuiz[]>([]);
  const [sections, setSections] = useState<SectionFilterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Responses Modal State
  const [selectedQuizForResponses, setSelectedQuizForResponses] = useState<DbQuiz | null>(null);
  const [responsesData, setResponsesData] = useState<QuizResultsData | null>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [searchStudent, setSearchStudent] = useState('');

  // Schedule Modal State
  const [scheduleModalQuiz, setScheduleModalQuiz] = useState<DbQuiz | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Delete Confirmation State
  const [quizToDelete, setQuizToDelete] = useState<DbQuiz | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  // Action status toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizzesRes, sectionsRes] = await Promise.all([
        api.get('/quizzes'),
        api.get('/sections').catch(() => ({ data: [] })),
      ]);
      if (Array.isArray(quizzesRes.data)) {
        setQuizzes(quizzesRes.data);
      }
      if (Array.isArray(sectionsRes.data)) {
        setSections(sectionsRes.data);
      }
    } catch (err) {
      console.warn('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Quizzes (Strictly disjoint status categories)
  const filteredQuizzes = quizzes.filter(q => {
    const isCompleted = (q.status || '').toUpperCase() === 'COMPLETED';
    const isScheduled = !isCompleted && !!q.scheduledAt && new Date(q.scheduledAt) > new Date();
    const isActive = !isCompleted && !isScheduled;

    const statusMatch =
      tab === 'all' ||
      (tab === 'active' && isActive) ||
      (tab === 'completed' && isCompleted) ||
      (tab === 'scheduled' && isScheduled);

    const classMatch =
      classFilter === 'all' ||
      q.sectionId === classFilter ||
      q.section?.id === classFilter;

    return statusMatch && classMatch;
  });

  // Handler: View Responses
  const handleOpenResponses = async (quiz: DbQuiz) => {
    setSelectedQuizForResponses(quiz);
    setLoadingResponses(true);
    setSearchStudent('');
    try {
      const res = await api.get(`/quizzes/${quiz.id}/results`);
      setResponsesData(res.data);
    } catch (err: any) {
      console.error('Failed to load quiz results:', err);
      showToast('Failed to load student responses');
    } finally {
      setLoadingResponses(false);
    }
  };

  // Handler: End Open Quiz
  const handleEndQuiz = async (quiz: DbQuiz) => {
    if (
      !window.confirm(
        `Are you sure you want to end "${quiz.title}"? Students will no longer be able to submit attempts, and scheduling for this quiz will be locked.`
      )
    ) {
      return;
    }
    try {
      await api.patch(`/quizzes/${quiz.id}/status`, { status: 'COMPLETED' });
      setQuizzes(prev =>
        prev.map(item => (item.id === quiz.id ? { ...item, status: 'COMPLETED' } : item))
      );
      showToast(`Quiz "${quiz.title}" ended. Scheduling is now disabled.`);
    } catch (err: any) {
      console.error('Failed to end quiz:', err);
      showToast(err?.response?.data?.message || 'Failed to end quiz.');
    }
  };

  // Handler: Open a scheduled quiz immediately (Early Launch)
  const handleOpenNow = async (quiz: DbQuiz) => {
    try {
      const now = new Date();
      await api.patch(`/quizzes/${quiz.id}/schedule`, {
        scheduledAt: now,
        status: 'ACTIVE',
      });
      setQuizzes(prev =>
        prev.map(item =>
          item.id === quiz.id
            ? { ...item, scheduledAt: now.toISOString(), status: 'ACTIVE' }
            : item
        )
      );
      showToast(`Quiz "${quiz.title}" is now open & active for students!`);
    } catch (err: any) {
      console.error('Failed to open quiz:', err);
      showToast(err?.response?.data?.message || 'Failed to open quiz.');
    }
  };

  // Handler: Open Schedule Modal (Only for non-completed quizzes)
  const handleOpenSchedule = (quiz: DbQuiz) => {
    if (quiz.status.toUpperCase() === 'COMPLETED') {
      showToast('Completed quizzes cannot be rescheduled.');
      return;
    }
    setScheduleModalQuiz(quiz);
    if (quiz.scheduledAt) {
      const d = new Date(quiz.scheduledAt);
      const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setScheduledDateTime(isoLocal);
    } else {
      const tomorrow = new Date(Date.now() + 2 * 3600 * 1000);
      const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setScheduledDateTime(isoLocal);
    }
  };

  // Handler: Save Schedule
  const handleSaveSchedule = async () => {
    if (!scheduleModalQuiz || !scheduledDateTime) return;
    setSavingSchedule(true);
    try {
      const dateVal = new Date(scheduledDateTime);
      const isFuture = dateVal > new Date();
      const newStatus = isFuture ? 'DRAFT' : 'ACTIVE';

      await api.patch(`/quizzes/${scheduleModalQuiz.id}/schedule`, {
        scheduledAt: dateVal,
        status: newStatus,
      });

      setQuizzes(prev =>
        prev.map(item =>
          item.id === scheduleModalQuiz.id
            ? { ...item, scheduledAt: dateVal.toISOString(), status: newStatus }
            : item
        )
      );
      showToast(
        isFuture
          ? `Quiz "${scheduleModalQuiz.title}" scheduled for ${dateVal.toLocaleString('en-IN')}`
          : `Quiz "${scheduleModalQuiz.title}" is now active!`
      );
      setScheduleModalQuiz(null);
    } catch (err: any) {
      console.error('Failed to schedule quiz:', err);
      showToast(err?.response?.data?.message || 'Failed to schedule quiz.');
    } finally {
      setSavingSchedule(false);
    }
  };

  // Handler: Confirm & Delete Quiz
  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    setDeletingQuiz(true);
    try {
      await api.delete(`/quizzes/${quizToDelete.id}`);
      setQuizzes(prev => prev.filter(item => item.id !== quizToDelete.id));
      showToast(`Quiz "${quizToDelete.title}" deleted successfully.`);
      setQuizToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete quiz:', err);
      showToast(err?.response?.data?.message || 'Failed to delete quiz.');
    } finally {
      setDeletingQuiz(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const activeSchedulableQuizzes = quizzes.filter(q => q.status.toUpperCase() !== 'COMPLETED');

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/faculty')}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--color-accent)] rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base text-[var(--color-text-primary)]">Quiz Management</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSchedulableQuizzes.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CalendarIcon className="w-4 h-4" />}
              onClick={() => handleOpenSchedule(activeSchedulableQuizzes[0])}
            >
              Schedule
            </Button>
          )}
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/faculty/quiz/create')}
          >
            Create Quiz
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6 animate-fade-in-up">
        {/* Class Filter Chips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
              Filter by class
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setClassFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: classFilter === 'all' ? 'var(--color-accent)' : 'var(--color-muted)',
                color: classFilter === 'all' ? '#fff' : 'var(--color-text-secondary)',
                border: classFilter === 'all' ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border)',
              }}
            >
              All Classes ({quizzes.length})
            </button>
            {sections.map(cls => {
              const quizCountForSection = quizzes.filter(
                q => q.sectionId === cls.id || q.section?.id === cls.id
              ).length;
              return (
                <button
                  key={cls.id}
                  onClick={() => setClassFilter(cls.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background: classFilter === cls.id ? 'var(--color-accent)' : 'var(--color-muted)',
                    color: classFilter === cls.id ? '#fff' : 'var(--color-text-secondary)',
                    border: classFilter === cls.id ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border)',
                  }}
                >
                  Sem {cls.semester} · Sec {cls.name}
                  {quizCountForSection > 0 && (
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                      style={{
                        background: classFilter === cls.id ? 'rgba(255,255,255,0.3)' : 'var(--color-accent)',
                        color: '#fff',
                      }}
                    >
                      {quizCountForSection}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {STATUS_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px"
              style={{
                borderColor: tab === t.id ? 'var(--color-accent)' : 'transparent',
                color: tab === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-xs text-[var(--color-text-muted)]">Loading curriculum quizzes...</p>
          </div>
        ) : (
          /* Quiz Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map(q => {
                const isCompleted = (q.status || '').toUpperCase() === 'COMPLETED';
                const isScheduled = !isCompleted && !!q.scheduledAt && new Date(q.scheduledAt) > new Date();
                const isActive = !isCompleted && !isScheduled;
                const attemptsCount = q._count?.attempts ?? 0;
                const questionsCount = q._count?.questions ?? 0;

                return (
                  <div
                    key={q.id}
                    className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
                  >
                    {/* Top status & type */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          {isActive ? (
                            <Badge color="green" dot>Active Now</Badge>
                          ) : isCompleted ? (
                            <Badge color="gray">Completed</Badge>
                          ) : (
                            <Badge color="amber">Scheduled</Badge>
                          )}
                          <Badge color="gray" className="uppercase text-[10px]">
                            {q.type || 'WEEKLY'}
                          </Badge>
                        </div>

                        {/* Delete Quiz Button */}
                        <button
                          onClick={() => setQuizToDelete(q)}
                          title="Delete Quiz"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quiz Title & Course */}
                      <h4 className="font-bold text-base text-[var(--color-text-primary)] line-clamp-1 mb-1">
                        {q.title}
                      </h4>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium mb-3">
                        {q.subject ? `[${q.subject.code}] ${q.subject.name}` : 'Curriculum Subject'}
                      </p>

                      {/* Info Chips */}
                      <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{questionsCount} questions</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{q.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] col-span-2">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-semibold text-slate-700">{attemptsCount} student responses</span>
                        </div>
                      </div>

                      {/* Class Badge */}
                      <div className="flex items-center justify-between text-xs mb-4 text-[var(--color-text-muted)]">
                        <span>Assigned Section:</span>
                        <Badge color="indigo">
                          Sem {q.section?.semester || q.subject?.semester || 1} · Sec {q.section?.name || 'A'}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-3 border-t border-[var(--color-border)] flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* View Responses Button (Always available) */}
                        <Button
                          size="sm"
                          className="flex-1 !bg-[var(--color-accent)] !text-white hover:!opacity-95"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenResponses(q)}
                        >
                          View Responses ({attemptsCount})
                        </Button>

                        {/* End Quiz button (Only for active open quizzes) */}
                        {isActive && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="!border-amber-200 !text-amber-700 hover:!bg-amber-50"
                            leftIcon={<StopCircle className="w-3.5 h-3.5" />}
                            onClick={() => handleEndQuiz(q)}
                            title="End active quiz and disable further submissions"
                          >
                            End Quiz
                          </Button>
                        )}

                        {/* Open Now button (Only for scheduled quizzes that haven't opened yet) */}
                        {isScheduled && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="!border-emerald-200 !text-emerald-700 hover:!bg-emerald-50"
                            leftIcon={<Play className="w-3 h-3 fill-emerald-600" />}
                            onClick={() => handleOpenNow(q)}
                            title="Open this quiz immediately for students"
                          >
                            Open Now
                          </Button>
                        )}
                      </div>

                      {/* Secondary Info & Schedule Action */}
                      {isCompleted ? (
                        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Assessment Ended &amp; Finalized
                          </span>
                          <span className="text-slate-400 font-mono">Scheduling Closed</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-1">
                          <span>
                            {isScheduled
                              ? `Opens: ${new Date(q.scheduledAt!).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}`
                              : `Active since: ${new Date(q.createdAt).toLocaleDateString('en-IN')}`}
                          </span>
                          <button
                            onClick={() => handleOpenSchedule(q)}
                            className="text-[var(--color-accent)] font-semibold hover:underline flex items-center gap-1"
                          >
                            <CalendarIcon className="w-3 h-3" />
                            {q.scheduledAt ? 'Reschedule' : 'Set Schedule'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Contextual Empty State depending on active tab */
              tab === 'active' ? (
                <div className="col-span-full py-16 px-6 text-center card bg-white border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                    <PlayCircle className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-1">
                    No Active Quizzes Open
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-md mb-6 leading-relaxed">
                    There are currently no active or open quizzes available for student submissions. You can create a new assessment or launch one from your drafts.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => navigate('/faculty/quiz/create')}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create Quiz
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setTab('all')}
                    >
                      View All Quizzes
                    </Button>
                  </div>
                </div>
              ) : tab === 'completed' ? (
                <div className="col-span-full py-16 px-6 text-center card bg-white border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                    <CheckCircle2 className="w-7 h-7 text-slate-500" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-1">
                    No Completed Quizzes Yet
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-md mb-6 leading-relaxed">
                    Quizzes will appear here once they are ended or completed. You'll be able to review all student attempts, scores, and class performance analytics.
                  </p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setTab('all')}
                    >
                      View All Quizzes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate('/faculty/quiz/create')}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create New Quiz
                    </Button>
                  </div>
                </div>
              ) : tab === 'scheduled' ? (
                <div className="col-span-full py-16 px-6 text-center card bg-white border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-100">
                    <CalendarIcon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-1">
                    No Quizzes Scheduled
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-md mb-6 leading-relaxed">
                    You don't have any quizzes scheduled for future dates. Setting a schedule lets students plan ahead and prepares the assessment window automatically.
                  </p>
                  <div className="flex items-center gap-3">
                    {activeSchedulableQuizzes.length > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<CalendarIcon className="w-4 h-4" />}
                        onClick={() => handleOpenSchedule(activeSchedulableQuizzes[0])}
                      >
                        Schedule Existing Quiz
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => navigate('/faculty/quiz/create')}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create & Schedule
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="col-span-full py-16 px-6 text-center card bg-white border border-[var(--color-border)] rounded-2xl flex flex-col items-center justify-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[var(--color-accent)] flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-1">
                    No Quizzes Found
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] max-w-md mb-6 leading-relaxed">
                    {classFilter !== 'all'
                      ? 'No curriculum quizzes have been assigned to this section yet. You can create a new assessment targeted specifically to this class.'
                      : 'You have not created any quizzes yet. Build your first curriculum assessment using the quiz builder.'}
                  </p>
                  <div className="flex items-center gap-3">
                    {classFilter !== 'all' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setClassFilter('all')}
                      >
                        Show All Classes
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => navigate('/faculty/quiz/create')}
                      leftIcon={<Plus className="w-4 h-4" />}
                    >
                      Create Quiz
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. VIEW RESPONSES MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedQuizForResponses && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge color="green" className="text-[10px]">Responses Report</Badge>
                  <span className="text-xs text-slate-400">
                    {selectedQuizForResponses.subject?.code} · Sem {selectedQuizForResponses.section?.semester} - Sec {selectedQuizForResponses.section?.name}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedQuizForResponses.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuizForResponses(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingResponses ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
                  <p className="text-xs text-slate-500">Loading student responses & statistics...</p>
                </div>
              ) : responsesData ? (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                      <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                      <p className="text-2xl font-black text-slate-900">{responsesData.stats.totalSubmissions}</p>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Submissions</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                      <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-2xl font-black text-emerald-600">{responsesData.stats.avgScore}%</p>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average Score</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                      <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <p className="text-2xl font-black text-amber-600">{responsesData.stats.highestScore}%</p>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Highest Score</p>
                    </div>
                  </div>

                  {/* Student Submissions Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-slate-800">
                        Student Submissions ({responsesData.attempts.length})
                      </h4>
                      {/* Search student */}
                      <div className="relative w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchStudent}
                          onChange={e => setSearchStudent(e.target.value)}
                          placeholder="Search student or roll no..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {responsesData.attempts.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-4">Student</th>
                              <th className="py-2.5 px-4">Roll No</th>
                              <th className="py-2.5 px-4">Score</th>
                              <th className="py-2.5 px-4">Correct / Total</th>
                              <th className="py-2.5 px-4">Time Taken</th>
                              <th className="py-2.5 px-4">Submitted At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {responsesData.attempts
                              .filter(
                                a =>
                                  !searchStudent ||
                                  a.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
                                  a.rollNo.toLowerCase().includes(searchStudent.toLowerCase()) ||
                                  a.studentEmail.toLowerCase().includes(searchStudent.toLowerCase())
                              )
                              .map(attempt => {
                                const scoreColor =
                                  attempt.score >= 75
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : attempt.score >= 50
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-red-50 text-red-700 border-red-200';

                                return (
                                  <tr key={attempt.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-2.5 px-4">
                                      <p className="font-semibold text-slate-800">{attempt.studentName}</p>
                                      <p className="text-[11px] text-slate-400">{attempt.studentEmail}</p>
                                    </td>
                                    <td className="py-2.5 px-4 font-mono text-slate-600">{attempt.rollNo}</td>
                                    <td className="py-2.5 px-4">
                                      <span
                                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-xs ${scoreColor}`}
                                      >
                                        {attempt.score}%
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-slate-600">
                                      {attempt.correctAnswers} / {attempt.totalAnswers} correct
                                    </td>
                                    <td className="py-2.5 px-4 text-slate-600">
                                      {formatTime(attempt.timeTaken)}
                                    </td>
                                    <td className="py-2.5 px-4 text-slate-500">
                                      {new Date(attempt.submittedAt).toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No student responses yet</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Students assigned to this section will appear here once they attempt the quiz.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button size="sm" variant="secondary" onClick={() => setSelectedQuizForResponses(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. SCHEDULE QUIZ MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {scheduleModalQuiz && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                <h3 className="font-bold text-base text-slate-900">Schedule Quiz</h3>
              </div>
              <button
                onClick={() => setScheduleModalQuiz(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Set the date and time when <span className="font-semibold text-slate-800">"{scheduleModalQuiz.title}"</span> should become open for students.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={e => setScheduledDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Class:</span>
                  <span className="font-semibold text-slate-700">
                    Sem {scheduleModalQuiz.section?.semester} · Sec {scheduleModalQuiz.section?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-slate-700">{scheduleModalQuiz.duration} minutes</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setScheduleModalQuiz(null)}
                  disabled={savingSchedule}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  isLoading={savingSchedule}
                  onClick={handleSaveSchedule}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Save Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. DELETE QUIZ CONFIRMATION MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl max-w-sm w-full shadow-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="font-bold text-base text-slate-900 mb-1">Delete Quiz?</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-slate-800">"{quizToDelete.title}"</span>? All associated student responses and attempts will be permanently deleted from the database.
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setQuizToDelete(null)}
                disabled={deletingQuiz}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="!bg-red-600 hover:!bg-red-700 !text-white"
                isLoading={deletingQuiz}
                onClick={handleDeleteQuiz}
                leftIcon={<Trash2 className="w-4 h-4" />}
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
