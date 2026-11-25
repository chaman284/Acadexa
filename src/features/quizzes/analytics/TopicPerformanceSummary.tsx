// ============================================================================
// ACADEXA TOPIC PERFORMANCE SUMMARY (LEARNING-GAP ANALYSIS INTEGRATION)
// Identifies class-level syllabus learning gaps vs topics with insufficient data
// ============================================================================
import React, { useEffect, useState } from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle2, HelpCircle,
  BookOpen, Sparkles, ArrowRight, BarChart2,
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import type { TopicPerformance } from '../types/quizTypes';
import { quizAnalyticsService } from '../services/quizAnalyticsService';

interface TopicPerformanceSummaryProps {
  quizId?: string;
  subjectId?: string;
  onLaunchRemedialQuiz?: (topicId: string, topicName: string) => void;
}

export const TopicPerformanceSummary: React.FC<TopicPerformanceSummaryProps> = ({
  quizId,
  subjectId,
  onLaunchRemedialQuiz,
}) => {
  const [topics, setTopics] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    quizAnalyticsService
      .getTopicPerformanceSummary({ quizId, subjectId })
      .then(res => setTopics(res))
      .finally(() => setLoading(false));
  }, [quizId, subjectId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Aggregating topic-level learning performance...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-base text-slate-900">
            Curriculum Learning-Gap Analytics
          </h3>
          <p className="text-xs text-slate-500">
            Topic-level diagnostic breakdown derived from continuous assessments
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {topics.map(t => {
          const isGap = t.status === 'learning_gap';
          const isInsufficient = t.status === 'insufficient_data';
          const isMastered = t.status === 'mastered';

          return (
            <div
              key={t.topicId}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isGap
                  ? 'border-rose-200 bg-rose-50/30'
                  : isInsufficient
                  ? 'border-slate-200 bg-slate-50/50'
                  : 'border-emerald-200 bg-emerald-50/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{t.topicName}</span>
                  {isGap && (
                    <Badge color="red" dot>
                      Learning Gap Detected
                    </Badge>
                  )}
                  {isInsufficient && (
                    <Badge color="gray">
                      Insufficient Data (&lt; 3 attempts)
                    </Badge>
                  )}
                  {isMastered && (
                    <Badge color="green">
                      Concept Mastered
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500">
                  {t.totalQuestionsAttempted} question attempts · {t.totalCorrect} answered correctly
                </p>

                {t.recommendedAction && (
                  <p className="text-xs text-slate-700 italic pt-1">
                    <strong>Intervention:</strong> {t.recommendedAction}
                  </p>
                )}
              </div>

              {/* Score bar & Remedial trigger */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p
                    className={`text-xl font-black ${
                      isGap ? 'text-rose-600' : isInsufficient ? 'text-slate-400' : 'text-emerald-600'
                    }`}
                  >
                    {isInsufficient ? '—' : `${t.averagePercentage}%`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Class Mastery
                  </p>
                </div>

                {isGap && onLaunchRemedialQuiz && (
                  <Button
                    size="sm"
                    onClick={() => onLaunchRemedialQuiz(t.topicId, t.topicName)}
                    className="!bg-rose-600 hover:!bg-rose-700 !text-white text-xs"
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Create Remedial Quiz
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
