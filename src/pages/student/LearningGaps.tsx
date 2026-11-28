import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StudentSkillGapReport } from '../../components/skillgap/StudentSkillGapReport';
import {
  analyticsService,
  type StudentTopicSkill,
  type StudentSkillGapRecommendation,
} from '../../services/analyticsService';
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react';

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
        <StudentSkillGapReport
          topics={topics}
          recommendations={recommendations}
          onPractice={(gap) =>
            navigate(
              `/student/question-bank?topicId=${gap.topicId}&topicName=${encodeURIComponent(gap.topicName)}`,
            )
          }
        />
      )}
    </div>
  );
};
