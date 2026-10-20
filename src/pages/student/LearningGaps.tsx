import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  analyticsService,
  type StudentTopicSkill,
  type StudentSkillGapRecommendation,
} from '../../services/analyticsService';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Target,
  BookOpen,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const LearningGaps: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<StudentTopicSkill[]>([]);
  const [recommendations, setRecommendations] = useState<StudentSkillGapRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const report = await analyticsService.getStudentSkillGaps();
      setTopics(report.topics);
      setRecommendations(report.recommendations);
      setIsFallback(!!report.isFallback);
    } catch (err) {
      console.error('Failed to load learning gap report:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const strong = topics.filter(t => t.category === 'strong');
  const needsPractice = topics.filter(t => t.category === 'needs-practice');
  const improving = topics.filter(t => t.category === 'improving');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Learning Gaps"
          subtitle="Bayesian telemetry tracking your conceptual mastery & learning gaps"
          breadcrumbs={[{ label: 'Overview' }, { label: 'Learning Gaps' }]}
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
        >
          Recalculate Telemetry
        </Button>
      </div>

      {isFallback && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-800">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            Connected in resilient mode. Complete scheduled weekly quizzes to build your live diagnostic score.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Computing learning gap telemetry from quiz submissions...</p>
        </div>
      ) : topics.length === 0 ? (
        <Card className="p-12 text-center max-w-xl mx-auto my-8 border border-slate-200">
          <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Learning Gaps Recorded Yet</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            You haven't attempted any curriculum quizzes yet. Complete your weekly course assessments to activate Bayesian cognitive telemetry and generate your customized topic diagnosis.
          </p>
          <Button onClick={() => navigate('/student/quiz')} leftIcon={<Sparkles className="w-4 h-4" />}>
            Go to Weekly Quizzes
          </Button>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card p-4 border-l-4 border-l-[var(--color-success)] shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Strong Topics</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-success)]">{strong.length}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">High conceptual mastery (&ge;75%)</p>
            </div>
            <div className="card p-4 border-l-4 border-l-[var(--color-danger)] shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Needs Attention</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-danger)]">{needsPractice.length}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Critical learning gaps requiring remediation</p>
            </div>
            <div className="card p-4 border-l-4 border-l-[var(--color-warning)] shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[var(--color-warning)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">Improving</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-warning)]">{improving.length}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Developing proficiency (50%–74%)</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Topic Performance & Topic Breakdowns */}
            <div className="space-y-6">
              {/* All topics performance */}
              <Card>
                <CardHeader
                  title="Topic Mastery Matrix"
                  subtitle="Bayesian diagnostic score per curriculum topic"
                  action={
                    <span className="text-xs text-[var(--color-text-muted)] font-medium">
                      {topics.length} Topics Assessed
                    </span>
                  }
                />
                <div className="space-y-3.5">
                  {topics.map(topic => (
                    <div key={topic.topicId} className="hover:bg-slate-50/70 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-snug">
                            {topic.topicName}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {topic.subjectName}
                            {topic.answered !== undefined && topic.answered > 0 ? ` · ${topic.answered} questions evaluated` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            color={
                              topic.category === 'strong'
                                ? 'green'
                                : topic.category === 'needs-practice'
                                ? 'red'
                                : 'amber'
                            }
                            className="text-[10px]"
                          >
                            {topic.category === 'strong'
                              ? 'Mastered'
                              : topic.category === 'needs-practice'
                              ? 'Attention'
                              : 'Improving'}
                          </Badge>
                          <span className="text-sm font-bold text-[var(--color-text-primary)]">{topic.score}%</span>
                        </div>
                      </div>
                      <ProgressBar
                        value={topic.score}
                        color={
                          topic.category === 'strong'
                            ? 'green'
                            : topic.category === 'needs-practice'
                            ? 'red'
                            : 'amber'
                        }
                        height="xs"
                      />
                      {topic.answered !== undefined && topic.answered > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mt-1.5 px-0.5">
                          <span>Raw accuracy: <b className="text-slate-700 font-medium">{topic.rawAccuracy ?? topic.score}%</b></span>
                          <span>Diagnostic confidence: <b className="text-slate-700 font-medium">{topic.confidence ?? 75}%</b></span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strong vs Weak breakdown */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader
                    title="Strong Topics"
                    action={<CheckCircle className="w-4 h-4 text-[var(--color-success)]" />}
                  />
                  <div className="space-y-2">
                    {strong.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-muted)] py-3 text-center">No mastered topics yet.</p>
                    ) : (
                      strong.map(t => (
                        <div
                          key={t.topicId}
                          className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0 gap-2"
                        >
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.topicName}</span>
                          <Badge color="green" className="flex-shrink-0">{t.score}%</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card>
                  <CardHeader
                    title="Needs Attention"
                    action={<AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />}
                  />
                  <div className="space-y-2">
                    {needsPractice.length === 0 ? (
                      <p className="text-xs text-[var(--color-text-muted)] py-3 text-center">No critical gaps detected!</p>
                    ) : (
                      needsPractice.map(t => (
                        <div
                          key={t.topicId}
                          className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0 gap-2"
                        >
                          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{t.topicName}</span>
                          <Badge color="red" className="flex-shrink-0">{t.score}%</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column: Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[var(--color-text-primary)]">Targeted Remedial Practice</h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Prioritized by Bayesian error rate & conceptual importance</p>
                </div>
              </div>

              {recommendations.length === 0 ? (
                <div className="card p-8 text-center text-[var(--color-text-muted)] text-sm">
                  Great work! All your evaluated topics are performing above the institutional mastery standard.
                </div>
              ) : (
                recommendations.map(gap => (
                  <div key={gap.topicId} className="card p-4 transition-all hover:shadow-md border border-slate-200/70">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            color={
                              gap.gapSeverity === 'high' ? 'red' : gap.gapSeverity === 'medium' ? 'amber' : 'green'
                            }
                          >
                            {gap.gapSeverity === 'high'
                              ? 'High Priority (Critical Gap)'
                              : gap.gapSeverity === 'medium'
                              ? 'Medium Priority'
                              : 'Low Priority'}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug">{gap.topicName}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{gap.courseName}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[var(--color-text-muted)]">Current Mastery</p>
                        <p className={`font-extrabold text-base ${gap.currentScore < 50 ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>
                          {gap.currentScore}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <ProgressBar
                        value={gap.currentScore}
                        max={100}
                        height="xs"
                        color={gap.gapSeverity === 'high' ? 'red' : 'amber'}
                        className="flex-1"
                      />
                      <Target className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-500 flex-shrink-0">
                        {gap.targetScore}% Target
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border)] mt-2">
                      <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-medium text-slate-700">{gap.recommendedQuestions}</span> questions available
                      </span>
                      <button
                        onClick={() => navigate(`/student/question-bank?topicId=${gap.topicId}&topicName=${encodeURIComponent(gap.topicName)}`)}
                        className="text-xs text-[var(--color-accent)] font-semibold flex items-center gap-1 hover:underline cursor-pointer group"
                      >
                        Practice Topic <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
