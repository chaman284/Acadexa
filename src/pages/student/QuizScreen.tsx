import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Zap, Star, Maximize, Minimize } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockQuestions } from '../../data/quizzes';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ─── Kahoot-style tile colours ───────────────────────────────────────────────
const OPTION_COLORS = [
  // [idle bg, selected-correct, selected-wrong, label bg]
  { base: '#7a8b1e', dark: '#5a6813', accent: '#c5d93a', label: '#8e9e22' }, // olive-green  A
  { base: '#7b35c4', dark: '#5a2490', accent: '#c285ff', label: '#9048d8' }, // purple       B
  { base: '#d45a10', dark: '#a03e08', accent: '#ff8a3a', label: '#e0650a' }, // orange       C
  { base: '#0e9e8a', dark: '#077362', accent: '#2dd4bf', label: '#11b89e' }, // teal         D
];

// ─── Web Audio sound effects ──────────────────────────────────────────────────
const playSound = (type: 'correct' | 'wrong' | 'pop' | 'countdown') => {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC() as AudioContext;

    if (type === 'correct') {
      // Cheerful ascending chord: C-E-G
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.09 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + i * 0.09 + 0.4);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.45);
      });
    } else if (type === 'wrong') {
      // Harsh descending buzz — classic "wrong answer" game tune
      const osc = ctx.createOscillator();
      const distortion = ctx.createWaveShaper();
      const gain = ctx.createGain();

      // Create distortion curve for buzz effect
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 400) * x / (Math.PI + 400 * Math.abs(x));
      }
      distortion.curve = curve;

      osc.connect(distortion);
      distortion.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);

      // Second layer: lower buzz note
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(130, ctx.currentTime + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
      gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.45);
      osc2.start(ctx.currentTime + 0.05);
      osc2.stop(ctx.currentTime + 0.5);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'countdown') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (_) {
    // Ignore audio errors silently
  }
};

// ─── Fullscreen helpers ───────────────────────────────────────────────────────
const requestFullscreen = (el: Element) => {
  if (el.requestFullscreen) return el.requestFullscreen();
  const anyEl = el as any;
  if (anyEl.webkitRequestFullscreen) return anyEl.webkitRequestFullscreen();
  if (anyEl.mozRequestFullScreen) return anyEl.mozRequestFullScreen();
  if (anyEl.msRequestFullscreen) return anyEl.msRequestFullscreen();
};

const exitFullscreen = () => {
  if (document.exitFullscreen) return document.exitFullscreen();
  const anyDoc = document as any;
  if (anyDoc.webkitExitFullscreen) return anyDoc.webkitExitFullscreen();
  if (anyDoc.mozCancelFullScreen) return anyDoc.mozCancelFullScreen();
  if (anyDoc.msExitFullscreen) return anyDoc.msExitFullscreen();
};

const isFullscreenActive = () => !!(
  document.fullscreenElement ||
  (document as any).webkitFullscreenElement ||
  (document as any).mozFullScreenElement
);

