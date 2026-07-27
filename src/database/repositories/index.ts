import { db, DEFAULT_SUBJECT } from '../db';
import type { ActiveSessionState, AppSettings, Goal, Subject, UserProfile } from '../../types/models';
import { generateId } from '../../utils/id';

export const subjectRepository = {
  async all(): Promise<Subject[]> {
    return db.subjects.orderBy('name').toArray();
  },
  async create(name: string, color: string): Promise<Subject> {
    const subject: Subject = { id: generateId(), name, color, createdAt: Date.now() };
    await db.subjects.add(subject);
    return subject;
  },
  async remove(id: string): Promise<void> {
    await db.subjects.delete(id);
  },
  async ensureDefault(): Promise<void> {
    const count = await db.subjects.count();
    if (count === 0) {
      await db.subjects.add({
        id: generateId(),
        name: DEFAULT_SUBJECT,
        color: '#f2a94e',
        createdAt: Date.now(),
      });
    }
  },
};

export const goalRepository = {
  async all(): Promise<Goal[]> {
    return db.goals.orderBy('createdAt').reverse().toArray();
  },
  async active(): Promise<Goal[]> {
    return db.goals.filter((g) => g.active).toArray();
  },
  async create(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const full: Goal = { ...goal, id: generateId(), createdAt: Date.now() };
    await db.goals.add(full);
    return full;
  },
  async update(id: string, changes: Partial<Goal>): Promise<void> {
    await db.goals.update(id, changes);
  },
  async remove(id: string): Promise<void> {
    await db.goals.delete(id);
  },
};

export const profileRepository = {
  async get(): Promise<UserProfile | undefined> {
    return db.profile.get('profile');
  },
  async save(profile: Omit<UserProfile, 'id'>): Promise<void> {
    await db.profile.put({ ...profile, id: 'profile' });
  },
};

export const settingsRepository = {
  async get(): Promise<AppSettings> {
    const existing = await db.settings.get('settings');
    if (existing) return existing;
    const defaults: AppSettings = {
      id: 'settings',
      notificationsEnabled: false,
      dailyReminderTime: '19:00',
      breakReminderMinutes: 0,
      soundEnabled: true,
      theme: 'dark',
    };
    await db.settings.put(defaults);
    return defaults;
  },
  async save(changes: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const updated = { ...current, ...changes };
    await db.settings.put(updated);
    return updated;
  },
};

/** Persists the in-progress Focus Mode session so it survives refresh / restart. */
export const activeSessionRepository = {
  async get(): Promise<ActiveSessionState | undefined> {
    return db.activeSession.get('active');
  },
  async set(state: Omit<ActiveSessionState, 'id'>): Promise<void> {
    await db.activeSession.put({ ...state, id: 'active' });
  },
  async clear(): Promise<void> {
    await db.activeSession.delete('active');
  },
};
