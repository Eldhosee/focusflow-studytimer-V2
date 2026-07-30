import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2, Play, Square, Trash2 } from 'lucide-react';
import { useFocusSession } from '../../contexts/FocusSessionContext';
import { useAppData } from '../../contexts/AppDataContext';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useIdleCursor } from '../../hooks/useIdleCursor';
import { formatClockTime, formatTimer } from '../../utils/time';
import { DEFAULT_SUBJECT } from '../../database/db';
import { useToast } from '../../contexts/ToastContext';
import { notifications } from '../../services/notificationService';
import { clsx } from '../../utils/clsx';

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + (i % 3),
  delay: (i % 7) * 0.6,
  duration: 6 + (i % 5),
}));

function FocusBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(242,169,78,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(124,131,253,0.08) 0%, transparent 60%), #0b0b12',
        }}
      />
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[color:var(--color-amber-soft)]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: 0.3,
            animation: `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 220px 80px rgba(0,0,0,0.75)' }}
      />
    </div>
  );
}

function PreSessionScreen({ onStart }: { onStart: (subject: string) => void }) {
  const { subjects } = useAppData();
  const [subject, setSubject] = useState<string>(subjects[0]?.name ?? DEFAULT_SUBJECT);

  useEffect(() => {
    if (subjects.length && !subjects.some((s) => s.name === subject)) {
      setSubject(subjects[0].name);
    }
  }, [subjects, subject]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 text-center"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          Ready when you are
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[color:var(--color-text-primary)]">
          What are you studying?
        </h1>
      </div>

      <div className="w-full">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="glass w-full appearance-none rounded-xl px-4 py-3 text-center text-sm font-medium text-[color:var(--color-text-primary)] outline-none"
        >
          {subjects.length === 0 && <option value={DEFAULT_SUBJECT}>{DEFAULT_SUBJECT}</option>}
          {subjects.map((s) => (
            <option key={s.id} value={s.name} className="bg-[#14141F]">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onStart(subject || DEFAULT_SUBJECT)}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-[color:var(--color-amber-soft)] to-[color:var(--color-amber)] text-[#1a1206] shadow-[var(--shadow-glow-amber)] transition-transform hover:scale-105 active:scale-95"
        aria-label="Begin study session"
      >
        <Play size={28} fill="currentColor" className="ml-1" />
      </button>

      <button
  type="button"
  className="text-sm font-medium text-[color:var(--color-amber)] transition hover:underline"
  onClick={() => {
    // We'll implement this later
  }}
>
  + Manage Subjects
</button>
      <p className="text-xs text-[color:var(--color-text-muted)]">
        Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">F</kbd> to go fullscreen once started
      </p>
    </motion.div>
  );
}

export function FocusPage() {
  const { isActive, startTime, subject, elapsedSeconds, isRestoring, start, end, discard } = useFocusSession();
  const { settings } = useAppData();
  const { isFullscreen, enter, exit, toggle } = useFullscreen();
  const isIdle = useIdleCursor(3000);
  const navigate = useNavigate();
  const { show } = useToast();
  const [isEnding, setIsEnding] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const lastReminderRef = useRef(0);

  const startedLabel = useMemo(() => (startTime ? formatClockTime(startTime) : ''), [startTime]);

  // Fire a break reminder every N minutes of continuous focus, if enabled in settings.
  useEffect(() => {
    const minutes = settings?.breakReminderMinutes ?? 0;
    if (!isActive || minutes <= 0) return;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const cycle = Math.floor(elapsedMinutes / minutes);
    if (cycle > 0 && cycle !== lastReminderRef.current) {
      lastReminderRef.current = cycle;
      notifications.breakReminder();
    }
  }, [elapsedSeconds, isActive, settings?.breakReminderMinutes]);

  const handleEnd = async () => {
    setIsEnding(true);
    await end();
    show('Session saved.', 'success');
    if (document.fullscreenElement) await exit();
    navigate('/');
  };

  const handleDiscard = async () => {
    await discard();
    if (document.fullscreenElement) await exit();
    show('Session discarded.', 'info');
    navigate('/');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isActive) {
        e.preventDefault();
        handleEnd();
      } else if (e.key.toLowerCase() === 'f') {
        toggle();
      } else if (e.key === 'Escape' && document.fullscreenElement) {
        exit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  if (isRestoring) {
    return <div className="flex h-screen w-full items-center justify-center bg-[color:var(--color-base)]" />;
  }

  return (
    <div
      className={clsx(
        'relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[color:var(--color-base)] px-6',
        isIdle && isActive && 'cursor-none'
      )}
    >
      <FocusBackground />

      <button
        onClick={toggle}
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--color-text-muted)] transition-opacity hover:bg-white/5 hover:text-[color:var(--color-text-primary)]"
        style={{ opacity: isIdle && isActive ? 0 : 1 }}
        aria-label="Toggle fullscreen"
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      <AnimatePresence mode="wait">
        {!isActive ? (
          <PreSessionScreen key="pre" onStart={(s) => start(s).then(enter)} />
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-10 text-center"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[color:var(--color-amber-soft)]">
                {subject || DEFAULT_SUBJECT}
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">Started at {startedLabel}</p>
            </div>

            <motion.div
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="font-[family-name:var(--font-mono)] text-6xl font-semibold tabular-nums text-[color:var(--color-text-primary)] sm:text-8xl"
              style={{ textShadow: '0 0 60px rgba(242,169,78,0.25)' }}
            >
              {formatTimer(elapsedSeconds)}
            </motion.div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleEnd}
                disabled={isEnding}
                className="flex items-center gap-2.5 rounded-full bg-gradient-to-b from-[color:var(--color-amber-soft)] to-[color:var(--color-amber)] px-8 py-4 font-semibold text-[#1a1206] shadow-[var(--shadow-glow-amber)] transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                <Square size={16} fill="currentColor" />
                End Session
              </button>

              {!confirmDiscard ? (
                <button
                  onClick={() => setConfirmDiscard(true)}
                  className="flex items-center gap-1.5 text-xs text-[color:var(--color-text-muted)] transition-colors hover:text-[color:var(--color-danger)]"
                  style={{ opacity: isIdle ? 0 : 1 }}
                >
                  <Trash2 size={12} />
                  Discard session
                </button>
              ) : (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[color:var(--color-text-muted)]">Discard without saving?</span>
                  <button onClick={handleDiscard} className="font-medium text-[color:var(--color-danger)]">
                    Yes, discard
                  </button>
                  <button
                    onClick={() => setConfirmDiscard(false)}
                    className="font-medium text-[color:var(--color-text-secondary)]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[color:var(--color-text-muted)]" style={{ opacity: isIdle ? 0 : 0.7 }}>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5">Space</kbd> end ·{' '}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5">F</kbd> fullscreen ·{' '}
              <kbd className="rounded bg-white/10 px-1.5 py-0.5">Esc</kbd> exit fullscreen
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
