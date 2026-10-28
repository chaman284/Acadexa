// ============================================================================
// ACADEXA 4-STEP GUIDED QUIZ BUILDER PAGE
// Flagship hybrid builder integrating Manual, Library, AI, and Document sources
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Check, BookOpen, Layers,
  Sliders, ShieldCheck, GraduationCap, Eye, Save, Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type {
  Quiz, QuizQuestion, Question, QuizCategory, QuizMode,
  AssignedClass, QuizSettings,
} from '../types/quizTypes';
import { quizService } from '../services/quizService';
import { CURRICULUM_DATA, MOCK_CLASSES } from '../constants/curriculumData';

// Subcomponents
import { QuizDetailsForm } from '../components/QuizDetailsForm';
import { QuestionList } from '../components/QuestionList';
import { QuizSettingsForm } from '../components/QuizSettingsForm';
import { QuizReviewPanel } from '../components/QuizReviewPanel';

// Question source modals
import { ManualQuestionEditor } from '../question-sources/ManualQuestionEditor';
import { QuestionLibraryModal } from '../question-sources/QuestionLibraryModal';
import { AiQuestionGeneratorModal } from '../question-sources/AiQuestionGeneratorModal';
import { DocumentQuestionGeneratorModal } from '../question-sources/DocumentQuestionGeneratorModal';

const STEPS = ['Quiz Details', 'Add Questions', 'Quiz Settings', 'Review & Publish'];

