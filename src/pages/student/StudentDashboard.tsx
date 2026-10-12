import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ClipboardList, TrendingUp, Flame, ArrowRight,
  Calendar, CheckCircle, Trophy
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { mockQuizzes } from '../../data/quizzes';
import { departmentEvents } from '../../data/collegeInfo';
import { mockLeaderboard } from '../../data/students';
import type { Student } from '../../types/student';
import type { Course } from '../../types/course';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profileData, coursesData] = await Promise.all([
        studentService.getProfile(),
        Promise.resolve(courseService.getCoursesWithProgress()),
      ]);
      setStudent(profileData);
      setCourses(coursesData);
    } catch (err) {
      console.warn('Dashboard loading fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuiz = mockQuizzes.find(q => q.status === 'active' || q.status === 'upcoming');
  const recentEvents = departmentEvents.slice(0, 3);
  const topLeaderboard = mockLeaderboard.slice(0, 3);

  // Overall average course progress
  const averageProgress = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Welcome back, {student?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {student?.department || 'Computer Science'} · {student?.semester || 5}th Semester ({student?.section || 'Sec A'}) · Academic Overview
          </p>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] bg-white px-3.5 py-1.5 rounded-xl border border-[var(--color-border)] shadow-2xs flex items-center gap-2 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Syllabus Progress"
          value={`${averageProgress}%`}
          subtitle="Across enrolled subjects"
          icon={<BookOpen className="w-5 h-5" />}
          accent="indigo"
        />
        <StatCard
          title="Quiz Average"
          value={`${student?.quizAverage || 78}%`}
          trend={5}
          trendLabel="accuracy score"
          icon={<ClipboardList className="w-5 h-5" />}
          accent="navy"
        />
        <StatCard
          title="Learning Gain"
          value={`+${student?.learningProgress || 12}%`}
          trend={student?.learningProgress || 12}
          trendLabel="this semester"
          icon={<TrendingUp className="w-5 h-5" />}
          accent="success"
        />
        <StatCard
          title="Study Streak"
          value={`${student?.streak || 7} days`}
          subtitle="Consistency on track!"
          icon={<Flame className="w-5 h-5" />}
          accent="warning"
        />
      </div>

      {/* Main Content: Courses Progress & Academic Activities */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Courses with Syllabus Tracking */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" /> Current Courses & Completion
            </h2>
            <button
              onClick={() => navigate('/student/courses')}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              View Detailed Syllabus <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {courses.length === 0 ? (
              <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)]">No active courses registered.</p>
              </div>
            ) : (
              courses.slice(0, 4).map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate('/student/courses')}
                  className="card p-4 hover:border-[var(--color-accent)]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${course.color || '#6366f1'}15`, color: course.color || '#6366f1' }}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <Badge color="gray" className="text-[10px]">{course.code}</Badge>
                  </div>

                  <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
                    {course.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1 mb-3">
                    {course.facultyName}
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[var(--color-text-muted)]">Syllabus</span>
                      <span className="text-[var(--color-text-primary)]">{course.progress}%</span>
                    </div>
                    <ProgressBar value={course.progress} height="xs" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Assessment CTA */}
          {nextQuiz && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 flex-shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge color="green" className="text-[10px] py-0">Upcoming</Badge>
                    <span className="text-xs text-indigo-200">{nextQuiz.courseName}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-0.5">{nextQuiz.title}</h4>
                  <p className="text-xs text-white/60">
                    Duration: {nextQuiz.duration} mins · {nextQuiz.questionCount} Questions
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => navigate('/student/quiz')}
                className="!bg-[var(--color-accent)] hover:!bg-[var(--color-accent-dark)] !text-white flex-shrink-0"
              >
                Go to Quiz
              </Button>
            </div>
          )}
        </div>

        {/* Right Col: Priority Activities & Schedule */}
        <div className="space-y-5">
          {/* Upcoming Schedule / Department Events */}
          <Card>
            <CardHeader
              title="Upcoming Schedule"
              subtitle="Exams & department calendar"
              action={
                <button
                  onClick={() => navigate('/student/department')}
                  className="text-xs text-[var(--color-accent)] hover:underline"
                >
                  View all
                </button>
              }
            />
            <div className="space-y-2.5">
              {recentEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl border border-[var(--color-border)] flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    ev.category === 'exam' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">{ev.title}</span>
                      <Badge color={ev.category === 'exam' ? 'red' : 'amber'} className="text-[9px] py-0 px-1 capitalize">
                        {ev.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {ev.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Class Standing Spotlight */}
          <Card>
            <CardHeader
              title="Class Leaderboard"
              subtitle="Current 5th Sem ranking"
              action={
                <button
                  onClick={() => navigate('/student/leaderboard')}
                  className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
                >
                  Full Board <ArrowRight className="w-3 h-3" />
                </button>
              }
            />
            <div className="space-y-2">
              {topLeaderboard.map(entry => (
                <div
                  key={entry.studentId}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${
                    entry.studentId === student?.id
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold'
                      : 'bg-[var(--color-muted)]/50 text-[var(--color-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center font-bold text-[10px] text-slate-700">
                      {entry.rank}
                    </span>
                    <span className="truncate">{entry.studentName}</span>
                    {entry.studentId === student?.id && (
                      <Badge color="indigo" className="text-[9px] py-0 px-1">You</Badge>
                    )}
                  </div>
                  <span className="font-bold text-[var(--color-accent)]">{entry.score}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
