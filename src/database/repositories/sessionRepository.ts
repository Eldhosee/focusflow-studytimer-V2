import { db } from '../db';
import type { StudySession } from '../../types/models';
import { generateId } from '../../utils/id';

export const sessionRepository = {
  async create(input: {
    startTime: number;
    endTime: number;
    subject: string;
    notes?: string;
    tags?: string[];
  }): Promise<StudySession> {
    const session: StudySession = {
      id: generateId(),
      startTime: input.startTime,
      endTime: input.endTime,
      duration: Math.max(0, Math.round((input.endTime - input.startTime) / 1000)),
      subject: input.subject,
      notes: input.notes ?? '',
      tags: input.tags ?? [],
      createdAt: Date.now(),
    };
    await db.sessions.add(session);
    return session;
  },

  async update(id: string, changes: Partial<StudySession>): Promise<void> {
    await db.sessions.update(id, changes);
  },

  async remove(id: string): Promise<void> {
    await db.sessions.delete(id);
  },

  async getById(id: string): Promise<StudySession | undefined> {
    return db.sessions.get(id);
  },

  async all(): Promise<StudySession[]> {
    return db.sessions.orderBy('startTime').reverse().toArray();
  },

  async between(startMs: number, endMs: number): Promise<StudySession[]> {
    return db.sessions.where('startTime').between(startMs, endMs, true, true).toArray();
  },

  async search(query: string): Promise<StudySession[]> {
    const q = query.trim().toLowerCase();
    if (!q) return this.all();
    const all = await this.all();
    return all.filter(
      (s) =>
        s.subject.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  },

  async replaceAll(sessions: StudySession[]): Promise<void> {
    await db.transaction('rw', db.sessions, async () => {
      await db.sessions.clear();
      await db.sessions.bulkAdd(sessions);
    });
  },
};
