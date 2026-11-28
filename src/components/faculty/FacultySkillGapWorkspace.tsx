import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  Lock,
  RefreshCw,
  Search,
  Users,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { StudentSkillGapReport } from '../skillgap/StudentSkillGapReport';
import {
  facultyAnalyticsService,
  type ClassSummary,
  type FacultyAssignment,
  type FacultyNotification,
  type SkillGapStudent,
  type StudentListResponse,
  type TopicAnalysis,
  type TopicAnalysisRow,
} from '../../services/facultyAnalyticsService';
import { asArray, asNumber } from '../../services/facultyAnalyticsNormalizer';
import type { StudentSkillGapReport as StudentReport } from '../../services/analyticsService';

type Tab = 'overview' | 'students' | 'alerts';
type QuickFilter = '' | 'below-threshold' | 'weak-topic' | 'no-attempts';

const assignmentKey = (a: FacultyAssignment) => `${a.subjectId}|${a.sectionId}`;

const statusBadge: Record<SkillGapStudent['status'], { color: 'red' | 'amber' | 'green' | 'gray'; label: string }> = {
  'below-threshold': { color: 'red', label: 'Below threshold' },
  average: { color: 'amber', label: 'Average' },
  strong: { color: 'green', label: 'Strong' },
  'no-attempts': { color: 'gray', label: 'No attempts' },
};

const heatColor = (score: number | null): string => {
  if (score === null) return '#F7F1E8';
  if (score < 40) return 'rgba(139,44,53,0.28)';
  if (score < 50) return 'rgba(139,44,53,0.16)';
  if (score < 75) return 'rgba(182,154,105,0.22)';
  return 'rgba(52,72,58,0.20)';
};

