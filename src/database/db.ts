import Dexie, { type Table } from 'dexie';
import type {
  ActiveSessionState,
  AppSettings,
  Goal,
  StudySession,
  Subject,
  UserProfile,
} from '../types/models';

export class FocusFlowDB extends Dexie {
  sessions!: Table<StudySession, string>;
  subjects!: Table<Subject, string>;
  goals!: Table<Goal, string>;
  profile!: Table<UserProfile, string>;
  settings!: Table<AppSettings, string>;
  activeSession!: Table<ActiveSessionState, string>;

  constructor() {
    super('focusflow-db');
    this.version(1).stores({
      sessions: 'id, startTime, endTime, subject, createdAt',
      subjects: 'id, name, createdAt',
      goals: 'id, period, active, createdAt',
      profile: 'id',
      settings: 'id',
      activeSession: 'id',
    });
  }
}

export const db = new FocusFlowDB();

export const DEFAULT_SUBJECT = 'General Study';
