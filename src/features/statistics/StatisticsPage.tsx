import { useMemo, useState } from 'react';
import { useLiveSessions } from '../../hooks/useLiveSessions';
import { useAppData } from '../../contexts/AppDataContext';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { StudyBarChart } from '../../components/charts/StudyBarChart';
import { Heatmap } from '../../components/charts/Heatmap';
import { SubjectPieChart, SUBJECT_COLORS } from '../../components/charts/SubjectPieChart';
import {
  averageSessionSeconds,
  currentStreak,
  groupByDay,
  heatmapGrid,
  longestSessionSeconds,
  monthlySeriesLast,
  subjectBreakdown,
  totalSeconds,
  weeklySeriesLast,
} from '../../utils/stats';
import { formatDurationShort, isoDate, startOfDayMs } from '../../utils/time';
import { Gauge, Timer as TimerIcon, TrendingUp, Flame } from 'lucide-react';
import { clsx } from '../../utils/clsx';

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const TABS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

export function StatisticsPage() {
  const { sessions } = useLiveSessions();
  const { goals } = useAppData();
  const [period, setPeriod] = useState<Period>('weekly');

  const seriesData = useMemo(() => {
    if (period === 'daily') {
      const today = startOfDayMs(Date.now());
      const buckets = Array.from({ length: 12 }, (_, i) => {
        const h = i * 2;
        const hourSessions = sessions.filter((s) => {
          const d = new Date(s.startTime);
          return isoDate(s.startTime) === isoDate(today) && d.getHours() >= h && d.getHours() < h + 2;
        });
        return { label: `${h}:00`, seconds: totalSeconds(hourSessions) };
      });
      return buckets;
    }
    if (period === 'weekly') return weeklySeriesLast(sessions, 7);
    if (period === 'monthly') return weeklySeriesLast(sessions, 30).reduce<{ label: string; seconds: number }[]>(
      (acc, d, i) => {
        if (i % 3 === 0) acc.push({ label: d.label, seconds: 0 });
        acc[acc.length - 1].seconds += d.seconds;
        return acc;
      },
      []
    );
    return monthlySeriesLast(sessions, 12);
  }, [sessions, period]);

  const breakdown = useMemo(() => subjectBreakdown(sessions), [sessions]);
  const heatmap = useMemo(() => heatmapGrid(sessions, 26), [sessions]);
  const streak = useMemo(() => currentStreak(sessions), [sessions]);

  const dailyGoal = goals.find((g) => g.period === 'daily' && g.active);
  const days = Array.from(groupByDay(sessions).values());
  const daysGoalMet = dailyGoal ? days.filter((d) => d.seconds >= dailyGoal.targetMinutes * 60).length : 0;
  const goalCompletionRate = dailyGoal && days.length > 0 ? Math.round((daysGoalMet / days.length) * 100) : null;

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total study time" value={formatDurationShort(totalSeconds(sessions))} icon={<TimerIcon size={18} />} />
        <StatCard label="Average session" value={formatDurationShort(averageSessionSeconds(sessions))} icon={<Gauge size={18} />} accent="violet" />
        <StatCard label="Longest session" value={formatDurationShort(longestSessionSeconds(sessions))} icon={<TrendingUp size={18} />} />
        <StatCard label="Current streak" value={`${streak} ${streak === 1 ? 'day' : 'days'}`} icon={<Flame size={18} />} accent="success" />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Study time</h3>
          <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  period === t.key
                    ? 'bg-[color:var(--color-amber)] text-[#1a1206]'
                    : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <StudyBarChart data={seriesData} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-[color:var(--color-text-primary)]">Subject breakdown</h3>
          {breakdown.length === 0 ? (
            <p className="text-sm text-[color:var(--color-text-muted)]">No data yet.</p>
          ) : (
            <>
              <SubjectPieChart data={breakdown} />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {breakdown.map((b, i) => (
                  <div key={b.subject} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
                    />
                    <span className="text-[color:var(--color-text-secondary)]">{b.subject}</span>
                    <span className="text-[color:var(--color-text-muted)]">{formatDurationShort(b.seconds)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="flex flex-col justify-center">
          <h3 className="mb-3 text-sm font-semibold text-[color:var(--color-text-primary)]">Goal completion</h3>
          {goalCompletionRate === null ? (
            <p className="text-sm text-[color:var(--color-text-muted)]">Set a daily goal to track completion.</p>
          ) : (
            <div>
              <p className="font-[family-name:var(--font-mono)] text-4xl font-semibold text-[color:var(--color-amber-soft)]">
                {goalCompletionRate}%
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                Goal hit on {daysGoalMet} of {days.length} tracked days
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-[color:var(--color-text-primary)]">Study heatmap</h3>
        <Heatmap grid={heatmap} />
      </Card>
    </div>
  );
}
