import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft, Users, TrendingUp, FileText, AlertTriangle, Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { facultyClasses, type FacultyClass } from '../../data/facultyClasses';
import api from '../../lib/apiClient';
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

  const [cls, setCls] = useState<FacultyClass | null>(() => {
    return facultyClasses.find(c => c.id === classId || c.sectionId === classId) || null;
  });
  const [loading, setLoading] = useState<boolean>(!cls);

  // Typewriter effect for welcome back message
  const { user } = useAuth();
  const facultyFirstName = user?.name ? user.name.split(' ')[0] : 'Faculty';
  const fullGreeting = `Welcome back, ${facultyFirstName}`;
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    setDisplayedGreeting('');
    setIsTyping(true);
    setCursorVisible(true);

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex++;
        setDisplayedGreeting(fullGreeting.slice(0, currentIndex));
        if (currentIndex >= fullGreeting.length) {
          clearInterval(interval);
          setIsTyping(false);
          setTimeout(() => setCursorVisible(false), 2500);
        }
      }, 65);

      return () => clearInterval(interval);
    }, 250);

    return () => clearTimeout(startTimeout);
  }, [fullGreeting]);

  useEffect(() => {
    let isMounted = true;
    const fetchClass = async () => {
      try {
        const res = await api.get('/sections/faculty-classes');
        if (res.data && Array.isArray(res.data)) {
          const match = res.data.find((c: any) => c.id === classId || c.sectionId === classId);
          if (match && isMounted) {
            setCls(match);
          }
        }
      } catch (err) {
        console.error('Failed to load class:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (!cls) {
      fetchClass();
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [classId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading class details...</p>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">Class not found.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/faculty/select-class')}
          leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Back to Class Selector
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

      {/* ── Welcome Greeting with Typewriter Animation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-[26px] sm:text-[28px] font-normal text-[#302A2B] tracking-tight leading-tight flex items-center min-h-[36px]"
            style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
          >
            <span>{displayedGreeting}</span>
            <span
              className={`inline-block w-[2px] h-[0.85em] bg-[#542536] ml-1.5 align-middle transition-opacity duration-150 ${
                isTyping ? 'opacity-100 animate-pulse' : cursorVisible ? 'opacity-70 animate-pulse' : 'opacity-0'
              }`}
            />
          </h1>
          <p className="text-sm text-[#79666A] font-medium mt-1">
            Department of Computer Science · Teaching & Analytics Overview
          </p>
        </div>

        <div
          className="text-xs font-medium text-[#79666A] bg-white px-3.5 py-1.5 rounded-[9px] flex items-center gap-2 self-start sm:self-auto flex-shrink-0"
          style={{ border: '1px solid #E1D4CA', boxShadow: '0 1px 4px rgba(84,37,54,0.07)' }}
        >
          <Calendar className="w-3.5 h-3.5 text-[#542536]" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ── Header: Switch Class + Class Name & Subject ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/80 border border-[#E1D4CA] rounded-[14px] shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty/select-class')}
            id="btn-switch-class"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#79666A] hover:text-[#542536] bg-[#F7F1E8] hover:bg-[#EFE7DE] border border-[#E1D4CA] rounded-[9px] transition-all shadow-2xs group cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Switch Class
          </button>
          <div className="h-4 w-px bg-[#E1D4CA]" />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-[7px] text-xs font-bold bg-[#542536] text-[#F7F1E8]">
              {cls.section}
            </span>
            <span
              className="text-base sm:text-lg font-normal text-[#302A2B] tracking-tight"
              style={{ fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              {cls.subject}
            </span>
            <span className="text-xs text-[#79666A] font-medium hidden sm:inline">
              ({cls.subjectCode} · {cls.semester})
            </span>
          </div>
        </div>

        <Badge color={
          cls.trend === 'improving' ? 'green' :
          cls.trend === 'declining' ? 'red' : 'gray'
        }>
          {cls.trend === 'improving' ? '↑ Improving' :
           cls.trend === 'declining' ? '↓ Declining' : '→ Stable'}
        </Badge>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={cls.studentsCount}
          icon={<Users className="w-5 h-5" />}
          accent="oxblood"
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
          accent="brass"
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
              {(cls.weakTopics && cls.weakTopics.length > 0 ? cls.weakTopics : [
                { topicName: 'Foundations & Concepts', score: 62 },
                { topicName: 'Practical Application', score: 58 },
                { topicName: 'Analysis & Evaluation', score: 71 },
              ]).map((t, i) => (
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
