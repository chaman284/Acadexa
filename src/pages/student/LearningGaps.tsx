import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockTopicPerformance } from '../../data/students';
import { studentLearningGaps } from '../../data/analytics';
import { CheckCircle, AlertTriangle, TrendingUp, ArrowRight, Target, BookOpen } from 'lucide-react';

export const LearningGaps: React.FC = () => {
  const navigate = useNavigate();
  const strong = mockTopicPerformance.filter(t => t.category === 'strong');
  const needsPractice = mockTopicPerformance.filter(t => t.category === 'needs-practice');
  const improving = mockTopicPerformance.filter(t => t.category === 'improving');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Learning Gaps"
        subtitle="Your personalized analysis of strengths and areas to improve"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Learning Gaps' }]}
      />

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-[var(--color-success)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Strong Topics</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-success)]">{strong.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Performing well</p>
        </div>
        <div className="card p-4 border-l-4 border-l-[var(--color-danger)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Needs Practice</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-danger)]">{needsPractice.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Focus on these</p>
        </div>
        <div className="card p-4 border-l-4 border-l-[var(--color-warning)]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[var(--color-warning)]" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Improving</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-warning)]">{improving.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Making progress</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* All topics performance */}
        <Card>
          <CardHeader title="Topic Performance" subtitle="All subjects this semester" />
          <div className="space-y-3">
            {mockTopicPerformance.map(topic => (
              <div key={topic.topicId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-[var(--color-text-secondary)] truncate">{topic.topicName}</span>
                    <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0 hidden sm:inline">{topic.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <Badge
                      color={topic.category === 'strong' ? 'green' : topic.category === 'needs-practice' ? 'red' : 'amber'}
                      className="text-[10px] hidden sm:inline-flex"
                    >
                      {topic.category === 'strong' ? 'Strong' : topic.category === 'needs-practice' ? 'Practice' : 'Improving'}
                    </Badge>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{topic.score}%</span>
                  </div>
                </div>
                <ProgressBar value={topic.score} height="xs" />
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Recommended Practice</h2>
          {studentLearningGaps.map(gap => (
            <div key={gap.topicId} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={gap.gapSeverity === 'high' ? 'red' : gap.gapSeverity === 'medium' ? 'amber' : 'green'}>
                      {gap.gapSeverity === 'high' ? 'High Priority' : gap.gapSeverity === 'medium' ? 'Medium Priority' : 'Low Priority'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{gap.topicName}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{gap.courseName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">Current</p>
                  <p className="font-bold text-[var(--color-text-primary)]">{gap.currentScore}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ProgressBar value={gap.currentScore} max={100} height="xs" className="flex-1" />
                <Target className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
                <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">{gap.targetScore}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {gap.recommendedQuestions} practice questions
                </span>
                <button
                  onClick={() => navigate('/student/question-bank')}
                  className="text-xs text-[var(--color-accent)] font-semibold flex items-center gap-1 hover:underline"
                >
                  Start Practice <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strong vs Weak breakdown */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Strong Topics"
            action={<CheckCircle className="w-4 h-4 text-[var(--color-success)]" />}
          />
          <div className="space-y-2">
            {strong.map(t => (
              <div key={t.topicId} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">{t.topicName}</span>
                <Badge color="green">{t.score}%</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Topics Needing Attention"
            action={<AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />}
          />
          <div className="space-y-2">
            {needsPractice.map(t => (
              <div key={t.topicId} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="text-sm text-[var(--color-text-secondary)]">{t.topicName}</span>
                <Badge color="red">{t.score}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
