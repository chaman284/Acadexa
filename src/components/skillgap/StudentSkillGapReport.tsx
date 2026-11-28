import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Target,
  BookOpen,
  Lock,
} from 'lucide-react';
import type {
  StudentTopicSkill,
  StudentSkillGapRecommendation,
} from '../../services/analyticsService';

interface StudentSkillGapReportProps {
  topics: StudentTopicSkill[];
  recommendations: StudentSkillGapRecommendation[];
  readOnly?: boolean;
  onPractice?: (gap: StudentSkillGapRecommendation) => void;
  className?: string;
}

/**
 * The exact report a student sees. Faculty open it with readOnly so no
 * practice/remedial action is available and no number is recomputed differently.
 */
export const StudentSkillGapReport: React.FC<StudentSkillGapReportProps> = ({
  topics,
  recommendations,
  readOnly = false,
  onPractice,
  className = '',
}) => {
  const strong = topics.filter((t) => t.category === 'strong');
  const needsPractice = topics.filter((t) => t.category === 'needs-practice');
  const improving = topics.filter((t) => t.category === 'improving');

  if (topics.length === 0) {
    return (
      <div className={`card p-10 text-center ${className}`}>
        <BookOpen className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">No skill-gap data yet</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          No quiz attempts have been recorded for this subject.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {readOnly && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(104,123,98,0.10)] border border-[rgba(104,123,98,0.20)] text-xs font-medium text-[#34483A]">
          <Lock className="w-3.5 h-3.5" /> Faculty preview — read only. Scores match the student report.
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-forest bg-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-forest" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Strong Topics</span>
          </div>
          <p className="text-3xl font-serif font-bold text-forest">{strong.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">High conceptual mastery (≥75%)</p>
        </div>
        <div className="card p-5 border-l-4 border-l-danger bg-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Needs Attention</span>
          </div>
          <p className="text-3xl font-serif font-bold text-danger">{needsPractice.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Below the 50% threshold</p>
        </div>
        <div className="card p-5 border-l-4 border-l-brass bg-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-brass" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Improving</span>
          </div>
          <p className="text-3xl font-serif font-bold text-brass">{improving.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Developing proficiency (50%–74%)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
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
              {topics.map((topic) => (
                <div
                  key={topic.topicId}
                  className="hover:bg-slate-50/70 p-2 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{topic.topicName}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {topic.subjectName}
                        {topic.answered ? ` · ${topic.answered} questions evaluated` : ''}
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
                      topic.category === 'strong' ? 'green' : topic.category === 'needs-practice' ? 'red' : 'amber'
                    }
                    height="xs"
                  />
                  {topic.answered ? (
                    <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] mt-1.5 px-0.5">
                      <span>
                        Raw accuracy: <b className="text-slate-700 font-medium">{topic.rawAccuracy ?? topic.score}%</b>
                      </span>
                      <span>
                        Diagnostic confidence:{' '}
                        <b className="text-slate-700 font-medium">{topic.confidence ?? 75}%</b>
                      </span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Strong Topics" action={<CheckCircle className="w-4 h-4 text-[var(--color-success)]" />} />
              <div className="space-y-2">
                {strong.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] py-3 text-center">No mastered topics yet.</p>
                ) : (
                  strong.map((t) => (
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
                  needsPractice.map((t) => (
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

        <div className="space-y-4">
          <div>
            <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">
              Targeted Remedial Practice
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Prioritized by Bayesian error rate &amp; conceptual importance
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div className="card p-8 text-center text-[var(--color-text-muted)] text-sm">
              All evaluated topics are above the institutional mastery standard.
            </div>
          ) : (
            recommendations.map((gap) => (
              <div
                key={gap.topicId}
                className="card p-5 bg-white border border-[var(--color-border)] shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        color={gap.gapSeverity === 'high' ? 'red' : gap.gapSeverity === 'medium' ? 'amber' : 'green'}
                      >
                        {gap.gapSeverity === 'high'
                          ? 'High Priority (Critical Gap)'
                          : gap.gapSeverity === 'medium'
                          ? 'Medium Priority'
                          : 'Low Priority'}
                      </Badge>
                    </div>
                    <h3 className="font-serif font-bold text-[var(--color-text-primary)] text-base leading-snug">
                      {gap.topicName}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{gap.courseName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--color-text-muted)]">Current Mastery</p>
                    <p className={`font-serif font-bold text-lg ${gap.currentScore < 50 ? 'text-[var(--color-danger)]' : 'text-oxblood'}`}>
                      {gap.currentScore}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <ProgressBar
                    value={gap.currentScore}
                    max={100}
                    height="xs"
                    color={gap.gapSeverity === 'high' ? 'red' : 'oxblood'}
                    className="flex-1"
                  />
                  <Target className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] flex-shrink-0">
                    {gap.targetScore}% Target
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border)] mt-2">
                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-oxblood" />
                    <span className="font-medium text-[#302A2B]">{gap.recommendedQuestions}</span> questions available
                  </span>
                  {readOnly ? (
                    <span className="text-xs font-semibold text-[#79666A] flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> View only
                    </span>
                  ) : (
                    <button
                      onClick={() => onPractice?.(gap)}
                      className="text-xs text-oxblood font-semibold flex items-center gap-1 hover:underline cursor-pointer group"
                    >
                      Practice Topic{' '}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <span className="sr-only">{improving.length} topics improving</span>
    </div>
  );
};
