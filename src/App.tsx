import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, Hand, RotateCcw, Trophy, Volume2, VolumeX, Play, Lock, Check } from 'lucide-react';
import { CartoonCharacter, CharacterMood } from './components/CartoonCharacter';
import { TimingBar } from './components/TimingBar';
import { HAND_SKINS, HandSkinId, MISS_TAUNTS, SCENARIOS } from './data/scenarios';
import { soundEngine } from './utils/sound';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'GAME_OVER';

const HIGH_SCORE_KEY = 'nepok_jidat_highscore_v1';
const SKIN_KEY = 'nepok_jidat_skin_v1';
const MAX_LIVES = 3;

function pickRandomScenario(exclude?: string): string {
  const pool = exclude ? SCENARIOS.filter((s) => s !== exclude) : SCENARIOS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickRandomTaunt(exclude?: string): string {
  const pool = exclude ? MISS_TAUNTS.filter((t) => t !== exclude) : MISS_TAUNTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [round, setRound] = useState(1);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [isNewRecord, setIsNewRecord] = useState(false);

  const [selectedSkin, setSelectedSkin] = useState<HandSkinId>(() => {
    try {
      const saved = localStorage.getItem(SKIN_KEY) as HandSkinId | null;
      return saved && HAND_SKINS.some((s) => s.id === saved) ? saved : 'normal';
    } catch {
      return 'normal';
    }
  });

  const [muted, setMuted] = useState(false);
  const [scenario, setScenario] = useState<string>(() => pickRandomScenario());
  const [mood, setMood] = useState<CharacterMood>('polos');
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<'hit' | 'perfect' | 'miss' | null>(null);
  const [shakeClass, setShakeClass] = useState<string>('');
  const [roundLocked, setRoundLocked] = useState(false);

  // Target zone parameters (percent 0..100)
  const [zoneCenter, setZoneCenter] = useState(50);
  const [zoneWidth, setZoneWidth] = useState(26);
  const [perfectWidth, setPerfectWidth] = useState(9);

  // Distraction mosquito state
  const [showMosquito, setShowMosquito] = useState(false);
  const [mosquitoPos, setMosquitoPos] = useState(20);

  // Refs for 60fps needle loop without causing React re-renders
  const needleRef = useRef<HTMLDivElement | null>(null);
  const needlePosRef = useRef<number>(0); // 0..100
  const needleDirRef = useRef<1 | -1>(1);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const roundTimeoutRef = useRef<number | null>(null);
  const shakeTimeoutRef = useRef<number | null>(null);
  const mosquitoTimerRef = useRef<number | null>(null);

  const speedRef = useRef<number>(75); // % per second
  const roundLockedRef = useRef<boolean>(false);
  const lastTauntRef = useRef<string>('');

  // Keep refs synced for event listeners
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const comboRef = useRef(combo);
  comboRef.current = combo;
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const zoneCenterRef = useRef(zoneCenter);
  zoneCenterRef.current = zoneCenter;
  const zoneWidthRef = useRef(zoneWidth);
  zoneWidthRef.current = zoneWidth;
  const perfectWidthRef = useRef(perfectWidth);
  perfectWidthRef.current = perfectWidth;

  const zoneStart = zoneCenter - zoneWidth / 2;
  const perfectStart = zoneCenter - perfectWidth / 2;

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
  };

  const handleSelectSkin = (skinId: HandSkinId, unlockScore: number) => {
    if (highScore < unlockScore) return;
    setSelectedSkin(skinId);
    try {
      localStorage.setItem(SKIN_KEY, skinId);
    } catch {
      // ignore storage errors
    }
  };

  const triggerShake = useCallback((heavy: boolean) => {
    setShakeClass('');
    if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
    requestAnimationFrame(() => {
      setShakeClass(heavy ? 'animate-shake-heavy' : 'animate-shake');
      shakeTimeoutRef.current = window.setTimeout(() => {
        setShakeClass('');
      }, 450);
    });
  }, []);

  const setupRoundDifficulty = useCallback((currentScore: number) => {
    const nextSpeed = Math.min(76 + currentScore * 0.72, 230);
    const nextZoneWidth = Math.max(26 - Math.floor(currentScore / 25) * 2, 13);
    const nextPerfectWidth = Math.max(9 - Math.floor(currentScore / 45), 5);

    // Shift center slightly once score >= 40 so player reads the bar instead of blind muscle memory
    let nextCenter = 50;
    if (currentScore >= 40) {
      const margin = nextZoneWidth / 2 + 12;
      nextCenter = margin + Math.random() * (100 - margin * 2);
    }

    speedRef.current = nextSpeed;
    setZoneWidth(nextZoneWidth);
    setPerfectWidth(nextPerfectWidth);
    setZoneCenter(nextCenter);

    // Randomize needle starting side slightly
    needlePosRef.current = Math.random() > 0.5 ? 5 : 95;
    needleDirRef.current = needlePosRef.current < 50 ? 1 : -1;
    if (needleRef.current) {
      needleRef.current.style.transform = `translate3d(${needlePosRef.current}%, 0, 0)`;
    }

    // Occasional mosquito distraction starting at score 50
    const mosquitoActive = currentScore >= 50 && Math.random() < 0.55;
    setShowMosquito(mosquitoActive);
    if (mosquitoActive) {
      setMosquitoPos(15 + Math.random() * 70);
    }
  }, []);

  const startGame = useCallback(() => {
    if (roundTimeoutRef.current) window.clearTimeout(roundTimeoutRef.current);
    soundEngine.playStart();

    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLives(MAX_LIVES);
    setRound(1);
    setIsNewRecord(false);
    setMood('polos');
    setFeedbackText(null);
    setLastResult(null);
    setRoundLocked(false);
    roundLockedRef.current = false;
    setScenario(pickRandomScenario());
    setupRoundDifficulty(0);
    setGameState('PLAYING');
  }, [setupRoundDifficulty]);

  const handleSlap = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING' || roundLockedRef.current) return;

    roundLockedRef.current = true;
    setRoundLocked(true);

    const pos = needlePosRef.current;
    const zCenter = zoneCenterRef.current;
    const zHalf = zoneWidthRef.current / 2;
    const pHalf = perfectWidthRef.current / 2;

    const dist = Math.abs(pos - zCenter);
    const isPerfect = dist <= pHalf;
    const isHit = dist <= zHalf;

    if (isHit) {
      const nextCombo = comboRef.current + 1;
      const comboBonus = nextCombo >= 3 ? Math.min((nextCombo - 2) * 2, 10) : 0;
      const points = (isPerfect ? 15 : 10) + comboBonus;
      const nextScore = scoreRef.current + points;

      soundEngine.playSlap(isPerfect);
      triggerShake(isPerfect);

      setScore(nextScore);
      setCombo(nextCombo);
      setBestCombo((prev) => Math.max(prev, nextCombo));
      setMood(isPerfect ? 'perfect' : 'slapped');
      setLastResult(isPerfect ? 'perfect' : 'hit');
      setFeedbackText(
        isPerfect
          ? `+${points} TEPAT JIDAT!`
          : comboBonus > 0
          ? `+${points} PLAK! (${nextCombo}x)`
          : `+${points} PLAK!`
      );

      setHighScore((prevHigh) => {
        if (nextScore > prevHigh) {
          setIsNewRecord(true);
          try {
            localStorage.setItem(HIGH_SCORE_KEY, String(nextScore));
          } catch {
            // ignore
          }
          return nextScore;
        }
        return prevHigh;
      });

      roundTimeoutRef.current = window.setTimeout(() => {
        if (gameStateRef.current !== 'PLAYING') return;
        setMood('polos');
        setFeedbackText(null);
        setLastResult(null);
        setRound((r) => r + 1);
        setScenario((prev) => pickRandomScenario(prev));
        setupRoundDifficulty(nextScore);
        roundLockedRef.current = false;
        setRoundLocked(false);
      }, 680);
    } else {
      // Missed!
      const nextLives = livesRef.current - 1;
      soundEngine.playMiss();
      triggerShake(false);

      const taunt = pickRandomTaunt(lastTauntRef.current);
      lastTauntRef.current = taunt;

      setLives(nextLives);
      setCombo(0);
      setMood(nextLives <= 0 ? 'gameover' : 'missed');
      setLastResult('miss');
      setFeedbackText(taunt);

      if (nextLives <= 0) {
        roundTimeoutRef.current = window.setTimeout(() => {
          soundEngine.playGameOver();
          setGameState('GAME_OVER');
          roundLockedRef.current = false;
          setRoundLocked(false);
        }, 720);
      } else {
        roundTimeoutRef.current = window.setTimeout(() => {
          if (gameStateRef.current !== 'PLAYING') return;
          setMood('polos');
          setFeedbackText(null);
          setLastResult(null);
          setRound((r) => r + 1);
          setScenario((prev) => pickRandomScenario(prev));
          setupRoundDifficulty(scoreRef.current);
          roundLockedRef.current = false;
          setRoundLocked(false);
        }, 850);
      }
    }
  }, [setupRoundDifficulty, triggerShake]);

  // 60fps needle sweep animation loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      if (!roundLockedRef.current) {
        let next = needlePosRef.current + needleDirRef.current * speedRef.current * dt;
        if (next >= 100) {
          next = 100 - (next - 100);
          needleDirRef.current = -1;
        } else if (next <= 0) {
          next = Math.abs(next);
          needleDirRef.current = 1;
        }
        needlePosRef.current = Math.max(0, Math.min(100, next));
        if (needleRef.current) {
          needleRef.current.style.transform = `translate3d(${needlePosRef.current}%, 0, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState]);

  // Mosquito subtle wiggle interval
  useEffect(() => {
    if (!showMosquito || gameState !== 'PLAYING') return;
    mosquitoTimerRef.current = window.setInterval(() => {
      setMosquitoPos((p) => {
        const delta = (Math.random() - 0.5) * 26;
        return Math.max(10, Math.min(90, p + delta));
      });
    }, 380);
    return () => {
      if (mosquitoTimerRef.current) window.clearInterval(mosquitoTimerRef.current);
    };
  }, [showMosquito, gameState]);

  // Spacebar keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Ignore if user is focused on a button other than stage/slap so we don't double fire
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'BUTTON' && gameStateRef.current !== 'PLAYING') return;

        e.preventDefault();
        if (gameStateRef.current === 'PLAYING') {
          handleSlap();
        } else {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSlap, startGame]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (roundTimeoutRef.current) window.clearTimeout(roundTimeoutRef.current);
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
      if (mosquitoTimerRef.current) window.clearInterval(mosquitoTimerRef.current);
    };
  }, []);

  const speedLevel = Math.min(1 + Math.floor(score / 30), 6);

  return (
    <div className="min-h-screen comic-dots flex flex-col">
      {/* Top Bar (3-zone contract: Brand — Stats/Nav — Action) */}
      <header className="w-full border-b-[3px] border-[#1E1B18] bg-white/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => {
              if (roundTimeoutRef.current) window.clearTimeout(roundTimeoutRef.current);
              setGameState('TITLE_MENU');
            }}
            className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#1E1B18] whitespace-nowrap shrink-0 hover:text-red-600 transition-colors cursor-pointer"
          >
            Nepok Jidat
          </button>

          {/* Zone 2: Clean unboxed HUD metrics */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-semibold text-stone-700 overflow-x-auto">
            <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="text-stone-500">Skor</span>
              <span className="font-mono font-bold text-[#1E1B18] tabular-nums">{score}</span>
            </div>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="text-stone-500">Combo</span>
              <span className="font-mono font-bold text-amber-600 tabular-nums">{combo}x</span>
            </div>
            <span className="text-stone-300 hidden sm:inline" aria-hidden="true">·</span>
            <div className="hidden sm:flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span className="text-stone-500">Rekor</span>
              <span className="font-mono font-bold text-[#1E1B18] tabular-nums">{highScore}</span>
            </div>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <div
              className="flex items-center gap-1 whitespace-nowrap shrink-0"
              aria-label={`Nyawa tersisa ${lives} dari ${MAX_LIVES}`}
            >
              {Array.from({ length: MAX_LIVES }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-4 h-4 transition-transform duration-150 ${
                    idx < lives
                      ? 'fill-red-500 text-[#1E1B18] scale-100'
                      : 'fill-stone-200 text-stone-400 scale-90'
                  }`}
                />
              ))}
              <span className="ml-1 font-mono text-xs text-stone-600 tabular-nums">
                {lives}/{MAX_LIVES}
              </span>
            </div>
          </div>

          {/* Zone 3: Primary sound control */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-[#1E1B18] bg-amber-100 hover:bg-amber-200 text-xs font-bold text-[#1E1B18] comic-shadow-sm active:translate-y-0.5 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{muted ? 'Mati' : 'Suara'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className={`w-full max-w-3xl bg-white border-[3px] border-[#1E1B18] rounded-2xl comic-shadow-lg p-5 sm:p-8 ${shakeClass}`}
        >
          {/* TITLE MENU */}
          {gameState === 'TITLE_MENU' && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 text-xs font-semibold text-stone-500">
                Game Reaksi Komik · Bahasa Indonesia
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-[#1E1B18] text-balance mb-3">
                Nepok Jidat!
              </h1>
              <p className="text-stone-600 text-sm sm:text-base max-w-lg mb-6 leading-relaxed">
                Pak Raden lagi hobi ngelakuin hal-hal konyol. Tekan{' '}
                <kbd className="px-2 py-0.5 font-mono text-xs font-bold bg-stone-100 border-2 border-[#1E1B18] rounded">
                  SPASI
                </kbd>{' '}
                atau klik layar tepat saat jarum berada di zona hijau biar jidatnya langsung{' '}
                <strong className="text-red-600">PLAK!</strong>
              </p>

              {/* Character Preview */}
              <div className="mb-4">
                <CartoonCharacter mood="polos" handSkin={selectedSkin} />
              </div>

              {/* Hand Skin Picker */}
              <div className="w-full max-w-xl mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-2">
                  <span>Pilih Tangan Tepokan</span>
                  <span className="font-mono tabular-nums">Rekor Tertinggi: {highScore}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {HAND_SKINS.map((skin) => {
                    const unlocked = highScore >= skin.unlockScore;
                    const active = selectedSkin === skin.id;
                    return (
                      <button
                        key={skin.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => handleSelectSkin(skin.id, skin.unlockScore)}
                        title={skin.description}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                          active
                            ? 'border-[#1E1B18] bg-amber-200 comic-shadow-sm'
                            : unlocked
                            ? 'border-[#1E1B18] bg-stone-50 hover:bg-amber-50 cursor-pointer'
                            : 'border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-display font-bold text-xs text-[#1E1B18] truncate">
                            {skin.name}
                          </span>
                          {active ? (
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          ) : !unlocked ? (
                            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          ) : null}
                        </div>
                        <div className="text-[11px] font-mono text-stone-600">
                          {unlocked ? 'Terbuka' : `Skor ${skin.unlockScore}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start CTA */}
              <button
                type="button"
                onClick={startGame}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border-[3px] border-[#1E1B18] bg-red-500 hover:bg-red-600 text-white font-display font-extrabold text-lg sm:text-xl comic-shadow active:translate-y-1 transition-all cursor-pointer whitespace-nowrap"
              >
                <Play className="w-5 h-5 fill-current" />
                Mulai Main
              </button>
            </div>
          )}

          {/* ACTIVE GAMEPLAY */}
          {gameState === 'PLAYING' && (
            <div className="flex flex-col items-center">
              {/* Round & Speed subtle metadata */}
              <div className="w-full flex items-center justify-between text-xs font-semibold text-stone-500 mb-3">
                <span className="font-mono tabular-nums">Ronde #{round}</span>
                <span>
                  Kecepatan Level <strong className="font-mono text-[#1E1B18]">{speedLevel}</strong>
                  {showMosquito ? ' · Awas Nyamuk!' : ''}
                </span>
              </div>

              {/* Clickable Stage Area (Speech Bubble + Character) */}
              <div
                onClick={handleSlap}
                role="button"
                tabIndex={0}
                aria-label="Area panggung permainan, klik untuk menepok jidat"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSlap();
                }}
                className="w-full flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E1B18] rounded-xl py-2"
              >
                {/* Comic Speech Bubble */}
                <div className="relative w-full max-w-xl bg-amber-50 border-[3px] border-[#1E1B18] rounded-2xl px-5 py-4 comic-shadow mb-5">
                  <p className="font-display font-bold text-lg sm:text-2xl text-center text-[#1E1B18] leading-snug text-balance">
                    “{scenario}”
                  </p>
                  {/* Speech Bubble Tail */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#1E1B18]"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -bottom-[11px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[11px] border-r-[11px] border-t-[13px] border-l-transparent border-r-transparent border-t-amber-50"
                    aria-hidden="true"
                  />
                </div>

                {/* Cartoon Character + Floating Score/Taunt Feedback */}
                <div className="relative flex items-center justify-center my-1">
                  <CartoonCharacter mood={mood} handSkin={selectedSkin} />

                  {feedbackText && (
                    <div
                      key={`${round}-${feedbackText}`}
                      className={`absolute -top-3 z-30 px-3.5 py-1.5 rounded-lg border-2 border-[#1E1B18] comic-shadow-sm font-display font-extrabold text-sm sm:text-base whitespace-nowrap pointer-events-none animate-float-up ${
                        lastResult === 'miss'
                          ? 'bg-red-500 text-white'
                          : lastResult === 'perfect'
                          ? 'bg-yellow-300 text-[#1E1B18]'
                          : 'bg-emerald-400 text-[#1E1B18]'
                      }`}
                    >
                      {feedbackText}
                    </div>
                  )}
                </div>
              </div>

              {/* Timing Bar */}
              <div className="w-full mt-2 mb-5">
                <TimingBar
                  needleRef={needleRef}
                  zoneStart={zoneStart}
                  zoneWidth={zoneWidth}
                  perfectStart={perfectStart}
                  perfectWidth={perfectWidth}
                  showMosquito={showMosquito}
                  mosquitoPos={mosquitoPos}
                  locked={roundLocked}
                  lastResult={lastResult}
                />
              </div>

              {/* Big Red Slap Button */}
              <button
                type="button"
                onClick={handleSlap}
                disabled={roundLocked}
                className={`w-full max-w-md inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-[3px] border-[#1E1B18] font-display font-extrabold text-xl tracking-wide transition-all whitespace-nowrap ${
                  roundLocked
                    ? 'bg-stone-300 text-stone-600 cursor-default translate-y-0.5'
                    : 'bg-red-500 hover:bg-red-600 text-white comic-shadow active:translate-y-1 cursor-pointer'
                }`}
              >
                <Hand className="w-6 h-6" />
                TEPOK JIDAT! (SPASI)
              </button>
            </div>
          )}

          {/* GAME OVER */}
          {gameState === 'GAME_OVER' && (
            <div className="flex flex-col items-center text-center">
              <div className="text-xs font-semibold text-red-600 mb-1">
                Nyawa Habis · Permainan Selesai
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#1E1B18] mb-2">
                {isNewRecord ? 'Rekor Baru Tercetak!' : 'Jidatnya Lolos Terus!'}
              </h2>
              <p className="text-sm text-stone-600 mb-4 max-w-md">
                {score >= 100
                  ? 'Reflek dewa! Jidat Pak Raden sampe merah permanen.'
                  : score >= 50
                  ? 'Lumayan jago! Tinggal dikit lagi tembus rekor master.'
                  : 'Kebanyakan melamun ya? Ayo coba lagi biar makin akurat!'}
              </p>

              <div className="mb-4">
                <CartoonCharacter mood="gameover" handSkin={selectedSkin} />
              </div>

              {/* Score Summary Row */}
              <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl border-2 border-[#1E1B18] bg-amber-50">
                  <div className="text-xs font-semibold text-stone-500">Skor Akhir</div>
                  <div className="font-mono font-bold text-2xl text-[#1E1B18] tabular-nums">
                    {score}
                  </div>
                </div>
                <div className="p-3 rounded-xl border-2 border-[#1E1B18] bg-emerald-50">
                  <div className="text-xs font-semibold text-stone-500">Max Combo</div>
                  <div className="font-mono font-bold text-2xl text-emerald-700 tabular-nums">
                    {bestCombo}x
                  </div>
                </div>
                <div className="p-3 rounded-xl border-2 border-[#1E1B18] bg-yellow-100">
                  <div className="text-xs font-semibold text-stone-500">Rekor</div>
                  <div className="font-mono font-bold text-2xl text-[#1E1B18] tabular-nums">
                    {highScore}
                  </div>
                </div>
              </div>

              {/* Quick Skin Unlock Check */}
              <div className="w-full max-w-md mb-6 text-left">
                <div className="text-xs font-semibold text-stone-600 mb-2">
                  Ganti Tangan Tepokan:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HAND_SKINS.map((skin) => {
                    const unlocked = highScore >= skin.unlockScore;
                    const active = selectedSkin === skin.id;
                    return (
                      <button
                        key={skin.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => handleSelectSkin(skin.id, skin.unlockScore)}
                        className={`px-2.5 py-2 rounded-lg border-2 text-xs font-bold transition-all truncate ${
                          active
                            ? 'border-[#1E1B18] bg-amber-200'
                            : unlocked
                            ? 'border-[#1E1B18] bg-white hover:bg-amber-50 cursor-pointer'
                            : 'border-stone-300 bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        {unlocked ? skin.name : `🔒 ${skin.unlockScore}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startGame}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border-[3px] border-[#1E1B18] bg-red-500 hover:bg-red-600 text-white font-display font-extrabold text-lg comic-shadow active:translate-y-1 transition-all cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-5 h-5" />
                  Main Lagi (Spasi)
                </button>
                <button
                  type="button"
                  onClick={() => setGameState('TITLE_MENU')}
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border-[3px] border-[#1E1B18] bg-white hover:bg-stone-100 text-[#1E1B18] font-display font-bold text-base comic-shadow-sm active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  Menu Utama
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
