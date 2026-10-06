import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ClassSelector, type AssignedClass } from '../../components/faculty/ClassSelector';
import { classPerformanceMatrix, studentsNeedingAttention } from '../../data/analytics';
import { FileDown, Search } from 'lucide-react';
import type { StudentNeedingAttention } from '../../types/analytics';

const facultyClasses: AssignedClass[] = [
  { id: 'sec_5a_ds', semester: '5th Sem', section: '5A', subject: 'Data Structures', studentsCount: 72 },
  { id: 'sec_5b_ds', semester: '5th Sem', section: '5B', subject: 'Data Structures', studentsCount: 68 },
  { id: 'sec_7c_cc', semester: '7th Sem', section: '7C', subject: 'Cloud Computing', studentsCount: 70 },
  { id: 'sec_3a_db', semester: '3rd Sem', section: '3A', subject: 'Database Systems', studentsCount: 75 },
];

export const ClassAnalytics: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState(facultyClasses[0].id);
  const selectedClass = facultyClasses.find(c => c.id === selectedClassId) || facultyClasses[0];
  
  // Dummy data variation based on selected class
  const classModifier = selectedClass.studentsCount % 5;

  const attentionColumns = [
    { key: 'displayId', header: 'Student ID', className: 'w-32 font-mono text-xs' },
    {
      key: 'weakTopics', header: 'Topics Requiring Practice',
      render: (s: StudentNeedingAttention) => (
        <div className="flex flex-wrap gap-1">
          {s.weakTopics.map(t => <Badge key={t} color="red" className="text-[10px]">{t}</Badge>)}
        </div>
      ),
    },
    {
      key: 'lastQuizScore', header: 'Last Quiz',
      render: (s: StudentNeedingAttention) => (
        <span className="font-semibold">{Math.max(0, s.lastQuizScore - classModifier)}%</span>
      ),
    },
    {
      key: 'actions', header: 'Actions',
      render: () => (
        <Button variant="ghost" size="sm" className="!text-[var(--color-accent)] hover:!bg-[var(--color-accent-light)]">
          Assign Practice
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Class Analytics"
        subtitle="Detailed performance analysis for your batches"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Class Analytics' }]}
        action={
          <Button variant="outline" size="sm" leftIcon={<FileDown className="w-4 h-4" />}>
            Export Report
          </Button>
        }
      />

      <ClassSelector 
        classes={facultyClasses} 
        selectedClassId={selectedClassId} 
        onChange={setSelectedClassId} 
      />

      <Card>
        <CardHeader title={`Unit Performance Heatmap — ${selectedClass.subject}`} subtitle={`Section ${selectedClass.section}`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left font-semibold text-[var(--color-text-muted)] pb-3 w-48">Topic Focus</th>
                <th className="font-semibold text-[var(--color-text-muted)] pb-3 text-center">Unit 1</th>
                <th className="font-semibold text-[var(--color-text-muted)] pb-3 text-center">Unit 2</th>
                <th className="font-semibold text-[var(--color-text-muted)] pb-3 text-center">Unit 3</th>
                <th className="font-semibold text-[var(--color-text-muted)] pb-3 text-center">Unit 4</th>
              </tr>
            </thead>
            <tbody>
              {classPerformanceMatrix.slice(0, 3).map((course, idx) => (
                <tr key={idx} className="border-t border-[var(--color-border)]">
                  <td className="py-3 font-medium text-[var(--color-text-primary)]">
                    {idx === 0 ? 'Core Concepts' : idx === 1 ? 'Practical App' : 'Theory Analysis'}
                  </td>
                  {[0, 1, 2, 3].map(i => {
                    const unit = course.units[i];
                    if (!unit) return <td key={i} className="p-1"><div className="heatmap-cell bg-[var(--color-muted)] text-[var(--color-text-muted)]">N/A</div></td>;
                    
                    const score = Math.min(100, Math.max(0, unit.averageScore + (classModifier * (idx === 1 ? -1 : 1))));
                    return (
                      <td key={i} className="p-1">
                        <div className={`heatmap-cell ${
                          score >= 75 ? 'heatmap-high' :
                          score >= 60 ? 'heatmap-medium' : 'heatmap-low'
                        }`} title={unit.unitName}>
                          {score}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader 
          title={`Students Needing Attention — Section ${selectedClass.section}`} 
          subtitle="Identified based on consistent low performance in specific topics"
          action={
            <div className="flex items-center gap-2 bg-[var(--color-muted)] rounded-[8px] px-2 py-1.5">
              <Search className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <input placeholder="Search ID..." className="bg-transparent text-sm outline-none w-24" />
            </div>
          }
        />
        <DataTable columns={attentionColumns} data={studentsNeedingAttention} keyField="studentId" />
      </Card>
    </div>
  );
};
