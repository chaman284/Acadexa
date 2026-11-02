import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Check,
  BookOpen, Clock, BarChart2, Layers,
  Plus, Trash2, Sparkles, Users, GraduationCap, CheckCircle2, ShieldCheck,
  X, RefreshCw, HelpCircle, AlertCircle, ArrowRight, Lightbulb,
  Pencil, Key, Settings2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import api from '../../lib/apiClient';
import { questionService } from '../../services/quizService';
import type { Question } from '../../types/quiz';

interface CourseItem {
  id: string;
  name: string;
  code: string;
  semester: number;
  departmentName?: string;
  departmentCode?: string;
}

interface SectionItem {
  id: string;
  name: string;
  section: string;
  semester: number;
  semesterLabel: string;
  departmentName?: string;
  departmentCode?: string;
  studentsCount: number;
}

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
  const location = useLocation();
  const locationState = location.state as {
    title?: string;
    topicId?: string;
    topicName?: string;
    courseId?: string;
    subject?: string;
    sectionId?: string;
    section?: string;
    semester?: string | number;
    remedial?: boolean;
  } | null;

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Available courses & sections loaded from DB
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [dbSections, setDbSections] = useState<SectionItem[]>([]);

  // Step 1 state
  const [title, setTitle] = useState(locationState?.title || '');
  const [selectedSemester, setSelectedSemester] = useState<string>(
    locationState?.semester ? String(locationState.semester).replace(/\D/g, '') : ''
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(locationState?.courseId || '');
  const [subject, setSubject] = useState(locationState?.subject || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [duration, setDuration] = useState(20);

  // Fetch registered courses and sections from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, sectionsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/sections'),
        ]);
        if (Array.isArray(coursesRes.data)) {
          setCourses(coursesRes.data);
          if (locationState?.courseId) {
            const matched = coursesRes.data.find(c => c.id === locationState.courseId);
            if (matched) {
              setSelectedCourseId(matched.id);
              setSelectedSemester(String(matched.semester));
              setSubject(matched.name);
            }
          }
        }
        if (Array.isArray(sectionsRes.data)) {
          setDbSections(sectionsRes.data);
          if (locationState?.sectionId) {
            setAssignedClassIds([locationState.sectionId]);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch courses or sections:', err);
      }
    };
    fetchData();
  }, [location.state]);

  // Filter courses by chosen semester
  const semesterCourses = useMemo(() => {
    if (!selectedSemester) return [];
    return courses.filter(c => (c.semester || 1) === Number(selectedSemester));
  }, [courses, selectedSemester]);

  // Step 2 & AIG state
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [courseTopics, setCourseTopics] = useState<{ id: string; name: string }[]>([]);

  // AIG modal state
  const [isAigModalOpen, setIsAigModalOpen] = useState(false);
  const [aigTopic, setAigTopic] = useState('');
  const [aigDifficulty, setAigDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [aigCognitiveLevel, setAigCognitiveLevel] = useState('CL2_UNDERSTAND');
  const [aigCount, setAigCount] = useState(4);
  const [aigGenerating, setAigGenerating] = useState(false);
  const [aigError, setAigError] = useState<string | null>(null);
  const [aigSuccessNotice, setAigSuccessNotice] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [selectedGeneratedIds, setSelectedGeneratedIds] = useState<string[]>([]);

  // API Key & Edit Question State
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(
    () => localStorage.getItem('acadexa_gemini_key') || ''
  );
  const [showApiKeySetting, setShowApiKeySetting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<{
    id: string;
    text: string;
    difficulty: 'easy' | 'medium' | 'hard';
    cognitiveLevel?: string;
    explanation: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    source: 'generated' | 'available';
  } | null>(null);

  const cleanQuestionText = (text: string): string => {
    if (!text) return '';
    let cleaned = text.trim();
    cleaned = cleaned.replace(/^In\s+[^:]*:\s*/i, '');
    cleaned = cleaned.replace(/\(?Bloom'?s\s+[A-Za-z0-9_]+\)?:\s*/i, '');
    cleaned = cleaned.replace(/^considering\s+[^:]*:\s*/i, '');
    cleaned = cleaned.replace(/^\[[A-Z0-9]{3,10}\]\s*[-—:]?\s*/i, '');
    cleaned = cleaned.replace(/^[A-Z]{2,5}\d{2,4}[A-Z0-9]?\s*[-—:]\s*/i, '');
    cleaned = cleaned.replace(/^(Question\s*\d+|Q\d+)\s*[:.-]\s*/i, '');
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    return cleaned.trim();
  };

  useEffect(() => {
    questionService.getQuestions({ status: 'APPROVED' }).then(res => {
      const approvedOnly = res.filter(q => q.status === 'approved').map(q => ({
        ...q,
        text: cleanQuestionText(q.text),
      }));
      setAvailableQuestions(approvedOnly);
    });
  }, []);

  // Fetch topics for selected course to auto-suggest
  useEffect(() => {
    if (selectedCourseId) {
      questionService.getTopics(selectedCourseId).then(topics => {
        if (Array.isArray(topics) && topics.length > 0) {
          setCourseTopics(topics);
          if (!aigTopic) setAigTopic(topics[0].name);
        }
      });
    }
  }, [selectedCourseId]);

  // Dynamic suggested topics based on selected course name or DB topics
  const suggestedTopics = useMemo(() => {
    if (courseTopics.length > 0) return courseTopics.map(t => t.name);
    const subLower = (subject || '').toLowerCase();
    if (subLower.includes('data structure') || subLower.includes('algorithm')) {
      return ['Binary Search Trees', 'Dynamic Programming', 'Graph Traversal', 'Stacks & Queues', 'Hash Tables'];
    }
    if (subLower.includes('database') || subLower.includes('dbms')) {
      return ['Relational Normalization', 'SQL Joins & Subqueries', 'ACID Transactions', 'Concurrency Control'];
    }
    if (subLower.includes('network')) {
      return ['TCP Congestion Control', 'Subnetting & CIDR', 'Routing Protocols', 'Application Layer'];
    }
    if (subLower.includes('operating system')) {
      return ['Virtual Memory & Paging', 'CPU Scheduling Algorithms', 'Deadlock Detection', 'Process Synchronization'];
    }
    return ['Foundational Concepts', 'Algorithmic Paradigms', 'Architectural Trade-offs', 'Problem Solving'];
  }, [courseTopics, subject]);

  const displayQuestions = availableQuestions;

  // Step 3 state
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [publishNow, setPublishNow] = useState(false);

  // Dynamic sections strictly filtered by selected semester with true student count
  const availableClasses = useMemo(() => {
    if (!selectedSemester) return [];
    const targetSem = Number(selectedSemester);
    const matchingSections = dbSections.filter(s => s.semester === targetSem);

    return matchingSections.map(s => ({
      id: s.id,
      semester: `Semester ${s.semester}`,
      section: `Section ${s.name}`,
      subject: subject || 'Curriculum Course',
      studentsCount: s.studentsCount || 0,
    }));
  }, [dbSections, selectedSemester, subject]);

  const toggleQuestion = (id: string) =>
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleClass = (id: string) =>
    setAssignedClassIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Question Edit Handlers
  const handleOpenEditQuestion = (q: Question, source: 'generated' | 'available') => {
    setEditingQuestion({
      id: q.id,
      text: cleanQuestionText(q.text),
      difficulty: q.difficulty || 'medium',
      cognitiveLevel: q.cognitiveLevel,
      explanation: q.explanation || '',
      options: (q.options || []).map((o, idx) => ({
        id: o.id || `opt_${idx}`,
        text: o.text,
        isCorrect: Boolean(o.isCorrect),
      })),
      source,
    });
  };

  const handleSaveQuestionEdit = async () => {
    if (!editingQuestion) return;
    const { id, text, difficulty, cognitiveLevel, explanation, options, source } = editingQuestion;

    if (!text.trim()) {
      alert('Question text cannot be empty.');
      return;
    }

    if (options.some(o => !o.text.trim())) {
      alert('All 4 options must contain text.');
      return;
    }

    if (!options.some(o => o.isCorrect)) {
      alert('Please select at least one correct option.');
      return;
    }

    const cleanedText = cleanQuestionText(text);
    const sanitizedOptions = options.map((o, idx) => ({
      id: o.id || `opt_${idx}_${Date.now()}`,
      text: o.text.trim(),
      isCorrect: Boolean(o.isCorrect),
    }));

    if (source === 'generated') {
      setGeneratedQuestions(prev =>
        prev.map(q => {
          if (q.id === id) {
            return {
              ...q,
              text: cleanedText,
              difficulty,
              cognitiveLevel: cognitiveLevel as any,
              explanation: explanation.trim(),
              options: sanitizedOptions,
            };
          }
          return q;
        })
      );
    } else {
      setAvailableQuestions(prev =>
        prev.map(q => {
          if (q.id === id) {
            return {
              ...q,
              text: cleanedText,
              difficulty,
              cognitiveLevel: cognitiveLevel as any,
              explanation: explanation.trim(),
              options: sanitizedOptions,
            };
          }
          return q;
        })
      );

      if (!id.startsWith('gen_')) {
        try {
          await questionService.reviewQuestion(id, {
            text: cleanedText,
            difficulty,
            cognitiveLevel,
            explanation: explanation.trim(),
            options: options.map(o => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
            action: 'approve',
          });
        } catch (err) {
          console.warn('Failed to update question in database:', err);
        }
      }
    }

    setEditingQuestion(null);
  };

  // AIG Generation Handler
  const handleGenerateAIG = async () => {
    const topicToUse = aigTopic.trim() || suggestedTopics[0] || subject || 'Curriculum Course';
    setAigGenerating(true);
    setAigError(null);
    try {
      const results = await questionService.generateQuestions({
        subject: subject || 'Curriculum Course',
        topic: topicToUse,
        difficulty: aigDifficulty,
        cognitiveLevel: aigCognitiveLevel,
        bloomsLevel: aigCognitiveLevel,
        count: aigCount,
        subjectId: selectedCourseId || undefined,
        autoApprove: true,
        status: 'APPROVED',
        geminiApiKey: geminiApiKeyInput.trim() || undefined,
      });

      if (results && results.length > 0) {
        const cleanedResults = results.map(q => ({
          ...q,
          text: cleanQuestionText(q.text),
        }));
        setGeneratedQuestions(cleanedResults);
        setSelectedGeneratedIds(cleanedResults.map(q => q.id));
      } else {
        setAigError('No questions could be synthesized. Please refine the topic and try again.');
      }
    } catch (err: any) {
      console.error('Error in AIG generation:', err);
      setAigError(err?.response?.data?.message || err?.message || 'Failed to generate questions with AI.');
    } finally {
      setAigGenerating(false);
    }
  };

  const toggleSelectGenerated = (id: string) => {
    setSelectedGeneratedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllGenerated = () => {
    if (selectedGeneratedIds.length === generatedQuestions.length) {
      setSelectedGeneratedIds([]);
    } else {
      setSelectedGeneratedIds(generatedQuestions.map(q => q.id));
    }
  };

  const handleAddGeneratedToQuiz = () => {
    const chosen = generatedQuestions.filter(q => selectedGeneratedIds.includes(q.id));
    if (chosen.length === 0) {
      setAigError('Please select at least one question to add.');
      return;
    }

    // Prepend to availableQuestions so they appear at the top of the list
    setAvailableQuestions(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filtered = chosen.filter(q => !existingIds.has(q.id));
      return [...filtered, ...prev];
    });

    // Select them in selectedQIds immediately
    setSelectedQIds(prev => {
      const combined = new Set([...chosen.map(q => q.id), ...prev]);
      return Array.from(combined);
    });

    setAigSuccessNotice(`${chosen.length} AI question${chosen.length > 1 ? 's' : ''} generated and selected! Ready to post.`);
    setIsAigModalOpen(false);
    setGeneratedQuestions([]);
    setSelectedGeneratedIds([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedCourseId) {
        const questionsToSend = displayQuestions
          .filter(q => selectedQIds.includes(q.id))
          .map(q => ({
            id: q.id,
            text: q.text,
            difficulty: q.difficulty,
            topicName: q.topicName,
            options: q.options,
            explanation: q.explanation,
            cognitiveLevel: q.cognitiveLevel,
          }));

        const targetSection = assignedClassIds[0] || (availableClasses.length > 0 ? availableClasses[0].id : '') || (dbSections[0]?.id || '');

        await api.post('/quizzes', {
          title: title.trim(),
          subjectId: selectedCourseId,
          sectionId: targetSection,
          duration: Number(duration),
          type: 'WEEKLY',
          scheduledAt: !publishNow && scheduledDate ? new Date(scheduledDate) : undefined,
          questionIds: selectedQIds,
          questions: questionsToSend,
        });
      }
      navigate('/faculty/quizzes');
    } catch (err: any) {
      console.error('Failed to save quiz:', err);
      alert(err?.response?.data?.message || 'Failed to create quiz. Please check requirements.');
    } finally {
      setSaving(false);
    }
  };

  const canNext = [
    title.trim().length > 0 && selectedSemester !== '' && selectedCourseId !== '',
    selectedQIds.length > 0,
    assignedClassIds.length > 0 || availableClasses.length === 0,
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

          <Field label="Quiz Title" hint="Provide a clear, descriptive title for this quiz">
            <input
              className={inputCls}
              placeholder="e.g. Unit 3 Assessment — Binary Search & Trees"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </Field>

          {/* Academic Semester Selector */}
          <Field label="Academic Semester" hint="Choose the target semester for this quiz">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
                const isSelected = selectedSemester === String(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSelectedSemester(String(s));
                      setSelectedCourseId('');
                      setSubject('');
                      setAssignedClassIds([]);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-[var(--color-oxblood)] bg-[var(--color-oxblood)] text-white shadow-xs'
                        : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
                    }`}
                  >
                    Sem {s}
                  </button>
                );
              })}
            </div>
            <select
              className={selectCls}
              value={selectedSemester}
              onChange={e => {
                const sem = e.target.value;
                setSelectedSemester(sem);
                setSelectedCourseId('');
                setSubject('');
                setAssignedClassIds([]);
              }}
              required
            >
              <option value="">-- Or choose from dropdown (1 - 8) --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </Field>

          {/* Course / Subject Dropdown (Filtered by Semester) */}
          <Field
            label="Course / Subject"
            hint={
              !selectedSemester
                ? 'Select a semester above to see registered courses'
                : `Showing courses registered for Semester ${selectedSemester}`
            }
          >
            {semesterCourses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                {semesterCourses.map(c => {
                  const isSelected = selectedCourseId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setSubject(`${c.code} — ${c.name}`);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[var(--color-oxblood)] bg-[rgba(84,37,54,0.06)] ring-1 ring-[var(--color-oxblood)] text-[var(--color-oxblood)] font-bold'
                          : 'border-[var(--color-border)] bg-white text-[var(--color-text-primary)] hover:bg-[var(--color-muted)]'
                      }`}
                    >
                      <span className="font-bold">[{c.code}]</span> {c.name}
                    </button>
                  );
                })}
              </div>
            )}
            <select
              className={selectCls}
              value={selectedCourseId}
              disabled={!selectedSemester}
              onChange={e => {
                const courseId = e.target.value;
                setSelectedCourseId(courseId);
                const found = courses.find(c => c.id === courseId);
                setSubject(found ? `${found.code} — ${found.name}` : '');
              }}
              required
            >
              {!selectedSemester ? (
                <option value="">-- Select a semester first --</option>
              ) : semesterCourses.length === 0 ? (
                <option value="">-- No courses registered for Semester {selectedSemester} --</option>
              ) : (
                <>
                  <option value="">-- Select Course --</option>
                  {semesterCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name} {c.departmentName ? `(${c.departmentName})` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            {selectedSemester && semesterCourses.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-2">
                No courses are registered for Semester {selectedSemester} yet. Please register courses for Semester {selectedSemester} in the Admin Portal.
              </p>
            )}
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
              size="sm"
              variant="primary"
              className="bg-gradient-to-r from-[var(--color-oxblood)] to-[#772840] hover:opacity-95 text-white shadow-sm flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
              onClick={() => {
                if (!aigTopic) setAigTopic(suggestedTopics[0] || subject || '');
                setAigError(null);
                setIsAigModalOpen(true);
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              AI Generate Questions (AIG)
            </Button>
          </div>

          {/* Success notice when AI questions are added */}
          {aigSuccessNotice && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="font-medium">{aigSuccessNotice}</span>
              </div>
              <button
                onClick={() => setAigSuccessNotice(null)}
                className="text-purple-600 hover:text-purple-900 dark:text-purple-300 font-bold ml-2 text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick AIG banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-950 dark:text-purple-200">
                  AI Question Generation (AIG)
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-300">
                  Generate verified questions with Gemini AI, select them, and post the quiz directly.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!aigTopic) setAigTopic(suggestedTopics[0] || subject || '');
                setAigError(null);
                setIsAigModalOpen(true);
              }}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 underline whitespace-nowrap ml-3"
            >
              Launch Generator →
            </button>
          </div>

          {/* Approved questions notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Verified Items Only:</strong> Only questions with <strong>APPROVED</strong> status from the Question Bank are available. Questions generated via AIG are automatically approved for your quiz.
            </span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {displayQuestions.map(q => {
              const selected = selectedQIds.includes(q.id);
              const isAi = q.isAiGenerated || q.id.startsWith('gen_');
              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className="w-full text-left rounded-xl border p-3.5 transition-all shadow-xs cursor-pointer select-none"
                  style={{
                    borderColor: selected ? 'var(--color-oxblood)' : 'var(--color-border)',
                    background: selected ? 'rgba(84,37,54,0.06)' : '#fff',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 transition-all"
                      style={{
                        background: selected ? 'var(--color-oxblood)' : 'transparent',
                        border: selected ? '1px solid var(--color-oxblood)' : '1.5px solid var(--color-border)',
                      }}
                    >
                      {selected && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-[var(--color-text-primary)] font-medium leading-snug">{cleanQuestionText(q.text)}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isAi && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                              AIG
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditQuestion(q, 'available');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-oxblood)] bg-[var(--color-muted)] hover:bg-[rgba(84,37,54,0.08)] rounded-lg border border-[var(--color-border)] transition-all cursor-pointer"
                            title="Edit question text and options"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge color={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'}>
                          {q.difficulty}
                        </Badge>
                        {q.cognitiveLevel && (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {q.cognitiveLevel.replace('CL', 'L')}
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-text-muted)]">{q.topicName || 'General'}</span>
                        {q.correctRate !== undefined && (
                          <>
                            <span className="text-xs text-[var(--color-text-muted)]">·</span>
                            <span className="text-xs text-[var(--color-text-muted)]">{q.correctRate}% correct rate</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-accent)]" />
                <h2 className="font-semibold text-[var(--color-text-primary)]">Assign to Classes</h2>
              </div>
              {selectedSemester && (
                <Badge color="indigo">Semester {selectedSemester}</Badge>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Select which section(s) in Semester {selectedSemester || ''} will receive this quiz.
            </p>

            {availableClasses.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                No sections are registered in the database for Semester {selectedSemester}. Please add sections in the Admin Portal under Sections.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {availableClasses.map(cls => {
                  const assigned = assignedClassIds.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
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
                          <p className="text-xs text-[var(--color-text-muted)] font-medium">
                            {cls.studentsCount} {cls.studentsCount === 1 ? 'student enrolled' : 'students enrolled'}
                          </p>
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
            )}
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
                <span className="text-[var(--color-text-muted)]">Semester</span>
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {selectedSemester ? `Semester ${selectedSemester}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Course</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{subject || '—'}</span>
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
                    ? availableClasses.filter(c => assignedClassIds.includes(c.id)).map(c => `${c.section}`).join(', ')
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

      {/* ── AIG Question Generation Modal ── */}
      <Modal
        isOpen={isAigModalOpen}
        onClose={() => {
          if (!aigGenerating) {
            setIsAigModalOpen(false);
            setGeneratedQuestions([]);
            setSelectedGeneratedIds([]);
            setAigError(null);
          }
        }}
        size="xl"
      >
        <div className="max-h-[78vh] overflow-y-auto pr-1 space-y-4">
          {/* Modal Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    AI Question Generator (AIG)
                  </h3>
                  <Badge color="purple">Gemini 1.5</Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Generate curriculum-aligned MCQs with verified answers and add directly to your quiz.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!aigGenerating) {
                  setIsAigModalOpen(false);
                  setGeneratedQuestions([]);
                  setSelectedGeneratedIds([]);
                  setAigError(null);
                }
              }}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {aigError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{aigError}</span>
            </div>
          )}

          {/* Generator Controls */}
          <div className="space-y-3.5 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
            {/* Target Course Info */}
            <div className="flex items-center justify-between text-xs pb-2.5 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)] font-medium">Target Course:</span>
              <span className="font-bold text-[var(--color-oxblood)] bg-[rgba(84,37,54,0.08)] px-2.5 py-1 rounded-md">
                {subject || 'General Curriculum Course'}
              </span>
            </div>

            {/* Optional Gemini Live Web Grounding Key */}
            <div className="p-2.5 bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Gemini Web-Grounded Research</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeySetting(!showApiKeySetting)}
                  className="text-[11px] text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 font-medium"
                >
                  <Key className="w-3 h-3" />
                  {showApiKeySetting ? 'Hide Settings' : (geminiApiKeyInput ? 'Key Configured ✓' : 'Add Gemini Key')}
                </button>
              </div>
              {showApiKeySetting && (
                <div className="pt-1 space-y-1">
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    Paste your Gemini API key to enable live Google Search grounding for fresh syllabus questions:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={geminiApiKeyInput}
                      onChange={(e) => {
                        setGeminiApiKeyInput(e.target.value);
                        localStorage.setItem('acadexa_gemini_key', e.target.value);
                      }}
                      placeholder="AIzaSy..."
                      className={inputCls}
                    />
                    {geminiApiKeyInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setGeminiApiKeyInput('');
                          localStorage.removeItem('acadexa_gemini_key');
                        }}
                        className="px-2 text-[11px] text-red-600 hover:underline flex-shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Topic Input & Chips */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5">
                Topic or Syllabus Concept <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={aigTopic}
                onChange={e => setAigTopic(e.target.value)}
                placeholder="e.g. Binary Search Trees, Dynamic Programming, Normalization..."
                className={inputCls}
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-[var(--color-text-muted)]">Suggestions:</span>
                {suggestedTopics.slice(0, 5).map(top => (
                  <button
                    key={top}
                    type="button"
                    onClick={() => setAigTopic(top)}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-[var(--color-border)] hover:border-[var(--color-oxblood)] hover:bg-[rgba(84,37,54,0.05)] text-[var(--color-text-secondary)] transition-all"
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>

            {/* Bloom's Level & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5">
                  Bloom's Taxonomy Depth
                </label>
                <select
                  value={aigCognitiveLevel}
                  onChange={e => setAigCognitiveLevel(e.target.value)}
                  className={selectCls}
                >
                  <option value="CL1_REMEMBER">CL1: Remember (Definitions & recall)</option>
                  <option value="CL2_UNDERSTAND">CL2: Understand (Concepts & explanations)</option>
                  <option value="CL3_APPLY">CL3: Apply (Problems & code tracing)</option>
                  <option value="CL4_ANALYZE">CL4: Analyze (Edge cases & complexity)</option>
                  <option value="CL5_EVALUATE">CL5: Evaluate (Tradeoffs & optimization)</option>
                  <option value="CL6_CREATE">CL6: Create (Synthesis & design)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'medium', 'hard'] as const).map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setAigDifficulty(d)}
                      className={`text-xs capitalize py-2 rounded-xl font-semibold border transition-all ${
                        aigDifficulty === d
                          ? 'border-[var(--color-oxblood)] bg-[var(--color-oxblood)] text-white shadow-xs'
                          : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Count & Trigger */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--color-text-primary)] mr-1">Count:</span>
                {[3, 4, 5, 8, 10].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setAigCount(cnt)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      aigCount === cnt
                        ? 'bg-[var(--color-oxblood)] text-white'
                        : 'border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-[var(--color-muted)]'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                onClick={handleGenerateAIG}
                isLoading={aigGenerating}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md text-xs px-4"
                leftIcon={!aigGenerating ? <Sparkles className="w-3.5 h-3.5 text-amber-300" /> : undefined}
              >
                {aigGenerating ? 'Generating with AI…' : `Generate ${aigCount} Questions`}
              </Button>
            </div>
          </div>

          {/* Generated Questions Preview */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                    Generated Preview ({generatedQuestions.length} items)
                  </h4>
                  <Badge color="purple">{selectedGeneratedIds.length} selected</Badge>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAllGenerated}
                  className="text-xs text-[var(--color-oxblood)] hover:underline font-semibold"
                >
                  {selectedGeneratedIds.length === generatedQuestions.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => {
                  const isChecked = selectedGeneratedIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-[var(--color-oxblood)] bg-[rgba(84,37,54,0.03)]'
                          : 'border-[var(--color-border)] bg-white opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleSelectGenerated(q.id)}
                          className="mt-0.5 text-[var(--color-oxblood)] flex-shrink-0"
                        >
                          {isChecked ? (
                            <div className="w-5 h-5 rounded-md bg-[var(--color-oxblood)] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-1.5 border-[var(--color-border)] bg-white" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--color-oxblood)]">
                                Q{idx + 1}.
                              </span>
                              <Badge color={q.difficulty === 'easy' ? 'green' : q.difficulty === 'medium' ? 'amber' : 'red'}>
                                {q.difficulty}
                              </Badge>
                              {q.cognitiveLevel && (
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {q.cognitiveLevel.replace('CL', 'Level ')}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenEditQuestion(q, 'generated')}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg transition-all cursor-pointer"
                              title="Edit question and options"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit Question & Options</span>
                            </button>
                          </div>

                          <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2 leading-relaxed">
                            {cleanQuestionText(q.text)}
                          </p>

                          {/* Options grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={opt.id || oIdx}
                                className={`text-[11px] p-2 rounded-lg border flex items-center gap-1.5 ${
                                  opt.isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                                    : 'bg-[var(--color-muted)]/50 border-[var(--color-border)] text-[var(--color-text-secondary)]'
                                }`}
                              >
                                {opt.isCorrect ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                ) : (
                                  <span className="w-3.5 text-center text-[var(--color-text-muted)] font-mono text-[10px]">
                                    {String.fromCharCode(65 + oIdx)}.
                                  </span>
                                )}
                                <span className="line-clamp-2">{opt.text}</span>
                              </div>
                            ))}
                          </div>

                          {/* Pedagogical Explanation */}
                          {q.explanation && (
                            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span><strong>Rationale:</strong> {q.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateAIG}
                  isLoading={aigGenerating}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Regenerate
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAddGeneratedToQuiz}
                  disabled={selectedGeneratedIds.length === 0}
                  className="bg-gradient-to-r from-[var(--color-oxblood)] to-[#772840] hover:opacity-95 text-white shadow-sm"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Add {selectedGeneratedIds.length} Question{selectedGeneratedIds.length > 1 ? 's' : ''} to Quiz & Select
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Edit Question & Options Modal ── */}
      <Modal
        isOpen={Boolean(editingQuestion)}
        onClose={() => setEditingQuestion(null)}
        title="Edit Question & Options"
        size="lg"
      >
        {editingQuestion && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-300">
              <strong>Exact Question Format:</strong> The question text displays the exact question without any course codes, Bloom&apos;s level prefixes, or condition boilerplate.
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={editingQuestion.text}
                onChange={(e) =>
                  setEditingQuestion({ ...editingQuestion, text: e.target.value })
                }
                placeholder="Enter the exact question..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Difficulty and Cognitive Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1">
                  Difficulty
                </label>
                <select
                  value={editingQuestion.difficulty}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                    })
                  }
                  className={selectCls}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1">
                  Cognitive Level (Bloom&apos;s)
                </label>
                <select
                  value={editingQuestion.cognitiveLevel || 'CL2_UNDERSTAND'}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      cognitiveLevel: e.target.value,
                    })
                  }
                  className={selectCls}
                >
                  <option value="CL1_REMEMBER">CL1: Remember</option>
                  <option value="CL2_UNDERSTAND">CL2: Understand</option>
                  <option value="CL3_APPLY">CL3: Apply</option>
                  <option value="CL4_ANALYZE">CL4: Analyze</option>
                  <option value="CL5_EVALUATE">CL5: Evaluate</option>
                  <option value="CL6_CREATE">CL6: Create</option>
                </select>
              </div>
            </div>

            {/* Options list with Radio selector for isCorrect */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[var(--color-text-primary)]">
                  Answer Options & Correct Answer <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  Click the circle next to an option to mark it as correct
                </span>
              </div>

              <div className="space-y-2.5">
                {editingQuestion.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={opt.id || idx}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                        opt.isCorrect
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                          : 'border-[var(--color-border)] bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingQuestion.options.map((o, i) => ({
                            ...o,
                            isCorrect: i === idx,
                          }));
                          setEditingQuestion({ ...editingQuestion, options: updated });
                        }}
                        className="mt-2 flex items-center justify-center cursor-pointer flex-shrink-0"
                        title="Mark this option as correct"
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            opt.isCorrect
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {opt.isCorrect && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                            Option {letter} {opt.isCorrect && (
                              <span className="ml-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                Correct Answer
                              </span>
                            )}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = [...editingQuestion.options];
                            updated[idx] = { ...updated[idx], text: val };
                            setEditingQuestion({ ...editingQuestion, options: updated });
                          }}
                          placeholder={`Option ${letter} text...`}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pedagogical Explanation */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-primary)] mb-1">
                Pedagogical Explanation / Rationale
              </label>
              <textarea
                rows={2}
                value={editingQuestion.explanation}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    explanation: e.target.value,
                  })
                }
                placeholder="Explain why the selected option is correct and why other options are incorrect..."
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--color-border)]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingQuestion(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveQuestionEdit}
                className="bg-[var(--color-oxblood)] hover:opacity-95 text-white"
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      </div>
    </div>
  );
};
