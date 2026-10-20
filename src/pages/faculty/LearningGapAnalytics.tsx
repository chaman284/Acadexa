import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClassSelector, type AssignedClass } from '../../components/faculty/ClassSelector';
import {
  analyticsService,
  type SectionTopicSkill,
} from '../../services/analyticsService';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AssignedClassExtended extends AssignedClass {
  subjectId?: string;
  sectionId?: string;
}

export const LearningGapAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<AssignedClassExtended[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [topics, setTopics] = useState<SectionTopicSkill[]>([]);
  const [reteachTopics, setReteachTopics] = useState<Array<{ id: string; name: string; pctNeedsAttention: number }>>([]);
  const [atRiskCount, setAtRiskCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const fetchAnalytics = async (classId?: string, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 1. Fetch assigned classes
      const rawClasses = await analyticsService.getFacultyClasses();
      const formattedClasses: AssignedClassExtended[] = rawClasses.map((c: any) => ({
        id: c.id,
        sectionId: c.sectionId || c.id,
        subjectId: c.subjectId,
        semester: c.semester?.toString().includes('Sem') ? c.semester : `Sem ${c.semester || 5}`,
        section: (c.section || c.sectionName || 'A').replace(/^Section\s+/i, ''),
        subject: c.subject || c.subjectName || 'Course',
        studentsCount: c.studentsCount || 0,
      }));

      setClasses(formattedClasses);

      const targetId = classId || selectedClassId || formattedClasses[0]?.id;
      if (targetId) setSelectedClassId(targetId);

      const activeClass = formattedClasses.find(c => c.id === targetId) || formattedClasses[0];

      if (activeClass) {
        // 2. Query section skill gap diagnostics
        const report = await analyticsService.getSectionSkillGaps(
          activeClass.sectionId || activeClass.id,
          activeClass.subjectId
        );
        setTopics(report.topics);
        setReteachTopics(report.reteachTopics);
        setAtRiskCount(report.atRiskCount);
        setIsFallback(!!report.isFallback);
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

  const handleGenerateRemedial = (topic: SectionTopicSkill) => {
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
      header: 'Curriculum Topic',
      render: (t: SectionTopicSkill) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{t.topicName}</p>
            {t.isReteachRecommended && (
              <Badge color="red" className="text-[10px]">
                Re-teaching Needed
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {selectedClass?.subject || t.courseName} · {t.unitName}
          </p>
        </div>
      ),
    },
    {
      key: 'averageScore',
      header: 'Batch Mastery',
      render: (t: SectionTopicSkill) => {
        const score = t.averageScore;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-bold ${
                score < 60
                  ? 'text-[var(--color-danger)]'
                  : score < 75
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-success)]'
              }`}
            >
              {score}%
            </span>
            <Badge
              color={score >= 75 ? 'green' : score >= 50 ? 'amber' : 'red'}
              className="text-[10px]"
            >
              {score >= 75 ? 'Mastered' : score >= 50 ? 'Moderate' : 'Low'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'pctNeedsAttention',
      header: 'Batch Risk',
      render: (t: SectionTopicSkill) => {
        const pct = t.pctNeedsAttention ?? 0;
        return (
          <Badge color={pct >= 40 ? 'red' : pct >= 25 ? 'amber' : 'gray'}>
            {pct}% needs attention
          </Badge>
        );
      },
    },
    {
      key: 'trend',
      header: 'Trend',
      render: (t: SectionTopicSkill) => (
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
      key: 'actions',
      header: 'Remediation',
      render: (t: SectionTopicSkill) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Target className="w-4 h-4" />}
          className="!text-[var(--color-accent)] hover:!bg-[var(--color-accent-light)] font-semibold cursor-pointer"
          onClick={() => handleGenerateRemedial(t)}
        >
          Dispatch Remedial Quiz
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Learning Gap Analytics"
          subtitle="Bayesian diagnostic analysis across student cohorts & sections"
          breadcrumbs={[{ label: 'Overview' }, { label: 'Learning Gaps' }]}
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
          onClick={() => fetchAnalytics(selectedClassId, true)}
          disabled={loading || refreshing}
        >
          Refresh Telemetry
        </Button>
      </div>

      {isFallback && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-800">
          <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>
            Connected in resilient mode. Displaying diagnostic telemetry models for {selectedClass?.subject || 'the course'}.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-[var(--color-text-muted)]">Computing section skill gap analytics...</p>
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

          {/* Re-teaching Recommendation Alert */}
          {reteachTopics.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  {reteachTopics.length} Topic{reteachTopics.length > 1 ? 's' : ''} Flagged for Lecture Re-Teaching
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Over 40% of students in Section {selectedClass?.section} exhibited low conceptual mastery on{' '}
                  <span className="font-semibold">
                    {reteachTopics.map(r => r.name).slice(0, 3).join(', ')}
                    {reteachTopics.length > 3 ? `, and ${reteachTopics.length - 3} more` : ''}
                  </span>
                  . Consider revisiting these concepts before scheduled mid-term evaluations.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-3.5">
              <p className="text-xs text-[var(--color-text-muted)]">Assessed Topics</p>
              <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">{topics.length}</p>
            </div>
            <div className="card p-3.5">
              <p className="text-xs text-[var(--color-text-muted)]">Flagged for Re-teaching</p>
              <p className="text-xl font-bold text-[var(--color-danger)] mt-1">{reteachTopics.length}</p>
            </div>
            <div className="card p-3.5">
              <p className="text-xs text-[var(--color-text-muted)]">Students At Risk</p>
              <p className="text-xl font-bold text-[var(--color-warning)] mt-1">{atRiskCount}</p>
            </div>
            <div className="card p-3.5">
              <p className="text-xs text-[var(--color-text-muted)]">Active Enrolled</p>
              <p className="text-xl font-bold text-[var(--color-primary)] mt-1">{selectedClass?.studentsCount || 0}</p>
            </div>
          </div>

          <Card padding="none">
            <CardHeader
              title={`Topic Performance Matrix — Section ${selectedClass?.section || ''}`}
              subtitle={selectedClass ? `${selectedClass.subject} · ${selectedClass.semester}` : undefined}
              className="p-5 pb-0"
              action={
                <span className="text-xs text-[var(--color-text-muted)] font-medium">
                  {topics.length} Curriculum Units Analyzed
                </span>
              }
            />
            <DataTable columns={columns} data={topics} keyField="topicId" />
          </Card>
        </>
      )}
    </div>
  );
};
