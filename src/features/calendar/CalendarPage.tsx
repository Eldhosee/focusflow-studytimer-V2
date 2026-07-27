import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLiveSessions } from '../../hooks/useLiveSessions';
import { Card } from '../../components/ui/Card';
import { groupByDay, longestSessionSeconds, subjectBreakdown, totalSeconds } from '../../utils/stats';
import { formatDurationShort, isoDate } from '../../utils/time';
import { clsx } from '../../utils/clsx';

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarPage() {
  const { sessions } = useLiveSessions();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const totals = useMemo(() => groupByDay(sessions), [sessions]);
  const todayKey = isoDate(Date.now());

  const selectedSessions = useMemo(
    () => (selected ? sessions.filter((s) => isoDate(s.startTime) === selected) : []),
    [sessions, selected]
  );

  const changeMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row">
      <Card className="flex-1">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-text-primary)]">
            {cursor.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() => changeMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--color-text-muted)] hover:bg-white/5 hover:text-[color:var(--color-text-primary)]"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--color-text-muted)] hover:bg-white/5 hover:text-[color:var(--color-text-primary)]"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {grid.map((date, i) => {
            if (!date) return <div key={i} />;
            const key = isoDate(date.getTime());
            const total = totals.get(key)?.seconds ?? 0;
            const isToday = key === todayKey;
            const isSelected = key === selected;
            return (
              <button
                key={i}
                onClick={() => setSelected(key)}
                className={clsx(
                  'relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs transition-colors',
                  isSelected
                    ? 'bg-[color:var(--color-amber)] text-[#1a1206] font-semibold'
                    : total > 0
                      ? 'bg-[color:var(--color-amber)]/[0.14] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-amber)]/25'
                      : 'text-[color:var(--color-text-muted)] hover:bg-white/[0.04]',
                  isToday && !isSelected && 'ring-1 ring-[color:var(--color-amber-dim)]'
                )}
              >
                {date.getDate()}
                {total > 0 && (
                  <span
                    className={clsx(
                      'mt-0.5 h-1 w-1 rounded-full',
                      isSelected ? 'bg-[#1a1206]' : 'bg-[color:var(--color-amber)]'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="w-full lg:w-80"
          >
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-[color:var(--color-text-primary)]">
                  {new Date(selected).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                  aria-label="Close day detail"
                >
                  <X size={16} />
                </button>
              </div>

              {selectedSessions.length === 0 ? (
                <p className="text-sm text-[color:var(--color-text-muted)]">No study time logged this day.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase text-[color:var(--color-text-muted)]">Study time</p>
                      <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[color:var(--color-amber-soft)]">
                        {formatDurationShort(totalSeconds(selectedSessions))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase text-[color:var(--color-text-muted)]">Sessions</p>
                      <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[color:var(--color-text-primary)]">
                        {selectedSessions.length}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase text-[color:var(--color-text-muted)]">Longest</p>
                      <p className="mt-1 font-[family-name:var(--font-mono)] text-sm text-[color:var(--color-text-primary)]">
                        {formatDurationShort(longestSessionSeconds(selectedSessions))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase text-[color:var(--color-text-muted)]">Subjects</p>
                      <p className="mt-1 text-sm text-[color:var(--color-text-primary)]">
                        {subjectBreakdown(selectedSessions).length}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium text-[color:var(--color-text-secondary)]">Sessions</p>
                    <ul className="flex flex-col gap-2">
                      {selectedSessions.map((s) => (
                        <li key={s.id} className="rounded-lg bg-white/[0.03] px-3 py-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[color:var(--color-text-primary)]">{s.subject}</span>
                            <span className="text-[color:var(--color-amber-soft)]">
                              {formatDurationShort(s.duration)}
                            </span>
                          </div>
                          {s.notes && <p className="mt-1 text-[color:var(--color-text-muted)]">{s.notes}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
