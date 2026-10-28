// ============================================================================
// ACADEXA QUIZ EVALUATION SERVICE
// Authoritative scoring logic across all 6 question types
// ============================================================================
import type {
  QuizQuestion,
  QuestionResponse,
  EvaluationResult,
  QuizAttempt,
  QuizMode,
} from '../types/quizTypes';

export const quizEvaluationService = {
  /**
   * Evaluate a single question response
   */
  evaluateResponse: (
    question: QuizQuestion,
    response?: QuestionResponse
  ): EvaluationResult => {
    const maxMarks = question.marks || 1;
    const topicId = question.metadata?.topicId || 'unmapped';
    const topicName = question.metadata?.topicName || 'General Topic';

    if (!response || !response.isAnswered) {
      return {
        questionId: question.id,
        scoreAwarded: 0,
        maxMarks,
        isCorrect: false,
        status: 'graded',
        feedback: 'No response submitted.',
        topicId,
        topicName,
      };
    }

    switch (question.type) {
      case 'mcq':
      case 'true-false': {
        const correctOpt = question.options?.find(o => o.isCorrect);
        const selectedId = response.selectedOptionIds?.[0];
        const isCorrect = !!correctOpt && selectedId === correctOpt.id;

        return {
          questionId: question.id,
          scoreAwarded: isCorrect ? maxMarks : 0,
          maxMarks,
          isCorrect,
          status: 'graded',
          feedback: isCorrect ? 'Correct response.' : 'Incorrect option selected.',
          topicId,
          topicName,
        };
      }

      case 'multi-select': {
        const correctOptIds = new Set(
          (question.options || []).filter(o => o.isCorrect).map(o => o.id)
        );
        const selectedIds = new Set(response.selectedOptionIds || []);

        if (correctOptIds.size === 0) {
          return {
            questionId: question.id,
            scoreAwarded: 0,
            maxMarks,
            isCorrect: false,
            status: 'graded',
            feedback: 'No answer key configured.',
            topicId,
            topicName,
          };
        }

        let correctSelected = 0;
        let incorrectSelected = 0;

        selectedIds.forEach(id => {
          if (correctOptIds.has(id)) {
            correctSelected++;
          } else {
            incorrectSelected++;
          }
        });

        const isFullyCorrect =
          correctSelected === correctOptIds.size && incorrectSelected === 0;

        // Partial scoring: Proportional to correctly identified items minus misidentifications, floor at 0
        let score = 0;
        if (isFullyCorrect) {
          score = maxMarks;
        } else if (incorrectSelected === 0 && correctSelected > 0) {
          score = Number(((correctSelected / correctOptIds.size) * maxMarks).toFixed(1));
        }

        return {
          questionId: question.id,
          scoreAwarded: score,
          maxMarks,
          isCorrect: isFullyCorrect,
          isPartiallyCorrect: score > 0 && !isFullyCorrect,
          status: 'graded',
          feedback: isFullyCorrect
            ? 'Fully correct!'
            : score > 0
            ? `Partially correct (${correctSelected}/${correctOptIds.size} correct selected)`
            : 'Incorrect option combination.',
          topicId,
          topicName,
        };
      }

      case 'fill-blank': {
        const userText = (response.textResponse || '').trim();
        const accepted = question.acceptedAnswers || [];

        let isMatch = false;
        if (question.caseSensitive) {
          isMatch = accepted.some(a => a.trim() === userText);
        } else {
          const userLower = userText.toLowerCase().replace(/\s+/g, ' ');
          isMatch = accepted.some(
            a => a.toLowerCase().replace(/\s+/g, ' ').trim() === userLower
          );
        }

        return {
          questionId: question.id,
          scoreAwarded: isMatch ? maxMarks : 0,
          maxMarks,
          isCorrect: isMatch,
          status: 'graded',
          feedback: isMatch ? 'Accurate match.' : 'Answer did not match accepted key.',
          topicId,
          topicName,
        };
      }

      case 'code-output': {
        const userText = (response.textResponse || '').trim();
        const expected = (question.expectedAnswer || '').trim();
        const accepted = question.acceptedAnswers || [expected];

        const normalizeOutput = (s: string) =>
          s.replace(/\r\n/g, '\n').trim();

        const userNorm = normalizeOutput(userText);
        const isMatch = accepted.some(acc => normalizeOutput(acc) === userNorm);

        return {
          questionId: question.id,
          scoreAwarded: isMatch ? maxMarks : 0,
          maxMarks,
          isCorrect: isMatch,
          status: 'graded',
          feedback: isMatch ? 'Output matches expected result.' : 'Output mismatch.',
          topicId,
          topicName,
        };
      }

      case 'short-answer': {
        // Faculty requires manual rubric evaluation for descriptive responses
        return {
          questionId: question.id,
          scoreAwarded: 0,
          maxMarks,
          isCorrect: false,
          status: 'pending_manual',
          feedback: 'Submitted for faculty evaluation according to question rubric.',
          topicId,
          topicName,
        };
      }

      default:
        return {
          questionId: question.id,
          scoreAwarded: 0,
          maxMarks,
          isCorrect: false,
          status: 'graded',
          feedback: 'Unsupported question type.',
          topicId,
          topicName,
        };
    }
  },

  /**
   * Evaluate a full quiz attempt
   */
  evaluateAttempt: (
    quiz: { id: string; title: string; questions: QuizQuestion[] },
    student: { id: string; name: string; rollNo: string; className: string },
    responses: Record<string, QuestionResponse>,
    mode: QuizMode,
    durationSeconds: number
  ): QuizAttempt => {
    const evaluations: Record<string, EvaluationResult> = {};
    let totalScore = 0;
    let maxPossibleScore = 0;
    let hasPendingManual = false;

    quiz.questions.forEach(q => {
      const resp = responses[q.id];
      const evalResult = quizEvaluationService.evaluateResponse(q, resp);
      evaluations[q.id] = evalResult;

      totalScore += evalResult.scoreAwarded;
      maxPossibleScore += evalResult.maxMarks;

      if (evalResult.status === 'pending_manual') {
        hasPendingManual = true;
      }
    });

    const percentage =
      maxPossibleScore > 0
        ? Math.round((totalScore / maxPossibleScore) * 100)
        : 0;

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.rollNo,
      className: student.className,
      mode,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSeconds,
      responses,
      evaluations,
      totalScore,
      maxPossibleScore,
      percentage,
      hasPendingManualEvaluation: hasPendingManual,
    };
  },
};
