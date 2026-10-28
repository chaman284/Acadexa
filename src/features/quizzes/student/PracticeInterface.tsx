// ============================================================================
// ACADEXA PRACTICE MODE INTERFACE
// Unified UI/UX pattern matching Exam Mode, with a playful, interactive
// design using curated matching colors, instant feedback, streaks, and hints.
// ============================================================================
import React, { useState, useRef } from 'react';
import {
  Flame, Star, Lightbulb, CheckCircle2, XCircle, ChevronRight,
  RotateCcw, ArrowRight, Trophy, Sparkles, X, Check, ArrowLeft,
  ChevronLeft, Award, HelpCircle, Volume2, VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Quiz, QuizQuestion, QuizAttempt, QuestionResponse } from '../types/quizTypes';
import { quizEvaluationService } from '../services/quizEvaluationService';

interface PracticeInterfaceProps {
  quiz: Quiz;
  studentName?: string;
  studentRollNo?: string;
  onFinish: (attempt: QuizAttempt) => void;
  onExit: () => void;
  isPreview?: boolean;
}

// ─── Curated Playful Matching Color Themes ─────────────────────────────────
const PLAYFUL_OPTION_THEMES = [
  {
    letter: 'A',
    idleBorder: 'border-violet-200 hover:border-violet-400',
    idleBg: 'bg-violet-50/60 hover:bg-violet-100/70',
    badgeBg: 'bg-violet-600 text-white',
    textColor: 'text-violet-950',
    accentRing: 'ring-violet-400',
  },
  {
    letter: 'B',
    idleBorder: 'border-emerald-200 hover:border-emerald-400',
    idleBg: 'bg-emerald-50/60 hover:bg-emerald-100/70',
    badgeBg: 'bg-emerald-600 text-white',
    textColor: 'text-emerald-950',
    accentRing: 'ring-emerald-400',
  },
  {
    letter: 'C',
    idleBorder: 'border-amber-200 hover:border-amber-400',
    idleBg: 'bg-amber-50/60 hover:bg-amber-100/70',
    badgeBg: 'bg-amber-600 text-white',
    textColor: 'text-amber-950',
    accentRing: 'ring-amber-400',
  },
  {
    letter: 'D',
    idleBorder: 'border-rose-200 hover:border-rose-400',
    idleBg: 'bg-rose-50/60 hover:bg-rose-100/70',
    badgeBg: 'bg-rose-600 text-white',
    textColor: 'text-rose-950',
    accentRing: 'ring-rose-400',
  },
];

const playAudioFeedback = (
  type: 'correct' | 'wrong' | 'pop' | 'streak' | 'hint' | 'submit' | 'victory',
  isMuted: boolean = false
) => {
  if (isMuted) return;
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (type === 'correct') {
      // Harmonic 4-note ascending chord (C5 - E5 - G5 - C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.14, now + i * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.38);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.42);
      });
    } else if (type === 'wrong') {
      // Gentle warm low frequency thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'streak') {
      // Celebratory streak milestone fanfare
      const notes = [587.33, 739.99, 880.0, 1174.66];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.45);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.5);
      });
    } else if (type === 'hint') {
      // Twinkling soft hint chime
      [880, 1318.51, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.05);
        gain.gain.linearRampToValueAtTime(0.09, now + i * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.3);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.35);
      });
    } else if (type === 'submit') {
      // Tactile button confirmation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'victory') {
      // Triumphant victory fanfare (C5, G5, C6, E6, G6)
      const notes = [523.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.16, now + i * 0.09 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.6);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.65);
      });
    } else {
      // Pop / click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (_) {}
};

