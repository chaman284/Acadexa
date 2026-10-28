// ============================================================================
// ACADEXA QUIZ SETTINGS FORM (STEP 3)
// Adapts assessment behavior to Exam Mode or Gamified Practice Mode
// ============================================================================
import React from 'react';
import {
  ShieldAlert, Clock, Shuffle, CheckCircle, Award, Eye,
  Lock, Flame, Trophy, HelpCircle, AlertCircle, FileText,
} from 'lucide-react';
import type { QuizSettings, QuizMode } from '../types/quizTypes';

interface QuizSettingsFormProps {
  mode: QuizMode;
  settings: QuizSettings;
  setSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
}

export const QuizSettingsForm: React.FC<QuizSettingsFormProps> = ({
  mode,
  settings,
  setSettings,
}) => {
  const isExam = mode === 'exam';

  const updateExam = <K extends keyof QuizSettings['exam']>(
    key: K,
    val: QuizSettings['exam'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      exam: {
        ...prev.exam,
        [key]: val,
      },
    }));
  };

  const updatePractice = <K extends keyof QuizSettings['practice']>(
    key: K,
    val: QuizSettings['practice'][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      practice: {
        ...prev.practice,
        [key]: val,
      },
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between ${
          isExam
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-amber-500/10 text-amber-900 border-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isExam ? 'bg-slate-800 text-emerald-400' : 'bg-amber-600 text-white'
            }`}
          >
            {isExam ? <ShieldAlert className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {isExam ? 'Formal Examination Mode Active' : 'Gamified Practice Session Active'}
            </h4>
            <p className={`text-xs ${isExam ? 'text-slate-400' : 'text-amber-700'}`}>
              {isExam
                ? 'Distraction-free environment, strict time bounds, and authoritative evaluation records'
                : 'Engaging, immediate feedback, hints, and streaks for mastery reinforcement'}
            </p>
          </div>
        </div>
      </div>

      {/* EXAM MODE SETTINGS */}
      {isExam ? (
        <div className="space-y-5">
          {/* Timing & Attempts */}
          <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Timing &amp; Attempts Control
            </h4>

            <div className="grid sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={settings.exam.durationMinutes}
                  onChange={e => updateExam('durationMinutes', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maximum Attempts
                </label>
                <select
                  value={settings.exam.maxAttempts}
                  onChange={e => updateExam('maxAttempts', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value={1}>1 Attempt (Strict Examination)</option>
                  <option value={2}>2 Attempts</option>
                  <option value={3}>3 Attempts</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Access Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CIE-2026"
                  value={settings.exam.accessCode || ''}
                  onChange={e => updateExam('accessCode', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="auto-submit"
                checked={settings.exam.autoSubmitOnTimeout}
                onChange={e => updateExam('autoSubmitOnTimeout', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="auto-submit" className="text-xs text-slate-700 cursor-pointer font-medium">
                Auto-submit responses immediately when countdown timer expires
              </label>
            </div>
          </div>

          {/* Randomization & Navigation */}
          <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-600" /> Randomization &amp; Question Flow
            </h4>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Randomize Question Sequence</p>
                  <p className="text-[11px] text-slate-500">Shuffles order uniquely for each student</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.exam.randomizeQuestions}
                  onChange={e => updateExam('randomizeQuestions', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Randomize MCQ Option Order</p>
                  <p className="text-[11px] text-slate-500">Prevents side-by-side answer copying</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.exam.randomizeOptions}
                  onChange={e => updateExam('randomizeOptions', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Free Question Navigation Palette</p>
                  <p className="text-[11px] text-slate-500">Allow students to jump between questions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.exam.allowNavigation}
                  onChange={e => updateExam('allowNavigation', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Flag for Review Support</p>
                  <p className="text-[11px] text-slate-500">Enable bookmarking questions during exam</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.exam.allowMarkForReview}
                  onChange={e => updateExam('allowMarkForReview', e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Results & Integrity */}
          <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" /> Result Disclosure &amp; Scoring Policy
            </h4>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Result Release Window</label>
                <select
                  value={settings.exam.resultRelease}
                  onChange={e => updateExam('resultRelease', e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="immediate">Immediate Score upon Submission</option>
                  <option value="manual">Manual Release by Faculty (After all submit)</option>
                  <option value="scheduled">Scheduled on Exam End Time</option>
                </select>
              </div>

              <div className="flex flex-col justify-center gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-ans"
                    checked={settings.exam.showCorrectAnswersAfterSubmission}
                    onChange={e =>
                      updateExam('showCorrectAnswersAfterSubmission', e.target.checked)
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <label htmlFor="show-ans" className="font-medium text-slate-700 cursor-pointer">
                    Display answer keys after submission
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-exp"
                    checked={settings.exam.showExplanationsAfterSubmission}
                    onChange={e =>
                      updateExam('showExplanationsAfterSubmission', e.target.checked)
                    }
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <label htmlFor="show-exp" className="font-medium text-slate-700 cursor-pointer">
                    Display pedagogical explanations
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PRACTICE MODE SETTINGS */
        <div className="space-y-5">
          <div className="card p-6 bg-white border border-[var(--color-border)] rounded-2xl shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Gamification &amp; Engagement Features
            </h4>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Instant Answer Feedback</p>
                  <p className="text-[11px] text-slate-500">Color tiles &amp; sound on answer select</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.practice.showInstantFeedback}
                  onChange={e => updatePractice('showInstantFeedback', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Points &amp; Combo Streaks</p>
                  <p className="text-[11px] text-slate-500">Confetti animations and multiplier</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.practice.enablePointsAndStreaks}
                  onChange={e => updatePractice('enablePointsAndStreaks', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Show Instant Explanations</p>
                  <p className="text-[11px] text-slate-500">Display reasoning immediately after attempt</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.practice.showExplanationsImmediately}
                  onChange={e => updatePractice('showExplanationsImmediately', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Question Hints</p>
                  <p className="text-[11px] text-slate-500">Allow students to reveal helpful hints</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.practice.allowHints}
                  onChange={e => updatePractice('allowHints', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Allow Question Retries</p>
                  <p className="text-[11px] text-slate-500">Students can retry missed questions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.practice.allowRetries}
                  onChange={e => updatePractice('allowRetries', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Optional Practice Leaderboard</p>
                  <p className="text-[11px] text-slate-500">Friendly peer points ranking</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.practice.enableLeaderboard}
                  onChange={e => updatePractice('enableLeaderboard', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600"
                />
              </div>
            </div>

            {/* Crucial Acadexa Principle Notice */}
            <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Academic Score Separation:</strong> Practice points and leaderboard streaks are kept strictly separate from continuous internal examination (CIE) academic marks. Both inform Learning-Gap Analytics, with attempt count factored in.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
