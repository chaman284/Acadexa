import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Check,
  BookOpen, Clock, BarChart2, Layers,
  Plus, Trash2, Sparkles, Users, GraduationCap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { facultyClasses } from '../../data/facultyClasses';
import { mockQuestions } from '../../data/quizzes';

// ─── Step indicator ───────────────────────────────────────────────────────────
const steps = ['Quiz Details', 'Questions', 'Assign & Schedule'];

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {steps.map((label, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
            style={{
              background: i < current ? 'var(--color-success)' : i === current ? 'var(--color-accent)' : 'var(--color-muted)',
              color: i <= current ? '#fff' : 'var(--color-text-muted)',
              border: i === current ? '2px solid var(--color-accent)' : '2px solid transparent',
              boxShadow: i === current ? '0 0 0 4px var(--color-accent-light)' : 'none',
            }}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          <span
            className="text-xs font-medium whitespace-nowrap"
            style={{ color: i === current ? 'var(--color-accent)' : i < current ? 'var(--color-success)' : 'var(--color-text-muted)' }}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className="flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-all duration-300"
            style={{ background: i < current ? 'var(--color-success)' : 'var(--color-border)' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Form field wrapper ───────────────────────────────────────────────────────
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>}
  </div>
);

const inputCls = "w-full border border-[var(--color-border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all";
const selectCls = inputCls + " cursor-pointer";

// ─── Quiz Builder ─────────────────────────────────────────────────────────────
export const QuizBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1 state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [duration, setDuration] = useState(20);

  // Step 2 state
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Step 3 state
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishNow, setPublishNow] = useState(false);

  const toggleQuestion = (id: string) =>
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleClass = (id: string) =>
    setAssignedClassIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const simulateAI = async () => {
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setSelectedQIds(mockQuestions.slice(0, 4).map(q => q.id));
    setAiLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    navigate('/faculty/quizzes');
  };

  const canNext = [
    title.trim().length > 0 && subject.length > 0,
    selectedQIds.length > 0,
    assignedClassIds.length > 0,
  ][step];

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12">
      {/* Minimal top bar */}
      <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-50 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/faculty/quizzes')}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {step === 0 ? 'Back to Quizzes' : 'Previous Step'}
          </button>
          <div className="h-4 w-px bg-[var(--color-border)]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--color-accent)] rounded-md flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base text-[var(--color-text-primary)]">Quiz Builder</span>
          </div>
        </div>

        <span className="text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-muted)] px-3 py-1.5 rounded-full">
          Step {step + 1} of {steps.length}
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-6 space-y-6 animate-fade-in-up">
        <StepIndicator current={step} />

      {/* ── Step 1: Quiz Details ── */}
      {step === 0 && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
            <h2 className="font-semibold text-[var(--color-text-primary)]">Basic Details</h2>
          </div>

          <Field label="Quiz Title">
            <input
              className={inputCls}
              placeholder="e.g. Week 7 — Binary Search Trees"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Field>

          <Field label="Subject / Topic" hint="Choose the subject this quiz covers">
            <select className={selectCls} value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Select subject…</option>
              {[...new Set(facultyClasses.map(c => c.subject))].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Difficulty">
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                    style={{
                      background: difficulty === d
                        ? (d === 'easy' ? '#059669' : d === 'medium' ? '#f59e0b' : '#ef4444')
                        : 'var(--color-muted)',
                      color: difficulty === d ? '#fff' : 'var(--color-text-muted)',
                      border: `2px solid ${difficulty === d ? (d === 'easy' ? '#059669' : d === 'medium' ? '#f59e0b' : '#ef4444') : 'transparent'}`,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Duration (minutes)">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDuration(d => Math.max(5, d - 5))}
                  className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors text-lg font-bold text-[var(--color-text-secondary)]"
                >−</button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-[var(--color-text-primary)]">{duration}</span>
                  <span className="text-xs text-[var(--color-text-muted)] ml-1">min</span>
                </div>
                <button
                  onClick={() => setDuration(d => Math.min(120, d + 5))}
                  className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors text-lg font-bold text-[var(--color-text-secondary)]"
                >+</button>
              </div>
            </Field>
          </div>
        </div>
      )}

      {/* ── Step 2: Questions ── */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="font-semibold text-[var(--color-text-primary)]">Select Questions</h2>
              {selectedQIds.length > 0 && (
                <Badge color="indigo">{selectedQIds.length} selected</Badge>
              )}
            </div>
            <Button
              size="sm" variant="secondary"
              leftIcon={aiLoading ? undefined : <Sparkles className="w-3.5 h-3.5" />}
              isLoading={aiLoading}
              onClick={simulateAI}
            >
              {aiLoading ? 'Generating…' : 'AI Suggest'}
            </Button>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {mockQuestions.map(q => {
              const selected = selectedQIds.includes(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full text-left rounded-xl border-2 p-3 transition-all"
                  style={{
                    borderColor: selected ? 'var(--color-accent)' : 'var(--color-border)',
                    background: selected ? 'var(--color-accent-light)' : '#fff',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 transition-all"
                      style={{
                        background: selected ? 'var(--color-accent)' : 'var(--color-muted)',
                        border: selected ? '2px solid var(--color-accent)' : '2px solid var(--color-border)',
                      }}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-text-primary)] font-medium leading-snug">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge color={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'}>
                          {q.difficulty}
                        </Badge>
                        <span className="text-xs text-[var(--color-text-muted)]">{q.topicName}</span>
                        <span className="text-xs text-[var(--color-text-muted)]">·</span>
                        <span className="text-xs text-[var(--color-text-muted)]">{q.correctRate}% correct rate</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedQIds.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <span className="text-sm text-[var(--color-text-muted)]">
                Est. time: ~{Math.ceil(selectedQIds.length * 2)} min
              </span>
              <button
                onClick={() => setSelectedQIds([])}
                className="flex items-center gap-1 text-xs text-[var(--color-danger)] hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Assign & Schedule ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="font-semibold text-[var(--color-text-primary)]">Assign to Classes</h2>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Select which classes will receive this quiz.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {facultyClasses.map(cls => {
                const assigned = assignedClassIds.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    onClick={() => toggleClass(cls.id)}
                    className="text-left rounded-xl border-2 p-4 transition-all"
                    style={{
                      borderColor: assigned ? 'var(--color-accent)' : 'var(--color-border)',
                      background: assigned ? 'var(--color-accent-light)' : '#fff',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                          {cls.semester} · {cls.section}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{cls.subject}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{cls.studentsCount} students</p>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                        style={{
                          background: assigned ? 'var(--color-accent)' : 'var(--color-muted)',
                        }}
                      >
                        {assigned && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" />
              <h2 className="font-semibold text-[var(--color-text-primary)]">Schedule</h2>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)]">
              <input
                type="checkbox"
                id="publish-now"
                checked={publishNow}
                onChange={e => setPublishNow(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
              />
              <label htmlFor="publish-now" className="text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">
                Publish immediately (quiz goes live right after saving)
              </label>
            </div>

            {!publishNow && (
              <Field label="Scheduled Date & Time" hint="Quiz becomes available to students at this time">
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                />
              </Field>
            )}
          </div>

          {/* Summary */}
          <div className="card p-4 bg-[var(--color-muted)]">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Summary</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Title</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{title || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Questions</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{selectedQIds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Duration</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Classes</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {assignedClassIds.length > 0
                    ? facultyClasses.filter(c => assignedClassIds.includes(c.id)).map(c => `${c.section}`).join(', ')
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/faculty/quizzes')}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        {step < steps.length - 1 ? (
          <Button
            disabled={!canNext}
            onClick={() => setStep(s => s + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next: {steps[step + 1]}
          </Button>
        ) : (
          <Button
            disabled={!canNext}
            isLoading={saving}
            onClick={handleSave}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {publishNow ? 'Publish Quiz' : 'Save & Schedule'}
          </Button>
        )}
      </div>

      </div>
    </div>
  );
};