export const QuizBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: editQuizId } = useParams<{ id: string }>();
  const location = useLocation();

  const locationState = location.state as {
    topicId?: string;
    topicName?: string;
    subjectId?: string;
    remedial?: boolean;
    title?: string;
  } | null;

  // Active step index (0 - 3)
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Details
  const [title, setTitle] = useState(
    locationState?.title ||
    (locationState?.remedial ? `Remedial Practice: ${locationState.topicName || 'Core Concepts'}` : '')
  );
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuizCategory>(
    locationState?.remedial ? 'Remedial Practice' : 'Weekly Assessment'
  );
  const [mode, setMode] = useState<QuizMode>(locationState?.remedial ? 'practice' : 'exam');
  const [semester, setSemester] = useState<number>(3);
  const [subjectId, setSubjectId] = useState<string>(locationState?.subjectId || CURRICULUM_DATA[0].id);
  const [unitIds, setUnitIds] = useState<string[]>([CURRICULUM_DATA[0].units[0]?.id || '']);
  const [topicIds, setTopicIds] = useState<string[]>([
    locationState?.topicId || CURRICULUM_DATA[0].units[0]?.topics[0]?.id || '',
  ]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [scheduledStart, setScheduledStart] = useState<string>('');
  const [scheduledEnd, setScheduledEnd] = useState<string>('');

  // Step 2: Questions (Unified list)
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Step 3: Settings
  const [settings, setSettings] = useState<QuizSettings>({
    mode: 'exam',
    exam: {
      durationMinutes: 25,
      maxAttempts: 1,
      randomizeQuestions: true,
      randomizeOptions: true,
      allowNavigation: true,
      allowRevisit: true,
      allowMarkForReview: true,
      showCorrectAnswersAfterSubmission: false,
      showExplanationsAfterSubmission: false,
      resultRelease: 'immediate',
      negativeMarkingEnabled: false,
      negativeMarksValue: 0.5,
      autoSubmitOnTimeout: true,
      instructions: 'Please answer all questions independently.',
    },
    practice: {
      selfPaced: true,
      showInstantFeedback: true,
      showExplanationsImmediately: true,
      allowRetries: true,
      maxRetriesPerQuestion: 2,
      shuffleQuestions: true,
      enablePointsAndStreaks: true,
      enableLeaderboard: false,
      allowHints: true,
      topicSpecificPractice: true,
    },
  });

  // Modal display states
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Load existing quiz for editing if editQuizId is present
  useEffect(() => {
    if (editQuizId) {
      quizService.getQuizById(editQuizId).then(existing => {
        if (existing) {
          setTitle(existing.title);
          setDescription(existing.description || '');
          setCategory(existing.category);
          setMode(existing.mode);
          setSemester(existing.semester);
          setSubjectId(existing.subjectId);
          setUnitIds(existing.unitIds || []);
          setTopicIds(existing.topicIds || []);
          setAssignedClasses(existing.assignedClasses || []);
          setScheduledStart(existing.scheduledStart || '');
          setScheduledEnd(existing.scheduledEnd || '');
          setQuestions(existing.questions || []);
          if (existing.settings) setSettings(existing.settings);
        }
      });
    }
  }, [editQuizId]);

  // Synchronize settings mode with details mode
  useEffect(() => {
    setSettings(prev => ({ ...prev, mode }));
  }, [mode]);

  // Question Management Callbacks (Non-destructive multi-source addition)
  const handleAddQuestionFromSource = (newQuestions: Question[]) => {
    const formatted: QuizQuestion[] = newQuestions.map((q, idx) => ({
      ...q,
      quizQuestionId: `qq_${Date.now()}_${questions.length + idx}_${Math.random().toString(36).substring(2, 5)}`,
      orderIndex: questions.length + idx,
    }));

    setQuestions(prev => [...prev, ...formatted]);
  };

  const handleSaveManualQuestion = (savedQ: Question) => {
    if (editingQuestion) {
      setQuestions(prev =>
        prev.map(q =>
          q.quizQuestionId === editingQuestion.quizQuestionId
            ? { ...savedQ, quizQuestionId: q.quizQuestionId, orderIndex: q.orderIndex }
            : q
        )
      );
      setEditingQuestion(null);
    } else {
      handleAddQuestionFromSource([savedQ]);
    }
    setShowManualEditor(false);
  };

  const handleDuplicateQuestion = (quizQuestionId: string) => {
    const target = questions.find(q => q.quizQuestionId === quizQuestionId);
    if (!target) return;
    const duplicated: QuizQuestion = {
      ...target,
      quizQuestionId: `qq_dup_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      orderIndex: questions.length,
    };
    setQuestions(prev => [...prev, duplicated]);
  };

  const handleRemoveQuestion = (quizQuestionId: string) => {
    setQuestions(prev => prev.filter(q => q.quizQuestionId !== quizQuestionId));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const copy = [...questions];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Update order indices
    const reordered = copy.map((q, i) => ({ ...q, orderIndex: i }));
    setQuestions(reordered);
  };

  // Build Quiz Payload helper
  const assembleQuizPayload = (status: Quiz['status']): Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'> => {
    const currentSubj = CURRICULUM_DATA.find(s => s.id === subjectId) || CURRICULUM_DATA[0];

    return {
      title: title.trim() || 'Untitled Curriculum Assessment',
      description,
      category,
      mode,
      status,
      department: currentSubj.department,
      semester,
      subjectId: currentSubj.id,
      subjectCode: currentSubj.code,
      subjectName: currentSubj.name,
      unitIds,
      unitNames: currentSubj.units.filter(u => unitIds.includes(u.id)).map(u => u.name),
      topicIds,
      topicNames: currentSubj.units
        .flatMap(u => u.topics)
        .filter(t => topicIds.includes(t.id))
        .map(t => t.name),
      assignedClasses,
      questions,
      totalQuestions: questions.length,
      totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      settings,
      scheduledStart: scheduledStart || undefined,
      scheduledEnd: scheduledEnd || undefined,
    };
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = assembleQuizPayload('draft');
      if (editQuizId) {
        await quizService.updateQuiz(editQuizId, payload);
      } else {
        await quizService.createQuiz(payload);
      }
      navigate('/faculty/quizzes');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishNow = async () => {
    setIsSaving(true);
    try {
      const payload = assembleQuizPayload('active');
      if (editQuizId) {
        await quizService.updateQuiz(editQuizId, payload);
      } else {
        await quizService.createQuiz(payload);
      }
      navigate('/faculty/quizzes');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = async () => {
    setIsSaving(true);
    try {
      const payload = assembleQuizPayload('scheduled');
      if (editQuizId) {
        await quizService.updateQuiz(editQuizId, payload);
      } else {
        await quizService.createQuiz(payload);
      }
      navigate('/faculty/quizzes');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewAsStudent = () => {
    // Navigate to preview page with the in-progress draft state
    const currentSubj = CURRICULUM_DATA.find(s => s.id === subjectId) || CURRICULUM_DATA[0];
    const previewQuiz: Quiz = {
      id: editQuizId || 'quiz_preview_temp',
      title: title || 'Curriculum Assessment Preview',
      description,
      category,
      mode,
      status: 'active',
      department: currentSubj.department,
      semester,
      subjectId: currentSubj.id,
      subjectCode: currentSubj.code,
      subjectName: currentSubj.name,
      unitIds,
      unitNames: [],
      topicIds,
      topicNames: [],
      assignedClasses,
      questions,
      totalMarks: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
      totalQuestions: questions.length,
      settings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    navigate('/faculty/quiz/preview', { state: { previewQuiz } });
  };

  // Step validation rules
  const canProceed = [
    title.trim().length > 0 && subjectId !== '',
    questions.length > 0,
    true, // Settings always valid
    true, // Review panel manages blocking actions
  ][step];

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-16">
      {/* Top Bar */}
      <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (step > 0 ? setStep(s => s - 1) : navigate('/faculty/quizzes'))}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors group cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {step === 0 ? 'Back to Quizzes' : 'Previous Step'}
          </button>

          <div className="h-4 w-px bg-[var(--color-border)]" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--color-oxblood)] rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">
                {editQuizId ? 'Edit Quiz Draft' : 'Create New Assessment'}
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                {title || 'Untitled Quiz'}
              </span>
            </div>
          </div>
        </div>

        {/* Action button in header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Draft
          </Button>

          {step === 1 && questions.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePreviewAsStudent}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Step Indicator Stepper */}
        <div className="flex items-center justify-between relative mb-8">
          {STEPS.map((stepLabel, idx) => {
            const isPassed = idx < step;
            const isCurrent = idx === step;

            return (
              <React.Fragment key={stepLabel}>
                <div
                  onClick={() => idx <= step && setStep(idx)}
                  className={`flex flex-col items-center gap-1.5 cursor-pointer z-10 transition-all ${
                    idx > step ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isPassed
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[var(--color-oxblood)] text-white ring-4 ring-rose-900/20'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent
                        ? 'text-[var(--color-oxblood)] font-bold'
                        : isPassed
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {stepLabel}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${
                      idx < step ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step View Content */}
        {step === 0 && (
          <QuizDetailsForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            mode={mode}
            setMode={setMode}
            semester={semester}
            setSemester={setSemester}
            subjectId={subjectId}
            setSubjectId={setSubjectId}
            unitIds={unitIds}
            setUnitIds={setUnitIds}
            topicIds={topicIds}
            setTopicIds={setTopicIds}
            assignedClasses={assignedClasses}
            setAssignedClasses={setAssignedClasses}
            scheduledStart={scheduledStart}
            setScheduledStart={setScheduledStart}
            scheduledEnd={scheduledEnd}
            setScheduledEnd={setScheduledEnd}
          />
        )}

        {step === 1 && (
          <QuestionList
            questions={questions}
            onOpenManualEditor={() => {
              setEditingQuestion(null);
              setShowManualEditor(true);
            }}
            onOpenLibrarySelector={() => setShowLibraryModal(true)}
            onOpenAiGenerator={() => setShowAiModal(true)}
            onOpenDocumentGenerator={() => setShowDocModal(true)}
            onEditQuestion={q => {
              setEditingQuestion(q);
              setShowManualEditor(true);
            }}
            onDuplicateQuestion={handleDuplicateQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onMoveQuestion={handleMoveQuestion}
          />
        )}

        {step === 2 && (
          <QuizSettingsForm
            mode={mode}
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {step === 3 && (
          <QuizReviewPanel
            title={title}
            description={description}
            subjectName={CURRICULUM_DATA.find(s => s.id === subjectId)?.name || 'Course'}
            subjectCode={CURRICULUM_DATA.find(s => s.id === subjectId)?.code || 'CS'}
            semester={semester}
            assignedClasses={assignedClasses}
            questions={questions}
            settings={settings}
            scheduledStart={scheduledStart}
            onSaveDraft={handleSaveDraft}
            onPreviewAsStudent={handlePreviewAsStudent}
            onSchedule={handleSchedule}
            onPublishNow={handlePublishNow}
            onNavigateToStep={s => setStep(s)}
            isSaving={isSaving}
          />
        )}

        {/* Stepper Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <Button
            variant="outline"
            onClick={() => (step > 0 ? setStep(s => s - 1) : navigate('/faculty/quizzes'))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            {step === 0 ? 'Cancel' : 'Previous Step'}
          </Button>

          {step < STEPS.length - 1 && (
            <Button
              disabled={!canProceed}
              onClick={() => setStep(s => s + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="!bg-[var(--color-oxblood)] hover:!bg-[#3f1927] !text-white font-bold"
            >
              Continue to {STEPS[step + 1]}
            </Button>
          )}
        </div>
      </div>

      {/* Modals for 4 Question Sources */}
      {showManualEditor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-3xl w-full">
            <ManualQuestionEditor
              initialQuestion={editingQuestion}
              defaultSubjectId={subjectId}
              defaultSemester={semester}
              onSave={handleSaveManualQuestion}
              onCancel={() => {
                setShowManualEditor(false);
                setEditingQuestion(null);
              }}
            />
          </div>
        </div>
      )}

      {showLibraryModal && (
        <QuestionLibraryModal
          currentQuizQuestions={questions}
          defaultSubjectId={subjectId}
          defaultSemester={semester}
          onAddQuestions={selected => {
            handleAddQuestionFromSource(selected);
            setShowLibraryModal(false);
          }}
          onClose={() => setShowLibraryModal(false)}
        />
      )}

      {showAiModal && (
        <AiQuestionGeneratorModal
          defaultSubjectId={subjectId}
          defaultSemester={semester}
          onAddQuestions={generated => {
            handleAddQuestionFromSource(generated);
            setShowAiModal(false);
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {showDocModal && (
        <DocumentQuestionGeneratorModal
          defaultSubjectId={subjectId}
          defaultSemester={semester}
          onAddQuestions={fromDoc => {
            handleAddQuestionFromSource(fromDoc);
            setShowDocModal(false);
          }}
          onClose={() => setShowDocModal(false)}
        />
      )}
    </div>
  );
};
