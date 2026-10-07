import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuizCard } from '../../components/dashboard/CourseCard';
import { mockQuizzes } from '../../data/quizzes';
import { facultyClasses } from '../../data/facultyClasses';
import { Plus, Calendar as CalendarIcon, Filter, ChevronLeft, GraduationCap } from 'lucide-react';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active & Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'drafts', label: 'Drafts' },
];

export const QuizManagement: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [classFilter, setClassFilter] = useState<string>('all');

  const filteredQuizzes = mockQuizzes.filter(q => {
    const statusMatch =
      tab === 'all' ||
      (tab === 'active' && (q.status === 'active' || q.status === 'upcoming' || q.status === 'scheduled')) ||
      (tab === 'completed' && q.status === 'completed') ||
      tab === 'drafts';
    return statusMatch;
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Minimal top bar */}
      <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-50">
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
          <Button variant="secondary" size="sm" leftIcon={<CalendarIcon className="w-4 h-4" />}>
            Schedule
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/faculty/quiz/create')}
          >
            Create Quiz
          </Button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6 animate-fade-in-up">

      {/* ── Class filter chips ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Filter by class</span>
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
            All Classes
          </button>
          {facultyClasses.map(cls => (
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
              {cls.section} · {cls.subject.split(' ')[0]}
              {cls.activeQuizCount > 0 && (
                <span
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                  style={{ background: classFilter === cls.id ? 'rgba(255,255,255,0.3)' : 'var(--color-accent)', color: '#fff' }}
                >
                  {cls.activeQuizCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Status tabs ── */}
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

      {/* ── Quiz grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.length > 0 ? filteredQuizzes.map(q => (
          <div key={q.id} className="relative">
            <QuizCard
              title={q.title}
              courseName={q.courseName}
              questionCount={q.questionCount}
              duration={q.duration}
              difficulty={q.difficulty}
              status={q.status}
              scheduledDate={q.scheduledDate}
              type={q.type}
              onStart={() => console.log('Edit quiz', q.id)}
            />
            {/* Assign badge */}
            {classFilter === 'all' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Assigned to:</span>
                <Badge color="indigo">5A · DS</Badge>
                <button
                  className="text-xs text-[var(--color-accent)] hover:underline font-medium"
                  onClick={() => navigate('/faculty/quiz/create')}
                >
                  + Assign
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full py-16 text-center card">
            <p className="text-[var(--color-text-muted)] text-sm">No quizzes found.</p>
            <Button
              size="sm" className="mt-4"
              onClick={() => navigate('/faculty/quiz/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Quiz
            </Button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
