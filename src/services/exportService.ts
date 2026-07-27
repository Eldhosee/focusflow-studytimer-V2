import type { Goal, StudySession, Subject, UserProfile } from '../types/models';
import { sessionRepository } from '../database/repositories/sessionRepository';
import { db } from '../database/db';
import { generateId } from '../utils/id';

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportSessionsAsCSV(): Promise<void> {
  const sessions = await sessionRepository.all();
  const header = ['id', 'subject', 'startTime', 'endTime', 'durationSeconds', 'notes', 'tags'];
  const rows = sessions.map((s) =>
    [
      s.id,
      csvSafe(s.subject),
      new Date(s.startTime).toISOString(),
      s.endTime ? new Date(s.endTime).toISOString() : '',
      s.duration.toString(),
      csvSafe(s.notes),
      csvSafe(s.tags.join('|')),
    ].join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  downloadBlob(csv, `focusflow-sessions-${dateStamp()}.csv`, 'text/csv');
}

function csvSafe(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export interface FullBackup {
  version: 1;
  exportedAt: string;
  sessions: StudySession[];
  subjects: Subject[];
  goals: Goal[];
  profile: UserProfile | null;
}

export async function exportFullBackupAsJSON(): Promise<void> {
  const [sessions, subjects, goals, profile] = await Promise.all([
    db.sessions.toArray(),
    db.subjects.toArray(),
    db.goals.toArray(),
    db.profile.get('profile'),
  ]);
  const backup: FullBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
    subjects,
    goals,
    profile: profile ?? null,
  };
  downloadBlob(JSON.stringify(backup, null, 2), `focusflow-backup-${dateStamp()}.json`, 'application/json');
}

export async function importBackupFromJSON(file: File): Promise<{ sessions: number; subjects: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Partial<FullBackup>;
  if (!parsed || !Array.isArray(parsed.sessions)) {
    throw new Error('This file does not look like a valid FocusFlow backup.');
  }

  await db.transaction('rw', db.sessions, db.subjects, db.goals, db.profile, async () => {
    if (parsed.sessions) {
      await db.sessions.bulkPut(
        parsed.sessions.map((s) => ({ ...s, id: s.id || generateId() }))
      );
    }
    if (parsed.subjects) {
      await db.subjects.bulkPut(parsed.subjects.map((s) => ({ ...s, id: s.id || generateId() })));
    }
    if (parsed.goals) {
      await db.goals.bulkPut(parsed.goals.map((g) => ({ ...g, id: g.id || generateId() })));
    }
    if (parsed.profile) {
      await db.profile.put({ ...parsed.profile, id: 'profile' });
    }
  });

  return {
    sessions: parsed.sessions?.length ?? 0,
    subjects: parsed.subjects?.length ?? 0,
  };
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