const formatDate = (value: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

interface Props {
  compact?: boolean;
}

export const FacultySkillGapWorkspace: React.FC<Props> = ({ compact = false }) => {
  const initialQuery = useMemo(() => new URLSearchParams(window.location.search), []);
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [tab, setTab] = useState<Tab>(
    initialQuery.get('tab') === 'alerts' || initialQuery.get('tab') === 'students'
      ? (initialQuery.get('tab') as Tab)
      : 'overview',
  );
  const [topicId, setTopicId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('overallScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('');
  // Keep type arguments inside useState<...>: a stray `| null` outside the
  // angle brackets is parsed as `useState | (null > null)` by Vite/esbuild.
  const [summary, setSummary] = useState<ClassSummary | null>(null);
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);
  const [studentData, setStudentData] = useState<StudentListResponse | null>(null);
  const [notifications, setNotifications] = useState<FacultyNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<SkillGapStudent | null>(null);
  const [studentReport, setStudentReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  const selected = assignments.find((a) => assignmentKey(a) === selectedKey) || assignments[0];

  const loadAssignments = async () => {
    setLoading(true);
    const response = await facultyAnalyticsService.getAssignments();
    setAssignments(asArray<FacultyAssignment>(response.assignments));
    const requestedSubject = initialQuery.get('subjectId') || '';
    const requestedSection = initialQuery.get('sectionId') || '';
    const match = response.assignments.find(
      (a) => (!requestedSubject || a.subjectId === requestedSubject) && (!requestedSection || a.sectionId === requestedSection),
    );
    setSelectedKey(assignmentKey(match || response.assignments[0] || { subjectId: '', sectionId: '' } as FacultyAssignment));
    setLoading(false);
  };

  const loadData = async () => {
    if (!selected?.subjectId || !selected?.sectionId) return;
    setLoading(true);
    setError('');
    const query = { topicId, from, to };
    try {
      const [classSummary, topics, students] = await Promise.all([
        facultyAnalyticsService.getClassSummary(selected.subjectId, selected.sectionId, query),
        facultyAnalyticsService.getTopicAnalysis(selected.subjectId, selected.sectionId, query),
        facultyAnalyticsService.getStudents(selected.subjectId, selected.sectionId, {
          ...query,
          search,
          sortBy,
          sortDir,
          quickFilter,
        }),
      ]);
      setSummary(classSummary);
      setAnalysis(topics);
      setStudentData(students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load skill-gap data');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    const response = await facultyAnalyticsService.getNotifications();
    setNotifications(asArray<FacultyNotification>(response.notifications));
    setUnreadCount(asNumber(response.unreadCount));
  };

  useEffect(() => {
    void loadAssignments();
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, topicId, from, to, search, sortBy, sortDir, quickFilter]);

  const openStudentReport = async (student: SkillGapStudent) => {
    if (!selected) return;
    setSelectedStudent(student);
    setReportLoading(true);
    const report = await facultyAnalyticsService.getStudentSkillGap(
      selected.subjectId,
      selected.sectionId,
      student.studentId,
    );
    setStudentReport(report);
    setReportLoading(false);
  };

  const markRead = async (notification: FacultyNotification) => {
    if (notification.isRead) return;
    setNotifications((current) =>
      current.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await facultyAnalyticsService.markNotificationRead(notification.id);
    } catch {
      void loadNotifications();
    }
  };

  const topicOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const row of asArray<TopicAnalysisRow>(analysis?.topics)) byId.set(row.topicId, row.topicName);
    for (const row of asArray<StudentListResponse['topics'][number]>(studentData?.topics)) {
      byId.set(row.topicId, row.topicName);
    }
    return [...byId.entries()].map(([id, name]) => ({ id, name }));
  }, [analysis, studentData]);

  const alerts = asArray<FacultyNotification>(notifications).filter((n) => n.type === 'learning_gap');
  const distributionData = asArray<ClassSummary['distribution'][number]>(summary?.distribution).map((band) => ({
    name: band.label,
    students: band.count,
  }));
  const bandColors = ['#8b2c35', '#b0575f', '#B69A69', '#34483A'];

  return (
    <div className="space-y-5">
      {!compact && assignments.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[14px] border border-[#E1D4CA] bg-white p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-[10px] bg-[#EEE3E0] text-[#542536] flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#79666A]">Assigned subject + section</p>
              <div className="relative inline-flex items-center gap-1 cursor-pointer">
                <select
                  value={assignmentKey(selected || ({ subjectId: '', sectionId: '' } as FacultyAssignment))}
                  onChange={(event) => setSelectedKey(event.target.value)}
                  className="appearance-none bg-transparent pr-5 text-sm font-semibold text-[#302A2B] outline-none cursor-pointer max-w-full"
                >
                  {assignments.map((assignment) => (
                    <option key={assignmentKey(assignment)} value={assignmentKey(assignment)}>
                      Sem {assignment.semester} · Section {assignment.sectionName} · {assignment.subjectName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#79666A]" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#79666A] font-medium">
            <span>{summary?.totalStudents ?? 0} students</span>
            <span>·</span>
            <span>Threshold {summary?.thresholdPercent ?? 50}%</span>
          </div>
        </div>
      )}

      {compact && assignments.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <select
            value={assignmentKey(selected || ({ subjectId: '', sectionId: '' } as FacultyAssignment))}
            onChange={(event) => setSelectedKey(event.target.value)}
            className="rounded-[10px] border border-[#E1D4CA] bg-white px-3 py-2 text-sm text-[#302A2B] font-semibold max-w-full"
          >
            {assignments.map((assignment) => (
              <option key={assignmentKey(assignment)} value={assignmentKey(assignment)}>
                Sem {assignment.semester} · Section {assignment.sectionName} · {assignment.subjectName}
              </option>
            ))}
          </select>
          <div className="flex gap-2 flex-wrap">
            {([
              ['overview', 'Class Overview', <BarChart3 key="o" className="w-3.5 h-3.5" />],
              ['students', 'Students', <Users key="s" className="w-3.5 h-3.5" />],
              ['alerts', `Alerts${unreadCount ? ` (${unreadCount})` : ''}`, <Bell key="a" className="w-3.5 h-3.5" />],
            ] as const).map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-bold border transition-colors ${
                  tab === key
                    ? 'bg-[#542536] text-white border-[#542536]'
                    : 'bg-white text-[#79666A] border-[#E1D4CA] hover:border-[#542536]'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          {([
            ['overview', 'Class Overview', <BarChart3 key="o" className="w-4 h-4" />],
            ['students', 'Students', <Users key="s" className="w-4 h-4" />],
            ['alerts', `Alerts${unreadCount ? ` (${unreadCount})` : ''}`, <Bell key="a" className="w-4 h-4" />],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-bold border transition-colors ${
                tab === key
                  ? 'bg-[#542536] text-white border-[#542536]'
                  : 'bg-white text-[#79666A] border-[#E1D4CA] hover:border-[#542536]'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading && !summary ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-8 h-8 border-2 border-[#542536] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#79666A] font-medium">Loading assigned subject and section data…</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-[14px] border border-[#E1D4CA] bg-white p-10 text-center">
          <ClipboardList className="w-8 h-8 mx-auto text-[#a08a8e] mb-2" />
          <p className="text-sm font-semibold text-[#302A2B]">No assigned subject-section pairs</p>
          <p className="text-xs text-[#79666A] mt-1">Ask an administrator to assign you to a subject and section.</p>
        </div>
      ) : (
        <>
          {/* Shared filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-semibold text-[#79666A]">
              Module
              <select
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                className="mt-1 w-full rounded-[10px] border border-[#E1D4CA] bg-white px-3 py-2 text-sm text-[#302A2B]"
              >
                <option value="">All modules</option>
                {topicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-[#79666A]">
              From
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 w-full rounded-[10px] border border-[#E1D4CA] bg-white px-3 py-2 text-sm text-[#302A2B]"
              />
            </label>
            <label className="text-xs font-semibold text-[#79666A]">
              To
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 w-full rounded-[10px] border border-[#E1D4CA] bg-white px-3 py-2 text-sm text-[#302A2B]"
              />
            </label>
          </div>

          {summary && !summary.hasData && (
            <div className="rounded-[14px] border border-[#E1D4CA] bg-white p-6 text-center">
              <BookOpen className="w-7 h-7 mx-auto text-[#a08a8e] mb-2" />
              <p className="text-sm font-semibold text-[#302A2B]">No data yet</p>
              <p className="text-xs text-[#79666A] mt-1">
                No submitted assessments for this subject and section in the selected period yet.
              </p>
            </div>
          )}

          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  ['Total students', summary?.totalStudents ?? 0, 'text-[#302A2B]'],
                  ['Class average', `${summary?.classAverage ?? 0}%`, 'text-[#34483A]'],
                  ['Pass ≥50%', `${summary?.passPercent ?? 0}%`, 'text-[#34483A]'],
                  ['Below threshold', summary?.belowThresholdCount ?? 0, 'text-[#8b2c35]'],
                ].map(([label, value, color]) => (
                  <div key={String(label)} className="card p-4">
                    <p className="text-xs text-[#79666A] font-semibold">{label}</p>
                    <p className={`text-2xl font-serif font-bold mt-1 ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {!summary?.hasData ? (
                <div className="rounded-[14px] border border-[#E1D4CA] bg-white p-10 text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-[#a08a8e] mb-2" />
                  <p className="text-sm font-semibold text-[#302A2B]">No data yet</p>
                  <p className="text-xs text-[#79666A] mt-1">Results will appear here after students submit assessments.</p>
                </div>
              ) : (
                <>
                  <div className="grid lg:grid-cols-2 gap-5">
                    <Card>
                      <CardHeader title="Score distribution" subtitle="Chart buckets only — classification uses 50% / 75%" />
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distributionData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                              {distributionData.map((entry, index) => (
                                <Cell key={entry.name} fill={bandColors[index]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                    <Card>
                      <CardHeader title="Assessment trend" subtitle="Average submitted score by assessment date" />
                      {(summary?.trend || []).length === 0 ? (
                        <p className="text-xs text-[#79666A] py-16 text-center">No assessment dates available yet.</p>
                      ) : (
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summary.trend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                              <Tooltip />
                              <Line type="monotone" dataKey="averageScore" stroke="#34483A" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </Card>
                  </div>

                  <Card padding="none">
                    <CardHeader
                      title="Topic-wise class performance"
                      subtitle="Weakest first · top three highlighted"
                      className="p-5 pb-0"
                    />
                    <div className="overflow-x-auto">
                      <table className="data-table w-full">
                        <thead>
                          <tr>
                            <th>Module / Topic</th>
                            <th>Average mastery</th>
                            <th>Weak students</th>
                            <th>Flag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {asArray<TopicAnalysisRow>(analysis?.topics).map((topic) => {
                            const highlighted = asArray<string>(analysis?.highlightedTopicIds).includes(topic.topicId);
                            return (
                              <tr key={topic.topicId}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-[#302A2B]">{topic.topicName}</span>
                                    {topic.moduleNo ? <Badge color="gray">M{topic.moduleNo}</Badge> : null}
                                  </div>
                                </td>
                                <td>
                                  <span className={topic.averageScore < 50 ? 'text-[#8b2c35] font-bold' : 'font-semibold'}>
                                    {topic.averageScore}%
                                  </span>
                                </td>
                                <td>{topic.pctWeak}%</td>
                                <td>
                                  {highlighted ? (
                                    <Badge color="red">Top 3 weakest</Badge>
                                  ) : topic.reteachRecommended ? (
                                    <Badge color="amber">Re-teach</Badge>
                                  ) : (
                                    <Badge color="gray">—</Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {asArray<TopicAnalysisRow>(analysis?.topics).length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 text-[#79666A]">No topic data yet.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card padding="none">
                    <CardHeader
                      title="Skill gap heatmap"
                      subtitle="Students × topics · darker red means lower mastery"
                      className="p-5 pb-0"
                    />
                    <div className="overflow-x-auto">
                      <table className="data-table w-full text-xs">
                        <thead>
                          <tr>
                            <th>Student</th>
                            {asArray<StudentListResponse['topics'][number]>(studentData?.topics).slice(0, 12).map((topic) => (
                              <th key={topic.topicId} title={topic.topicName} className="min-w-[90px]">
                                {topic.topicName.length > 16 ? `${topic.topicName.slice(0, 15)}…` : topic.topicName}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {asArray<SkillGapStudent>(studentData?.students).map((student) => (
                            <tr key={student.studentId}>
                              <td className="whitespace-nowrap font-semibold">{student.rollNo}</td>
                              {asArray<StudentListResponse['topics'][number]>(studentData?.topics).slice(0, 12).map((topic) => {
                                const score = student.topicScores.find((t) => t.topicId === topic.topicId)?.score ?? null;
                                return (
                                  <td key={topic.topicId} className="text-center" style={{ background: heatColor(score) }}>
                                    {score === null ? '—' : `${score}%`}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          {asArray<SkillGapStudent>(studentData?.students).length === 0 && (
                            <tr><td colSpan={13} className="text-center py-8 text-[#79666A]">No students or topics yet — the heatmap fills in after assessments are submitted.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {tab === 'students' && (
            <div className="space-y-4">
              <Card>
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#79666A]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name or roll number"
                      className="w-full rounded-[10px] border border-[#E1D4CA] bg-white pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="rounded-[10px] border border-[#E1D4CA] bg-white px-3 py-2 text-sm"
                  >
                    <option value="overallScore">Sort: overall score</option>
                    <option value="name">Sort: name</option>
                    <option value="rollNo">Sort: roll number</option>
                    <option value="weakTopicCount">Sort: weak topics</option>
                    <option value="lastActivity">Sort: last activity</option>
                  </select>
                  <select
                    value={sortDir}
                    onChange={(event) => setSortDir(event.target.value as 'asc' | 'desc')}
                    className="rounded-[10px] border border-[#E1D4CA] bg-white px-3 py-2 text-sm"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {([
                    ['', 'All students'],
                    ['below-threshold', 'Below threshold'],
                    ['weak-topic', 'Weak in module'],
                    ['no-attempts', 'No attempts'],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setQuickFilter(value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        quickFilter === value
                          ? 'bg-[#542536] text-white border-[#542536]'
                          : 'bg-white text-[#79666A] border-[#E1D4CA]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Card>

              <Card padding="none">
                <CardHeader
                  title={`Students · ${studentData?.total ?? 0}`}
                  subtitle="Click a student to open the same report they see, in read-only mode"
                  className="p-5 pb-0"
                />
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll no</th>
                        <th>Section</th>
                        <th>Overall</th>
                        <th>Weak topics</th>
                        <th>Status</th>
                        <th>Last activity</th>
                        <th>Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asArray<SkillGapStudent>(studentData?.students).map((student) => {
                        const badge = statusBadge[student.status];
                        return (
                          <tr key={student.studentId}>
                            <td className="font-semibold">{student.name}</td>
                            <td>{student.rollNo}</td>
                            <td>{student.sectionName || selected?.sectionName || '—'}</td>
                            <td>{student.overallScore === null ? '—' : `${student.overallScore}%`}</td>
                            <td>{student.weakTopicCount}</td>
                            <td><Badge color={badge.color}>{badge.label}</Badge></td>
                            <td className="whitespace-nowrap">{formatDate(student.lastActivity)}</td>
                            <td>
                              <Button variant="ghost" size="sm" onClick={() => void openStudentReport(student)}>
                                View report
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {asArray<SkillGapStudent>(studentData?.students).length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-10 text-[#79666A]">
                            {studentData?.total === 0
                              ? 'No students in this section yet.'
                              : 'No students match these filters.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {tab === 'alerts' && (
            <div className="grid lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-1">
                <CardHeader title="Below threshold students" subtitle="Current assigned section" />
                <p className="text-4xl font-serif font-bold text-[#8b2c35]">{summary?.belowThresholdCount ?? 0}</p>
                <p className="text-xs text-[#79666A] mt-1">
                  {summary?.assessedStudents ?? 0} students assessed · threshold {summary?.thresholdPercent ?? 50}%
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setTab('students');
                    setQuickFilter('below-threshold');
                  }}
                >
                  Review students
                </Button>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader
                  title="Skill gap notifications"
                  subtitle={`${unreadCount} unread · grouped per subject-section`}
                  action={<Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => void loadNotifications()}>Refresh</Button>}
                />
                {alerts.length === 0 ? (
                  <p className="text-sm text-[#79666A] py-10 text-center">No below-threshold alerts yet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {alerts.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-xl border p-3 ${notification.isRead ? 'border-[#E1D4CA] bg-white' : 'border-[#C58D98] bg-[#FAF0F2]'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#302A2B]">{notification.title}</p>
                            <p className="text-xs text-[#79666A] mt-0.5">{formatDate(notification.createdAt)}</p>
                          </div>
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm" onClick={() => void markRead(notification)}>
                              Mark read
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-[#4a4243] mt-2 whitespace-pre-line">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[#F7F1E8] rounded-[16px] w-full max-w-5xl max-h-[92vh] overflow-y-auto p-5 relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#302A2B]">
                  {selectedStudent.name} · {selectedStudent.rollNo}
                </h3>
                <p className="text-xs text-[#79666A] mt-0.5">
                  {selected?.subjectName} · Section {selected?.sectionName} · Read-only student report
                </p>
              </div>
              <button
                onClick={() => { setSelectedStudent(null); setStudentReport(null); }}
                className="p-2 rounded-lg hover:bg-white transition-colors"
                aria-label="Close report"
              >
                <X className="w-5 h-5 text-[#79666A]" />
              </button>
            </div>
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#542536] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-[#79666A]">Opening student report…</p>
              </div>
            ) : (
              <StudentSkillGapReport
                topics={asArray<StudentReport['topics'][number]>(studentReport?.topics)}
                recommendations={asArray<StudentReport['recommendations'][number]>(studentReport?.recommendations)}
                readOnly
              />
            )}
            <div className="flex items-center gap-1.5 mt-4 text-xs text-[#79666A]">
              <Lock className="w-3.5 h-3.5" /> This view is read-only and uses the student's own report data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
