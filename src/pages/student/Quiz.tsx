import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../lib/apiClient';
import {
  ClipboardList,
  Clock,
  HelpCircle,
  BookOpen,
  Play,
  CheckCircle2,
  Calendar,
  Loader2,
  ArrowRight,
  Award,
  Lock,
} from 'lucide-react';

interface DbQuizStudent {
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
  attempts?: {
    id: string;
    score: number;
    submittedAt: string;
    timeTaken: number;
  }[];
}

export const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<DbQuizStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quizzes');
      if (Array.isArray(res.data)) {
        setQuizzes(res.data);
      }
    } catch (err) {
      console.warn('Failed to load student quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Completed if: student has an attempt OR quiz status is COMPLETED
  const completedQuizzes = quizzes.filter(
    q => (q.attempts && q.attempts.length > 0) || q.status.toUpperCase() === 'COMPLETED'
  );

  // Scheduled / Upcoming if: scheduled in future and NOT completed and not attempted
  const upcomingQuizzes = quizzes.filter(
    q =>
      q.status.toUpperCase() !== 'COMPLETED' &&
      (!q.attempts || q.attempts.length === 0) &&
      !!q.scheduledAt &&
      new Date(q.scheduledAt) > new Date()
  );

  // Active if: NOT completed, NOT attempted, AND NOT scheduled in future (i.e. open right now!)
  const activeQuizzes = quizzes.filter(
    q =>
      q.status.toUpperCase() !== 'COMPLETED' &&
      (!q.attempts || q.attempts.length === 0) &&
      (!q.scheduledAt || new Date(q.scheduledAt) <= new Date())
  );

  const primaryQuiz = activeQuizzes[0] || upcomingQuizzes[0];
  const isPrimaryLive = activeQuizzes.length > 0;

  // Stats calculation
  const attemptsList = quizzes.flatMap(q => q.attempts || []);
  const completedCount = attemptsList.length;
  const lastScore = attemptsList.length > 0 ? Math.round(attemptsList[0].score) : 0;
  const avgScore =
    attemptsList.length > 0
      ? Math.round(attemptsList.reduce((acc, a) => acc + a.score, 0) / attemptsList.length)
      : 0;

  const handleStartQuiz = (quizId: string) => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    }
    navigate(`/student/quiz/${quizId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Weekly Quiz & Assessments"
        subtitle="Test your knowledge with your scheduled curriculum assessments"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Weekly Quiz' }]}
      />

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
          <p className="text-xs text-[var(--color-text-muted)]">Loading your quizzes...</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Active / Scheduled Hero Card */}
            <div className="lg:col-span-2">
              {primaryQuiz ? (
                <div
                  className="card p-7 relative overflow-hidden rounded-2xl shadow-card text-white border border-oxblood/30"
                  style={{ background: 'linear-gradient(135deg, #321923 0%, #441d2b 50%, #542536 100%)' }}
                >
                  <div
                    className="absolute top-0 right-0 w-60 h-60 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'var(--color-brass)', transform: 'translate(30%,-30%)', filter: 'blur(30px)' }}
                  />

                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {isPrimaryLive ? (
                          <Badge color="green" dot>Active Now</Badge>
                        ) : (
                          <Badge color="amber">Scheduled</Badge>
                        )}
                        <Badge color="gray">{primaryQuiz.type || 'WEEKLY'}</Badge>
                        <Badge color="oxblood">
                          Sem {primaryQuiz.section?.semester || primaryQuiz.subject?.semester || 1} · Sec {primaryQuiz.section?.name || 'A'}
                        </Badge>
                      </div>
                      <h2 className="text-white text-2xl font-serif font-bold mb-1 tracking-tight">{primaryQuiz.title}</h2>
                      <p className="text-white/80 text-sm font-medium">
                        {primaryQuiz.subject
                          ? `[${primaryQuiz.subject.code}] ${primaryQuiz.subject.name}`
                          : 'Curriculum Course'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3.5 mb-6 relative z-10">
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 text-center border border-white/10">
                      <HelpCircle className="w-4 h-4 text-white/70 mx-auto mb-1" />
                      <p className="text-white font-serif font-bold text-lg">
                        {primaryQuiz._count?.questions ?? 0}
                      </p>
                      <p className="text-white/70 text-xs">Questions</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 text-center border border-white/10">
                      <Clock className="w-4 h-4 text-white/70 mx-auto mb-1" />
                      <p className="text-white font-serif font-bold text-lg">{primaryQuiz.duration} min</p>
                      <p className="text-white/70 text-xs">Duration</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 text-center border border-white/10">
                      <BookOpen className="w-4 h-4 text-white/70 mx-auto mb-1" />
                      <p className="text-white font-serif font-bold text-lg capitalize">Medium</p>
                      <p className="text-white/70 text-xs">Level</p>
                    </div>
                  </div>

                  {/* Actions / Availability */}
                  <div className="flex items-center gap-3 relative z-10">
                    {isPrimaryLive ? (
                      <Button
                        onClick={() => handleStartQuiz(primaryQuiz.id)}
                        className="!bg-white !text-cherry hover:!bg-ivory shadow-btn px-6 py-2.5 text-sm font-bold border border-white"
                        leftIcon={<Play className="w-4 h-4 fill-cherry" />}
                      >
                        Start Quiz Now
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2.5 text-white/90 text-sm bg-white/10 px-5 py-2.5 rounded-xl border border-white/15">
                        <Lock className="w-4 h-4 text-brass" />
                        <span>
                          Opens at{' '}
                          <strong className="text-brass">
                            {new Date(primaryQuiz.scheduledAt!).toLocaleString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </strong>{' '}
                          · Quiz not available yet
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center h-full flex flex-col items-center justify-center rounded-2xl shadow-card">
                  <ClipboardList className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-40" />
                  <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mb-1">
                    No Open Quizzes Pending
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
                    You have completed all active assessments assigned to your semester and section. Great job!
                  </p>
                </Card>
              )}
            </div>

            {/* Quiz Performance Stats */}
            <Card className="rounded-2xl shadow-card">
              <CardHeader title="Assessment Overview" />
              <div className="space-y-4">
                <div className="text-center py-4 bg-ivory/60 border border-[var(--color-border)] rounded-xl">
                  <div className="text-4xl font-serif font-bold text-oxblood">{lastScore}%</div>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">Last quiz score</p>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Quizzes Completed</span>
                    <span className="font-serif font-bold text-charcoal">{completedCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Average Score</span>
                    <span className="font-serif font-bold text-charcoal">{avgScore}%</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)]">Active Available</span>
                    <span className="font-bold text-forest">{activeQuizzes.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[var(--color-text-secondary)]">Upcoming Scheduled</span>
                    <span className="font-bold text-brass">{upcomingQuizzes.length}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Open Quizzes (if multiple open) */}
          {activeQuizzes.length > 1 && (
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mb-3">
                Other Open Quizzes ({activeQuizzes.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeQuizzes.slice(1).map(q => (
                  <div
                    key={q.id}
                    className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl flex flex-col justify-between hover:shadow-card-hover transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Badge color="green" dot>Active</Badge>
                        <Badge color="gray">{q.type || 'WEEKLY'}</Badge>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[var(--color-text-primary)] mb-1">{q.title}</h4>
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">
                        {q.subject ? `[${q.subject.code}] ${q.subject.name}` : 'Curriculum Subject'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] mb-4">
                        <span>{q._count?.questions ?? 0} questions</span>
                        <span>•</span>
                        <span>{q.duration} min</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStartQuiz(q.id)}
                      className="w-full !bg-oxblood hover:!bg-cherry !text-white"
                      leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                    >
                      Start Quiz
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Scheduled Assessments */}
          {upcomingQuizzes.length > (isPrimaryLive ? 0 : 1) && (
            <div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brass" />
                Upcoming Scheduled Quizzes
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isPrimaryLive ? upcomingQuizzes : upcomingQuizzes.slice(1)).map(q => (
                  <div
                    key={q.id}
                    className="card p-5 bg-white border border-brass/30 bg-brass/5 rounded-2xl flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge color="amber">Scheduled</Badge>
                        <span className="text-[11px] font-semibold text-brass flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(q.scheduledAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[var(--color-text-primary)] mb-1">{q.title}</h4>
                      <p className="text-xs text-[var(--color-text-muted)] mb-3">
                        {q.subject ? `[${q.subject.code}] ${q.subject.name}` : 'Curriculum Subject'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
                        <span>{q._count?.questions ?? 0} questions</span>
                        <span>•</span>
                        <span>{q.duration} min duration</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-ivory border border-brass/20 rounded-xl text-center text-xs font-semibold text-charcoal flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-brass" />
                      <span>
                        Opens on{' '}
                        {new Date(q.scheduledAt!).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous / Completed Quizzes */}
          <div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              Completed & Previous Assessments ({completedQuizzes.length})
            </h3>
            {completedQuizzes.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedQuizzes.map(q => {
                  const myAttempt = q.attempts?.[0];
                  const hasAttempt = !!myAttempt;
                  const score = hasAttempt ? Math.round(myAttempt.score) : null;

                  return (
                    <div
                      key={q.id}
                      className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl flex flex-col justify-between hover:shadow-card-hover transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Badge color="gray">Completed</Badge>
                          {score !== null && (
                            <span
                              className={`text-xs font-serif font-bold px-2.5 py-0.5 rounded-full border ${
                                score >= 75
                                  ? 'bg-forest/10 text-forest border-forest/20'
                                  : score >= 50
                                  ? 'bg-brass/10 text-brass border-brass/20'
                                  : 'bg-danger/10 text-danger border-danger/20'
                              }`}
                            >
                              Score: {score}%
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-base text-[var(--color-text-primary)] mb-1">{q.title}</h4>
                        <p className="text-xs text-[var(--color-text-muted)] mb-3">
                          {q.subject ? `[${q.subject.code}] ${q.subject.name}` : 'Curriculum Subject'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-4">
                          <span>{q._count?.questions ?? 0} questions</span>
                          <span>•</span>
                          <span>{q.duration} min</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/student/quiz/${q.id}/result`)}
                        className="flex items-center justify-center gap-1.5 text-xs font-bold text-oxblood hover:underline py-2 border-t border-[var(--color-border)] cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        View Result Report <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)]">No previous quizzes completed yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
