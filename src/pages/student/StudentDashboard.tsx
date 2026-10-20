import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ClipboardList, TrendingUp, Flame,
  Calendar
} from 'lucide-react';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ControlledTabs } from '../../components/ui/Tabs';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { studentService } from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { departmentEvents } from '../../data/collegeInfo';
import { mockLeaderboard } from '../../data/students';
import api from '../../lib/apiClient';
import type { Student, LeaderboardEntry } from '../../types/student';
import type { Course } from '../../types/course';

interface DashboardQuiz {
  id: string;
  title: string;
  duration: number;
  questionCount: number;
  courseName: string;
  status: 'active' | 'upcoming';
  scheduledAt?: string | null;
}

const mostImprovedData: { rank: number; studentId: string; studentName: string; score: number; change: 'up' | 'down' | 'same'; changeValue: number }[] = [];

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [nextQuiz, setNextQuiz] = useState<DashboardQuiz | null>(null);
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardTab, setLeaderboardTab] = useState('weekly');

  const leaderboardTabs = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'overall', label: 'Overall' },
    { id: 'improved', label: 'Most Improved' },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Load real student profile from /auth/me & studentService
      let profileData = await studentService.getProfile();
      let sectionId = '';

      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data) {
          const u = meRes.data;
          sectionId = u.student?.sectionId || u.student?.section?.id || '';
          profileData = {
            ...profileData,
            id: u.student?.id || u.id,
            name: u.name || profileData.name,
            email: u.email || profileData.email,
            rollNumber: u.student?.rollNo || profileData.rollNumber,
            department: u.student?.section?.department?.name || profileData.department || 'Computer Science',
            semester: u.student?.section?.semester || profileData.semester || 3,
            section: u.student?.section?.name ? `Section ${u.student.section.name}` : profileData.section,
          };
        }
      } catch (err) {
        console.warn('Failed to fetch /auth/me:', err);
      }

      // 2. Load real courses for student's semester from /courses
      let coursesData = courseService.getCoursesWithProgress();
      try {
        const coursesRes = await api.get('/courses');
        if (Array.isArray(coursesRes.data) && coursesRes.data.length > 0) {
          const dbCourses: any[] = coursesRes.data;
          const merged: Course[] = dbCourses.map(dbCourse => {
            const match = coursesData.find(l => l.code === dbCourse.code);
            return {
              id: dbCourse.id,
              name: dbCourse.name,
              code: dbCourse.code,
              semester: dbCourse.semester || profileData.semester || 3,
              department: dbCourse.departmentName || profileData.department || 'Computer Science',
              creditHours: 4,
              facultyId: dbCourse.assignments?.[0]?.facultyId || '',
              facultyName: dbCourse.assignments?.[0]?.facultyName || 'Department Faculty',
              color: match?.color || '#6366f1',
              units: match?.units || [],
              progress: match?.progress || 0,
              enrollmentStatus: 'Enrolled' as const,
            };
          });
          coursesData = merged;
        }
      } catch (err) {
        console.warn('Failed to fetch /courses:', err);
      }

      // 3. Load real quizzes from /quizzes and calculate live quiz stats
      try {
        const quizzesRes = await api.get('/quizzes');
        if (Array.isArray(quizzesRes.data) && quizzesRes.data.length > 0) {
          const allQuizzes: any[] = quizzesRes.data;

          // Compute real quiz average from student's database attempts
          const attempts = allQuizzes.flatMap(q => q.attempts || []);
          if (attempts.length > 0) {
            const totalScore = attempts.reduce((acc: number, a: any) => acc + (a.score || 0), 0);
            profileData.quizAverage = Math.round(totalScore / attempts.length);
            profileData.learningProgress = Math.min(100, Math.round((profileData.quizAverage / 100) * 85));
          }

          // Find active or upcoming quiz for nextQuiz banner
          const activeQ = allQuizzes.find(
            q =>
              q.status?.toUpperCase() !== 'COMPLETED' &&
              (!q.attempts || q.attempts.length === 0) &&
              (!q.scheduledAt || new Date(q.scheduledAt) <= new Date())
          );

          const upcomingQ = allQuizzes.find(
            q =>
              q.status?.toUpperCase() !== 'COMPLETED' &&
              (!q.attempts || q.attempts.length === 0) &&
              !!q.scheduledAt &&
              new Date(q.scheduledAt) > new Date()
          );

          const candidate = activeQ || upcomingQ;
          if (candidate) {
            setNextQuiz({
              id: candidate.id,
              title: candidate.title,
              duration: candidate.duration || 15,
              questionCount: candidate._count?.questions ?? 0,
              courseName: candidate.subject
                ? `[${candidate.subject.code}] ${candidate.subject.name}`
                : 'Curriculum Assessment',
              status: activeQ ? 'active' : 'upcoming',
              scheduledAt: candidate.scheduledAt,
            });
          } else {
            setNextQuiz(null);
          }
        } else {
          setNextQuiz(null);
        }
      } catch (err) {
        console.warn('Failed to fetch live quizzes:', err);
      }

      // 4. Load real section leaderboard from /analytics/leaderboard/:sectionId
      if (sectionId) {
        try {
          const lbRes = await api.get(`/analytics/leaderboard/${sectionId}`);
          if (Array.isArray(lbRes.data) && lbRes.data.length > 0) {
            const mapped: LeaderboardEntry[] = lbRes.data.map((item: any, idx: number) => ({
              rank: idx + 1,
              studentId: item.studentId,
              studentName: item.name,
              score: Math.round(item.averageScore || 0),
              change: 'same' as const,
              changeValue: 0,
              avatarUrl: item.avatarUrl,
            }));
            setLiveLeaderboard(mapped);
          }
        } catch (err) {
          console.warn('Failed to fetch leaderboard:', err);
        }
      }

      setStudent(profileData);
      setCourses(coursesData);
    } catch (err) {
      console.warn('Dashboard loading fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recentEvents = departmentEvents;

  // Overall average course progress
  const averageProgress = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / courses.length)
    : 0;

  const currentLeaderboard =
    liveLeaderboard.length > 0 ? liveLeaderboard : mockLeaderboard;

  const leaderboardData =
    leaderboardTab === 'improved' ? mostImprovedData : currentLeaderboard;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
            Welcome back{student?.name ? `, ${student.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {student?.department
              ? `${student.department} · ${student.semester ? `${student.semester}th Semester` : ''} ${student.section ? `(${student.section}) · ` : ''}Academic Overview`
              : 'Academic Overview'}
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
          value={`${student?.quizAverage || 0}%`}
          trend={student?.quizAverage ? student.quizAverage : undefined}
          trendLabel={student?.quizAverage ? "accuracy score" : undefined}
          icon={<ClipboardList className="w-5 h-5" />}
          accent="navy"
        />
        <StatCard
          title="Learning Gain"
          value={student?.learningProgress ? `+${student.learningProgress}%` : '0%'}
          trend={student?.learningProgress ? student.learningProgress : undefined}
          trendLabel={student?.learningProgress ? "this semester" : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="success"
        />
        <StatCard
          title="Study Streak"
          value={`${student?.streak || 0} days`}
          subtitle="Consistency on track!"
          icon={<Flame className="w-5 h-5" />}
          accent="warning"
        />
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
                <Badge
                  color={nextQuiz.status === 'active' ? 'green' : 'amber'}
                  className="text-[10px] py-0"
                >
                  {nextQuiz.status === 'active' ? 'Active' : 'Upcoming'}
                </Badge>
                <span className="text-xs text-indigo-200">{nextQuiz.courseName}</span>
              </div>
              <h4 className="font-bold text-sm text-white mt-0.5">{nextQuiz.title}</h4>
              <p className="text-xs text-white/60">
                Duration: {nextQuiz.duration} mins · {nextQuiz.questionCount} Questions
                {nextQuiz.status === 'upcoming' && nextQuiz.scheduledAt && (
                  <>
                    {' · '}Opens {new Date(nextQuiz.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </>
                )}
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

      {/* Priority Activities & Schedule */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Upcoming Schedule / Department Events */}
        <Card className="h-fit">
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
            {recentEvents.length > 0 ? (
              recentEvents.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl border border-[var(--color-border)] flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    ev.category === 'exam' ? 'bg-rose-50 text-rose-600' : ev.category === 'deadline' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] truncate">{ev.title}</span>
                      <Badge color={ev.category === 'exam' ? 'red' : ev.category === 'deadline' ? 'indigo' : 'amber'} className="text-[9px] py-0 px-1 capitalize">
                        {ev.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                      {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {ev.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[var(--color-text-muted)]">
                No upcoming exams or department events scheduled.
              </div>
            )}
          </div>
        </Card>

        {/* Class Leaderboard */}
        <Card padding="none" className="h-fit">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-[var(--color-text-primary)]">Class Leaderboard</h3>
            <ControlledTabs tabs={leaderboardTabs} activeTab={leaderboardTab} onChange={setLeaderboardTab} />
          </div>
          <LeaderboardTable
            entries={leaderboardData}
            currentStudentId={student?.id || ''}
          />
        </Card>
      </div>
    </div>
  );
};

export { Dashboard } from './Dashboard';
