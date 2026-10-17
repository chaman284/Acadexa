import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  Flame,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  FileCheck,
  BrainCircuit,
  GraduationCap,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { analyticsService } from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';

interface TopicGap {
  topicId: string;
  topicName: string;
  subjectName: string;
  averageMastery: number;
  failureRate: number;
  totalAttempts: number;
  correctCount: number;
  studentsAttempted: number;
  studentsFailing: number;
  totalEnrolled: number;
  isLearningGap: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MASTERED';
  cognitiveBreakdown?: Record<string, { total: number; correct: number; accuracy: number }>;
  recommendedRemedialCount?: number;
}

interface ClassGapsData {
  sectionId: string;
  sectionName: string;
  subjectName: string;
  totalStudents: number;
  overallMastery: number;
  criticalGapsCount: number;
  topics: TopicGap[];
  weakestTopics: TopicGap[];
}

const AVAILABLE_SECTIONS = [
  { id: 'section-5a', name: '5th Sem - Section A', subject: 'Data Structures & Algorithms', count: 48 },
  { id: 'section-5b', name: '5th Sem - Section B', subject: 'Data Structures & Algorithms', count: 45 },
  { id: 'section-7c', name: '7th Sem - Section C', subject: 'Cloud Computing & DevOps', count: 42 },
  { id: 'section-3a', name: '3rd Sem - Section A', subject: 'Database Management Systems', count: 50 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedSection, setSelectedSection] = useState('section-5a');
  const [data, setData] = useState<ClassGapsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'GAPS_ONLY'>('ALL');

  // Remedial Quiz Modal State
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  const [targetTopicIds, setTargetTopicIds] = useState<string[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDuration, setQuizDuration] = useState(20);
  const [questionCount, setQuestionCount] = useState(5);
  const [isAssigning, setIsAssigning] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const loadData = async (secId: string) => {
    setLoading(true);
    try {
      const res = await analyticsService.getClassLearningGaps(secId);
      setData(res);
      // Pre-select weak topics for remedial modal
      const weakIds = res.weakestTopics?.map((t: TopicGap) => t.topicId) || [];
      setTargetTopicIds(weakIds);
      setQuizTitle(`Remedial Quiz: ${res.sectionName || 'Class'} Weak Topics`);
    } catch (err) {
      console.error('Failed to load class learning gaps', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSection);
  }, [selectedSection]);

  const handleOpenRemedialModal = (specificTopicId?: string) => {
    if (specificTopicId) {
      setTargetTopicIds([specificTopicId]);
      const topicObj = data?.topics.find(t => t.topicId === specificTopicId);
      setQuizTitle(`Remedial Drill: ${topicObj?.topicName || 'Target Topic'}`);
    } else {
      const weakIds = data?.weakestTopics?.map(t => t.topicId) || [];
      setTargetTopicIds(weakIds);
      setQuizTitle(`Class Remedial Quiz: Section ${data?.sectionName || '5A'}`);
    }
    setSuccessResult(null);
    setIsRemedialModalOpen(true);
  };

  const handleAssignRemedialQuiz = async () => {
    if (targetTopicIds.length === 0) return;
    setIsAssigning(true);
    try {
      const res = await analyticsService.generateRemedialQuiz({
        sectionId: selectedSection,
        topicIds: targetTopicIds,
        title: quizTitle,
        duration: quizDuration,
        questionCount,
      });

      setSuccessResult(res);
    } catch (err) {
      console.error('Error assigning remedial quiz', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleTopicSelection = (id: string) => {
    setTargetTopicIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const displayedTopics = data?.topics.filter(t => {
    if (filterSeverity === 'GAPS_ONLY') {
      return t.isLearningGap || t.averageMastery < 60;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in-up pb-12 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <PageHeader
        title="Faculty Analytics & Learning Heatmap"
        subtitle={`Real-time knowledge tracing, cohort weak spots, and automated remedial quizzes for ${data?.sectionName || 'Section 5A'}`}
        breadcrumbs={[{ label: 'Faculty' }, { label: 'Class Heatmap & Remedial Quizzes' }]}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(selectedSection)}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              id="btn-generate-remedial-main"
              onClick={() => handleOpenRemedialModal()}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
              className="bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              Generate Remedial Quiz
            </Button>
          </div>
        }
      />

      {/* ── Section & Filter Switcher ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider pl-1 mr-1">
            Section:
          </span>
          {AVAILABLE_SECTIONS.map(sec => {
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-white shadow-xs'
                    : 'bg-[var(--color-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                }`}
              >
                {sec.name}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filterSeverity === 'ALL'
                ? 'bg-[var(--color-border)] text-[var(--color-text-primary)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            All Topics ({data?.topics?.length || 0})
          </button>
          <button
            onClick={() => setFilterSeverity('GAPS_ONLY')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterSeverity === 'GAPS_ONLY'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/30'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Weak Topics &lt;60% ({data?.weakestTopics?.length || 0})
          </button>
        </div>
      </div>

      {/* ── Metric Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 relative overflow-hidden border-indigo-200/50 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Cohort Overall Mastery</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--color-text-primary)]">
                {data?.overallMastery ?? 64}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Target: &gt;75% benchmark</span>
          </div>
        </Card>

        <Card className="p-4 relative overflow-hidden border-rose-200/60 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Class Learning Gaps</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
                {data?.criticalGapsCount ?? 3} Topics
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Accuracy below 60% threshold</span>
          </div>
        </Card>

        <Card className="p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-muted)]">Enrolled In Section</p>
              <h3 className="text-2xl font-bold mt-1 text-[var(--color-text-primary)]">
                {data?.totalStudents ?? 48} Students
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Active knowledge tracing telemetry</span>
          </div>
        </Card>

        <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Remedial Action</p>
              <h3 className="text-lg font-bold mt-1 text-[var(--color-text-primary)]">
                Auto-Quiz Engine
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <button
            onClick={() => handleOpenRemedialModal()}
            className="mt-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            Assign weak topics now <ArrowRight className="w-3 h-3" />
          </button>
        </Card>
      </div>

      {/* ── Class Learning Heatmap (Visual Matrix Grid) ── */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Class Learning Heatmap
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Visualizes topic failure rates across the entire section. Topics with &lt;60% mastery are classified as learning gaps.
            </p>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span className="text-[var(--color-text-muted)] font-medium">Mastery Scale:</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-rose-600 inline-block" />
              <span className="text-rose-600 font-semibold">&lt;45% Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
              <span className="text-amber-600 font-semibold">45–59% High Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-blue-500 inline-block" />
              <span className="text-blue-600 font-semibold">60–74% Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
              <span className="text-emerald-600 font-semibold">≥75% Mastered</span>
            </div>
          </div>
        </div>

        {/* Heatmap Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {displayedTopics.map(topic => {
            const isFailing = topic.averageMastery < 60;
            const isCritical = topic.averageMastery < 45;

            // Palette based on mastery
            const badgeBg = isCritical
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
              : topic.averageMastery < 60
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              : topic.averageMastery < 75
              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';

            const barColor = isCritical
              ? 'bg-gradient-to-r from-rose-600 to-red-500'
              : topic.averageMastery < 60
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : topic.averageMastery < 75
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500';

            return (
              <div
                key={topic.topicId}
                className={`p-4 rounded-2xl border transition-all duration-200 relative flex flex-col justify-between ${
                  isFailing
                    ? 'border-rose-300/70 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/40'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        {topic.subjectName}
                      </span>
                      <h4 className="text-base font-bold text-[var(--color-text-primary)] leading-snug">
                        {topic.topicName}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeBg}`}>
                      {topic.severity}
                    </span>
                  </div>

                  {/* Mastery Percentage and Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--color-text-muted)] font-medium">Cohort Mastery</span>
                      <span
                        className={`text-sm font-extrabold ${
                          isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : isFailing
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {topic.averageMastery}%
                      </span>
                    </div>
                    <div className="w-full bg-[var(--color-border)] rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${topic.averageMastery}%` }}
                      />
                    </div>
                  </div>

                  {/* Failure Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
                    <div>
                      <span className="text-[var(--color-text-muted)] text-[11px] block">Failing Cohort</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        {topic.studentsFailing} of {topic.totalEnrolled} ({topic.failureRate}%)
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)] text-[11px] block">Quiz Attempts</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {topic.totalAttempts} answers
                      </span>
                    </div>
                  </div>

                  {/* Cognitive Breakdown Chips */}
                  {topic.cognitiveBreakdown && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
                        Bloom's Cognitive Bottlenecks
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(topic.cognitiveBreakdown).map(([lvl, info]: [string, any]) => (
                          <span
                            key={lvl}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                              info.accuracy < 50
                                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                : info.accuracy < 70
                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            }`}
                            title={`${lvl}: ${info.accuracy}% accuracy (${info.correct}/${info.total})`}
                          >
                            {lvl.replace('CL', 'L').split('_')[0]}: {info.accuracy}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                  {isFailing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRemedialModal(topic.topicId)}
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-rose-500" />}
                      className="w-full text-xs font-semibold text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Generate Remedial Quiz
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium py-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concept Mastered
                      </span>
                      <button
                        onClick={() => handleOpenRemedialModal(topic.topicId)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-[11px]"
                      >
                        Reinforce
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Cohort Weak Topics & Remedial Action Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Topic Analytics Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                  Topic Mastery & Remedial Readiness
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Curriculum topics mapped with student response accuracy and remedial question availability
                </p>
              </div>
              <Badge color="red">{data?.weakestTopics?.length || 0} Gaps Flagged</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--color-muted)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold border-b border-[var(--color-border)]">
                    <th className="p-3 pl-4">Topic Name</th>
                    <th className="p-3">Avg Mastery</th>
                    <th className="p-3">Failing Students</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data?.topics?.map(t => {
                    const isFailing = t.averageMastery < 60;
                    return (
                      <tr
                        key={t.topicId}
                        className={`hover:bg-[var(--color-muted)]/50 transition-colors ${
                          isFailing ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                        }`}
                      >
                        <td className="p-3 pl-4">
                          <p className="font-semibold text-[var(--color-text-primary)]">{t.topicName}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">{t.subjectName}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-bold ${
                              t.averageMastery < 45
                                ? 'text-rose-600'
                                : t.averageMastery < 60
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {t.averageMastery}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {t.studentsFailing} / {t.totalEnrolled}
                          </span>
                          <span className="text-[var(--color-text-muted)] text-[11px] block">
                            {t.failureRate}% failure rate
                          </span>
                        </td>
                        <td className="p-3">
                          <Badge
                            color={
                              t.severity === 'CRITICAL'
                                ? 'red'
                                : t.severity === 'HIGH'
                                ? 'amber'
                                : t.severity === 'MODERATE'
                                ? 'blue'
                                : 'green'
                            }
                          >
                            {t.severity}
                          </Badge>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenRemedialModal(t.topicId)}
                            className="!text-[var(--color-accent)] hover:!bg-[var(--color-accent)]/10 text-xs"
                          >
                            Remedial Drill
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Remedial Trigger & Tools */}
        <div className="space-y-4">
          <Card className="p-5 bg-gradient-to-br from-[var(--color-surface)] to-rose-50/30 dark:to-rose-950/20 border-rose-200/60 dark:border-rose-900/50">
            <div className="flex items-center gap-2 mb-2 text-rose-600">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                Automated Remedial Generator
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              When class topic mastery falls below 60%, the engine automatically filters the question bank for{' '}
              <strong className="text-[var(--color-text-primary)]">APPROVED</strong> items matching the weak topics and deploys an interactive drill to the entire section.
            </p>

            <div className="my-4 p-3 rounded-xl bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                <span>Identified Weak Topics:</span>
                <span className="font-bold text-rose-600">{data?.weakestTopics?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                <span>Eligible Approved Questions:</span>
                <span className="font-bold text-emerald-600">Available</span>
              </div>
              <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                <span>Target Cohort:</span>
                <span className="font-bold text-[var(--color-text-primary)]">{data?.sectionName || 'Section 5A'}</span>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="sm"
              onClick={() => handleOpenRemedialModal()}
              leftIcon={<Flame className="w-4 h-4 text-amber-300" />}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-md"
            >
              Launch Remedial Assignment
            </Button>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Faculty Tools
            </h4>

            <button
              onClick={() => navigate('/faculty/question-bank')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-muted)] text-left transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
                  <BrainCircuit className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">Question Bank & Gemini</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">AI Item Generation</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>

            <button
              onClick={() => navigate('/faculty/quizzes')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-muted)] text-left transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">Quiz Management</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">Active & Scheduled Quizzes</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>

            <button
              onClick={() => navigate('/faculty/paper-bank')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--color-muted)] text-left transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">Question Paper Bank</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">University Exam Papers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
            </button>
          </Card>
        </div>
      </div>

      {/* ── Generate Remedial Quiz Modal ── */}
      <Modal
        isOpen={isRemedialModalOpen}
        onClose={() => !isAssigning && setIsRemedialModalOpen(false)}
        title="Generate & Assign Remedial Quiz"
        size="lg"
      >
        {successResult ? (
          <div className="space-y-4 py-3 text-center animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                Remedial Quiz Successfully Assigned!
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">
                {successResult.message}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--color-muted)] text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Quiz Title:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{successResult.quiz?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Target Section:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{successResult.quiz?.sectionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Assigned Students:</span>
                <span className="font-semibold text-emerald-600">{successResult.quiz?.assignedStudentsCount} Students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Approved Questions Attached:</span>
                <span className="font-semibold text-indigo-600">{successResult.pulledQuestionsCount} MCQs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Duration:</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{successResult.quiz?.duration} Minutes</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRemedialModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsRemedialModalOpen(false);
                  navigate('/faculty/quizzes');
                }}
              >
                View in Quizzes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Automated Curriculum Remediation</p>
                <p className="mt-0.5 opacity-90">
                  This tool pulls verified <strong>APPROVED</strong> questions from the question bank matching the selected topics and assigns a targeted remedial drill to <strong>{data?.sectionName}</strong>.
                </p>
              </div>
            </div>

            {/* Quiz Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={e => setQuizTitle(e.target.value)}
                placeholder="e.g. Remedial Drill: Trees & Dynamic Programming"
                className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
              />
            </div>

            {/* Select Target Weak Topics */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center justify-between">
                <span>Select Weak Topics to Include</span>
                <span className="text-[var(--color-text-muted)] font-normal normal-case">
                  {targetTopicIds.length} topic(s) selected
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {data?.topics?.map(topic => {
                  const isSelected = targetTopicIds.includes(topic.topicId);
                  const isFailing = topic.averageMastery < 60;
                  return (
                    <button
                      key={topic.topicId}
                      type="button"
                      onClick={() => toggleTopicSelection(topic.topicId)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-xs'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-muted)]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                          {topic.topicName}
                        </p>
                        <p className="text-[11px] text-[var(--color-text-muted)]">
                          Mastery: <span className={isFailing ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>{topic.averageMastery}%</span>
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0 ${
                          isSelected
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'border border-[var(--color-border)]'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration and Question Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Quiz Duration
                </label>
                <select
                  value={quizDuration}
                  onChange={e => setQuizDuration(parseInt(e.target.value, 10))}
                  className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
                >
                  <option value={10}>10 Minutes (Quick Drill)</option>
                  <option value={15}>15 Minutes</option>
                  <option value={20}>20 Minutes (Standard)</option>
                  <option value={30}>30 Minutes (Deep Review)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  Number of APPROVED Questions
                </label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(parseInt(e.target.value, 10))}
                  className="w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm bg-white dark:bg-[var(--color-surface)] outline-none focus:border-[var(--color-accent)] text-[var(--color-text-primary)]"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions (Recommended)</option>
                  <option value={8}>8 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button
                variant="outline"
                disabled={isAssigning}
                onClick={() => setIsRemedialModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={isAssigning || targetTopicIds.length === 0}
                isLoading={isAssigning}
                onClick={handleAssignRemedialQuiz}
                leftIcon={!isAssigning ? <Send className="w-4 h-4 text-amber-300" /> : undefined}
                className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-md"
              >
                {isAssigning ? 'Deploying to Class Section...' : 'Assign Remedial Quiz'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
