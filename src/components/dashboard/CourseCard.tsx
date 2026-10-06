import React from 'react';
import { clsx } from 'clsx';
import { BookOpen, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../types/course';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, compact = false }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card p-4 card-hover cursor-pointer"
      onClick={() => navigate(`/student/courses`)}
    >
      {/* Color accent top strip */}
      <div
        className="h-1 w-full rounded-full mb-4"
        style={{ background: course.color || 'var(--color-accent)' }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${course.color}18` || 'var(--color-accent-light)' }}
        >
          <BookOpen className="w-4 h-4" style={{ color: course.color || 'var(--color-accent)' }} />
        </div>
        <Badge color="gray">{course.code}</Badge>
      </div>

      <h4 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1 leading-snug">
        {course.name}
      </h4>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">{course.facultyName}</p>

      <ProgressBar value={course.progress} height="xs" showLabel className="mb-3" />

      {!compact && course.nextQuizDate && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] bg-[var(--color-muted)] rounded-lg px-2.5 py-1.5">
          <Calendar className="w-3 h-3" />
          <span>Next quiz: {new Date(course.nextQuizDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span className="mx-1">·</span>
          <span>{course.nextQuizTopic}</span>
        </div>
      )}
    </div>
  );
};

interface QuizCardProps {
  title: string;
  courseName: string;
  questionCount: number;
  duration: number;
  difficulty: string;
  status: string;
  scheduledDate: string;
  onStart?: () => void;
  type?: 'weekly' | 'remedial' | 'practice';
}

export const QuizCard: React.FC<QuizCardProps> = ({
  title,
  courseName,
  questionCount,
  duration,
  difficulty,
  status,
  scheduledDate,
  onStart,
  type = 'weekly',
}) => {
  const difficultyColor: Record<string, 'green' | 'amber' | 'red'> = {
    easy: 'green', medium: 'amber', hard: 'red',
  };
  const statusColor: Record<string, 'indigo' | 'green' | 'gray' | 'amber'> = {
    upcoming: 'indigo', active: 'green', completed: 'gray', scheduled: 'amber',
  };

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color={statusColor[status] || 'gray'} dot>{status}</Badge>
            {type === 'remedial' && <Badge color="amber">Remedial</Badge>}
          </div>
          <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">{title}</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{courseName}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{questionCount} questions</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
          <Clock className="w-3.5 h-3.5" />
          <span>{duration} min</span>
        </div>
        <Badge color={difficultyColor[difficulty] || 'gray'} className="capitalize">
          {difficulty}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)]">
          {status === 'completed' ? 'Submitted' : 'Due'}: {new Date(scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        {status !== 'completed' && (
          <button
            onClick={onStart}
            className={clsx(
              'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
              status === 'active'
                ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)]'
                : 'bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
            )}
          >
            {status === 'active' ? 'Start Quiz' : 'View'}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        {status === 'completed' && (
          <button
            onClick={onStart}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            View Result <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
