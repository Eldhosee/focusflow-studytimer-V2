import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { activeSessionRepository } from '../database/repositories';
import { sessionRepository } from '../database/repositories/sessionRepository';
import { generateId } from '../utils/id';

interface FocusSessionContextValue {
  isActive: boolean;
  startTime: number | null;
  subject: string;
  /** live elapsed seconds, recomputed from timestamps every tick — never accumulated, never drifts */
  elapsedSeconds: number;
  isRestoring: boolean;
  start: (subject: string) => Promise<void>;
  end: (notes?: string, tags?: string[]) => Promise<void>;
  discard: () => Promise<void>;
}

const FocusSessionContext = createContext<FocusSessionContextValue | null>(null);

export function FocusSessionProvider({ children }: { children: ReactNode }) {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [isRestoring, setIsRestoring] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Restore any in-progress session on mount (survives refresh / tab close / PWA reopen).
  useEffect(() => {
    (async () => {
      const active = await activeSessionRepository.get();
      if (active) {
        setStartTime(active.startTime);
        setSubject(active.subject);
        setPendingSessionId(active.sessionId);
      }
      setIsRestoring(false);
    })();
  }, []);

  // Drive the visible tick. The actual elapsed value is always (now - startTime),
  // so a throttled/backgrounded tab, a missed interval tick, or sleep never causes drift —
  // it just causes the display to "catch up" the instant the tab is visible again.
  useEffect(() => {
    if (startTime === null) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    const tick = () => setNow(Date.now());
    tick();
    intervalRef.current = window.setInterval(tick, 1000);
    const onVisible = () => tick();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [startTime]);

  const elapsedSeconds = useMemo(() => {
    if (startTime === null) return 0;
    return Math.max(0, Math.floor((now - startTime) / 1000));
  }, [startTime, now]);

  const start = useCallback(async (subjectName: string) => {
    const ts = Date.now();
    const sessionId = generateId();
    setStartTime(ts);
    setSubject(subjectName);
    setPendingSessionId(sessionId);
    await activeSessionRepository.set({ sessionId, startTime: ts, subject: subjectName });
  }, []);

  const end = useCallback(
    async (notes = '', tags: string[] = []) => {
      if (startTime === null) return;
      const endTs = Date.now();
      await sessionRepository.create({
        startTime,
        endTime: endTs,
        subject: subject || 'General Study',
        notes,
        tags,
      });
      await activeSessionRepository.clear();
      setStartTime(null);
      setSubject('');
      setPendingSessionId(null);
    },
    [startTime, subject]
  );

  const discard = useCallback(async () => {
    await activeSessionRepository.clear();
    setStartTime(null);
    setSubject('');
    setPendingSessionId(null);
  }, []);

  const value: FocusSessionContextValue = {
    isActive: startTime !== null,
    startTime,
    subject,
    elapsedSeconds,
    isRestoring,
    start,
    end,
    discard,
  };

  // pendingSessionId is retained for potential future use (e.g. crash-recovery UI) — referenced to avoid unused warnings.
  void pendingSessionId;

  return <FocusSessionContext.Provider value={value}>{children}</FocusSessionContext.Provider>;
}

export function useFocusSession() {
  const ctx = useContext(FocusSessionContext);
  if (!ctx) throw new Error('useFocusSession must be used within FocusSessionProvider');
  return ctx;
}
