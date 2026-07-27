import type { StudySession } from '../types/models';
import { isoDate, startOfDayMs } from './time';

export interface DailyTotal {
  date: string; // ISO date
  seconds: number;
  sessionCount: number;
}

/** Groups sessions by calendar day (local time), keyed by ISO date. */
export function groupByDay(sessions: StudySession[]): Map<string, DailyTotal> {
  const map = new Map<string, DailyTotal>();
  for (const s of sessions) {
    const key = isoDate(s.startTime);
    const entry = map.get(key) ?? { date: key, seconds: 0, sessionCount: 0 };
    entry.seconds += s.duration;
    entry.sessionCount += 1;
    map.set(key, entry);
  }
  return map;
}

export function totalSeconds(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration, 0);
}

export function averageSessionSeconds(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  return totalSeconds(sessions) / sessions.length;
}

export function longestSessionSeconds(sessions: StudySession[]): number {
  return sessions.reduce((max, s) => Math.max(max, s.duration), 0);
}

/** Current streak in days: consecutive days up to and including today (or yesterday if
 * today has no session yet) with at least one completed session. */
export function currentStreak(sessions: StudySession[]): number {
  const days = groupByDay(sessions);
  let cursor = startOfDayMs(Date.now());
  let streak = 0;

  // If nothing logged today, allow the streak to still "count" through yesterday.
  if (!days.has(isoDate(cursor))) {
    cursor -= 24 * 60 * 60 * 1000;
  }

  while (days.has(isoDate(cursor))) {
    streak += 1;
    cursor -= 24 * 60 * 60 * 1000;
  }
  return streak;
}

export function subjectBreakdown(sessions: StudySession[]): { subject: string; seconds: number }[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.subject, (map.get(s.subject) ?? 0) + s.duration);
  }
  return Array.from(map.entries())
    .map(([subject, seconds]) => ({ subject, seconds }))
    .sort((a, b) => b.seconds - a.seconds);
}

/** Builds a 7x N week grid of daily totals for a GitHub-style heatmap, most recent `weeks` weeks. */
export function heatmapGrid(sessions: StudySession[], weeks = 18): { date: string; seconds: number }[][] {
  const days = groupByDay(sessions);
  const today = startOfDayMs(Date.now());
  const totalDays = weeks * 7;
  const cells: { date: string; seconds: number }[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const ts = today - i * 24 * 60 * 60 * 1000;
    const key = isoDate(ts);
    cells.push({ date: key, seconds: days.get(key)?.seconds ?? 0 });
  }

  // chunk into weeks (columns of 7)
  const grid: { date: string; seconds: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    grid.push(cells.slice(i, i + 7));
  }
  return grid;
}

export function weeklySeriesLast(sessions: StudySession[], days = 7): { label: string; seconds: number }[] {
  const totals = groupByDay(sessions);
  const result: { label: string; seconds: number }[] = [];
  const today = startOfDayMs(Date.now());
  for (let i = days - 1; i >= 0; i--) {
    const ts = today - i * 24 * 60 * 60 * 1000;
    const key = isoDate(ts);
    const label = new Date(ts).toLocaleDateString([], { weekday: 'short' });
    result.push({ label, seconds: totals.get(key)?.seconds ?? 0 });
  }
  return result;
}

export function monthlySeriesLast(sessions: StudySession[], months = 6): { label: string; seconds: number }[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.startTime);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, (map.get(key) ?? 0) + s.duration);
  }
  const result: { label: string; seconds: number }[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    result.push({ label: d.toLocaleDateString([], { month: 'short' }), seconds: map.get(key) ?? 0 });
  }
  return result;
}
