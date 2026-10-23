import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, RotateCcw, TrendingUp, Trophy, Star, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/apiClient';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const playVictorySound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch (e) {
    // Ignore audio errors
  }
};

export const QuizResult: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [attemptData, setAttemptData] = useState<any>(location.state?.attempt || null);
  const [quizTitle, setQuizTitle] = useState<string>(
    location.state?.quizTitle || location.state?.quiz?.title || 'Weekly Assessment'
  );
  const [loading, setLoading] = useState(!location.state?.attempt && !!id);

  useEffect(() => {
    playVictorySound();

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!attemptData && id) {
      setLoading(true);
      api
        .get(`/quizzes/${id}/my-attempt`)
        .then(res => {
          if (res.data) {
            setAttemptData(res.data);
            if (res.data.quiz?.title) {
              setQuizTitle(res.data.quiz.title);
            }
          }
        })
        .catch(err => {
          console.warn('Failed to load my-attempt:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, attemptData]);

  const score = attemptData ? Math.round(attemptData.score) : 80;
  const timeTaken = attemptData?.timeTaken ?? 120;
  const totalQuestions = attemptData?.answers?.length || 5;
  const correctCount = attemptData?.answers
    ? attemptData.answers.filter((a: any) => a.isCorrect).length
    : Math.round((score / 100) * totalQuestions);
  const incorrectCount = totalQuestions - correctCount;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  const scoreBorder =
    score >= 75
      ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
      : score >= 50
      ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
      : 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]';
  const scoreMessage = score >= 75 ? 'Outstanding Performance!' : score >= 50 ? 'Good Effort!' : 'Keep Practicing!';

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cherry text-ivory flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brass mb-3" />
        <p className="text-sm text-ivory/80">Retrieving your assessment results...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-ivory flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden relative"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #441d2b 0%, #321923 60%, #201016 100%)' }}
    >
      {/* Background warm ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brass/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-oxblood/30 blur-[120px] rounded-full pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-3xl space-y-6 relative z-10">
        {/* Score card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Accent top luxury strip */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brass via-rose to-brass" />

          <div className="flex justify-center mb-6">
            <Trophy className="w-12 h-12 text-brass drop-shadow-[0_0_15px_rgba(182,154,105,0.4)]" />
          </div>

          <div
            className={`w-36 h-36 rounded-full mx-auto mb-6 flex flex-col items-center justify-center border-4 ${
              score >= 75 ? 'border-sage shadow-[0_0_30px_rgba(104,123,98,0.4)]' :
              score >= 50 ? 'border-brass shadow-[0_0_20px_rgba(182,154,105,0.4)]' :
              'border-rose shadow-[0_0_20px_rgba(197,141,152,0.4)]'
            } bg-cherry`}
          >
            <span className={`text-4xl font-serif font-bold ${
              score >= 75 ? 'text-sage' : score >= 50 ? 'text-brass' : 'text-rose'
            } drop-shadow-md`}>{score}%</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 tracking-tight">{scoreMessage}</h1>
          <p className="text-ivory/70 text-xs md:text-sm mb-8 uppercase tracking-widest font-semibold">
            {quizTitle}
          </p>

          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 max-w-lg mx-auto">
            <div className="bg-forest/20 border border-forest/40 rounded-2xl p-4 transition-transform hover:scale-105">
              <CheckCircle className="w-6 h-6 text-sage mx-auto mb-2" />
              <p className="text-3xl font-serif font-bold text-sage">{correctCount}</p>
              <p className="text-xs text-sage/80 font-semibold uppercase tracking-wider">Correct</p>
            </div>
            <div className="bg-danger/20 border border-danger/40 rounded-2xl p-4 transition-transform hover:scale-105">
              <XCircle className="w-6 h-6 text-rose mx-auto mb-2" />
              <p className="text-3xl font-serif font-bold text-rose">{incorrectCount}</p>
              <p className="text-xs text-rose/80 font-semibold uppercase tracking-wider">Incorrect</p>
            </div>
            <div className="bg-brass/20 border border-brass/40 rounded-2xl p-4 transition-transform hover:scale-105">
              <Clock className="w-6 h-6 text-brass mx-auto mb-2" />
              <p className="text-xl md:text-2xl font-serif font-bold text-brass mt-1">{formatTime(timeTaken)}</p>
              <p className="text-xs text-brass/80 font-semibold uppercase tracking-wider mt-1">Time Taken</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/student/quiz')}
              className="!bg-white/10 hover:!bg-white/15 !text-white border border-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> All Quizzes
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/student/learning-gaps')}
              className="!bg-brass hover:!bg-[#a38858] !text-cherry font-bold shadow-btn"
            >
              <TrendingUp className="w-4 h-4 mr-2" /> Practice Weak Topics
            </Button>
          </div>
        </motion.div>

        {/* Topic Breakdown & Recommendations */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6">
            <h2 className="font-serif font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-brass" />
              Topic Performance
            </h2>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-ivory/80">Curriculum Assessment Mastery</span>
                  <span className="font-serif font-bold text-base text-white">{score}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                    className={`h-full ${
                      score >= 75 ? 'bg-sage' : score >= 50 ? 'bg-brass' : 'bg-rose'
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            {score < 75 ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 h-full flex flex-col justify-between">
                <div>
                  <h2 className="font-serif font-bold text-lg text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brass" />
                    Recommended Next Steps
                  </h2>
                  <p className="text-sm text-ivory/80 mb-4">
                    Review your answers with Acadexa AI tutor and strengthen your concept retention.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/student/tutor')}
                  className="!bg-oxblood hover:!bg-cherry !text-white border border-white/20"
                >
                  Ask AI Tutor <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="bg-forest/20 border border-forest/30 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center">
                <Trophy className="w-12 h-12 text-brass mb-3" />
                <h2 className="text-xl font-serif font-bold text-sage mb-1">Excellent Mastery!</h2>
                <p className="text-ivory/80 text-sm">
                  You scored exceptionally well on this assessment. Keep up the high standard of scholarship!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex justify-center pt-4">
          <button
            onClick={() => navigate('/student')}
            className="text-sm text-ivory/80 hover:text-white font-medium transition-colors bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full border border-white/10 cursor-pointer"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
