import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';
import { db } from '../database/db';
import type { StudySession } from '../types/models';
import { startOfDayMs, endOfDayMs } from '../utils/time';

/** Subscribes to all sessions in IndexedDB, updating automatically after any create/update/delete
 * — including ones made from Focus Mode, Sessions list, or an imported backup. */
export function useLiveSessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(() => db.sessions.orderBy('startTime').reverse().toArray()).subscribe({
      next: (value) => {
        setSessions(value);
        setIsLoading(false);
      },
      error: (err) => console.error('useLiveSessions error', err),
    });
    return () => subscription.unsubscribe();
  }, []);

  const todayStart = startOfDayMs(Date.now());
  const todayEnd = endOfDayMs(Date.now());
  const todaySessions = sessions.filter((s) => s.startTime >= todayStart && s.startTime <= todayEnd);

  return { sessions, todaySessions, isLoading };
}
