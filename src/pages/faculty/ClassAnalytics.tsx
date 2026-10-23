import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { classPerformanceMatrix, studentsNeedingAttention } from '../../data/analytics';
import { FileDown, CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { StudentNeedingAttention } from '../../types/analytics';
import { useAuth } from '../../context/AuthContext';

const facultyClasses = [
  { id: 'sec_5a_ds', semester: '5th Sem', section: '5A', subject: 'Data Structures', studentsCount: 72 },
  { id: 'sec_5b_ds', semester: '5th Sem', section: '5B', subject: 'Data Structures', studentsCount: 68 },
  { id: 'sec_7c_cc', semester: '7th Sem', section: '7C', subject: 'Cloud Computing', studentsCount: 70 },
  { id: 'sec_3a_db', semester: '3rd Sem', section: '3A', subject: 'Database Systems', studentsCount: 75 },
];

export const ClassAnalytics: React.FC = () => {
  const { classId: urlClassId } = useParams<{ classId: string }>();
  const defaultClassId = urlClassId ?? facultyClasses[0].id;
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId);
  const selectedClass = facultyClasses.find(c => c.id === selectedClassId) || facultyClasses[0];
  const { user } = useAuth();

  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data variation based on selected class
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
        <Button variant="ghost" size="sm" className="!text-oxblood hover:!bg-oxblood/10 font-medium">
          Assign Practice
        </Button>
      ),
    },
  ];

  // ─── Export Analytics Report (CSV) ─────────────────────────────────────────
  const handleExportReport = () => {
    setIsExporting(true);
    setFeedback(null);

    try {
      const rows: string[][] = [];

      // 1. Report Header
      rows.push(['ACADEXA FACULTY ACADEMIC REPORT - PERFORMANCE ANALYTICS']);
      rows.push(['Course / Subject', selectedClass.subject]);
      rows.push(['Section', selectedClass.section]);
      rows.push(['Semester', selectedClass.semester]);
      rows.push(['Total Enrolled Students', String(selectedClass.studentsCount)]);
      rows.push(['Faculty Member', user?.name || 'Dr. Ramesh Kumar']);
      rows.push(['Export Timestamp', new Date().toLocaleString('en-IN')]);
      rows.push([]);

      // 2. Unit Performance Summary Matrix
      rows.push(['=== UNIT PERFORMANCE MATRIX ===']);
      rows.push(['Topic Focus', 'Unit 1 Score (%)', 'Unit 2 Score (%)', 'Unit 3 Score (%)', 'Unit 4 Score (%)']);

      const focusNames = ['Core Concepts', 'Practical Application', 'Theory Analysis'];
      classPerformanceMatrix.slice(0, 3).forEach((course, idx) => {
        const rowScores = [0, 1, 2, 3].map(i => {
          const unit = course.units[i];
          if (!unit) return 'N/A';
          const score = Math.min(100, Math.max(0, unit.averageScore + (classModifier * (idx === 1 ? -1 : 1))));
          return `${score}%`;
        });
        rows.push([focusNames[idx], ...rowScores]);
      });

      rows.push([]);

      // 3. Students Needing Attention
      rows.push(['=== STUDENTS NEEDING ACADEMIC ATTENTION ===']);
      rows.push(['Student ID', 'Last Quiz Score (%)', 'Identified Weak Topics', 'Intervention Status']);

      if (studentsNeedingAttention.length === 0) {
        rows.push(['No students currently flagged as needing attention.', '', '', 'Normal']);
      } else {
        studentsNeedingAttention.forEach(s => {
          const adjustedScore = Math.max(0, s.lastQuizScore - classModifier);
          rows.push([
            s.displayId,
            `${adjustedScore}%`,
            `"${s.weakTopics.join('; ')}"`,
            'Remedial Practice Recommended',
          ]);
        });
      }

      // Format as CSV
      const csvContent = rows
        .map(row => row.map(val => (val.includes(',') ? `"${val}"` : val)).join(','))
        .join('\r\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = `Analytics_Report_${selectedClass.section.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      setFeedback({
        type: 'success',
        message: `Analytics report for Section ${selectedClass.section} successfully exported as CSV!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to generate analytics export report. Please try again.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Analytics"
        subtitle={`Performance analysis — ${selectedClass.section} (${selectedClass.subject})`}
        breadcrumbs={[
          { label: 'Overview' },
          { label: selectedClass.section },
          { label: 'Analytics' },
        ]}
        action={
          <div className="flex items-center gap-2">
            {!urlClassId && (
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="text-xs border border-[var(--color-border)] rounded-[8px] px-2.5 py-1.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none"
              >
                {facultyClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    Sec {c.section} · {c.subject}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              isLoading={isExporting}
              leftIcon={<FileDown className="w-4 h-4" />}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* Export feedback message */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-xl text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Heatmap Card */}
      <Card>
        <CardHeader
          title={`Unit Performance Heatmap — ${selectedClass.subject}`}
          subtitle={`Section ${selectedClass.section} · ${selectedClass.semester}`}
        />
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

      {/* Students Needing Attention (Unnecessary dummy search bar removed) */}
      <Card>
        <CardHeader 
          title={`Students Needing Attention — Section ${selectedClass.section}`} 
          subtitle="Identified based on consistent low performance in specific topics"
        />
        <DataTable columns={attentionColumns} data={studentsNeedingAttention} keyField="studentId" />
      </Card>
    </div>
  );
};
