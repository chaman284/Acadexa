import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ClassSelector, type AssignedClass } from '../../components/faculty/ClassSelector';
import { classTopicPerformance } from '../../data/analytics';
import type { ClassTopicPerformance } from '../../types/analytics';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

const facultyClasses: AssignedClass[] = [
  { id: 'sec_5a_ds', semester: '5th Sem', section: '5A', subject: 'Data Structures', studentsCount: 72 },
  { id: 'sec_5b_ds', semester: '5th Sem', section: '5B', subject: 'Data Structures', studentsCount: 68 },
  { id: 'sec_7c_cc', semester: '7th Sem', section: '7C', subject: 'Cloud Computing', studentsCount: 70 },
  { id: 'sec_3a_db', semester: '3rd Sem', section: '3A', subject: 'Database Systems', studentsCount: 75 },
];

export const LearningGapAnalytics: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState(facultyClasses[0].id);
  const selectedClass = facultyClasses.find(c => c.id === selectedClassId) || facultyClasses[0];
  
  const classModifier = selectedClass.studentsCount % 5;

  const columns = [
    {
      key: 'topicName', header: 'Topic',
      render: (t: ClassTopicPerformance) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{t.topicName}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{selectedClass.subject} · {t.unitName}</p>
        </div>
      ),
    },
    {
      key: 'averageScore', header: 'Class Avg',
      render: (t: ClassTopicPerformance) => {
        const score = Math.min(100, Math.max(0, t.averageScore + classModifier));
        return (
          <span className={`font-semibold ${score < 60 ? 'text-[var(--color-danger)]' : score < 75 ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
            {score}%
          </span>
        );
      },
    },
    {
      key: 'trend', header: 'Trend',
      render: (t: ClassTopicPerformance) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {t.trend === 'improving' && <><TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]"/><span className="text-[var(--color-success)]">Improving</span></>}
          {t.trend === 'declining' && <><TrendingDown className="w-3.5 h-3.5 text-[var(--color-danger)]"/><span className="text-[var(--color-danger)]">Declining</span></>}
          {t.trend === 'stable' && <><Minus className="w-3.5 h-3.5 text-[var(--color-text-muted)]"/><span className="text-[var(--color-text-muted)]">Stable</span></>}
        </div>
      ),
    },
    {
      key: 'participationRate', header: 'Participation',
      render: (t: ClassTopicPerformance) => (
        <Badge color="gray">{Math.min(100, t.participationRate + classModifier)}%</Badge>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: () => (
        <Button variant="ghost" size="sm" leftIcon={<Target className="w-4 h-4"/>} className="!text-[var(--color-accent)] hover:!bg-[var(--color-accent-light)]">
          Generate Remedial Quiz
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Learning Gap Analytics"
        subtitle="Identify and address knowledge gaps across the batch"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Learning Gaps' }]}
      />

      <ClassSelector 
        classes={facultyClasses} 
        selectedClassId={selectedClassId} 
        onChange={setSelectedClassId} 
      />

      <Card padding="none">
        <CardHeader title={`Topic Performance Breakdown — Section ${selectedClass.section}`} className="p-5 pb-0" />
        <DataTable columns={columns} data={classTopicPerformance} keyField="topicId" />
      </Card>
    </div>
  );
};
