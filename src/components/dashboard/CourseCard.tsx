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
      className="card p-5 card-hover cursor-pointer"
      onClick={() => navigate(`/student/courses`)}
    >
      {/* Accent top bar using course color */}
      <div
        className="h-1 w-full rounded-full mb-4 opacity-70"
        style={{ background: course.color || '#542536' }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(84,37,54,0.08)', border: '1px solid rgba(84,37,54,0.14)' }}
        >
          <BookOpen className="w-4.5 h-4.5 text-[#542536]" />
        </div>
        <Badge color="brass">{course.code}</Badge>
      </div>

      <h4 className="font-semibold text-[#302A2B] text-[14px] mb-1 leading-snug">
        {course.name}
      </h4>
      <p className="text-xs font-medium text-[#79666A] mb-3">{course.facultyName}</p>

      <ProgressBar value={course.progress} height="sm" showLabel className="mb-3" />

      {!compact && course.nextQuizDate && (
        <div
          className="flex items-center gap-1.5 text-xs font-medium text-[#302A2B] rounded-[8px] px-2.5 py-1.5"
          style={{ background: '#F7F1E8', border: '1px solid #E1D4CA' }}
        >
          <Calendar className="w-3.5 h-3.5 text-[#542536]" />
          <span>Next quiz: {new Date(course.nextQuizDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <span className="mx-1 text-[#a08a8e]">·</span>
          <span className="font-semibold">{course.nextQuizTopic}</span>
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
  const difficultyColor: Record<string, 'forest' | 'brass' | 'red'> = {
    easy: 'forest', medium: 'brass', hard: 'red',
  };
  const statusColor: Record<string, 'oxblood' | 'forest' | 'pale-rose' | 'brass'> = {
    upcoming: 'oxblood', active: 'forest', completed: 'pale-rose', scheduled: 'brass',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge color={statusColor[status] || 'pale-rose'} dot>{status}</Badge>
            {type === 'remedial' && <Badge color="brass">Remedial</Badge>}
          </div>
          <h4 className="font-semibold text-[#302A2B] text-[14px]">{title}</h4>
          <p className="text-xs font-medium text-[#79666A] mt-0.5">{courseName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <div className="flex items-center gap-1 text-xs font-medium text-[#79666A] px-2 py-1 rounded-[6px]" style={{ background: '#F7F1E8', border: '1px solid #E1D4CA' }}>
          <BookOpen className="w-3.5 h-3.5 text-[#79666A]" />
          <span>{questionCount} questions</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-[#79666A] px-2 py-1 rounded-[6px]" style={{ background: '#F7F1E8', border: '1px solid #E1D4CA' }}>
          <Clock className="w-3.5 h-3.5 text-[#79666A]" />
          <span>{duration} min</span>
        </div>
        <Badge color={difficultyColor[difficulty] || 'pale-rose'} className="capitalize">
          {difficulty}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E1D4CA]">
        <span className="text-xs font-medium text-[#79666A]">
          {status === 'completed' ? 'Submitted' : 'Due'}: {new Date(scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        {status !== 'completed' && (
          <button
            onClick={onStart}
            className={clsx(
              'flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-[8px] border transition-all',
              status === 'active'
                ? 'bg-[#542536] text-white border-[#321923] hover:bg-[#321923]'
                : 'bg-[#F7F1E8] text-[#302A2B] border-[#E1D4CA] hover:bg-[#EEE3E0]'
            )}
          >
            {status === 'active' ? 'Start Quiz' : 'View'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
        {status === 'completed' && (
          <button
            onClick={onStart}
            className="flex items-center gap-1 text-xs font-semibold text-[#542536] hover:underline"
          >
            View Result <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
