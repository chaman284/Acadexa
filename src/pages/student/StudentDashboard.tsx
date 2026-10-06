import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ClipboardList, TrendingUp, Flame, BarChart, ArrowRight,
  Calendar, Trophy,
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { PerformanceChart } from '../../components/dashboard/PerformanceChart';
import { CourseCard } from '../../components/dashboard/CourseCard';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockCurrentStudent, mockLeaderboard, mockTopicPerformance } from '../../data/students';
import { mockCourses } from '../../data/courses';
import {
  studentWeeklyPerformance,
  studentMonthlyPerformance,
  studentSemesterPerformance,
} from '../../data/analytics';
import { departmentEvents } from '../../data/collegeInfo';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const student = mockCurrentStudent;
  const topTopics = mockTopicPerformance.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
          Here's your academic overview, {student.name.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Semester"
          value="5th Sem"
          subtitle="Computer Science"
          icon={<BookOpen className="w-5 h-5" />}
          accent="navy"
        />
        <StatCard
          title="Quiz Average"
          value={`${student.quizAverage}%`}
          trend={5}
          trendLabel="this month"
          icon={<ClipboardList className="w-5 h-5" />}
          accent="indigo"
        />
        <StatCard
          title="Learning Progress"
          value={`+${student.learningProgress}%`}
          trend={student.learningProgress}
          trendLabel="this semester"
          icon={<TrendingUp className="w-5 h-5" />}
          accent="success"
        />
        <StatCard
          title="Current Streak"
          value={`${student.streak} days`}
          subtitle="Keep it up!"
          icon={<Flame className="w-5 h-5" />}
          accent="warning"
        />
      </div>

      {/* Performance Chart + Learning Snapshot */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PerformanceChart
            weekData={studentWeeklyPerformance}
            monthData={studentMonthlyPerformance}
            semesterData={studentSemesterPerformance}
          />
        </div>

        {/* Learning Snapshot */}
        <Card>
          <CardHeader
            title="Learning Snapshot"
            action={
              <button
                onClick={() => navigate('/student/learning-gaps')}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Full analysis <ArrowRight className="w-3 h-3" />
              </button>
            }
          />
          <div className="space-y-3">
            {topTopics.map(topic => (
              <div key={topic.topicId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm text-[var(--color-text-secondary)] truncate">{topic.topicName}</span>
                    {topic.category === 'needs-practice' && (
                      <Badge color="red" className="text-[10px] py-0 px-1">Needs Practice</Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)] ml-2 flex-shrink-0">
                    {topic.score}%
                  </span>
                </div>
                <ProgressBar value={topic.score} height="xs" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--color-text-primary)]">My Courses</h2>
          <button
            onClick={() => navigate('/student/courses')}
            className="text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Upcoming + Leaderboard preview */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Upcoming */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Upcoming</h2>
          {/* Upcoming quiz */}
          <div className="card p-4 flex items-start gap-3">
            <div className="w-9 h-9 bg-[var(--color-accent-light)] rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Upcoming Quiz</p>
              <p className="font-medium text-[var(--color-text-primary)] text-sm truncate">Graph Algorithms</p>
              <p className="text-xs text-[var(--color-text-muted)]">Data Structures · Oct 8</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/student/quiz')}>
              Prepare
            </Button>
          </div>
          {/* Department Events */}
          {departmentEvents.slice(0, 2).map(ev => (
            <div key={ev.id} className="card p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                ev.category === 'exam' ? 'bg-[var(--color-danger-light)]' : 'bg-[var(--color-warning-light)]'
              }`}>
                <Calendar className={`w-4 h-4 ${ev.category === 'exam' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <Badge color={ev.category === 'exam' ? 'red' : 'amber'} className="text-[10px] mb-0.5">
                  {ev.category}
                </Badge>
                <p className="font-medium text-[var(--color-text-primary)] text-sm truncate">{ev.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {ev.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader
              title="Class Leaderboard"
              action={
                <button
                  onClick={() => navigate('/student/leaderboard')}
                  className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
                >
                  Full leaderboard <ArrowRight className="w-3 h-3" />
                </button>
              }
            />
            <LeaderboardTable
              entries={mockLeaderboard.slice(0, 5)}
              currentStudentId={student.id}
              compact
            />
          </Card>
        </div>
      </div>
    </div>
  );
};