export const PracticeInterface: React.FC<PracticeInterfaceProps> = ({
  quiz,
  studentName = 'Demo Student',
  studentRollNo = 'CS23B101',
  onFinish,
  onExit,
  isPreview = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const questions = quiz.questions;
  const current = questions[currentIndex];

  // Responses dictionary
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [answeredState, setAnsweredState] = useState<Record<number, { isAnswered: boolean; isCorrect: boolean }>>({});

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const startTimeRef = useRef(Date.now());

  const currentStatus = answeredState[currentIndex];
  const hasAnsweredCurrent = !!currentStatus?.isAnswered;
  const isCurrentCorrect = !!currentStatus?.isCorrect;

  // Single choice selection
  const handleSingleOptionSelect = (optId: string, isOptCorrect: boolean) => {
    if (hasAnsweredCurrent) return;

    if (isOptCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setHighestStreak(h => Math.max(h, newStreak));
      setPoints(p => p + 100 + streak * 25);
      if (newStreak >= 3 && newStreak % 3 === 0) {
        playAudioFeedback('streak', isMuted);
      } else {
        playAudioFeedback('correct', isMuted);
      }
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'],
      });
    } else {
      playAudioFeedback('wrong', isMuted);
      setStreak(0);
    }

    setResponses(prev => ({
      ...prev,
      [current.id]: {
        questionId: current.id,
        selectedOptionIds: [optId],
        timeTakenSeconds: 0,
        isAnswered: true,
      },
    }));

    setAnsweredState(prev => ({
      ...prev,
      [currentIndex]: { isAnswered: true, isCorrect: isOptCorrect },
    }));
  };

  // Multi select toggle
  const handleToggleMulti = (optId: string) => {
    if (hasAnsweredCurrent) return;
    setMultiSelected(prev =>
      prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId]
    );
  };

  // Submit multi select
  const handleSubmitMulti = () => {
    if (hasAnsweredCurrent || multiSelected.length === 0) return;
    const correctIds = current.options?.filter(o => o.isCorrect).map(o => o.id) || [];
    const isAllCorrect =
      correctIds.length === multiSelected.length &&
      correctIds.every(id => multiSelected.includes(id));

    playAudioFeedback('submit', isMuted);
    setTimeout(() => {
      if (isAllCorrect) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setHighestStreak(h => Math.max(h, newStreak));
        setPoints(p => p + 120 + streak * 30);
        if (newStreak >= 3 && newStreak % 3 === 0) {
          playAudioFeedback('streak', isMuted);
        } else {
          playAudioFeedback('correct', isMuted);
        }
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'],
        });
      } else {
        playAudioFeedback('wrong', isMuted);
        setStreak(0);
      }
    }, 100);

    setResponses(prev => ({
      ...prev,
      [current.id]: {
        questionId: current.id,
        selectedOptionIds: multiSelected,
        timeTakenSeconds: 0,
        isAnswered: true,
      },
    }));

    setAnsweredState(prev => ({
      ...prev,
      [currentIndex]: { isAnswered: true, isCorrect: isAllCorrect },
    }));
  };

  // Submit text / blank / code output answer
  const handleSubmitText = () => {
    if (hasAnsweredCurrent || !textInput.trim()) return;
    const normalized = textInput.trim().toLowerCase();
    const accepted = (current.acceptedAnswers || [current.expectedAnswer || '']).map(a =>
      a.trim().toLowerCase()
    );
    const matched = accepted.some(a => (current.caseSensitive ? a === textInput.trim() : a === normalized));

    playAudioFeedback('submit', isMuted);
    setTimeout(() => {
      if (matched) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setHighestStreak(h => Math.max(h, newStreak));
        setPoints(p => p + 110 + streak * 25);
        if (newStreak >= 3 && newStreak % 3 === 0) {
          playAudioFeedback('streak', isMuted);
        } else {
          playAudioFeedback('correct', isMuted);
        }
        confetti({
          particleCount: 70,
          spread: 65,
          origin: { y: 0.6 },
        });
      } else {
        playAudioFeedback('wrong', isMuted);
        setStreak(0);
      }
    }, 100);

    setResponses(prev => ({
      ...prev,
      [current.id]: {
        questionId: current.id,
        textResponse: textInput,
        timeTakenSeconds: 0,
        isAnswered: true,
      },
    }));

    setAnsweredState(prev => ({
      ...prev,
      [currentIndex]: { isAnswered: true, isCorrect: matched },
    }));
  };

  const handleNext = () => {
    playAudioFeedback('pop', isMuted);
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setShowHint(false);
      setTextInput(responses[questions[nextIdx]?.id]?.textResponse || '');
      setMultiSelected(responses[questions[nextIdx]?.id]?.selectedOptionIds || []);
    } else {
      handleCompleteSession();
    }
  };

  const handlePrevious = () => {
    playAudioFeedback('pop', isMuted);
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setShowHint(false);
      setTextInput(responses[questions[prevIdx]?.id]?.textResponse || '');
      setMultiSelected(responses[questions[prevIdx]?.id]?.selectedOptionIds || []);
    }
  };

  const handleCompleteSession = () => {
    playAudioFeedback('victory', isMuted);
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
      'practice',
      totalDuration
    );
    setIsCompleted(true);
    onFinish(attempt);
  };

  const handleRetryMistakes = () => {
    const wrongIndex = Object.entries(answeredState).find(([_, s]) => !s.isCorrect);
    if (wrongIndex) {
      const idx = Number(wrongIndex[0]);
      setCurrentIndex(idx);
      setShowHint(false);
      setAnsweredState(prev => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
      setIsCompleted(false);
    }
  };

  // Completion screen
  if (isCompleted) {
    const totalCount = questions.length;
    const correctCount = Object.values(answeredState).filter(s => s.isCorrect).length;
    const percentage = Math.round((correctCount / Math.max(1, totalCount)) * 100);

    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#302A2B] flex flex-col items-center justify-center p-6 animate-fade-in font-sans">
        <div className="max-w-md w-full bg-white border-2 border-[#E1D4CA] rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top festive banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 via-amber-500 to-emerald-500" />

          <div className="w-20 h-20 rounded-full mx-auto bg-amber-100 text-amber-600 border-2 border-amber-300 flex items-center justify-center shadow-md animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-serif text-[#302A2B]">Practice Completed!</h2>
            <p className="text-xs text-[#79666A] mt-1">{quiz.title}</p>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#F7F1E8] rounded-2xl border border-[#E1D4CA] text-xs">
            <div>
              <p className="text-2xl font-black text-amber-600">{points}</p>
              <p className="text-[#79666A] font-bold mt-0.5">Total XP</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">{percentage}%</p>
              <p className="text-[#79666A] font-bold mt-0.5">Mastery</p>
            </div>
            <div>
              <p className="text-2xl font-black text-violet-600">
                {correctCount}/{totalCount}
              </p>
              <p className="text-[#79666A] font-bold mt-0.5">Correct</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {correctCount < totalCount && (
              <Button
                onClick={handleRetryMistakes}
                className="w-full !bg-amber-600 hover:!bg-amber-700 !text-white font-bold"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Retry Missed Questions
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onExit}
              className="w-full !border-[#E1D4CA] !text-[#542536] font-bold"
            >
              Return to Quizzes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#302A2B] flex flex-col font-sans select-none relative">
      {/* ── Top Header (Unified UI/UX Pattern) ── */}
      <header className="h-16 px-4 sm:px-6 bg-white border-b border-[#E1D4CA] flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left: Exit + Title + Mode Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E1D4CA] text-[#542536] hover:bg-[#542536]/10 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 flex-shrink-0"
            title="Exit practice"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="h-5 w-px bg-[#E1D4CA] hidden sm:block flex-shrink-0" />

          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
            <Flame className="w-4 h-4 fill-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#302A2B] truncate max-w-[200px] sm:max-w-md">
                {quiz.title}
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 hidden sm:inline">
                Practice Mode
              </span>
              {isPreview && (
                <Badge color="amber" className="text-[10px]">Preview</Badge>
              )}
            </div>
            <p className="text-xs text-[#79666A] truncate">
              {quiz.subjectCode} · Self-Paced Learning
            </p>
          </div>
        </div>

        {/* Right: Streak & XP & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Sound Mute/Unmute Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMuted(m => !m)}
            className="p-2 rounded-xl border border-[#E1D4CA] text-[#79666A] hover:text-[#542536] hover:bg-slate-50 transition-all cursor-pointer shadow-xs active:scale-95"
            title={isMuted ? 'Unmute practice sounds' : 'Mute practice sounds'}
            aria-label={isMuted ? 'Unmute practice sounds' : 'Mute practice sounds'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Streak Flame Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/90 text-amber-800 border border-amber-300 text-xs font-bold shadow-xs">
            <Flame className="w-4 h-4 text-amber-600 fill-amber-500 animate-pulse" />
            <span>{streak} Streak</span>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-100/90 text-violet-800 border border-violet-300 text-xs font-bold shadow-xs">
            <Star className="w-4 h-4 text-violet-600 fill-violet-500" />
            <span>{points} XP</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCompleteSession}
            className="!border-[#E1D4CA] !text-[#542536] font-bold hidden sm:flex"
          >
            End Practice
          </Button>

          {isPreview && (
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              title="Exit Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ── Progress Bar (Unified Dual-tone Fill) ── */}
      <div className="w-full h-1.5 bg-[#EAE2D8]">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-violet-500 to-emerald-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* ── Question Stage (Centered Card Matching Exam Pattern) ── */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-between">
        <div className="bg-white rounded-3xl border-2 border-[#E1D4CA] shadow-lg p-6 sm:p-8 space-y-6">
          {/* Question Meta Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E1D4CA]/60 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold uppercase tracking-wider text-[#79666A]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-violet-100 text-violet-800 border border-violet-200">
                +{current.marks * 50 || 100} XP
              </span>
              <Badge
                color={
                  current.difficulty === 'easy'
                    ? 'green'
                    : current.difficulty === 'medium'
                    ? 'amber'
                    : 'red'
                }
              >
                {current.difficulty}
              </Badge>
              {current.metadata?.topicName && (
                <span className="text-[#79666A] font-semibold hidden md:inline">
                  • {current.metadata.topicName}
                </span>
              )}
            </div>

            {/* Hint Button */}
            {current.hint && (
              <button
                type="button"
                onClick={() => {
                  if (!showHint) playAudioFeedback('hint', isMuted);
                  setShowHint(h => !h);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
              </button>
            )}
          </div>

          {/* Hint Reveal Box */}
          {showHint && current.hint && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-3 animate-fade-in shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-950 mb-0.5">Helpful Concept Hint</p>
                <p className="leading-relaxed font-medium">{current.hint}</p>
              </div>
            </div>
          )}

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#302A2B] leading-relaxed">
            {current.text}
          </h2>

          {/* Code Snippet for Code Output Questions */}
          {current.codeSnippet && (
            <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner">
              <pre>{current.codeSnippet}</pre>
            </div>
          )}

          {/* ── Playful Matching Option Cards ── */}
          {(current.type === 'mcq' || current.type === 'true-false' || !current.type) && (
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              {(current.options && current.options.length > 0
                ? current.options
                : [
                    { id: 'opt_true', text: 'True', isCorrect: true },
                    { id: 'opt_false', text: 'False', isCorrect: false },
                  ]
              ).map((opt, i) => {
                const theme = PLAYFUL_OPTION_THEMES[i % PLAYFUL_OPTION_THEMES.length];
                const selectedOptId = responses[current.id]?.selectedOptionIds?.[0];
                const isSelected = selectedOptId === opt.id;
                const isOptCorrect = !!opt.isCorrect;

                let cardClasses = `p-5 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 ${theme.idleBorder} ${theme.idleBg} ${theme.textColor}`;

                if (hasAnsweredCurrent) {
                  if (isSelected && isOptCorrect) {
                    cardClasses =
                      'p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-100 text-emerald-950 shadow-md ring-2 ring-emerald-400/50 scale-[1.01]';
                  } else if (isSelected && !isOptCorrect) {
                    cardClasses =
                      'p-5 rounded-2xl border-2 border-rose-500 bg-rose-100 text-rose-950 shadow-md ring-2 ring-rose-400/50';
                  } else if (!isSelected && isOptCorrect) {
                    cardClasses =
                      'p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-300';
                  } else {
                    cardClasses =
                      'p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSingleOptionSelect(opt.id, isOptCorrect)}
                    disabled={hasAnsweredCurrent}
                    className={cardClasses}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs ${
                        hasAnsweredCurrent && isOptCorrect
                          ? 'bg-emerald-600 text-white'
                          : hasAnsweredCurrent && isSelected && !isOptCorrect
                          ? 'bg-rose-600 text-white'
                          : theme.badgeBg
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-bold flex-1 leading-snug">{opt.text}</span>
                    {hasAnsweredCurrent && isOptCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-bounce" />
                    )}
                    {hasAnsweredCurrent && isSelected && !isOptCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Multi-select in Practice Mode */}
          {current.type === 'multi-select' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-violet-800 bg-violet-50 p-2.5 rounded-xl border border-violet-200">
                ✨ Playful Challenge: Select all options that apply, then click &quot;Submit Choices&quot;
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {current.options?.map((opt, i) => {
                  const theme = PLAYFUL_OPTION_THEMES[i % PLAYFUL_OPTION_THEMES.length];
                  const isChecked = multiSelected.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleMulti(opt.id)}
                      disabled={hasAnsweredCurrent}
                      className={`p-5 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-violet-500 bg-violet-100/90 text-violet-950 shadow-md ring-2 ring-violet-400/50'
                          : `${theme.idleBorder} ${theme.idleBg} ${theme.textColor}`
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked ? 'bg-violet-600 text-white' : 'border-2 border-violet-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-sm font-bold flex-1">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {!hasAnsweredCurrent && (
                <Button
                  onClick={handleSubmitMulti}
                  disabled={multiSelected.length === 0}
                  className="!bg-violet-600 hover:!bg-violet-700 !text-white font-bold"
                >
                  Submit Choices
                </Button>
              )}
            </div>
          )}

          {/* Fill in Blanks or Code Output in Practice Mode */}
          {(current.type === 'fill-blank' || current.type === 'code-output') && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#79666A] uppercase tracking-wide">
                Type your answer &amp; test your understanding:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  disabled={hasAnsweredCurrent}
                  placeholder="Enter expected answer..."
                  className="flex-1 border-2 border-[#E1D4CA] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-400/30 font-mono"
                />
                {!hasAnsweredCurrent && (
                  <Button
                    onClick={handleSubmitText}
                    disabled={!textInput.trim()}
                    className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold"
                  >
                    Check Answer
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── Instant Playful Feedback Banner ── */}
          {hasAnsweredCurrent && (
            <div
              className={`p-5 rounded-2xl border-2 flex items-start gap-4 animate-fade-in shadow-md ${
                isCurrentCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                  isCurrentCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {isCurrentCorrect ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm">
                    {isCurrentCorrect ? 'Brilliant! Correct Answer' : 'Not Quite — Learning Opportunity'}
                  </h4>
                  {isCurrentCorrect && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      +{current.marks * 50 || 100} XP Earned
                    </span>
                  )}
                </div>
                {current.explanation ? (
                  <p className="text-xs leading-relaxed opacity-90">{current.explanation}</p>
                ) : (
                  <p className="text-xs leading-relaxed opacity-80">
                    Review this topic in your lecture syllabus notes to solidify this concept.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom Navigation Strip ── */}
        <div className="pt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className="!border-[#E1D4CA] !text-[#542536] font-bold"
          >
            Previous
          </Button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setCurrentIndex(i);
                  setShowHint(false);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  i === currentIndex
                    ? 'w-6 bg-[#542536]'
                    : answeredState[i]?.isCorrect
                    ? 'bg-emerald-500'
                    : answeredState[i]?.isAnswered
                    ? 'bg-rose-400'
                    : 'bg-[#E1D4CA]'
                }`}
                title={`Question ${i + 1}`}
              />
            ))}
          </div>

          <Button
            size="lg"
            onClick={handleNext}
            className={`font-bold ${
              currentIndex === questions.length - 1
                ? '!bg-emerald-600 hover:!bg-emerald-700 !text-white'
                : '!bg-[#542536] hover:!bg-[#381622] !text-white'
            }`}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {currentIndex === questions.length - 1 ? 'Complete Practice' : 'Next Question'}
          </Button>
        </div>
      </main>
    </div>
  );
};
