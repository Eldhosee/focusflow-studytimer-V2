import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Flame, Gauge, ListChecks, Timer as TimerIcon, TrendingUp } from 'lucide-react';
import { useLiveSessions } from '../../hooks/useLiveSessions';
import { useAppData } from '../../contexts/AppDataContext';
import { notifications } from '../../services/notificationService';
import {
  averageSessionSeconds,
  currentStreak,
  heatmapGrid,
  longestSessionSeconds,
  monthlySeriesLast,
  totalSeconds,
  weeklySeriesLast,
} from '../../utils/stats';
import { formatClockTime, formatDurationShort } from '../../utils/time';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { StudyBarChart } from '../../components/charts/StudyBarChart';
import { Heatmap } from '../../components/charts/Heatmap';
import { ConfettiBurst } from '../../components/ui/ConfettiBurst';
import { Skeleton } from '../../components/ui/Skeleton';

export function DashboardPage() {
  const { sessions, todaySessions, isLoading } = useLiveSessions();
  const { goals, profile, settings } = useAppData();
  const navigate = useNavigate();
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const goalHitRef = useRef(false);

  const dailyGoalMinutes =
    goals.find((g) => g.period === 'daily' && g.active)?.targetMinutes ?? profile?.dailyGoalMinutes ?? 60;

  const todayTotal = totalSeconds(todaySessions);
  const goalProgress = Math.min(1, todayTotal / Math.max(1, dailyGoalMinutes * 60));
  const streak = useMemo(() => currentStreak(sessions), [sessions]);
  const avgSession = useMemo(() => averageSessionSeconds(sessions), [sessions]);
  const longest = useMemo(() => longestSessionSeconds(sessions), [sessions]);
  const weekly = useMemo(() => weeklySeriesLast(sessions, 7), [sessions]);
  const monthly = useMemo(() => monthlySeriesLast(sessions, 6), [sessions]);
  const heatmap = useMemo(() => heatmapGrid(sessions, 18), [sessions]);
  const recent = sessions.slice(0, 5);

  useEffect(() => {
    if (goalProgress >= 1 && !goalHitRef.current) {
      goalHitRef.current = true;
      setConfettiTrigger((n) => n + 1);
      if (settings?.notificationsEnabled) notifications.goalCompleted();
    } else if (goalProgress < 1) {
      goalHitRef.current = false;
    }
  }, [goalProgress, settings?.notificationsEnabled]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 p-5 sm:p-8 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <ConfettiBurst trigger={confettiTrigger} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's study time"
          value={formatDurationShort(todayTotal)}
          icon={<Clock size={18} />}
          sublabel={`Goal: ${formatDurationShort(dailyGoalMinutes * 60)}`}
          accent="amber"
        />
        <StatCard
          label="Current streak"
          value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
          icon={<Flame size={18} />}
          accent="success"
        />
        <StatCard
          label="Average session"
          value={formatDurationShort(avgSession)}
          icon={<Gauge size={18} />}
          accent="violet"
        />
        <StatCard
          label="Longest session"
          value={formatDurationShort(longest)}
          icon={<TrendingUp size={18} />}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-4 lg:col-span-1">
          <ProgressRing progress={goalProgress} size={140} strokeWidth={12}>
            <div className="text-center">
              <p className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-[color:var(--color-text-primary)]">
                {Math.round(goalProgress * 100)}%
              </p>
              <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">of goal</p>
            </div>
          </ProgressRing>
          <div className="text-center">
            <p className="text-sm font-medium text-[color:var(--color-text-primary)]">Today's goal progress</p>
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {formatDurationShort(todayTotal)} of {formatDurationShort(dailyGoalMinutes * 60)}
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">This week</h3>
          </div>
          <StudyBarChart data={weekly} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-[color:var(--color-text-primary)]">Last 6 months</h3>
          <StudyBarChart data={monthly} color="var(--color-violet)" />
        </Card>

        <Card className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <ListChecks size={16} className="text-[color:var(--color-amber)]" />
            <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Recent sessions</h3>
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-[color:var(--color-text-muted)]">No sessions yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {recent.map((s) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between border-b border-[color:var(--color-border-soft)] pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[color:var(--color-text-primary)]">{s.subject}</p>
                    <p className="text-xs text-[color:var(--color-text-muted)]">{formatClockTime(s.startTime)}</p>
                  </div>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[color:var(--color-amber-soft)]">
                    {formatDurationShort(s.duration)}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-[color:var(--color-text-primary)]">Study heatmap</h3>
        <Heatmap grid={heatmap} />
      </Card>

      {sessions.length === 0 && (
        <EmptyState
          icon={<TimerIcon size={22} />}
          title="No sessions yet"
          description="Start your first Focus Mode session and your dashboard will fill in automatically."
          action={
            <Button variant="primary" onClick={() => navigate('/focus')}>
              Start studying
            </Button>
          }
        />
      )}
    </div>
  );
}
