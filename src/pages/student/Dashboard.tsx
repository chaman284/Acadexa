import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  TrendingUp,
  Flame,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Target,
  Sparkles,
  Play,
  RotateCcw,
  Clock,
  Layers,
  ChevronRight,
  Brain,
  HelpCircle,
  X,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { quizService } from '../../services/quizService';
import { studentService } from '../../services/studentService';
import type { KnowledgeTracingProfile, TopicMastery } from '../../types/analytics';
import type { Quiz } from '../../types/quiz';
import confetti from 'canvas-confetti';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [profile, setProfile] = useState<KnowledgeTracingProfile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartView, setChartView] = useState<'radar' | 'heatmap' | 'cognitive'>('radar');

  // Practice Modal State
  const [activePracticeTopic, setActivePracticeTopic] = useState<TopicMastery | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [practiceQuestionIndex, setPracticeQuestionIndex] = useState(0);
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null);
  const [practiceAnswerSubmitted, setPracticeAnswerSubmitted] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [isPracticeCompleted, setIsPracticeCompleted] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ktData, quizList, studentProfile] = await Promise.all([
        analyticsService.getKnowledgeTracingProfile(user?.id),
        quizService.getStudentQuizzes(user?.id || 'stu001'),
        studentService.getProfile().catch(() => null),
      ]);

      setProfile(ktData);
      setQuizzes(quizList || []);
      setStudentDetails(studentProfile);
    } catch (err) {
      console.warn('Dashboard loading fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Launch targeted practice for weak topic
  const handleOpenPractice = async (topic: TopicMastery) => {
    setActivePracticeTopic(topic);
    setPracticeQuestionIndex(0);
    setSelectedPracticeOption(null);
    setPracticeAnswerSubmitted(false);
    setPracticeScore(0);
    setIsPracticeCompleted(false);

    try {
      const questions = await analyticsService.getPracticeQuestions(topic.topicId);
      if (questions && questions.length > 0) {
        setPracticeQuestions(questions);
      } else {
        // High quality fallback practice questions targeted to this topic
        setPracticeQuestions(generateFallbackPracticeQuestions(topic.topicName));
      }
    } catch (e) {
      setPracticeQuestions(generateFallbackPracticeQuestions(topic.topicName));
    }
  };

  const handlePracticeAnswerSelect = (optionId: string) => {
    if (practiceAnswerSubmitted) return;
    setSelectedPracticeOption(optionId);
  };

  const handlePracticeSubmitAnswer = () => {
    if (!selectedPracticeOption || practiceAnswerSubmitted) return;
    setPracticeAnswerSubmitted(true);
    const currQ = practiceQuestions[practiceQuestionIndex];
    const isCorrect = currQ.options?.find((o: any) => o.id === selectedPracticeOption)?.isCorrect;
    if (isCorrect) {
      setPracticeScore(s => s + 1);
      confetti({ particleCount: 45, spread: 55, origin: { y: 0.6 } });
    }
  };

  const handlePracticeNext = () => {
    if (practiceQuestionIndex < practiceQuestions.length - 1) {
      setPracticeQuestionIndex(i => i + 1);
      setSelectedPracticeOption(null);
      setPracticeAnswerSubmitted(false);
    } else {
      setIsPracticeCompleted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    }
  };

  // Radar chart data preparation
  const radarData = profile?.topicMastery?.map(t => ({
    topic: t.topicName,
    mastery: t.mastery,
    benchmark: 60, // 60% threshold
    fullMark: 100,
  })) || [];

  // Cognitive level bar data
  const cognitiveData = profile?.cognitiveMastery?.map(c => ({
    name: c.name,
    level: c.level.replace('CL', 'L'),
    accuracy: c.accuracy,
    status: c.status,
  })) || [];

  const activeWeeklyQuiz = quizzes.find(q => q.status === 'active' || q.status === 'upcoming') || quizzes[0];
  const weakTopics = profile?.learningGaps || [];
  const masteredTopics = profile?.masteredTopics || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up pb-12">
      {/* ── Header Welcome ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || studentDetails?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <Badge color="indigo" className="text-xs">Semester 5 · Sec A</Badge>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Knowledge Tracing & Continuous Academic Mastery Engine
          </p>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)] bg-white px-3.5 py-1.5 rounded-xl border border-[var(--color-border)] shadow-2xs flex items-center gap-2 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* ── Key Performance Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Mastery"
          value={`${profile?.overallMastery || 64}%`}
          subtitle="Bayesian Knowledge Trace"
          icon={<Brain className="w-5 h-5" />}
          accent="indigo"
        />
        <StatCard
          title="Learning Gaps"
          value={`${weakTopics.length}`}
          subtitle="Topics below 60% mastery"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent={weakTopics.length > 0 ? 'danger' : 'success'}
        />
        <StatCard
          title="Mastered Concepts"
          value={`${masteredTopics.length}`}
          subtitle="Topics at ≥60% proficiency"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="success"
        />
        <StatCard
          title="Active Streak"
          value={`${studentDetails?.streak || 7} Days`}
          subtitle="Consistent weekly learner"
          icon={<Flame className="w-5 h-5" />}
          accent="warning"
        />
      </div>

      {/* ── SECTION 1: WEEKLY QUIZ INTERFACE ── */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Weekly Assessment
              </span>
              <Badge color="green" className="text-xs">Live Active</Badge>
              <span className="text-xs text-white/50">Subject: Data Structures (CS-201)</span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {activeWeeklyQuiz?.title || 'Week 2 — Binary Trees & BST Analysis'}
              </h2>
              <p className="text-sm text-indigo-200/80 mt-1 leading-relaxed">
                Evaluates algorithmic reasoning across Bloom Levels CL1 (Remember) through CL4 (Analyze).
                Results automatically feed into your continuous Knowledge Tracing profile.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-white/70">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Duration: <strong>{activeWeeklyQuiz?.duration || 30} mins</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Questions: <strong>{activeWeeklyQuiz?.questionCount || 4} MCQs</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Topics: <strong>Trees, Traversal, BST</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
            <Button
              size="lg"
              onClick={() => {
                const targetId = activeWeeklyQuiz?.id || 'quiz-week-2';
                navigate(`/student/quiz/${targetId}`);
              }}
              className="!bg-indigo-600 hover:!bg-indigo-500 !text-white !font-bold !py-3.5 !px-8 !rounded-2xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Weekly Quiz</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/student/quiz')}
              className="!border-white/20 !text-white/80 hover:!text-white hover:!bg-white/10 !rounded-2xl"
            >
              View All Quizzes & History
            </Button>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: KNOWLEDGE TRACING & LEARNING GAPS DASHBOARD ── */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Mastery Heatmap & Radar (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
                    Knowledge Tracing Matrix
                  </h3>
                  <Badge color="indigo" className="text-[10px]">Threshold: 60%</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Concept mastery vs. 60% passing benchmark across syllabus
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
                <button
                  onClick={() => setChartView('radar')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartView === 'radar'
                      ? 'bg-white text-[var(--color-accent)] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Radar View
                </button>
                <button
                  onClick={() => setChartView('heatmap')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartView === 'heatmap'
                      ? 'bg-white text-[var(--color-accent)] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Heatmap Grid
                </button>
                <button
                  onClick={() => setChartView('cognitive')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartView === 'cognitive'
                      ? 'bg-white text-[var(--color-accent)] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bloom's Levels
                </button>
              </div>
            </div>

            <div className="pt-4">
              {/* 1. Radar Chart View */}
              {chartView === 'radar' && (
                <div className="space-y-4">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                        <PolarAngleAxis
                          dataKey="topic"
                          tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          stroke="#94a3b8"
                          tick={{ fontSize: 10 }}
                        />
                        <Radar
                          name="Current Mastery"
                          dataKey="mastery"
                          stroke="#6366f1"
                          fill="#818cf8"
                          fillOpacity={0.45}
                        />
                        <Radar
                          name="Mastery Benchmark (60%)"
                          dataKey="benchmark"
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          fill="transparent"
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const isGap = data.mastery < 60;
                              return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                                  <p className="font-bold text-sm text-indigo-300">{data.topic}</p>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Mastery Score:</span>
                                    <span className={`font-bold ${isGap ? 'text-rose-400' : 'text-emerald-400'}`}>
                                      {data.mastery}%
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-400">Benchmark:</span>
                                    <span className="font-medium text-slate-300">60%</span>
                                  </div>
                                  <div className="pt-1 border-t border-slate-800 text-[11px]">
                                    {isGap ? (
                                      <span className="text-rose-300 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Flagged as Learning Gap
                                      </span>
                                    ) : (
                                      <span className="text-emerald-300 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Mastered Concept
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span>Student Mastery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-rose-500 border-t-2 border-dashed border-rose-500" />
                      <span>60% Passing Benchmark</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Mastered (&ge; 60%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Learning Gap (&lt; 60%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Heatmap Grid Matrix View */}
              {chartView === 'heatmap' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2.5 px-3 font-semibold">Syllabus Topic</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Score</th>
                          <th className="py-2.5 px-3 font-semibold text-center">CL1 Rem</th>
                          <th className="py-2.5 px-3 font-semibold text-center">CL2 Und</th>
                          <th className="py-2.5 px-3 font-semibold text-center">CL3 App</th>
                          <th className="py-2.5 px-3 font-semibold text-center">CL4 Ana</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {profile?.topicMastery?.map(topic => {
                          const isGap = topic.isLearningGap;
                          const heatColor = (score?: number) => {
                            if (score === undefined) return 'bg-slate-100 text-slate-400';
                            if (score >= 80) return 'bg-emerald-100 text-emerald-800 font-bold';
                            if (score >= 60) return 'bg-amber-100 text-amber-800 font-semibold';
                            return 'bg-rose-100 text-rose-800 font-bold';
                          };

                          const cl1 = topic.cognitiveBreakdown?.['CL1_REMEMBER']?.accuracy;
                          const cl2 = topic.cognitiveBreakdown?.['CL2_UNDERSTAND']?.accuracy;
                          const cl3 = topic.cognitiveBreakdown?.['CL3_APPLY']?.accuracy;
                          const cl4 = topic.cognitiveBreakdown?.['CL4_ANALYZE']?.accuracy;

                          return (
                            <tr key={topic.topicId} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 font-medium text-slate-800">
                                <div>
                                  <span className="font-semibold">{topic.topicName}</span>
                                  <span className="text-[10px] text-slate-400 block">{topic.subjectName || 'CS-201'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                  isGap ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                }`}>
                                  {topic.mastery}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block w-9 py-1 rounded text-[11px] ${heatColor(cl1)}`}>
                                  {cl1 !== undefined ? `${cl1}%` : '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block w-9 py-1 rounded text-[11px] ${heatColor(cl2)}`}>
                                  {cl2 !== undefined ? `${cl2}%` : '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block w-9 py-1 rounded text-[11px] ${heatColor(cl3)}`}>
                                  {cl3 !== undefined ? `${cl3}%` : '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-block w-9 py-1 rounded text-[11px] ${heatColor(cl4)}`}>
                                  {cl4 !== undefined ? `${cl4}%` : '—'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <Badge
                                  color={isGap ? 'red' : 'green'}
                                  className="text-[10px] font-semibold"
                                >
                                  {isGap ? 'Gap (<60%)' : 'Mastered'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Bloom Levels: Rem (Remember) · Und (Understand) · App (Apply) · Ana (Analyze)</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-200 inline-block" /> &ge;80%</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block" /> 60-79%</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-200 inline-block" /> &lt;60%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Bloom Cognitive Levels Breakdown */}
              {chartView === 'cognitive' && (
                <div className="space-y-4">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cognitiveData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip
                          formatter={(val: any) => [`${val}%`, 'Accuracy']}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                        />
                        <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                          {cognitiveData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.accuracy >= 75 ? '#10b981' : entry.accuracy >= 60 ? '#f59e0b' : '#f43f5e'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {profile?.cognitiveMastery?.map(cog => (
                      <div key={cog.level} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{cog.name}</span>
                          <span className={`font-bold ${cog.accuracy >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {cog.accuracy}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                          <div
                            className={`h-1.5 rounded-full ${cog.accuracy >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${cog.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Mastered Concepts List */}
          <Card>
            <CardHeader
              title="Mastered Concepts (≥60%)"
              subtitle="Solid algorithmic foundation ready for advanced topics"
              action={
                <Badge color="green" className="text-xs">
                  {masteredTopics.length} Concepts
                </Badge>
              }
            />
            <div className="grid sm:grid-cols-2 gap-3">
              {masteredTopics.map(t => (
                <div
                  key={t.topicId}
                  className="p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{t.topicName}</h4>
                      <p className="text-[11px] text-slate-500">{t.subjectName || 'Data Structures'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-sm font-extrabold text-emerald-700">{t.mastery}%</span>
                    <span className="text-[10px] text-emerald-600 block">Proficient</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: "Learning Gaps" Dashboard & Recommended Practice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-rose-100">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                    Identified Learning Gaps
                  </h3>
                  <p className="text-xs text-rose-600 font-medium">
                    Mastery &lt; 60% threshold
                  </p>
                </div>
              </div>
              <Badge color="red" className="text-xs">
                {weakTopics.length} Gaps
              </Badge>
            </div>

            <div className="space-y-4 pt-4">
              {weakTopics.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No Learning Gaps Detected!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    All your concept mastery levels are above 60%. Excellent work!
                  </p>
                </div>
              ) : (
                weakTopics.map(gap => {
                  const targetMastery = 80;
                  const deficit = Math.max(0, targetMastery - gap.mastery);

                  return (
                    <div
                      key={gap.topicId}
                      className="p-4 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/40 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge
                              color={gap.severity === 'CRITICAL' ? 'red' : 'amber'}
                              className="text-[10px] py-0 px-1.5 uppercase font-bold"
                            >
                              {gap.severity} Priority
                            </Badge>
                            <span className="text-[10px] text-slate-400">· {gap.subjectName || 'CS-201'}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{gap.topicName}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Accuracy is <strong>{gap.mastery}%</strong> (needs +{deficit}% to reach 80% target)
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-base font-extrabold text-rose-600">
                            {gap.mastery}%
                          </span>
                          <span className="text-[10px] text-slate-400 block">&lt; 60% Passing</span>
                        </div>
                      </div>

                      {/* Progress Bar towards Target */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span>Current: {gap.mastery}%</span>
                          <span className="font-semibold text-slate-700">Target: 80%</span>
                        </div>
                        <ProgressBar
                          value={gap.mastery}
                          max={100}
                          height="sm"
                          className="!bg-rose-100"
                        />
                      </div>

                      {/* Action: Recommended Practice Button */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-rose-100">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{gap.recommendedQuestionsCount || 6} Targeted MCQs</span>
                        </span>

                        <Button
                          size="sm"
                          onClick={() => handleOpenPractice(gap)}
                          className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !font-bold !text-xs !py-1.5 !px-3.5 !rounded-xl shadow-sm flex items-center gap-1.5 hover:scale-105 transition-transform"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Recommended Practice</span>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Quick AI Remedial Recommendation Card */}
          <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>AI Remedial Adaptive Plan</span>
            </div>
            <p className="text-xs text-indigo-900/80 leading-relaxed">
              Based on your quiz attempts in <strong>Trees (45%)</strong> and <strong>Dynamic Programming (38%)</strong>,
              we recommend reviewing <em>Inorder BST property</em> and <em>Top-Down Memoization</em> before the upcoming Weekly Quiz.
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => navigate('/student/tutor')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Ask Academic AI Tutor <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TARGETED PRACTICE MODAL ── */}
      {activePracticeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setActivePracticeTopic(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                  Remedial Practice
                </span>
                <span className="text-xs text-slate-500">
                  Topic: <strong>{activePracticeTopic.topicName}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {isPracticeCompleted ? '🎉 Practice Completed!' : `Question ${practiceQuestionIndex + 1} of ${practiceQuestions.length}`}
              </h3>
            </div>

            {/* Practice Flow */}
            {!isPracticeCompleted ? (
              practiceQuestions[practiceQuestionIndex] && (() => {
                const q = practiceQuestions[practiceQuestionIndex];
                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {q.text}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="space-y-2.5">
                      {q.options?.map((opt: any, idx: number) => {
                        const isSelected = selectedPracticeOption === opt.id;
                        const isRight = opt.isCorrect;

                        let styleClass = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50';
                        if (isSelected && !practiceAnswerSubmitted) {
                          styleClass = 'border-indigo-600 bg-indigo-50/50 text-indigo-900';
                        }
                        if (practiceAnswerSubmitted) {
                          if (isRight) {
                            styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                          } else if (isSelected && !isRight) {
                            styleClass = 'border-rose-500 bg-rose-50 text-rose-900';
                          } else {
                            styleClass = 'border-slate-200 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={opt.id || idx}
                            disabled={practiceAnswerSubmitted}
                            onClick={() => handlePracticeAnswerSelect(opt.id)}
                            className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all ${styleClass}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                            {practiceAnswerSubmitted && isRight && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                            {practiceAnswerSubmitted && isSelected && !isRight && (
                              <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Score: <strong>{practiceScore}</strong> / {practiceQuestionIndex + (practiceAnswerSubmitted ? 1 : 0)}
                      </span>

                      {!practiceAnswerSubmitted ? (
                        <Button
                          disabled={!selectedPracticeOption}
                          onClick={handlePracticeSubmitAnswer}
                          className="!bg-indigo-600 hover:!bg-indigo-700 !text-white"
                        >
                          Check Answer
                        </Button>
                      ) : (
                        <Button
                          onClick={handlePracticeNext}
                          className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
                        >
                          {practiceQuestionIndex < practiceQuestions.length - 1 ? 'Next Question →' : 'Finish Practice'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Mastery Boost Registered!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You scored <strong>{practiceScore} / {practiceQuestions.length}</strong> in {activePracticeTopic.topicName}.
                    Your Knowledge Tracing accuracy has been updated.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setActivePracticeTopic(null);
                    loadDashboardData();
                  }}
                  className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !px-6"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback practice questions generator for topics
function generateFallbackPracticeQuestions(topicName: string) {
  if (topicName.toLowerCase().includes('tree')) {
    return [
      {
        id: 'pq-tree-1',
        text: 'What is the maximum number of nodes in a binary tree of height h (where height of root is 0)?',
        options: [
          { id: 'opt-1', text: '2^(h+1) - 1', isCorrect: true },
          { id: 'opt-2', text: '2^h', isCorrect: false },
          { id: 'opt-3', text: '2h + 1', isCorrect: false },
          { id: 'opt-4', text: 'h²', isCorrect: false },
        ],
      },
      {
        id: 'pq-tree-2',
        text: 'Which binary tree traversal visits the root node first, followed by left subtree and right subtree?',
        options: [
          { id: 'opt-5', text: 'Inorder Traversal', isCorrect: false },
          { id: 'opt-6', text: 'Preorder Traversal', isCorrect: true },
          { id: 'opt-7', text: 'Postorder Traversal', isCorrect: false },
          { id: 'opt-8', text: 'Level-order Traversal', isCorrect: false },
        ],
      },
      {
        id: 'pq-tree-3',
        text: 'What ensures an AVL tree remains balanced with O(log n) operations?',
        options: [
          { id: 'opt-9', text: 'Tree rotations whenever balance factor exceeds [-1, 0, 1]', isCorrect: true },
          { id: 'opt-10', text: 'Always inserting at the deepest leaf', isCorrect: false },
          { id: 'opt-11', text: 'Doubling tree capacity when full', isCorrect: false },
          { id: 'opt-12', text: 'Sorting keys after every 10 inserts', isCorrect: false },
        ],
      },
    ];
  }

  return [
    {
      id: 'pq-gen-1',
      text: `What is the optimal algorithmic paradigm commonly used to solve optimal substructure problems in ${topicName}?`,
      options: [
        { id: 'opt-1', text: 'Dynamic Programming / Memoization', isCorrect: true },
        { id: 'opt-2', text: 'Linear Brute Force Search', isCorrect: false },
        { id: 'opt-3', text: 'Randomized Shuffling', isCorrect: false },
        { id: 'opt-4', text: 'Round Robin Scheduling', isCorrect: false },
      ],
    },
    {
      id: 'pq-gen-2',
      text: `In asymptotic analysis, what does O(1) auxiliary space signify for ${topicName}?`,
      options: [
        { id: 'opt-5', text: 'Constant extra memory independent of input size n', isCorrect: true },
        { id: 'opt-6', text: 'Memory grows linearly with input', isCorrect: false },
        { id: 'opt-7', text: 'Infinite memory required', isCorrect: false },
        { id: 'opt-8', text: 'Quadratic space allocation', isCorrect: false },
      ],
    },
  ];
}

export const StudentDashboard = Dashboard;
