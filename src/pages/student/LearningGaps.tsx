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
        <div className="card p-5 border-l-4 border-l-forest bg-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-forest" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Strong Topics</span>
          </div>
          <p className="text-3xl font-serif font-bold text-forest">{strong.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Performing with mastery</p>
        </div>
        <div className="card p-5 border-l-4 border-l-danger bg-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Needs Practice</span>
          </div>
          <p className="text-3xl font-serif font-bold text-danger">{needsPractice.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Focus areas flagged for review</p>
        </div>
        <div className="card p-5 border-l-4 border-l-brass bg-white shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-brass" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Improving</span>
          </div>
          <p className="text-3xl font-serif font-bold text-brass">{improving.length}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Active progress identified</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Topic Performance & Topic Breakdowns */}
        <div className="space-y-6">
          {/* All topics performance */}
          <Card>
            <CardHeader
              title="Topic Performance"
              subtitle="All subjects this semester"
              action={<span className="text-xs text-[var(--color-text-muted)] font-medium">{mockTopicPerformance.length} Topics</span>}
            />
            <div className="space-y-3.5">
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
                    <span className="text-sm text-[var(--color-text-secondary)] truncate mr-2">{t.topicName}</span>
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
                    <span className="text-sm text-[var(--color-text-secondary)] truncate mr-2">{t.topicName}</span>
                    <Badge color="red">{t.score}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-[var(--color-text-primary)]">Recommended Academic Practice</h2>
          {studentLearningGaps.map(gap => (
            <div key={gap.topicId} className="card p-5 bg-white border border-[var(--color-border)] shadow-card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge color={gap.gapSeverity === 'high' ? 'red' : gap.gapSeverity === 'medium' ? 'amber' : 'green'}>
                      {gap.gapSeverity === 'high' ? 'High Priority' : gap.gapSeverity === 'medium' ? 'Medium Priority' : 'Low Priority'}
                    </Badge>
                  </div>
                  <h3 className="font-serif font-bold text-[var(--color-text-primary)] text-base">{gap.topicName}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{gap.courseName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">Current</p>
                  <p className="font-serif font-bold text-lg text-[var(--color-text-primary)]">{gap.currentScore}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <ProgressBar value={gap.currentScore} max={100} height="xs" color={gap.gapSeverity === 'high' ? 'red' : 'oxblood'} className="flex-1" />
                <Target className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] flex-shrink-0">{gap.targetScore}%</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-oxblood" />
                  {gap.recommendedQuestions} practice questions available
                </span>
                <button
                  onClick={() => navigate('/student/question-bank')}
                  className="text-xs text-oxblood font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Start Practice <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
