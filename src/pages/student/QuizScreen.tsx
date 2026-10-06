import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Flag, Clock, CheckCircle, Zap, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { mockQuestions } from '../../data/quizzes';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Synthetic sound effects using Web Audio API
const playSound = (type: 'correct' | 'wrong' | 'pop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { optionId: string, isCorrect: boolean }>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  
  // Use the first 5 questions as mock quiz content
  const questions = mockQuestions.slice(0, 5);
  const current = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex) / total) * 100;
  
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;
  
  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    if (hasAnsweredCurrent) return; // Prevent changing answer
    
    setAnswers(prev => ({ ...prev, [currentIndex]: { optionId, isCorrect } }));
    
    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 100 + (combo * 20));
      setCombo(c => c + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      });
    } else {
      playSound('wrong');
      setCombo(0);
    }
  };

  const handleNext = () => {
    playSound('pop');
    if (currentIndex < total - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      navigate(`/student/quiz/${id}/result`);
    }
  };

  if (!current) return null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between relative z-10 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/quiz')}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="font-bold text-lg text-white drop-shadow-sm">Week 5 — Trees & Heaps</p>
            <p className="text-xs text-indigo-200">Data Structures & Algorithms</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-lg font-mono">{score}</span>
          </div>
          {combo > 1 && (
            <motion.div 
              initial={{ scale: 0, rotate: -10 }} 
              animate={{ scale: 1, rotate: 0 }}
              className="hidden md:flex items-center gap-1.5 text-orange-400 font-bold italic"
            >
              <Zap className="w-5 h-5 fill-orange-400" />
              {combo}x COMBO!
            </motion.div>
          )}
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="flex gap-1 p-4 max-w-5xl mx-auto w-full relative z-10">
        {questions.map((_, i) => (
          <div key={i} className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
            {answers[i] && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className={`h-full ${answers[i].isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
            )}
            {i === currentIndex && !answers[i] && (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-full w-full bg-indigo-500"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-1 flex flex-col"
          >
            {/* Question Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-indigo-300 font-bold tracking-wider uppercase text-sm">Question {currentIndex + 1} of {total}</span>
                <Badge color={current.difficulty === 'easy' ? 'green' : current.difficulty === 'medium' ? 'amber' : 'red'}>
                  {current.difficulty}
                </Badge>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-8">
                {current.text}
              </h2>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {current.options.map((option, idx) => {
                const isSelected = answers[currentIndex]?.optionId === option.id;
                const isCorrect = option.isCorrect;
                const showStatus = hasAnsweredCurrent;
                
                let btnStateClass = "bg-white/5 border-white/10 hover:bg-white/15 hover:border-indigo-400";
                
                if (showStatus) {
                  if (isSelected && isCorrect) {
                    btnStateClass = "bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
                  } else if (isSelected && !isCorrect) {
                    btnStateClass = "bg-red-500/20 border-red-500 text-red-100";
                  } else if (isCorrect) {
                    btnStateClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-200";
                  } else {
                    btnStateClass = "bg-white/5 border-white/5 opacity-50 grayscale";
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    whileHover={!showStatus ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!showStatus ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(option.id, !!option.isCorrect)}
                    disabled={showStatus}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 ${btnStateClass}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-colors ${
                      showStatus && isSelected && isCorrect ? 'bg-emerald-500 text-white' :
                      showStatus && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                      showStatus && isCorrect ? 'bg-emerald-500/50 text-white' :
                      'bg-white/10 text-white'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg font-medium">{option.text}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Next Button appearing after answer */}
            <AnimatePresence>
              {hasAnsweredCurrent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 flex justify-center"
                >
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="!bg-indigo-600 hover:!bg-indigo-500 !text-white !px-12 !py-4 !text-lg !rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all hover:scale-105"
                  >
                    {currentIndex < total - 1 ? 'Next Question' : 'View Results'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