// ─── Component ────────────────────────────────────────────────────────────────
export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { optionId: string; isCorrect: boolean }>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [showWrongFlash, setShowWrongFlash] = useState(false);

  const questions = mockQuestions.slice(0, 5);
  const current = questions[currentIndex];
  const total = questions.length;
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;

  // Enter fullscreen on mount
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      requestFullscreen(el).catch(() => {/* user may deny */});
    }

    const handleFSChange = () => {
      setIsFullscreen(isFullscreenActive());
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (isFullscreenActive()) {
      exitFullscreen();
    } else if (containerRef.current) {
      requestFullscreen(containerRef.current);
    }
  };

  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    if (hasAnsweredCurrent) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: { optionId, isCorrect } }));

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 100 + combo * 20);
      setCombo(c => c + 1);
      setShowCorrectFlash(true);
      setTimeout(() => setShowCorrectFlash(false), 600);
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.55 }, colors: ['#c5d93a', '#c285ff', '#ff8a3a', '#2dd4bf'] });
    } else {
      playSound('wrong');
      setCombo(0);
      setShowWrongFlash(true);
      setTimeout(() => setShowWrongFlash(false), 600);
    }
  };

  const handleNext = () => {
    playSound('pop');
    if (currentIndex < total - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      if (isFullscreenActive()) exitFullscreen();
      navigate(`/student/quiz/${id}/result`);
    }
  };

  const handleBack = () => {
    if (isFullscreenActive()) exitFullscreen();
    navigate('/student/quiz');
  };

  if (!current) return null;

  return (
    <div
      ref={containerRef}
      className="quiz-screen-root"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 60% 0%, #3d0a4f 0%, #2a003e 40%, #1a0028 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Screen flash overlays */}
      <AnimatePresence>
        {showCorrectFlash && (
          <motion.div
            key="correct-flash"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(16,185,129,0.25)',
              pointerEvents: 'none', zIndex: 100,
            }}
          />
        )}
        {showWrongFlash && (
          <motion.div
            key="wrong-flash"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(239,68,68,0.22)',
              pointerEvents: 'none', zIndex: 100,
            }}
          />
        )}
      </AnimatePresence>

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '45%', height: '45%', borderRadius: '50%', background: 'rgba(124,58,237,0.18)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '45%', height: '45%', borderRadius: '50%', background: 'rgba(6,182,212,0.14)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleBack}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>Week 5 — Trees &amp; Heaps</p>
            <p style={{ fontSize: 12, color: 'rgba(196,181,253,0.8)', margin: 0 }}>Data Structures &amp; Algorithms</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Score */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.1)', borderRadius: 24,
            padding: '6px 16px', border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <Star size={18} fill="#facc15" color="#facc15" />
            <span style={{ fontWeight: 700, fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{score}</span>
          </div>

          {/* Combo */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div
                key="combo"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: '#fb923c', fontWeight: 800, fontStyle: 'italic', fontSize: 15,
                }}
              >
                <Zap size={18} fill="#fb923c" />
                {combo}× COMBO!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>
      </div>

      {/* ── Segmented progress bar ── */}
      <div style={{ display: 'flex', gap: 5, padding: '10px 24px', position: 'relative', zIndex: 10 }}>
        {questions.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, borderRadius: 10, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            {answers[i] ? (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                style={{ height: '100%', background: answers[i].isCorrect ? '#10b981' : '#ef4444', borderRadius: 10 }}
              />
            ) : i === currentIndex ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{ height: '100%', width: '100%', background: '#818cf8', borderRadius: 10 }}
              />
            ) : null}
          </div>
        ))}
      </div>

      {/* ── Question + Options ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 980, margin: '0 auto', width: '100%', padding: '0 20px 14px', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Question card */}
            <div style={{
              background: 'rgba(20,10,40,0.75)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '16px 24px',
              marginBottom: 14,
              boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #818cf8, #c084fc, #f472b6)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#a5b4fc', textTransform: 'uppercase' }}>
                  Question {currentIndex + 1} / {total}
                </span>
                <Badge color={current.difficulty === 'easy' ? 'green' : current.difficulty === 'medium' ? 'amber' : 'red'}>
                  {current.difficulty}
                </Badge>
              </div>
              <h2 style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                {current.text}
              </h2>
            </div>

            {/* ── Kahoot-style option grid ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}>
              {current.options.map((option, idx) => {
                const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                const isSelected = answers[currentIndex]?.optionId === option.id;
                const isCorrect = !!option.isCorrect;
                const answered = hasAnsweredCurrent;

                // Determine visual state
                let tileBg = color.base;
                let tileOpacity = 1;
                let tileBoxShadow = `0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)`;
                let tileBorder = 'none';
                let tileBrightness = 'brightness(1)';

                if (answered) {
                  if (isSelected && isCorrect) {
                    tileBg = '#059669'; // emerald
                    tileBoxShadow = '0 0 30px rgba(16,185,129,0.7), 0 6px 20px rgba(0,0,0,0.3)';
                    tileBorder = '3px solid #34d399';
                  } else if (isSelected && !isCorrect) {
                    tileBg = '#b91c1c'; // red
                    tileBoxShadow = '0 0 24px rgba(239,68,68,0.5), 0 6px 20px rgba(0,0,0,0.3)';
                    tileBorder = '3px solid #f87171';
                  } else if (!isSelected && isCorrect) {
                    tileBg = '#065f46'; // muted green
                    tileBorder = '3px solid #34d399';
                    tileOpacity = 0.9;
                  } else {
                    tileOpacity = 0.35;
                    tileBrightness = 'brightness(0.6) saturate(0.4)';
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswer(option.id, isCorrect)}
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.025, y: -3, filter: 'brightness(1.12)' } : {}}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    animate={isSelected && answered ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: tileBg,
                      border: tileBorder || `2px solid rgba(255,255,255,0.1)`,
                      borderRadius: 14,
                      padding: '0',
                      cursor: answered ? 'default' : 'pointer',
                      opacity: tileOpacity,
                      filter: tileBrightness,
                      boxShadow: tileBoxShadow,
                      transition: 'background 0.25s, box-shadow 0.25s, opacity 0.25s, filter 0.25s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                      minHeight: 68,
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Glossy highlight */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
                      background: 'rgba(255,255,255,0.08)',
                      pointerEvents: 'none',
                      borderRadius: '16px 16px 0 0',
                    }} />

                    {/* Letter badge */}
                    <div style={{
                      width: 44,
                      alignSelf: 'stretch',
                      background: 'rgba(0,0,0,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#fff',
                      borderRight: '2px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px 0 0 12px',
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </div>

                    {/* Option text */}
                    <div style={{ flex: 1, padding: '10px 14px', fontSize: 'clamp(13px, 1.4vw, 16px)', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>
                      {option.text}
                    </div>

                    {/* Checkmark / X icon */}
                    {answered && (
                      <div style={{ paddingRight: 12, fontSize: 18, flexShrink: 0 }}>
                        {isSelected && isCorrect && '✓'}
                        {isSelected && !isCorrect && '✗'}
                        {!isSelected && isCorrect && '✓'}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* ── Next button ── */}
            <AnimatePresence>
              {hasAnsweredCurrent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}
                >
                  <Button
                    size="lg"
                    onClick={handleNext}
                    className="!bg-indigo-600 hover:!bg-indigo-500 !text-white !px-12 !py-3.5 !text-lg !rounded-full shadow-[0_0_24px_rgba(79,70,229,0.5)] transition-all hover:scale-105"
                  >
                    {currentIndex < total - 1 ? 'Next Question →' : '🎉 View Results'}
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
