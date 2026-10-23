import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Phases:
  // 'hidden'  → initial state, logo invisible
  // 'enter'   → logo animates in (drop + bounce)
  // 'hold'    → music plays, rings pulse, tagline reveals
  // 'exit'    → whole screen fades out gracefully
  const [phase, setPhase] = useState<'hidden' | 'enter' | 'hold' | 'exit'>('hidden');
  const audioRef = useRef<AudioContext | null>(null);

  // Warm academic fanfare using Web Audio API
  const playWelcomeTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioRef.current = ctx;

      // Reverb convolver for warmth
      const convolver = ctx.createConvolver();
      const noiseBuffer = ctx.createBuffer(2, ctx.sampleRate * 1.5, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = noiseBuffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
        }
      }
      convolver.buffer = noiseBuffer;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.75;
      convolver.connect(masterGain);
      masterGain.connect(ctx.destination);

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1;
      dryGain.connect(ctx.destination);

      const playNote = (
        freq: number,
        startTime: number,
        duration: number,
        gain: number = 0.15,
        type: OscillatorType = 'sine',
        wet = true
      ) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(wet ? convolver : dryGain);
        gainNode.connect(dryGain); // always some dry signal
        osc.frequency.value = freq;
        osc.type = type;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      };

      const t = ctx.currentTime + 0.15;

      // Warm bass undertone
      playNote(130.81, t, 2.2, 0.08, 'triangle', true);   // C3

      // Main ascending chime: C E G C
      playNote(523.25, t + 0.00, 1.6, 0.14, 'sine', true); // C5
      playNote(659.25, t + 0.25, 1.4, 0.13, 'sine', true); // E5
      playNote(783.99, t + 0.50, 1.2, 0.12, 'sine', true); // G5
      playNote(1046.5, t + 0.80, 1.8, 0.17, 'sine', true); // C6 — grand

      // Harmonics
      playNote(392.00, t + 0.25, 1.2, 0.05, 'triangle', true); // G4
      playNote(493.88, t + 0.50, 1.0, 0.04, 'triangle', true); // B4

      // Sparkle tail
      playNote(1318.5,  t + 1.05, 0.9, 0.06, 'sine', false);  // E6
      playNote(1567.98, t + 1.30, 0.7, 0.04, 'sine', false);  // G6

    } catch (e) {
      // Audio not supported — fail silently
    }
  };

  useEffect(() => {
    // Step 1: start enter animation immediately
    const t0 = requestAnimationFrame(() => setPhase('enter'));

    // Step 2: play music + transition to hold
    const t1 = setTimeout(() => {
      playWelcomeTone();
      setPhase('hold');
    }, 550);

    // Step 3: begin exit (fade out)
    const t2 = setTimeout(() => {
      setPhase('exit');
    }, 2700);

    // Step 4: unmount and notify app
    const t3 = setTimeout(() => {
      onComplete();
    }, 3450);

    return () => {
      cancelAnimationFrame(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      try { audioRef.current?.close(); } catch (_) {}
    };
  }, []);

  const isVisible = phase !== 'hidden';
  const isExiting = phase === 'exit';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #2A0F19 0%, #3d1726 40%, #302A2B 100%)',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.035)' : 'scale(1)',
        transition: isExiting
          ? 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
          : 'none',
        pointerEvents: isExiting ? 'none' : 'all',
        willChange: 'opacity, transform',
      }}
    >
      <style>{`
        @keyframes splashLogoEnter {
          0%   { opacity: 0; transform: translateY(-52px) scale(0.82); }
          55%  { opacity: 1; transform: translateY(8px) scale(1.04); }
          75%  { transform: translateY(-4px) scale(0.98); }
          90%  { transform: translateY(2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes splashLogoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }

        @keyframes splashStarGlow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(212,160,89,0.5))
                    drop-shadow(0 0 18px rgba(212,160,89,0.25));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(229,183,118,0.95))
                    drop-shadow(0 0 36px rgba(212,160,89,0.6))
                    drop-shadow(0 0 55px rgba(212,160,89,0.28));
          }
        }

        @keyframes splashRingExpand {
          0%   { transform: scale(0.12); opacity: 0.85; }
          100% { transform: scale(1.6);  opacity: 0; }
        }

        @keyframes splashTaglineReveal {
          0%   { opacity: 0; transform: translateY(6px); letter-spacing: 0.32em; }
          100% { opacity: 1; transform: translateY(0);   letter-spacing: 0.2em;  }
        }

        @keyframes splashShadowPulse {
          0%, 100% { transform: scaleX(1);    opacity: 0.3; }
          50%       { transform: scaleX(0.55); opacity: 0.08; }
        }

        @keyframes splashBarReveal {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes splashShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* Deep radial glow behind logo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 48%, rgba(84,37,54,0.55) 0%, transparent 72%)',
        }}
      />

      {/* Pulsing halo rings — only during hold */}
      {phase === 'hold' && [0, 0.45, 0.9].map((delay, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '44%',
            left: '50%',
            marginTop: -(110 + i * 35),
            marginLeft: -(110 + i * 35),
            width: 220 + i * 70,
            height: 220 + i * 70,
            border: `1px solid rgba(212, 160, 89, ${0.5 - i * 0.12})`,
            boxShadow: `0 0 12px rgba(212,160,89,${0.18 - i * 0.04})`,
            animation: `splashRingExpand 1.9s ease-out infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}

      {/* Logo stage */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: isVisible ? 1 : 0,
          animation: phase === 'enter' || phase === 'hold' || phase === 'exit'
            ? 'splashLogoEnter 0.85s cubic-bezier(0.34, 1.42, 0.64, 1) forwards'
            : undefined,
        }}
      >
        {/* Logo image with float + glow during hold */}
        <div
          style={{
            animation: phase === 'hold' || phase === 'exit'
              ? 'splashLogoFloat 3s ease-in-out infinite, splashStarGlow 2.4s ease-in-out infinite'
              : undefined,
          }}
        >
          <img
            src="/acadexa-logo-light.png"
            alt="Acadexa"
            style={{
              height: '210px',
              width: 'auto',
              objectFit: 'contain',
              userSelect: 'none',
              draggable: false,
              filter: 'drop-shadow(0 6px 28px rgba(0,0,0,0.4))',
            } as React.CSSProperties}
            draggable={false}
          />
        </div>

        {/* Ground shadow */}
        <div
          className="rounded-full blur-[5px] mt-1"
          style={{
            width: 148,
            height: 12,
            background: 'rgba(0,0,0,0.55)',
            animation: phase === 'hold' || phase === 'exit'
              ? 'splashShadowPulse 3s ease-in-out infinite'
              : undefined,
          }}
        />

        {/* Tagline — slides in after hold starts */}
        <p
          className="mt-9 text-[#E8DDD3] text-[13px]"
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            letterSpacing: '0.2em',
            opacity: 0,
            animation: phase === 'hold' || phase === 'exit'
              ? 'splashTaglineReveal 0.85s cubic-bezier(0.34, 1.2, 0.64, 1) forwards 0.2s'
              : undefined,
          }}
        >
          ASSESS · IDENTIFY · IMPROVE
        </p>
      </div>

      {/* Bottom progress shimmer bar */}
      <div
        className="absolute bottom-10 flex flex-col items-center gap-2.5"
        style={{
          opacity: 0,
          animation: phase === 'hold' || phase === 'exit'
            ? 'splashBarReveal 0.6s ease forwards 0.55s'
            : undefined,
        }}
      >
        <div
          className="w-32 h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(247,241,232,0.10)' }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4A059, #E8DDD3, #C58D98, #D4A059, transparent)',
              backgroundSize: '300% 100%',
              animation: 'splashShimmer 1.6s linear infinite',
            }}
          />
        </div>
        <p
          className="text-[10px] uppercase font-medium tracking-widest"
          style={{ color: 'rgba(247,241,232,0.28)' }}
        >
          Academic Intelligence Platform
        </p>
      </div>
    </div>
  );
};
