// ============================================================================
// ACADEXA QUIZ RESULTS & LEARNING-GAP REPORT PAGE
// Detailed class submissions, question-level breakdown, and diagnostic gap analysis
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Users, Award, Clock, Search, CheckCircle2,
  AlertTriangle, Filter, Sparkles, BookOpen, Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Quiz, QuizAttempt } from '../types/quizTypes';
import { quizService } from '../services/quizService';
import { quizAnalyticsService } from '../services/quizAnalyticsService';
import { TopicPerformanceSummary } from '../analytics/TopicPerformanceSummary';

export const QuizResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      quizService.getQuizById(id),
      quizAnalyticsService.getQuizAttempts(id),
    ])
      .then(([q, atts]) => {
        setQuiz(q);
        setAttempts(atts);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filteredAttempts = attempts.filter(
    a =>
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentRollNo.toLowerCase().includes(search.toLowerCase())
  );

  const avgPercentage =
    attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;

  const highestScore =
    attempts.length > 0
      ? Math.max(...attempts.map(a => a.percentage))
      : 0;

  const handleLaunchRemedialQuiz = (topicId: string, topicName: string) => {
    navigate('/faculty/quiz/create', {
      state: {
        topicId,
        topicName,
        subjectId: quiz?.subjectId,
        remedial: true,
        title: `Remedial Revision: ${topicName}`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center text-xs text-slate-500">
        Loading assessment results &amp; diagnostic analytics...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center p-6 text-center">
        <h3 className="font-bold text-lg mb-2">Quiz Not Found</h3>
        <Button onClick={() => navigate('/faculty/quizzes')}>Back to Quizzes</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-16">
      {/* Top Header */}
      <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/faculty/quizzes')}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Quizzes
          </button>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <div>
            <h1 className="font-bold text-base text-[var(--color-text-primary)]">{quiz.title}</h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              [{quiz.subjectCode}] {quiz.subjectName} · Results &amp; Learning Gaps
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() =>
            handleLaunchRemedialQuiz(
              quiz.topicIds[0] || 'gen',
              quiz.topicNames[0] || 'Target Syllabus'
            )
          }
          className="!bg-[var(--color-oxblood)] hover:!bg-[#3f1927] !text-white"
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Generate Remedial Quiz
        </Button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl text-center shadow-xs">
            <Users className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
            <p className="text-3xl font-black text-slate-900">{attempts.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student Submissions
            </p>
          </div>

          <div className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl text-center shadow-xs">
            <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-3xl font-black text-emerald-600">{avgPercentage}%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Class Average Score
            </p>
          </div>

          <div className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl text-center shadow-xs">
            <Award className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
            <p className="text-3xl font-black text-amber-600">{highestScore}%</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Highest Score
            </p>
          </div>
        </div>

        {/* Learning-Gap Analytics Section */}
        <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs space-y-4">
          <TopicPerformanceSummary
            quizId={quiz.id}
            subjectId={quiz.subjectId}
            onLaunchRemedialQuiz={handleLaunchRemedialQuiz}
          />
        </div>

        {/* Student Attempts Table */}
        <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Student Attempts ({attempts.length})</h3>
              <p className="text-xs text-slate-500">Individual student responses and evaluation statuses</p>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student or roll no..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
              />
            </div>
          </div>

          {filteredAttempts.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">
              No matching student attempt records found.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Evaluation Status</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttempts.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{att.studentName}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{att.studentRollNo}</td>
                      <td className="py-3 px-4 text-slate-600">{att.className}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-black text-sm ${
                            att.percentage >= 75
                              ? 'text-emerald-600'
                              : att.percentage >= 50
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {att.percentage}%
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">
                          ({att.totalScore}/{att.maxPossibleScore})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {att.hasPendingManualEvaluation ? (
                          <Badge color="amber">Manual Review Pending</Badge>
                        ) : (
                          <Badge color="green">Graded</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(att.submittedAt || att.startedAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
