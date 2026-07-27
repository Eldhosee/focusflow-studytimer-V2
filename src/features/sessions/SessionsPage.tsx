import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Pencil, Search, Trash2, ListChecks } from 'lucide-react';
import { useLiveSessions } from '../../hooks/useLiveSessions';
import { sessionRepository } from '../../database/repositories/sessionRepository';
import type { StudySession } from '../../types/models';
import { formatClockTime, formatDurationShort, isoDate } from '../../utils/time';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { SessionEditModal } from './SessionEditModal';
import { useToast } from '../../contexts/ToastContext';
import { exportSessionsAsCSV } from '../../services/exportService';

function groupByDateLabel(sessions: StudySession[]): Map<string, StudySession[]> {
  const map = new Map<string, StudySession[]>();
  for (const s of sessions) {
    const key = isoDate(s.startTime);
    const list = map.get(key) ?? [];
    list.push(s);
    map.set(key, list);
  }
  return map;
}

export function SessionsPage() {
  const { sessions, isLoading } = useLiveSessions();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<StudySession | null>(null);
  const { show } = useToast();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.subject.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [sessions, query]);

  const grouped = useMemo(() => groupByDateLabel(filtered), [filtered]);

  const handleDelete = async (session: StudySession) => {
    await sessionRepository.remove(session.id);
    show(`Deleted "${session.subject}" session.`, 'info', {
      label: 'Undo',
      onClick: async () => {
        await sessionRepository.create({
          startTime: session.startTime,
          endTime: session.endTime ?? session.startTime + session.duration * 1000,
          subject: session.subject,
          notes: session.notes,
          tags: session.tags,
        });
      },
    });
  };

  const handleSave = async (id: string, changes: Partial<StudySession>) => {
    await sessionRepository.update(id, changes);
    show('Session updated.', 'success');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-5 sm:p-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject, notes, or tags…"
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-amber-dim)]"
          />
        </div>
        <Button variant="secondary" icon={<Download size={15} />} onClick={() => exportSessionsAsCSV()}>
          Export CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ListChecks size={22} />}
          title={query ? 'No matching sessions' : 'No sessions yet'}
          description={query ? 'Try a different search term.' : 'Sessions you complete in Focus Mode show up here.'}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from(grouped.entries()).map(([date, items]) => (
            <div key={date}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                {new Date(date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <Card className="divide-y divide-[color:var(--color-border-soft)] !p-0">
                {items.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[color:var(--color-text-primary)]">
                          {s.subject}
                        </p>
                        {s.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-[color:var(--color-text-muted)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[color:var(--color-text-muted)]">
                        {formatClockTime(s.startTime)}
                        {s.notes ? ` · ${s.notes}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-[family-name:var(--font-mono)] text-sm text-[color:var(--color-amber-soft)]">
                        {formatDurationShort(s.duration)}
                      </span>
                      <button
                        onClick={() => setEditing(s)}
                        className="text-[color:var(--color-text-muted)] opacity-0 transition-opacity hover:text-[color:var(--color-text-primary)] group-hover:opacity-100"
                        aria-label="Edit session"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="text-[color:var(--color-text-muted)] opacity-0 transition-opacity hover:text-[color:var(--color-danger)] group-hover:opacity-100"
                        aria-label="Delete session"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      <SessionEditModal session={editing} onClose={() => setEditing(null)} onSave={handleSave} />
    </div>
  );
}
