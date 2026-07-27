import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLiveSessions } from '../../hooks/useLiveSessions';
import { totalSeconds } from '../../utils/stats';
import { formatDurationShort } from '../../utils/time';
import { Button } from '../ui/Button';

function useGreeting(name: string) {
  return useMemo(() => {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return name ? `${part}, ${name}` : part;
  }, [name]);
}

export function TopBar() {
  const { profile, goals } = useAppData();
  const { todaySessions } = useLiveSessions();
  const navigate = useNavigate();
  const greeting = useGreeting(profile?.displayName ?? '');

  const dailyGoalMinutes = goals.find((g) => g.period === 'daily' && g.active)?.targetMinutes
    ?? profile?.dailyGoalMinutes
    ?? 60;
  const todaySeconds = totalSeconds(todaySessions);
  const progressPct = Math.min(100, Math.round((todaySeconds / (dailyGoalMinutes * 60)) * 100));

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[color:var(--color-border-soft)] bg-[color:var(--color-base)]/70 px-5 py-4 backdrop-blur-xl sm:px-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-text-primary)] sm:text-xl">
          {greeting}
        </h1>
        <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)] sm:text-sm">
          {formatDurationShort(todaySeconds)} of {formatDurationShort(dailyGoalMinutes * 60)} today · {progressPct}%
        </p>
      </div>
      <Button variant="primary" size="md" icon={<Play size={16} fill="currentColor" />} onClick={() => navigate('/focus')}>
        <span className="hidden sm:inline">Start Session</span>
        <span className="sm:hidden">Start</span>
      </Button>
    </header>
  );
}
