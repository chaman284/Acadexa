import React from 'react';

export interface AcadexaLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export const AcadexaLoader: React.FC<AcadexaLoaderProps> = ({
  size = 'md',
  text,
  subtext,
  theme = 'light',
  className = '',
}) => {
  // Dimension mappings
  const dimensions = {
    sm: { emblemSize: 56, shadowWidth: 48, shadowHeight: 8, ringMax: 70, starTop: 6 },
    md: { emblemSize: 96, shadowWidth: 78, shadowHeight: 12, ringMax: 110, starTop: 10 },
    lg: { emblemSize: 136, shadowWidth: 108, shadowHeight: 16, ringMax: 150, starTop: 14 },
  }[size];

  const isDark = theme === 'dark';
  const textColor = isDark ? '#F7F1E8' : '#302A2B';
  const subtextColor = isDark ? 'rgba(247, 241, 232, 0.65)' : '#79666A';

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <style>{`
        @keyframes acadexaGentleBounce {
          0%, 100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
          }
          50% {
            transform: translateY(-9px);
            animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
          }
        }

        @keyframes acadexaShadowPulse {
          0%, 100% {
            transform: scaleX(1);
            opacity: 0.28;
          }
          50% {
            transform: scaleX(0.72);
            opacity: 0.12;
          }
        }

        @keyframes acadexaStarPulse {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(212, 160, 89, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(229, 183, 118, 0.95)) drop-shadow(0 0 16px rgba(212, 160, 89, 0.5));
          }
        }

        @keyframes acadexaHaloRing {
          0% {
            transform: translate(-50%, -50%) rotateX(65deg) scale(0.25);
            opacity: 0.95;
            border-width: 2px;
          }
          50% {
            opacity: 0.65;
          }
          100% {
            transform: translate(-50%, -50%) rotateX(65deg) scale(1.65);
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes acadexaStarRingsOutward {
          0% {
            transform: translate(-50%, -50%) scale(0.2);
            opacity: 0.85;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0;
          }
        }
      `}</style>

      {/* Emblem & Animation Stage */}
      <div
        className="relative flex flex-col items-center justify-end"
        style={{ width: dimensions.emblemSize + 60, height: dimensions.emblemSize + 40 }}
      >
        {/* Star Expanding Halo Circles Around The Head/Cap */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: dimensions.starTop + 8,
            left: '50%',
            width: dimensions.ringMax,
            height: dimensions.ringMax,
            perspective: '500px',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Orbital circle 1 */}
          <div
            className="absolute rounded-full border border-[#D4A059]"
            style={{
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              boxShadow: '0 0 8px rgba(212, 160, 89, 0.45), inset 0 0 6px rgba(212, 160, 89, 0.3)',
              animation: 'acadexaHaloRing 2.2s infinite ease-out',
            }}
          />
          {/* Orbital circle 2 - delayed */}
          <div
            className="absolute rounded-full border border-[#E5B776]"
            style={{
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              boxShadow: '0 0 8px rgba(229, 183, 118, 0.45)',
              animation: 'acadexaHaloRing 2.2s infinite ease-out 0.73s',
            }}
          />
          {/* Orbital circle 3 - delayed */}
          <div
            className="absolute rounded-full border border-[#C58D98]"
            style={{
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              boxShadow: '0 0 8px rgba(197, 141, 152, 0.35)',
              animation: 'acadexaHaloRing 2.2s infinite ease-out 1.46s',
            }}
          />
        </div>

        {/* Bouncing Acadexa Emblem */}
        <div
          className="relative z-10"
          style={{
            animation: 'acadexaGentleBounce 1.8s infinite ease-in-out',
          }}
        >
          <img
            src="/acadexa-emblem.png"
            alt="Acadexa Emblem"
            className="object-contain drop-shadow-md select-none"
            style={{
              width: dimensions.emblemSize,
              height: dimensions.emblemSize,
              animation: 'acadexaStarPulse 1.8s infinite ease-in-out',
            }}
            draggable={false}
          />
        </div>

        {/* Dynamic Ground Shadow */}
        <div
          className="rounded-[50%] blur-[2px] transition-all"
          style={{
            width: dimensions.shadowWidth,
            height: dimensions.shadowHeight,
            background: isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(50, 25, 35, 0.22)',
            marginTop: 4,
            animation: 'acadexaShadowPulse 1.8s infinite ease-in-out',
          }}
        />
      </div>

      {/* Optional Loading Text */}
      {(text || subtext) && (
        <div className="mt-4 text-center">
          {text && (
            <p
              className="text-sm font-medium tracking-[0.06em]"
              style={{ color: textColor, fontFamily: '"DM Serif Display", Georgia, serif' }}
            >
              {text}
            </p>
          )}
          {subtext && (
            <p
              className="text-[11px] tracking-wide mt-0.5"
              style={{ color: subtextColor }}
            >
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const AcadexaLoadingScreen: React.FC<{
  text?: string;
  subtext?: string;
}> = ({
  text = 'Loading Acadexa...',
  subtext = 'Assess. Identify. Improve.',
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: '#F7F1E8',
      }}
    >
      <div className="flex flex-col items-center">
        <AcadexaLoader size="lg" text={text} subtext={subtext} theme="light" />
      </div>
    </div>
  );
};
