import React from 'react';

interface TimingBarProps {
  needleRef: React.RefObject<HTMLDivElement | null>;
  zoneStart: number; // percentage 0..100
  zoneWidth: number; // percentage
  perfectStart: number; // percentage 0..100
  perfectWidth: number; // percentage
  showMosquito: boolean;
  mosquitoPos: number; // percentage 0..100
  locked: boolean;
  lastResult: 'hit' | 'perfect' | 'miss' | null;
}

export const TimingBar: React.FC<TimingBarProps> = ({
  needleRef,
  zoneStart,
  zoneWidth,
  perfectStart,
  perfectWidth,
  showMosquito,
  mosquitoPos,
  locked,
  lastResult,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-stone-600">
        <span>Area Tepok</span>
        <span className="font-mono tabular-nums">
          Zona Hijau = +10 · Tengah = +15
        </span>
      </div>

      {/* Outer Track */}
      <div
        className={`relative h-12 w-full rounded-xl border-[3px] border-[#1E1B18] bg-stone-100 overflow-hidden comic-shadow transition-colors duration-150 ${
          lastResult === 'miss' ? 'bg-red-100' : ''
        }`}
      >
        {/* Subtle left/right danger tick marks */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #1E1B18 0px, #1E1B18 2px, transparent 2px, transparent 24px)',
          }}
        />

        {/* Green Hit Zone */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-400 border-x-[2.5px] border-[#1E1B18] transition-all duration-200"
          style={{
            left: `${zoneStart}%`,
            width: `${zoneWidth}%`,
          }}
        />

        {/* Inner Perfect Bullseye Zone */}
        <div
          className="absolute top-0 bottom-0 bg-emerald-600 border-x-2 border-emerald-900/40 flex items-center justify-center transition-all duration-200"
          style={{
            left: `${perfectStart}%`,
            width: `${perfectWidth}%`,
          }}
        >
          <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase select-none">
            PAS
          </span>
        </div>

        {/* Distraction Mosquito at higher scores */}
        {showMosquito && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-none transition-transform duration-100"
            style={{ left: `${mosquitoPos}%` }}
            aria-hidden="true"
          >
            <svg width="28" height="24" viewBox="0 0 28 24">
              <ellipse cx="11" cy="7" rx="5" ry="3" fill="#E0F2FE" stroke="#1E1B18" strokeWidth="1.5" transform="rotate(-25 11 7)" />
              <ellipse cx="17" cy="7" rx="5" ry="3" fill="#E0F2FE" stroke="#1E1B18" strokeWidth="1.5" transform="rotate(25 17 7)" />
              <ellipse cx="14" cy="14" rx="6" ry="3.5" fill="#292524" stroke="#1E1B18" strokeWidth="1.5" />
              <line x1="20" y1="14" x2="26" y2="16" stroke="#1E1B18" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        {/* Moving Needle (positioned via transform on inner wrapper for zero-lag 60fps) */}
        <div
          ref={needleRef}
          className="absolute top-0 bottom-0 left-0 w-full pointer-events-none z-10 will-change-transform"
          style={{ transform: 'translate3d(0%, 0, 0)' }}
        >
          <div
            className={`-ml-[5px] w-[10px] h-full border-x-2 border-[#1E1B18] ${
              locked
                ? lastResult === 'miss'
                  ? 'bg-red-500'
                  : 'bg-amber-300'
                : 'bg-amber-400'
            }`}
          >
            {/* Top triangle marker */}
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-[#1E1B18] -ml-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
