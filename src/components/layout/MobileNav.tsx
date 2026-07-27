import { NavLink } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, ListChecks, Settings, Target, BarChart3 } from 'lucide-react';
import { clsx } from '../../utils/clsx';

const ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/sessions', label: 'Sessions', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/statistics', label: 'Stats', icon: BarChart3 },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  return (
  <nav
  className="
    fixed inset-x-0 bottom-0 z-40
    flex items-center justify-around
    px-1 py-2
    pb-[calc(0.5rem+env(safe-area-inset-bottom))]
    lg:hidden
    border-t border-white/10
    bg-[rgba(18,18,32,0.92)]
    backdrop-blur-2xl
    shadow-[0_-10px_30px_rgba(0,0,0,0.45)]
  "
> 
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-[color:var(--color-amber-soft)]' : 'text-[color:var(--color-text-muted)]'
            )
          }
        >
          <Icon size={19} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
