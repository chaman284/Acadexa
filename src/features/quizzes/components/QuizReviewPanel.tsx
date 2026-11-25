// ============================================================================
// ACADEXA QUIZ REVIEW & PRE-PUBLISH VALIDATION PANEL (STEP 4)
// Quality integrity checks, syllabus breakdown, and publish/schedule triggers
// ============================================================================
import React, { useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle, AlertCircle, Eye, Calendar,
  Check, Save, Clock, BookOpen, Layers, Users, Award, ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Quiz, QuizQuestion, AssignedClass, QuizSettings } from '../types/quizTypes';

interface QuizReviewPanelProps {
  title: string;
  description: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  assignedClasses: AssignedClass[];
  questions: QuizQuestion[];
  settings: QuizSettings;
  scheduledStart: string;
  onSaveDraft: () => void;
  onPreviewAsStudent: () => void;
  onSchedule: () => void;
  onPublishNow: () => void;
  onNavigateToStep: (stepIndex: number) => void;
  isSaving: boolean;
}

export const QuizReviewPanel: React.FC<QuizReviewPanelProps> = ({
  title,
  description,
  subjectName,
  subjectCode,
  semester,
  assignedClasses,
  questions,
  settings,
  scheduledStart,
  onSaveDraft,
  onPreviewAsStudent,
  onSchedule,
  onPublishNow,
  onNavigateToStep,
  isSaving,
}) => {
  const isExam = settings.mode === 'exam';
  const totalMarks = useMemo(
    () => questions.reduce((sum, q) => sum + (q.marks || 1), 0),
    [questions]
  );

  // Quality Integrity Checks
  const integrityAudit = useMemo(() => {
    const issues: { type: 'blocking' | 'warning'; message: string; stepTarget: number }[] = [];

    if (!title.trim()) {
      issues.push({
        type: 'blocking',
        message: 'Quiz title is missing.',
        stepTarget: 0,
      });
    }

    if (questions.length === 0) {
      issues.push({
        type: 'blocking',
        message: 'Quiz contains no assessment questions.',
        stepTarget: 1,
      });
    }

    const missingKeys = questions.filter(q => !q.hasValidAnswerKey);
    if (missingKeys.length > 0) {
      issues.push({
        type: 'blocking',
        message: `${missingKeys.length} question(s) are missing valid correct answer keys.`,
        stepTarget: 1,
      });
    }

    const unmappedTopics = questions.filter(
      q => !q.metadata?.topicId || q.metadata?.topicId === 'unmapped'
    );
    if (unmappedTopics.length > 0) {
      issues.push({
        type: 'warning',
        message: `${unmappedTopics.length} question(s) have unmapped topic metadata, which will limit learning-gap analytics precision.`,
        stepTarget: 1,
      });
    }

    if (assignedClasses.length === 0) {
      issues.push({
        type: 'warning',
        message: 'No student classes are assigned yet. The quiz will be saved as draft until assigned.',
        stepTarget: 0,
      });
    }

    return issues;
  }, [title, questions, assignedClasses]);

  const hasBlockingErrors = integrityAudit.some(i => i.type === 'blocking');

  // Topic Coverage Map
  const topicMap = useMemo(() => {
    const map: Record<string, { count: number; marks: number }> = {};
    questions.forEach(q => {
      const t = q.metadata?.topicName || 'General Topic';
      if (!map[t]) map[t] = { count: 0, marks: 0 };
      map[t].count += 1;
      map[t].marks += q.marks || 1;
    });
    return map;
  }, [questions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Integrity Audit Summary Alert */}
      {integrityAudit.length > 0 ? (
        <div
          className={`p-5 rounded-2xl border space-y-2 ${
            hasBlockingErrors
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {hasBlockingErrors ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            <span>
              {hasBlockingErrors
                ? 'Assessment Integrity Issues Detected'
                : 'Pedagogical Recommendations Before Publishing'}
            </span>
          </div>

          <ul className="text-xs space-y-1.5 pl-6 list-disc">
            {integrityAudit.map((issue, i) => (
              <li key={i}>
                <span>{issue.message} </span>
                <button
                  type="button"
                  onClick={() => onNavigateToStep(issue.stepTarget)}
                  className="font-bold underline hover:opacity-80 ml-1 cursor-pointer"
                >
                  Fix in Step {issue.stepTarget + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Assessment Quality Verified:</strong> All answer keys and syllabus topic mappings are intact. Ready for scheduled publication.
          </span>
        </div>
      )}

      {/* Primary Overview Card */}
      <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl space-y-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge color={isExam ? 'oxblood' : 'amber'}>
              {isExam ? 'Exam Mode' : 'Practice Mode'}
            </Badge>
            <Badge color="gray">Semester {semester}</Badge>
            <span className="text-xs font-semibold text-slate-500">
              {subjectCode}: {subjectName}
            </span>
          </div>
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-1">{title || 'Untitled Assessment'}</h2>
          {description && <p className="text-xs text-slate-600 leading-relaxed">{description}</p>}
        </div>

        {/* Core Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Questions</span>
            <p className="text-lg font-black text-slate-900">{questions.length}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Total Marks</span>
            <p className="text-lg font-black text-[var(--color-accent)]">{totalMarks}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Duration</span>
            <p className="text-lg font-black text-slate-900">
              {isExam ? `${settings.exam.durationMinutes} min` : 'Self-Paced'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Target Students</span>
            <p className="text-lg font-black text-emerald-600">
              {assignedClasses.reduce((sum, c) => sum + c.studentsCount, 0)} enrolled
            </p>
          </div>
        </div>

        {/* Assigned Classes */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
            Assigned Section(s)
          </span>
          <div className="flex flex-wrap gap-2">
            {assignedClasses.length > 0 ? (
              assignedClasses.map(cls => (
                <span
                  key={cls.id}
                  className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  {cls.name} ({cls.studentsCount} students)
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No sections assigned yet (Draft only)</span>
            )}
          </div>
        </div>

        {/* Topic-Level Syllabus Breakdown */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
            Topic-Level Assessment Distribution
          </span>
          <div className="space-y-2">
            {Object.entries(topicMap).map(([topicName, stats]) => (
              <div
                key={topicName}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white text-xs"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-semibold text-slate-800">{topicName}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span>{stats.count} {stats.count === 1 ? 'question' : 'questions'}</span>
                  <span className="font-bold text-slate-900">{stats.marks} marks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="card p-5 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPreviewAsStudent} leftIcon={<Eye className="w-4 h-4" />}>
            Preview as Student ({isExam ? 'Exam Mode' : 'Practice'})
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveDraft} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save as Draft
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          {scheduledStart ? (
            <Button
              size="sm"
              disabled={hasBlockingErrors}
              onClick={onSchedule}
              isLoading={isSaving}
              leftIcon={<Calendar className="w-4 h-4" />}
              className="!bg-amber-600 hover:!bg-amber-700 !text-white"
            >
              Schedule Assessment
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={hasBlockingErrors}
              onClick={onPublishNow}
              isLoading={isSaving}
              leftIcon={<Check className="w-4 h-4" />}
              className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold"
            >
              Publish Quiz Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
