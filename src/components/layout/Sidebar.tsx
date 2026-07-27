import { NavLink } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, ListChecks, Settings, Target, TimerIcon, BarChart3 } from 'lucide-react';
import { clsx } from '../../utils/clsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/sessions', label: 'Sessions', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[color:var(--color-border-soft)] px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--color-amber-soft)] to-[color:var(--color-amber)] shadow-[var(--shadow-glow-amber)]">
          <TimerIcon size={18} className="text-[#1a1206]" />
        </div>
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          FocusFlow
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[color:var(--color-amber)]/12 text-[color:var(--color-amber-soft)]'
                  : 'text-[color:var(--color-text-secondary)] hover:bg-white/[0.04] hover:text-[color:var(--color-text-primary)]'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-xl border border-[color:var(--color-border-soft)] px-3 py-3 text-xs text-[color:var(--color-text-muted)]">
        Studies happen quietly here — everything stays on this device.
      </div>
    </aside>
  );
}
