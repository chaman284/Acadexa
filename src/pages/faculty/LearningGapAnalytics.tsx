import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClassSelector, type AssignedClass } from '../../components/faculty/ClassSelector';
import type { ClassTopicPerformance } from '../../types/analytics';
import { TrendingUp, TrendingDown, Minus, Target, RefreshCw } from 'lucide-react';
import api from '../../lib/apiClient';

interface ExtendedTopicPerformance extends ClassTopicPerformance {
  attemptsCount?: number;
}

interface AssignedClassExtended extends AssignedClass {
  subjectId?: string;
  sectionId?: string;
}

export const LearningGapAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<AssignedClassExtended[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [topics, setTopics] = useState<ExtendedTopicPerformance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (classId?: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params: Record<string, string> = {};
      if (classId) params.classId = classId;

      const res = await api.get('/analytics/faculty/learning-gaps', { params });
      if (res.data) {
        if (Array.isArray(res.data.classes)) {
          setClasses(res.data.classes);
          if (!selectedClassId && res.data.selectedClass) {
            setSelectedClassId(res.data.selectedClass.id);
          } else if (classId) {
            setSelectedClassId(classId);
          }
        }
        if (Array.isArray(res.data.topics)) {
          setTopics(res.data.topics);
        }
      }
    } catch (err) {
      console.error('Failed to load learning gap analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleClassChange = (newClassId: string) => {
    setSelectedClassId(newClassId);
    fetchAnalytics(newClassId);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleGenerateRemedial = (topic: ExtendedTopicPerformance) => {
    navigate('/faculty/quiz/create', {
      state: {
        remedial: true,
        topicId: topic.topicId,
        topicName: topic.topicName,
        courseId: topic.courseId || selectedClass?.subjectId,
        subject: selectedClass?.subject,
        sectionId: selectedClass?.sectionId,
        section: selectedClass?.section,
        semester: selectedClass?.semester,
        title: `Remedial Quiz: ${topic.topicName}`,
      },
    });
  };

  const columns = [
    {
      key: 'topicName',
      header: 'Topic',
      render: (t: ExtendedTopicPerformance) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{t.topicName}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {selectedClass?.subject || t.courseName} · {t.unitName}
          </p>
        </div>
      ),
    },
    {
      key: 'averageScore',
      header: 'Class Avg',
      render: (t: ExtendedTopicPerformance) => {
        if (t.attemptsCount === 0) {
          return <span className="text-xs text-[var(--color-text-muted)] italic">No attempts yet</span>;
        }
        const score = t.averageScore;
        return (
          <span
            className={`font-semibold ${
              score < 60
                ? 'text-[var(--color-danger)]'
                : score < 75
                ? 'text-[var(--color-warning)]'
                : 'text-[var(--color-success)]'
            }`}
          >
            {score}%
          </span>
        );
      },
    },
    {
      key: 'trend',
      header: 'Trend',
      render: (t: ExtendedTopicPerformance) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {t.trend === 'improving' && (
            <>
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]" />
              <span className="text-[var(--color-success)]">Improving</span>
            </>
          )}
          {t.trend === 'declining' && (
            <>
              <TrendingDown className="w-3.5 h-3.5 text-[var(--color-danger)]" />
              <span className="text-[var(--color-danger)]">Declining</span>
            </>
          )}
          {t.trend === 'stable' && (
            <>
              <Minus className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-muted)]">Stable</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'participationRate',
      header: 'Participation',
      render: (t: ExtendedTopicPerformance) => (
        <Badge color={t.participationRate > 0 ? 'gray' : 'amber'}>
          {t.participationRate}%
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: ExtendedTopicPerformance) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Target className="w-4 h-4" />}
          className="!text-[var(--color-accent)] hover:!bg-[var(--color-accent-light)]"
          onClick={() => handleGenerateRemedial(t)}
        >
          Generate Remedial Quiz
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Learning Gap Analytics"
          subtitle="Identify and address knowledge gaps across the batch"
          breadcrumbs={[{ label: 'Overview' }, { label: 'Learning Gaps' }]}
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          onClick={() => fetchAnalytics(selectedClassId, true)}
          disabled={loading || refreshing}
        >
          Refresh Data
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading learning gap analytics...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-12 text-center">
          <p className="text-base font-semibold text-[var(--color-text-primary)]">No assigned classes found</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Classes and subjects assigned to your faculty profile will appear here.
          </p>
        </div>
      ) : (
        <>
          <ClassSelector
            classes={classes}
            selectedClassId={selectedClassId}
            onChange={handleClassChange}
          />

          <Card padding="none">
            <CardHeader
              title={`Topic Performance Breakdown — Section ${selectedClass?.section || ''}`}
              subtitle={selectedClass ? `${selectedClass.subject} · ${selectedClass.semester}` : undefined}
              className="p-5 pb-0"
            />
            <DataTable columns={columns} data={topics} keyField="topicId" />
          </Card>
        </>
      )}
    </div>
  );
};
