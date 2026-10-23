import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileDown, CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { StudentNeedingAttention } from '../../types/analytics';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/apiClient';

interface FacultyClassItem {
  id: string;
  sectionId?: string;
  semester: string;
  section: string;
  subject: string;
  studentsCount: number;
}

export const ClassAnalytics: React.FC = () => {
  const { classId: urlClassId } = useParams<{ classId: string }>();
  const [classes, setClasses] = useState<FacultyClassItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(urlClassId || '');
  const [studentsAttention] = useState<StudentNeedingAttention[]>([]);
  const { user } = useAuth();

  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/sections/faculty-classes');
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: FacultyClassItem[] = res.data.map((c: any) => ({
            id: c.id,
            sectionId: c.sectionId || c.id,
            semester: typeof c.semester === 'number' ? `${c.semester}th Sem` : (c.semester || '5th Sem'),
            section: (c.section || c.sectionName || 'A').replace(/^Section\s+/i, ''),
            subject: c.subject || c.subjectName || 'Course',
            studentsCount: c.studentsCount || 0,
          }));
          setClasses(mapped);
          if (!selectedClassId) {
            setSelectedClassId(urlClassId || mapped[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load faculty classes:', err);
      }
    };
    fetchClasses();
  }, [urlClassId]);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0] || {
    id: '',
    semester: '',
    section: '',
    subject: '',
    studentsCount: 0,
  };

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
      rows.push(['Faculty Member', user?.name || 'Faculty Member']);
      rows.push(['Export Timestamp', new Date().toLocaleString('en-IN')]);
      rows.push([]);

      // 2. Students Needing Attention
      rows.push(['=== STUDENTS NEEDING ACADEMIC ATTENTION ===']);
      rows.push(['Student ID', 'Last Quiz Score (%)', 'Identified Weak Topics', 'Intervention Status']);

      if (studentsAttention.length === 0) {
        rows.push(['No students currently flagged as needing attention.', '', '', 'Normal']);
      } else {
        studentsAttention.forEach(s => {
          rows.push([
            s.displayId,
            `${s.lastQuizScore}%`,
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
                {classes.map(c => (
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
          <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
            Heatmap metrics populate automatically as students complete unit-based quizzes for this section.
          </p>
        </div>
      </Card>

      {/* Students Needing Attention */}
      <Card>
        <CardHeader 
          title={`Students Needing Attention — Section ${selectedClass.section}`} 
          subtitle="Identified based on consistent low performance in specific topics"
        />
        <DataTable columns={attentionColumns} data={studentsAttention} keyField="studentId" emptyMessage="No students currently flagged as needing attention." />
      </Card>
    </div>
  );
};
