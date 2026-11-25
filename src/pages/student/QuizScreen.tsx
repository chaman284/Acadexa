// ============================================================================
// ACADEXA STUDENT QUIZ SCREEN ROUTER / RUNNER
// Handles assessment execution for both Exam Mode and Gamified Practice Mode
// using unified UI/UX patterns and persistent evaluation tracking.
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, Calendar, ShieldCheck, Flame, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/apiClient';
import { quizService } from '../../features/quizzes/services/quizService';
import { quizAnalyticsService } from '../../features/quizzes/services/quizAnalyticsService';
import { ExamInterface } from '../../features/quizzes/student/ExamInterface';
import { PracticeInterface } from '../../features/quizzes/student/PracticeInterface';
import type { Quiz, QuizAttempt } from '../../features/quizzes/types/quizTypes';
import { useAuth } from '../../context/AuthContext';

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const checkExistingAttempt = async () => {
      try {
        const res = await api.get(`/quizzes/${id}/my-attempt`);
        if (res.data) {
          setExistingAttempt(res.data);
          return;
        }
      } catch (_) {}

      try {
        const localAttempts = await quizAnalyticsService.getQuizAttempts(id);
        const myAttempt = localAttempts.find(
          a => a.studentId === user?.id || a.studentRollNo === 'CS23B101'
        ) || (localAttempts.length > 0 ? localAttempts[0] : null);
        if (myAttempt) {
          setExistingAttempt(myAttempt);
        }
      } catch (_) {}
    };

    const fetchAssessment = async () => {
      await checkExistingAttempt();

      try {
        const res = await api.get(`/quizzes/${id}`);
        if (res.data) {
          // Normalize if backend returned partial DB model
          const dbData = res.data;
          const questionsList = (dbData.questions || []).map((qq: any, idx: number) => ({
            id: qq.question?.id || qq.id || `q_${idx}`,
            quizQuestionId: qq.id || `qq_${idx}`,
            orderIndex: idx,
            text: qq.question?.text || qq.text || 'Question Prompt',
            type: (qq.question?.type || 'mcq').toLowerCase(),
            difficulty: (qq.question?.difficulty || 'medium').toLowerCase(),
            marks: qq.question?.marks || 1,
            options: (qq.question?.options || qq.options || []).map((opt: any) => ({
              id: opt.id,
              text: opt.text,
              isCorrect: !!opt.isCorrect,
            })),
            codeSnippet: qq.question?.codeSnippet,
            explanation: qq.question?.explanation,
            hint: qq.question?.hint,
            metadata: {
              department: 'Computer Science',
              semester: 5,
              subjectId: dbData.subjectId || 'subj_cs301',
              subjectCode: dbData.subject?.code || 'CS301',
              subjectName: dbData.subject?.name || 'Curriculum Subject',
              unitId: 'unit_1',
              unitName: 'Unit 1',
              topicId: 'topic_1',
              topicName: 'Curriculum Assessment Topic',
            },
            source: 'library',
            hasValidAnswerKey: true,
            createdAt: new Date().toISOString(),
          }));

          const normalized: Quiz = {
            id: dbData.id,
            title: dbData.title || 'Curriculum Assessment',
            description: dbData.description || '',
            category: 'Weekly Assessment',
            mode: dbData.mode === 'practice' || dbData.type === 'PRACTICE' ? 'practice' : 'exam',
            status: 'active',
            department: 'Computer Science',
            semester: dbData.subject?.semester || 5,
            subjectId: dbData.subjectId || 'subj_cs301',
            subjectCode: dbData.subject?.code || 'CS301',
            subjectName: dbData.subject?.name || 'Curriculum Subject',
            unitIds: [],
            unitNames: [],
            topicIds: [],
            topicNames: [],
            assignedClasses: [{ id: 'sec_3a', name: 'Section 3A', semester: 5, studentsCount: 42 }],
            questions: questionsList,
            totalMarks: questionsList.reduce((sum: number, q: any) => sum + (q.marks || 1), 0),
            totalQuestions: questionsList.length,
            settings: {
              mode: dbData.mode === 'practice' || dbData.type === 'PRACTICE' ? 'practice' : 'exam',
              exam: {
                durationMinutes: dbData.duration || 20,
                maxAttempts: 1,
                randomizeQuestions: false,
                randomizeOptions: false,
                allowNavigation: true,
                allowRevisit: true,
                allowMarkForReview: true,
                showCorrectAnswersAfterSubmission: true,
                showExplanationsAfterSubmission: true,
                resultRelease: 'immediate',
                negativeMarkingEnabled: false,
                negativeMarksValue: 0,
                autoSubmitOnTimeout: true,
                instructions: 'Answer all questions carefully within the allocated duration.',
              },
              practice: {
                selfPaced: true,
                showInstantFeedback: true,
                showExplanationsImmediately: true,
                allowRetries: true,
                maxRetriesPerQuestion: 2,
                shuffleQuestions: false,
                enablePointsAndStreaks: true,
                enableLeaderboard: true,
                allowHints: true,
              },
            },
            createdAt: dbData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setQuiz(normalized);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API quiz fetch unavailable, loading from local quiz service:', err);
      }

      // Local fallback
      try {
        const local = await quizService.getQuizById(id);
        if (local) {
          setQuiz(local);
        }
      } catch (e) {
        console.warn('Failed to load quiz from local store:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id, user?.id]);

  const handleFinish = async (attempt: QuizAttempt) => {
    // Record in local analytics service
    await quizAnalyticsService.recordAttempt(attempt);

    // Also attempt posting to backend API if available
    try {
      await api.post(`/quizzes/${id}/attempt`, {
        timeTaken: attempt.durationSeconds,
        answers: Object.values(attempt.responses).map(r => ({
          questionId: r.questionId,
          optionId: r.selectedOptionIds?.[0] || '',
        })),
      });
    } catch (err) {
      console.warn('Backend attempt synchronization offline, persisted locally:', err);
    }

    // Replaces the current quiz URL in the browser history so pressing Back returns to quiz list
    navigate(`/student/quiz/${id}/result`, {
      replace: true,
      state: {
        attempt,
        quizTitle: quiz?.title || 'Assessment',
      },
    });
  };

  const handleExit = () => {
    navigate('/student/quiz', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#302A2B] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#542536]" />
        <p className="text-sm font-semibold text-[#79666A]">Preparing your assessment questions...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#302A2B] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
          <ArrowLeft className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Quiz Not Available</h3>
        <p className="text-sm text-[#79666A] max-w-md mb-6">
          The requested assessment could not be found or has not yet been published by your instructor.
        </p>
        <Button onClick={handleExit} className="!bg-[#542536] !text-white font-bold">
          Return to Quizzes
        </Button>
      </div>
    );
  }

  // Already submitted check for Exam mode (only 1 attempt allowed)
  if (quiz.mode === 'exam' && existingAttempt) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#302A2B] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-300 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold mb-2">Assessment Already Completed</h3>
        <p className="text-sm text-[#79666A] max-w-md mb-6">
          You have already completed and submitted this examination. Re-attempting or re-entering an active session is restricted.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/student/quiz', { replace: true })}
            className="!border-[#E1D4CA] !text-[#542536] font-bold"
          >
            Return to Quizzes
          </Button>
          <Button
            onClick={() =>
              navigate(`/student/quiz/${id}/result`, {
                replace: true,
                state: { attempt: existingAttempt, quizTitle: quiz.title },
              })
            }
            className="!bg-[#542536] !text-white font-bold"
          >
            View Your Results
          </Button>
        </div>
      </div>
    );
  }

  // Future scheduled check
  if (quiz.scheduledStart && new Date(quiz.scheduledStart) > new Date()) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#302A2B] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 border border-amber-300">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Assessment Scheduled For Later</h3>
        <p className="text-sm text-[#79666A] max-w-md mb-2">
          This quiz will unlock at:
        </p>
        <p className="text-lg font-black text-amber-800 mb-6 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 inline-block">
          {new Date(quiz.scheduledStart).toLocaleString()}
        </p>
        <Button onClick={handleExit} className="!bg-[#542536] !text-white font-bold">
          Return to Quizzes
        </Button>
      </div>
    );
  }

  // Render Practice Mode vs Exam Mode using the same unified UI/UX layout pattern!
  if (quiz.mode === 'practice') {
    return (
      <PracticeInterface
        quiz={quiz}
        studentName={user?.name || 'Student'}
        studentRollNo="CS23B101"
        onFinish={handleFinish}
        onExit={handleExit}
      />
    );
  }

  return (
    <ExamInterface
      quiz={quiz}
      studentName={user?.name || 'Student'}
      studentRollNo="CS23B101"
      onFinish={handleFinish}
      onExit={handleExit}
    />
  );
};
