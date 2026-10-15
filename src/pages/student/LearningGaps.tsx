import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { analyticsService } from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import type { KnowledgeTracingProfile, TopicMastery } from '../../types/analytics';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Target,
  BookOpen,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import confetti from 'canvas-confetti';

export const LearningGaps: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<KnowledgeTracingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Practice Modal State
  const [activePracticeTopic, setActivePracticeTopic] = useState<TopicMastery | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getKnowledgeTracingProfile(user?.id);
      setProfile(data);
    } catch (e) {
      console.warn('Failed to load knowledge profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPractice = async (topic: TopicMastery) => {
    setActivePracticeTopic(topic);
    setPracticeIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);

    try {
      const qs = await analyticsService.getPracticeQuestions(topic.topicId);
      if (qs && qs.length > 0) {
        setPracticeQuestions(qs);
      } else {
        setPracticeQuestions(getTopicPracticeQuestions(topic.topicName));
      }
    } catch (e) {
      setPracticeQuestions(getTopicPracticeQuestions(topic.topicName));
    }
  };

  const handleSelectOption = (optId: string) => {
    if (isAnswered) return;
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswered) return;
    setIsAnswered(true);
    const curr = practiceQuestions[practiceIndex];
    const isCorrect = curr?.options?.find((o: any) => o.id === selectedOption)?.isCorrect;
    if (isCorrect) {
      setScore(s => s + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleNextQuestion = () => {
    if (practiceIndex < practiceQuestions.length - 1) {
      setPracticeIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
    }
  };

  const strong = profile?.masteredTopics || [];
  const needsPractice = profile?.learningGaps || [];
  const allTopics = profile?.topicMastery || [];

  const radarData = allTopics.map(t => ({
    topic: t.topicName,
    mastery: t.mastery,
    benchmark: 60,
  }));

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      <PageHeader
        title="Knowledge Tracing & Learning Gaps"
        subtitle="Real-time Bayesian knowledge tracing across concepts and Bloom cognitive levels"
        breadcrumbs={[{ label: 'Dashboard' }, { label: 'Learning Gaps' }]}
      />

      {/* Summary KPI cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-[var(--color-success)] bg-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Mastered Concepts</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-success)]">{strong.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">≥60% Passing benchmark</p>
        </div>

        <div className="card p-4 border-l-4 border-l-[var(--color-danger)] bg-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Learning Gaps</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-danger)]">{needsPractice.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">&lt;60% Needs targeted practice</p>
        </div>

        <div className="card p-4 border-l-4 border-l-indigo-500 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Overall Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">{profile?.overallMastery || 64}%</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Across all syllabus assessments</p>
        </div>
      </div>

      {/* Radar Chart Visualizer */}
      <Card>
        <CardHeader
          title="Concept Mastery Radar"
          subtitle="Continuous assessment vs 60% mastery threshold"
          action={<Badge color="indigo">Threshold: 60%</Badge>}
        />
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="topic" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Radar name="Mastery" dataKey="mastery" stroke="#6366f1" fill="#818cf8" fillOpacity={0.4} />
              <Radar name="60% Benchmark" dataKey="benchmark" stroke="#ef4444" strokeDasharray="4 4" fill="transparent" />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" /> Student Mastery</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-rose-500 border-t border-dashed" /> 60% Benchmark</span>
        </div>
      </Card>

      {/* Main Grid: Topic Masteries & Actionable Learning Gaps */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: All Topics with Cognitive Level Breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Syllabus Concept Accuracy"
              subtitle="Breakdown of individual concept performance"
              action={<span className="text-xs text-slate-500">{allTopics.length} Topics</span>}
            />
            <div className="space-y-4">
              {allTopics.map(topic => (
                <div key={topic.topicId} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-800">{topic.topicName}</span>
                      <span className="text-xs text-slate-400 block">{topic.subjectName || 'CS-201'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={topic.isLearningGap ? 'red' : 'green'} className="text-[10px]">
                        {topic.isLearningGap ? 'Gap (<60%)' : 'Mastered'}
                      </Badge>
                      <span className="text-sm font-bold text-slate-900">{topic.mastery}%</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={topic.mastery}
                    height="xs"
                    className={topic.isLearningGap ? '!bg-rose-100' : '!bg-emerald-100'}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Weak Topics with "Recommended Practice" */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Flagged Learning Gaps & Remedial Action</span>
            </h2>
          </div>

          {needsPractice.map(gap => (
            <div key={gap.topicId} className="card p-4 border border-rose-200 bg-white shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge color={gap.severity === 'CRITICAL' ? 'red' : 'amber'} className="text-[10px] uppercase font-bold">
                      {gap.severity}
                    </Badge>
                    <span className="text-xs text-slate-400">· {gap.subjectName || 'Data Structures'}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{gap.topicName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Current accuracy <strong>{gap.mastery}%</strong> drops below 60% threshold.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-rose-600">{gap.mastery}%</span>
                  <span className="text-[10px] text-slate-400 block">Passing: 60%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ProgressBar value={gap.mastery} max={100} height="xs" className="flex-1 !bg-rose-100" />
                <Target className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold">80% Target</span>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-indigo-500" />
                  {gap.recommendedQuestionsCount || 6} Targeted MCQs
                </span>
                <Button
                  size="sm"
                  onClick={() => handleOpenPractice(gap)}
                  className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !font-bold !text-xs !py-1 !px-3 !rounded-xl flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Recommended Practice</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Modal */}
      {activePracticeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setActivePracticeTopic(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                Remedial Practice
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {isFinished ? '🎉 Practice Completed!' : `Practicing: ${activePracticeTopic.topicName}`}
              </h3>
            </div>

            {!isFinished ? (
              practiceQuestions[practiceIndex] && (() => {
                const q = practiceQuestions[practiceIndex];
                return (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">{q.text}</p>
                    </div>

                    <div className="space-y-2">
                      {q.options?.map((opt: any, idx: number) => {
                        const isSel = selectedOption === opt.id;
                        const isRight = opt.isCorrect;
                        let cls = 'border-slate-200 hover:border-indigo-300';
                        if (isSel && !isAnswered) cls = 'border-indigo-600 bg-indigo-50/50';
                        if (isAnswered) {
                          if (isRight) cls = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                          else if (isSel && !isRight) cls = 'border-rose-500 bg-rose-50 text-rose-900';
                          else cls = 'border-slate-200 opacity-60';
                        }

                        return (
                          <button
                            key={opt.id || idx}
                            disabled={isAnswered}
                            onClick={() => handleSelectOption(opt.id)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${cls}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                            {isAnswered && isRight && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-500">
                        Score: <strong>{score}</strong> / {practiceIndex + (isAnswered ? 1 : 0)}
                      </span>
                      {!isAnswered ? (
                        <Button disabled={!selectedOption} onClick={handleSubmitAnswer} className="!bg-indigo-600 !text-white">
                          Submit Answer
                        </Button>
                      ) : (
                        <Button onClick={handleNextQuestion} className="!bg-emerald-600 !text-white">
                          {practiceIndex < practiceQuestions.length - 1 ? 'Next Question →' : 'Finish'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900">Great Job!</h4>
                <p className="text-xs text-slate-500">
                  You completed practice on {activePracticeTopic.topicName} with score {score}/{practiceQuestions.length}.
                </p>
                <Button onClick={() => { setActivePracticeTopic(null); loadData(); }} className="!bg-indigo-600 !text-white">
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function getTopicPracticeQuestions(topicName: string) {
  return [
    {
      id: 'q-prac-1',
      text: `Which core principle is fundamental to solving problems in ${topicName}?`,
      options: [
        { id: 'p1', text: 'Optimal subproblem decomposition and invariant preservation', isCorrect: true },
        { id: 'p2', text: 'Linear sequential iteration without state tracking', isCorrect: false },
        { id: 'p3', text: 'Unbounded memory allocation', isCorrect: false },
      ],
    },
    {
      id: 'q-prac-2',
      text: `What is the expected asymptotic runtime complexity of balanced operations in ${topicName}?`,
      options: [
        { id: 'p4', text: 'O(log n)', isCorrect: true },
        { id: 'p5', text: 'O(n²)', isCorrect: false },
        { id: 'p6', text: 'O(2ⁿ)', isCorrect: false },
      ],
    },
  ];
}
