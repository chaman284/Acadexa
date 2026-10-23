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

  const yearWiseChartData = (analytics?.yearWise || []).map(y => ({
    name: y.year,
    avgScore: y.averageScore !== null ? Math.round(y.averageScore) : null,
    students: y.studentsCount,
    attempts: y.attemptsCount,
  }));

  const sectionWiseChartData = (analytics?.sectionWise || []).map(s => ({
    name: `Sem ${s.semester}-${s.sectionName}`,
    avgScore: s.averageScore !== null ? Math.round(s.averageScore) : null,
    students: s.studentCount,
    attempts: s.attemptsCount,
  }));

  const courseWiseChartData = (analytics?.courseWise || []).map(c => ({
    code: c.code,
    name: c.name,
    avgScore: c.averageScore !== null ? Math.round(c.averageScore) : null,
    attempts: c.attemptsCount,
    passRate: c.passRate !== null ? Math.round(c.passRate) : null,
  }));

  const selectStyle = "text-xs font-medium bg-white border border-[#E1D4CA] rounded-[9px] px-3 py-2 text-[#302A2B] focus:outline-none focus:border-[#542536] focus:shadow-[0_0_0_3px_rgba(84,37,54,0.12)] transition-all";

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E1D4CA',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(50,25,35,0.12)',
    fontWeight: 500,
    fontSize: 12,
    color: '#302A2B',
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <PageHeader
        title="Academic Intelligence"
        subtitle="Real-time academic performance, faculty assignments, and department analytics"
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Overview' }]}
        action={
          <div className="flex items-center gap-2.5">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className={selectStyle}
            >
              <option value="">All Departments</option>
              {data?.departments?.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>

            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className={selectStyle}
            >
              <option value="all">All Time</option>
              <option value="semester">This Semester</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <button
              onClick={fetchOverview}
              disabled={isLoading}
              className="p-2 text-[#79666A] hover:text-[#302A2B] bg-white border border-[#E1D4CA] rounded-[9px] hover:bg-[#F7F1E8] transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#542536]' : ''}`} />
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-[10px] bg-[#fbeaec] border border-[rgba(139,44,53,0.20)] text-[#8b2c35] text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Students',
            value: isLoading ? '–' : summary?.totalStudents ?? 0,
            sub: 'Enrolled profiles',
            icon: <GraduationCap className="w-4 h-4 text-[#542536]" />,
            iconBg: 'rgba(84,37,54,0.10)',
            accent: 'accent-oxblood',
          },
          {
            label: 'Faculty',
            value: isLoading ? '–' : summary?.totalFaculty ?? 0,
            sub: 'Teaching staff',
            icon: <Users className="w-4 h-4 text-[#34483A]" />,
            iconBg: 'rgba(52,72,58,0.10)',
            accent: 'accent-forest',
          },
          {
            label: 'Courses',
            value: isLoading ? '–' : summary?.totalCourses ?? 0,
            sub: 'Curriculum subjects',
            icon: <BookOpen className="w-4 h-4 text-[#B69A69]" />,
            iconBg: 'rgba(182,154,105,0.12)',
            accent: 'accent-brass',
          },
          {
            label: 'Sections',
            value: isLoading ? '–' : summary?.totalSections ?? 0,
            sub: 'Active class cohorts',
            icon: <Building2 className="w-4 h-4 text-[#687B62]" />,
            iconBg: 'rgba(104,123,98,0.10)',
            accent: 'accent-sage',
          },
          {
            label: 'Active Courses',
            value: isLoading ? '–' : summary?.activeCourses ?? 0,
            sub: 'Assigned & running',
            icon: <TrendingUp className="w-4 h-4 text-[#C58D98]" />,
            iconBg: 'rgba(197,141,152,0.12)',
            accent: 'accent-rose',
          },
          {
            label: 'Academic Score',
            value: isLoading
              ? '–'
              : summary?.overallPerformance !== null && summary?.overallPerformance !== undefined
              ? `${Math.round(summary.overallPerformance)}%`
              : '--',
            sub: summary?.overallPerformance !== null ? 'Dept. average' : 'No quiz records',
            icon: <Award className="w-4 h-4 text-[#34483A]" />,
            iconBg: 'rgba(52,72,58,0.10)',
            accent: 'accent-forest',
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`card p-4 stat-card-accent ${item.accent}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold text-[#79666A] uppercase tracking-wider">{item.label}</span>
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: item.iconBg }}>
                {item.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-[#302A2B]">{item.value}</div>
            <p className="text-[11px] text-[#79666A] font-medium mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Analytics Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Year-wise Performance */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[13.5px] text-[#302A2B]">Year-Wise Academic Comparison</h3>
              <p className="text-xs text-[#79666A] font-medium mt-0.5">Mapped across semesters 1–8 (Years 1 to 4)</p>
            </div>
            <Badge color="oxblood">Curriculum Years</Badge>
          </div>

          <div className="h-64">
            {yearWiseChartData.every(d => d.avgScore === null) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#79666A]">
                <BarChart2 className="w-8 h-8 mb-2 text-[#a08a8e]" />
                <p className="text-sm font-semibold text-[#302A2B]">No quiz attempts recorded for curriculum years</p>
                <p className="text-xs text-[#79666A] mt-1">Attempts will populate here once students take quizzes</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearWiseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1D4CA" />
                  <XAxis dataKey="name" stroke="#E1D4CA" fontSize={12} tickLine={false} tick={{ fill: '#79666A', fontWeight: 500 }} />
                  <YAxis stroke="#E1D4CA" fontSize={12} tickLine={false} domain={[0, 100]} tick={{ fill: '#79666A', fontWeight: 500 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name?: any) => [val !== null ? `${val}%` : 'No attempts', name === 'avgScore' ? 'Avg Score' : String(name || '')]} />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#542536" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Section-wise Performance */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[13.5px] text-[#302A2B]">Section & Class Comparison</h3>
              <p className="text-xs text-[#79666A] font-medium mt-0.5">Academic performance across section cohorts</p>
            </div>
            <Badge color="forest">Sections</Badge>
          </div>

          <div className="h-64">
            {sectionWiseChartData.length === 0 || sectionWiseChartData.every(d => d.avgScore === null) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#79666A]">
                <Building2 className="w-8 h-8 mb-2 text-[#a08a8e]" />
                <p className="text-sm font-semibold text-[#302A2B]">No section scores available yet</p>
                <p className="text-xs text-[#79666A] mt-1">Sections will reflect quiz scores as students participate</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectionWiseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1D4CA" />
                  <XAxis dataKey="name" stroke="#E1D4CA" fontSize={12} tickLine={false} tick={{ fill: '#79666A', fontWeight: 500 }} />
                  <YAxis stroke="#E1D4CA" fontSize={12} tickLine={false} domain={[0, 100]} tick={{ fill: '#79666A', fontWeight: 500 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any) => [val !== null ? `${val}%` : 'No attempts', 'Average Score']} />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#34483A" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Course-wise Performance */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[13.5px] text-[#302A2B]">Course-Wise Subject Scores</h3>
              <p className="text-xs text-[#79666A] font-medium mt-0.5">Average student score per registered subject</p>
            </div>
            <Badge color="brass">Subjects</Badge>
          </div>

          <div className="h-64">
            {courseWiseChartData.length === 0 || courseWiseChartData.every(d => d.avgScore === null) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#79666A]">
                <BookOpen className="w-8 h-8 mb-2 text-[#a08a8e]" />
                <p className="text-sm font-semibold text-[#302A2B]">No quiz evaluations found for courses</p>
                <p className="text-xs text-[#79666A] mt-1">Scores will display per subject once quizzes are graded</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseWiseChartData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E1D4CA" />
                  <XAxis type="number" stroke="#E1D4CA" fontSize={12} domain={[0, 100]} tick={{ fill: '#79666A', fontWeight: 500 }} />
                  <YAxis dataKey="code" type="category" stroke="#E1D4CA" fontSize={12} tickLine={false} tick={{ fill: '#79666A', fontWeight: 500 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(val: any, name?: any) => [val !== null ? `${val}%` : 'No data', name === 'avgScore' ? 'Avg Score' : String(name || '')]} />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#B69A69" radius={[0, 5, 5, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Student Participation */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[13.5px] text-[#302A2B]">Student Quiz Participation</h3>
              <p className="text-xs text-[#79666A] font-medium mt-0.5">Active engagement rate and total submissions</p>
            </div>
            <Badge color="sage">Engagement</Badge>
          </div>

          <div className="flex flex-col justify-between h-56">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-[12px] border border-[#E1D4CA] text-center" style={{ background: 'rgba(84,37,54,0.04)' }}>
                <span className="text-[10px] text-[#79666A] font-semibold uppercase tracking-wider">Participation Rate</span>
                <p className="text-3xl font-bold text-[#542536] mt-1.5">
                  {analytics?.participation?.participationRate ?? 0}%
                </p>
                <p className="text-[11px] text-[#79666A] font-medium mt-1">
                  {analytics?.participation?.totalParticipatingStudents ?? 0} of {analytics?.participation?.totalEligibleStudents ?? 0} students
                </p>
              </div>

              <div className="p-4 rounded-[12px] border border-[#E1D4CA] text-center" style={{ background: 'rgba(52,72,58,0.05)' }}>
                <span className="text-[10px] text-[#79666A] font-semibold uppercase tracking-wider">Total Attempts</span>
                <p className="text-3xl font-bold text-[#34483A] mt-1.5">
                  {analytics?.participation?.totalAttempts ?? 0}
                </p>
                <p className="text-[11px] text-[#79666A] font-medium mt-1">
                  Submitted evaluations
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-[10px] border border-[#E1D4CA] flex items-start gap-2.5" style={{ background: '#F7F1E8' }}>
              <CheckCircle2 className="w-4 h-4 text-[#34483A] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#79666A] font-medium leading-relaxed">
                Participation metrics reflect genuine student quiz submissions. Incomplete submissions and missing scores are not falsified.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
