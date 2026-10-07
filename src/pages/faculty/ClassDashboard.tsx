import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Users, TrendingUp, FileText, AlertTriangle,
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { facultyClasses } from '../../data/facultyClasses';
import {
  classWeeklyPerformance,
  classTopicPerformance,
  recentActivities,
  difficultQuestions,
} from '../../data/analytics';
import type { DifficultQuestion } from '../../types/analytics';

// ─── Subject colour accents ───────────────────────────────────────────────────
const ACCENT_MAP: Record<string, string> = {
  sec_5a_ds: '#6366f1',
  sec_5b_ds: '#3b82f6',
  sec_7c_cc: '#10b981',
  sec_3a_db: '#f97316',
};

export const ClassDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const cls = facultyClasses.find(c => c.id === classId);

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">Class not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/faculty')}
          leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Back to My Classes
        </Button>
      </div>
    );
  }

  const accent = ACCENT_MAP[cls.id] ?? '#6366f1';
  const classModifier = cls.studentsCount % 5;
  const avgPerformance = cls.avgScore;
  const pendingReviews = cls.pendingReviewCount;

  // Difficult questions table columns
  const difficultColumns = [
    {
      key: 'questionText',
      header: 'Question',
      render: (q: DifficultQuestion) => (
        <div className="max-w-sm">
          <p className="text-sm text-[var(--color-text-primary)] truncate" title={q.questionText}>
            {q.questionText}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {cls.subject} · {q.topicName}
          </p>
        </div>
      ),
    },
    {
      key: 'correctRate',
      header: 'Correct %',
      render: (q: DifficultQuestion) => (
        <Badge color={q.correctRate < 50 ? 'red' : 'amber'}>
          {q.correctRate + classModifier}%
        </Badge>
      ),
    },
    { key: 'attempts', header: 'Attempts' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Back + Class Header ── */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => navigate('/faculty')}
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            My Classes
          </button>
          <span className="text-[var(--color-text-muted)]">/</span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {cls.section}
          </span>
        </div>

        {/* Class title banner */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)`,
            border: `1.5px solid ${accent}35`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: accent, transform: 'translate(30%, -30%)' }}
          />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: accent }}>
                {cls.subjectCode} · {cls.semester}
              </p>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {cls.section}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{cls.subject}</p>
            </div>
            <Badge color={
              cls.trend === 'improving' ? 'green' :
              cls.trend === 'declining' ? 'red' : 'gray'
            }>
              {cls.trend === 'improving' ? '↑ Improving' :
               cls.trend === 'declining' ? '↓ Declining' : '→ Stable'}
            </Badge>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={cls.studentsCount}
          icon={<Users className="w-5 h-5" />}
          accent="navy"
        />
        <StatCard
          title="Average Performance"
          value={`${avgPerformance}%`}
          trend={classModifier > 2 ? -2 : 5}
          trendLabel="vs last month"
          icon={<TrendingUp className="w-5 h-5" />}
          accent="success"
        />
        <StatCard
          title="Active Quizzes"
          value={cls.activeQuizCount}
          icon={<FileText className="w-5 h-5" />}
          accent="indigo"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviews}
          subtitle="Questions to approve"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="warning"
        />
      </div>

      {/* ── Main 3-col grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left 2/3: chart + difficult questions */}
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart
            title={`Performance — ${cls.section}`}
            weekData={classWeeklyPerformance.map(d => ({
              ...d,
              score: Math.min(100, d.score + classModifier * 2),
            }))}
            monthData={[]}
            semesterData={[]}
            showClassAverage={false}
          />

          <Card>
            <CardHeader
              title="Most Difficult Questions"
              subtitle={`Topics where ${cls.section} students struggle most`}
            />
            <DataTable
              columns={difficultColumns}
              data={difficultQuestions}
              keyField="questionId"
            />
          </Card>
        </div>

        {/* Right 1/3: learning gaps + activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Learning Gaps"
              action={
                <button
                  onClick={() => navigate('/faculty/learning-gaps')}
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  Full Report
                </button>
              }
            />
            <div className="space-y-3">
              {cls.weakTopics.map((t, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--color-text-primary)]">{t.topicName}</span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: t.score < 55 ? '#ef4444' : t.score < 70 ? '#f59e0b' : '#059669',
                      }}
                    >
                      {t.score}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-muted)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${t.score}%`,
                        background:
                          t.score < 55 ? '#ef4444' : t.score < 70 ? '#f59e0b' : '#059669',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent Activity" />
            <div className="space-y-4">
              {recentActivities.slice(0, 4).map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      activity.type === 'quiz_submitted'
                        ? 'bg-[var(--color-success)]'
                        : activity.type === 'quiz_created'
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-warning)]'
                    }`}
                  />
                  <div>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {activity.type === 'quiz_submitted'
                        ? `A student from Section ${cls.section} submitted a quiz.`
                        : activity.description}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" fullWidth className="mt-4">
              View All Activity
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
