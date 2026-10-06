import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight, RotateCcw, TrendingUp, Trophy, Star } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockQuizResults } from '../../data/quizzes';
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
  const result = mockQuizResults[0];

  useEffect(() => {
    playVictorySound();
    
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
    }, 250);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const scoreColor = result.score >= 75 ? 'text-emerald-400' : result.score >= 55 ? 'text-amber-400' : 'text-red-400';
  const scoreBorder = result.score >= 75 ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)]' : result.score >= 55 ? 'border-amber-400' : 'border-red-400';
  const scoreMessage = result.score >= 75 ? 'Outstanding!' : result.score >= 55 ? 'Good Effort!' : 'Keep Practicing!';

  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-3xl space-y-6 relative z-10"
      >
        {/* Score card */}
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500" />
          
          <div className="flex justify-center mb-6">
            <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </div>

          <div className={`w-36 h-36 rounded-full mx-auto mb-6 flex flex-col items-center justify-center border-[6px] ${scoreBorder} bg-[#0F172A]`}>
            <span className={`text-4xl font-black ${scoreColor} drop-shadow-md`}>{result.score}%</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">{scoreMessage}</h1>
          <p className="text-indigo-200 text-sm md:text-base mb-8 uppercase tracking-widest font-semibold">{result.quizTitle}</p>

          <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10 max-w-lg mx-auto">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 transition-transform hover:scale-105">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-emerald-400">{result.correctAnswers}</p>
              <p className="text-xs text-emerald-200/70 font-semibold uppercase tracking-wider">Correct</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 transition-transform hover:scale-105">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-red-400">{result.incorrectAnswers}</p>
              <p className="text-xs text-red-200/70 font-semibold uppercase tracking-wider">Incorrect</p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 transition-transform hover:scale-105">
              <Clock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-xl md:text-2xl font-black text-indigo-400 mt-1">{formatTime(result.timeTaken)}</p>
              <p className="text-xs text-indigo-200/70 font-semibold uppercase tracking-wider mt-1">Time</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/student/quiz')} className="!bg-white/10 hover:!bg-white/20 !text-white border border-white/20">
              <RotateCcw className="w-4 h-4 mr-2" /> Review Answers
            </Button>
            <Button size="lg" onClick={() => navigate('/student/learning-gaps')} className="!bg-indigo-600 hover:!bg-indigo-500 !text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <TrendingUp className="w-4 h-4 mr-2" /> Practice Weak Topics
            </Button>
          </div>
        </motion.div>

        {/* Breakdown section side-by-side on desktop */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Topic breakdown */}
          <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
            <h2 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Topic Performance
            </h2>
            <div className="space-y-5">
              {result.topicBreakdown.map(topic => (
                <div key={topic.topicId}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-indigo-100">{topic.topicName}</span>
                    <span className="font-bold text-sm text-white">{topic.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5, type: 'spring' }}
                      className={`h-full ${topic.percentage >= 75 ? 'bg-emerald-400' : topic.percentage >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div variants={itemVariants} className="h-full">
            {result.topicBreakdown.some(t => t.percentage < 75) ? (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 h-full flex flex-col">
                <h2 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Recommended Next Steps
                </h2>
                <p className="text-sm text-indigo-200/80 mb-6">Boost your mastery by practicing these weaker areas.</p>
                
                <div className="space-y-3 flex-1">
                  {result.topicBreakdown.filter(t => t.percentage < 75).map(topic => (
                    <div key={topic.topicId} className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-4 py-3 hover:bg-black/40 transition-colors cursor-pointer group">
                      <span className="text-sm font-medium text-white">{topic.topicName}</span>
                      <button className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        Practice <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center">
                <Trophy className="w-12 h-12 text-emerald-400 mb-4" />
                <h2 className="text-xl font-bold text-emerald-400 mb-2">Perfect Mastery!</h2>
                <p className="text-emerald-200/80 text-sm">You've mastered all topics in this quiz. Great job!</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="flex justify-center pt-4">
          <button
            onClick={() => navigate('/student')}
            className="text-sm text-indigo-300 hover:text-white font-medium transition-colors bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full border border-white/10"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
