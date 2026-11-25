// ============================================================================
// ACADEXA QUIZ PREVIEW PAGE
// Enables faculty to preview assessments as students in both Exam & Practice modes
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Shield, Flame, RotateCcw, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Quiz, QuizMode, QuizAttempt } from '../types/quizTypes';
import { quizService } from '../services/quizService';
import { ExamInterface } from '../student/ExamInterface';
import { PracticeInterface } from '../student/PracticeInterface';

export const QuizPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [quiz, setQuiz] = useState<Quiz | null>(
    (location.state as any)?.previewQuiz || null
  );
  const [activeMode, setActiveMode] = useState<QuizMode>(quiz?.mode || 'exam');
  const [completedAttempt, setCompletedAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(!quiz && !!id);

  useEffect(() => {
    if (!quiz && id) {
      setLoading(true);
      quizService
        .getQuizById(id)
        .then(res => {
          if (res) {
            setQuiz(res);
            setActiveMode(res.mode);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, quiz]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        Preparing preview assessment...
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h3 className="font-bold text-lg mb-2">Quiz Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">No quiz was found for preview.</p>
        <Button onClick={() => navigate('/faculty/quizzes')}>Back to Quizzes</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Faculty Mode Selector Strip */}
      <div className="bg-slate-950 text-white px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="h-3 w-px bg-slate-800" />
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" /> Student Preview Mode
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveMode('exam');
              setCompletedAttempt(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'exam'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Exam Mode View
          </button>
          <button
            onClick={() => {
              setActiveMode('practice');
              setCompletedAttempt(null);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'practice'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Practice Mode View
          </button>
        </div>
      </div>

      {/* Embedded Assessment View */}
      <div className="flex-1">
        {activeMode === 'exam' ? (
          <ExamInterface
            quiz={quiz}
            studentName="Faculty Preview"
            studentRollNo="PREVIEW-01"
            isPreview
            onFinish={attempt => {
              setCompletedAttempt(attempt);
            }}
            onExit={() => navigate('/faculty/quizzes')}
          />
        ) : (
          <PracticeInterface
            quiz={quiz}
            isPreview
            onFinish={attempt => {
              setCompletedAttempt(attempt);
            }}
            onExit={() => navigate('/faculty/quizzes')}
          />
        )}
      </div>

      {/* Completion Dialog in Preview */}
      {completedAttempt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full mx-auto bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Exam Preview Completed</h3>
              <p className="text-xs text-slate-500 mt-1">
                Score: <strong>{completedAttempt.totalScore} / {completedAttempt.maxPossibleScore}</strong> ({completedAttempt.percentage}%)
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
              This preview confirms that questions, answer keys, timer, and student navigation function as expected.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompletedAttempt(null)}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset Preview
              </Button>
              <Button size="sm" onClick={() => navigate('/faculty/quizzes')}>
                Done Previewing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
