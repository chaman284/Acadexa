// ============================================================================
// ACADEXA EXAM MODE INTERFACE
// Formal, distraction-free assessment environment with question palette,
// review flagging, countdown timer, and safe submission verification.
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Flag, CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle,
  HelpCircle, Shield, X, Code, Check, ArrowLeft,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Quiz, QuizQuestion, QuestionResponse, QuizAttempt } from '../types/quizTypes';
import { quizEvaluationService } from '../services/quizEvaluationService';

interface ExamInterfaceProps {
  quiz: Quiz;
  studentName?: string;
  studentRollNo?: string;
  onFinish: (attempt: QuizAttempt) => void;
  onExit: () => void;
  isPreview?: boolean;
}

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  quiz,
  studentName = 'Demo Student',
  studentRollNo = 'CS23B101',
  onFinish,
  onExit,
  isPreview = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];

  // User responses keyed by question.id
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(
    (quiz.settings.exam.durationMinutes || 20) * 60
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Response handlers
  const handleSingleSelect = (optionId: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOptionIds: [optionId],
        timeTakenSeconds: 0,
        isAnswered: true,
        isFlaggedForReview: prev[currentQuestion.id]?.isFlaggedForReview,
      },
    }));
  };

  const handleMultiSelect = (optionId: string) => {
    const existing = responses[currentQuestion.id]?.selectedOptionIds || [];
    const updated = existing.includes(optionId)
      ? existing.filter(x => x !== optionId)
      : [...existing, optionId];

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOptionIds: updated,
        timeTakenSeconds: 0,
        isAnswered: updated.length > 0,
        isFlaggedForReview: prev[currentQuestion.id]?.isFlaggedForReview,
      },
    }));
  };

  const handleTextAnswerChange = (val: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        textResponse: val,
        timeTakenSeconds: 0,
        isAnswered: val.trim().length > 0,
        isFlaggedForReview: prev[currentQuestion.id]?.isFlaggedForReview,
      },
    }));
  };

  const toggleFlagForReview = () => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        questionId: currentQuestion.id,
        timeTakenSeconds: 0,
        isAnswered: !!prev[currentQuestion.id]?.isAnswered,
        isFlaggedForReview: !prev[currentQuestion.id]?.isFlaggedForReview,
      },
    }));
  };

  const handleSubmitAttempt = () => {
    const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    const attempt = quizEvaluationService.evaluateAttempt(
      quiz,
      {
        id: 'stud_demo_1',
        name: studentName,
        rollNo: studentRollNo,
        className: quiz.assignedClasses[0]?.name || 'Section A',
      },
      responses,
      'exam',
      totalDuration
    );
    onFinish(attempt);
  };

  // Metrics for submission summary
  const answeredCount = questions.filter(q => responses[q.id]?.isAnswered).length;
  const flaggedCount = questions.filter(q => responses[q.id]?.isFlaggedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Formal Exam Bar */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
            title="Exit assessment"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block flex-shrink-0" />

          <div className="w-8 h-8 rounded-xl bg-[var(--color-oxblood)] flex items-center justify-center text-white font-serif font-black shadow-xs flex-shrink-0">
            A
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white truncate max-w-[220px] sm:max-w-md">{quiz.title}</h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700 hidden sm:inline">
                Exam Mode
              </span>
              {isPreview && (
                <Badge color="amber" className="text-[10px]">Preview</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {quiz.subjectCode} · {studentName} ({studentRollNo})
            </p>
          </div>
        </div>

        {/* Timer & Submit Action */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border ${
              secondsRemaining < 300
                ? 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse'
                : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowSubmitModal(true)}
            className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold"
          >
            Finish Exam
          </Button>

          {isPreview && (
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-white p-1"
              title="Exit Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full h-1 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-[var(--color-accent)] to-emerald-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Layout: Left Question Panel & Right Navigation Palette */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[550px]">
          <div>
            {/* Top row */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <Badge color="gray">{currentQuestion.marks} marks</Badge>
                {quiz.settings.exam.negativeMarkingEnabled && (
                  <span className="text-xs text-rose-600 font-medium">
                    (-{quiz.settings.exam.negativeMarksValue} for wrong)
                  </span>
                )}
              </div>

              {quiz.settings.exam.allowMarkForReview && (
                <button
                  type="button"
                  onClick={toggleFlagForReview}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                    responses[currentQuestion.id]?.isFlaggedForReview
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 text-amber-500" />
                  {responses[currentQuestion.id]?.isFlaggedForReview
                    ? 'Flagged for Review'
                    : 'Mark for Review'}
                </button>
              )}
            </div>

            {/* Question Text */}
            <h3 className="text-base md:text-lg font-semibold text-slate-900 leading-relaxed mb-6">
              {currentQuestion.text}
            </h3>

            {/* Code Snippet for Code Output Questions */}
            {currentQuestion.codeSnippet && (
              <div className="mb-6 rounded-xl bg-slate-900 p-4 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
                <pre>{currentQuestion.codeSnippet}</pre>
              </div>
            )}

            {/* Answer Controls based on Type */}
            {(currentQuestion.type === 'mcq' || currentQuestion.type === 'true-false') && (
              <div className="space-y-3">
                {currentQuestion.options?.map((opt, i) => {
                  const isChecked = responses[currentQuestion.id]?.selectedOptionIds?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSingleSelect(opt.id)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[var(--color-accent)] bg-rose-50/20 ring-1 ring-[var(--color-accent)]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'border-2 border-slate-300'
                        }`}
                      >
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-xs text-slate-400">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="text-sm font-medium text-slate-800">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'multi-select' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 italic mb-2">
                  Select all options that apply (multiple choices are correct):
                </p>
                {currentQuestion.options?.map((opt, i) => {
                  const isChecked = responses[currentQuestion.id]?.selectedOptionIds?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleMultiSelect(opt.id)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[var(--color-accent)] bg-rose-50/20 ring-1 ring-[var(--color-accent)]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'border-2 border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs text-slate-400">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className="text-sm font-medium text-slate-800">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'fill-blank' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Type Your Exact Answer
                </label>
                <input
                  type="text"
                  value={responses[currentQuestion.id]?.textResponse || ''}
                  onChange={e => handleTextAnswerChange(e.target.value)}
                  placeholder="Enter your blank value here..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-medium"
                />
              </div>
            )}

            {currentQuestion.type === 'code-output' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Console Output Result
                </label>
                <input
                  type="text"
                  value={responses[currentQuestion.id]?.textResponse || ''}
                  onChange={e => handleTextAnswerChange(e.target.value)}
                  placeholder="e.g. 30 20 10"
                  className="w-full border border-slate-300 rounded-xl p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            )}

            {currentQuestion.type === 'short-answer' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Descriptive Explanation
                </label>
                <textarea
                  rows={5}
                  value={responses[currentQuestion.id]?.textResponse || ''}
                  onChange={e => handleTextAnswerChange(e.target.value)}
                  placeholder="Write your explanation or reasoning here..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            )}
          </div>

          {/* Bottom Nav Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(i => i - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentIndex(i => i + 1)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next Question
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowSubmitModal(true)}
                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
              >
                Review &amp; Submit
              </Button>
            )}
          </div>
        </div>

        {/* Right Palette Panel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Question Palette
            </h4>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Answered ({answeredCount})
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Flagged ({flaggedCount})
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full bg-slate-300" /> Pending ({unansweredCount})
              </span>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const resp = responses[q.id];
                const isAnswered = !!resp?.isAnswered;
                const isFlagged = !!resp?.isFlaggedForReview;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs transition-all relative cursor-pointer ${
                      isCurrent ? 'ring-2 ring-slate-900 ring-offset-1' : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-600 text-white'
                        : isFlagged
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Confirm Exam Submission</h4>
                <p className="text-xs text-slate-500">Are you sure you want to finalize your exam?</p>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="grid grid-cols-3 gap-2 text-center p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <p className="font-bold text-lg text-emerald-600">{answeredCount}</p>
                <p className="text-slate-500">Answered</p>
              </div>
              <div>
                <p className="font-bold text-lg text-amber-600">{flaggedCount}</p>
                <p className="text-slate-500">Flagged</p>
              </div>
              <div>
                <p className="font-bold text-lg text-slate-500">{unansweredCount}</p>
                <p className="text-slate-500">Unanswered</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                You have {unansweredCount} unanswered questions remaining. You can still return and answer them before time runs out.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowSubmitModal(false)}>
                Return to Exam
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitAttempt}
                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold"
              >
                Submit &amp; End Exam
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">Leave Examination?</h4>
                <p className="text-xs text-slate-500">Your exam session will be terminated and responses discarded.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to exit? You will return to the assessment catalog.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowExitConfirm(false)}>
                Continue Exam
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white font-bold"
              >
                Yes, Exit Assessment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
