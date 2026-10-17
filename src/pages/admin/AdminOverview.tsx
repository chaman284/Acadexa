import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { adminService, type OverviewResponse } from '../../services/adminService';
import {
  Users, BookOpen, GraduationCap, Building2,
  TrendingUp, Award, CheckCircle2, AlertCircle,
  RefreshCw, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from 'recharts';

export const AdminOverview: React.FC = () => {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('all');

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getOverview(selectedDept || undefined, timeRange);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load overview data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedDept, timeRange]);

  const summary = data?.summary;
  const analytics = data?.analytics;

  // Chart data preparation - Year wise
  const yearWiseChartData = (analytics?.yearWise || []).map(y => ({
    name: y.year,
    avgScore: y.averageScore !== null ? Math.round(y.averageScore) : null,
    students: y.studentsCount,
    attempts: y.attemptsCount,
  }));

  // Chart data preparation - Section wise
  const sectionWiseChartData = (analytics?.sectionWise || []).map(s => ({
    name: `Sem ${s.semester}-${s.sectionName}`,
    avgScore: s.averageScore !== null ? Math.round(s.averageScore) : null,
    students: s.studentCount,
    attempts: s.attemptsCount,
  }));

  // Chart data preparation - Course wise
  const courseWiseChartData = (analytics?.courseWise || []).map(c => ({
    code: c.code,
    name: c.name,
    avgScore: c.averageScore !== null ? Math.round(c.averageScore) : null,
    attempts: c.attemptsCount,
    passRate: c.passRate !== null ? Math.round(c.passRate) : null,
  }));

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <PageHeader
        title="Admin Academic Intelligence"
        subtitle="Real-time academic performance, faculty assignments, and department analytics"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Overview' }]}
        action={
          <div className="flex items-center gap-3">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">All Departments</option>
              {data?.departments?.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            {/* Time range filter */}
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="text-xs font-medium bg-white border border-[var(--color-border)] rounded-xl px-3 py-2 text-[var(--color-text-primary)] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="all">All Time</option>
              <option value="semester">This Semester</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <button
              onClick={fetchOverview}
              disabled={isLoading}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-white border border-[var(--color-border)] rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Students */}
        <Card className="p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Total Students</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? '...' : summary?.totalStudents ?? 0}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Enrolled profiles</p>
        </Card>

        {/* Total Faculty */}
        <Card className="p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Total Faculty</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? '...' : summary?.totalFaculty ?? 0}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Teaching staff</p>
        </Card>

        {/* Total Courses */}
        <Card className="p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Total Courses</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? '...' : summary?.totalCourses ?? 0}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Curriculum subjects</p>
        </Card>

        {/* Total Classes/Sections */}
        <Card className="p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Classes/Sections</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? '...' : summary?.totalSections ?? 0}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Active class cohorts</p>
        </Card>

        {/* Active Courses */}
        <Card className="p-4 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Active Courses</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">
            {isLoading ? '...' : summary?.activeCourses ?? 0}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">Assigned & running</p>
        </Card>

        {/* Overall Academic Performance */}
        <Card className="p-4 border border-[var(--color-border)] bg-gradient-to-br from-indigo-50/40 to-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-900">Academic Score</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-950">
            {isLoading
              ? '...'
              : summary?.overallPerformance !== null && summary?.overallPerformance !== undefined
              ? `${Math.round(summary.overallPerformance)}%`
              : '--'}
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">
            {summary?.overallPerformance !== null ? 'Dept. average' : 'No quiz records'}
          </p>
        </Card>
      </div>

      {/* ── Analytics Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year-wise Performance */}
        <Card className="p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Year-Wise Academic Comparison</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Mapped across semesters 1–8 (Years 1 to 4)</p>
            </div>
            <Badge color="indigo">Curriculum Years</Badge>
          </div>

          <div className="h-64">
            {yearWiseChartData.every(d => d.avgScore === null) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)]">
                <BarChart2 className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm font-medium">No quiz attempts recorded for curriculum years</p>
                <p className="text-xs text-slate-400 mt-1">Attempts will populate here once students take quizzes</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearWiseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any, name?: any) => [
                      val !== null ? `${val}%` : 'No attempts',
                      name === 'avgScore' ? 'Avg Score' : String(name || '')
                    ]}
                  />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Class-wise/Section-wise Performance */}
        <Card className="p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Section & Class Comparison</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Academic performance across section cohorts</p>
            </div>
            <Badge color="green">Sections</Badge>
          </div>

          <div className="h-64">
            {sectionWiseChartData.length === 0 || sectionWiseChartData.every(d => d.avgScore === null) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)]">
                <Building2 className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm font-medium">No section scores available yet</p>
                <p className="text-xs text-slate-400 mt-1">Sections will reflect quiz scores as students participate</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionWiseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any) => [val !== null ? `${val}%` : 'No attempts', 'Average Score']}
                  />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Course-wise Performance */}
        <Card className="p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Course-Wise Subject Scores</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Average student score per registered subject</p>
            </div>
            <Badge color="purple">Subjects</Badge>
          </div>

          <div className="h-64">
            {courseWiseChartData.length === 0 || courseWiseChartData.every(d => d.avgScore === null) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-muted)]">
                <BookOpen className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm font-medium">No quiz evaluations found for courses</p>
                <p className="text-xs text-slate-400 mt-1">Scores will display per subject once quizzes are graded</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseWiseChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                  <YAxis dataKey="code" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(val: any, name?: any) => [
                      val !== null ? `${val}%` : 'No data',
                      name === 'avgScore' ? 'Avg Score' : String(name || '')
                    ]}
                  />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Student Participation & Quiz Activity */}
        <Card className="p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">Student Quiz Participation</h3>
              <p className="text-xs text-[var(--color-text-muted)]">Active engagement rate and total submissions</p>
            </div>
            <Badge color="blue">Engagement</Badge>
          </div>

          <div className="flex flex-col justify-between h-64">
            <div className="grid grid-cols-2 gap-4 my-auto">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Participation Rate</span>
                <p className="text-3xl font-extrabold text-[var(--color-accent)] mt-1">
                  {analytics?.participation?.participationRate ?? 0}%
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  {analytics?.participation?.totalParticipatingStudents ?? 0} of {analytics?.participation?.totalEligibleStudents ?? 0} students
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs text-[var(--color-text-muted)] font-medium">Total Quiz Attempts</span>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {analytics?.participation?.totalAttempts ?? 0}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                  Submitted evaluations
                </p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-indigo-900 leading-relaxed">
                Participation metrics reflect genuine student quiz submissions calculated from Prisma database relations. Incomplete submissions and missing scores are not falsified.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
