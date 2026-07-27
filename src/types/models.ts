export interface StudySession {
  /** UUID */
  id: string;
  /** epoch ms */
  startTime: number;
  /** epoch ms, undefined while a session is running */
  endTime?: number;
  /** seconds, computed on end (endTime - startTime) / 1000, rounded */
  duration: number;
  subject: string;
  notes: string;
  tags: string[];
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Goal {
  id: string;
  period: GoalPeriod;
  /** target study time in minutes */
  targetMinutes: number;
  /** for 'custom' goals only */
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  label?: string;
  active: boolean;
  createdAt: number;
}

export interface UserProfile {
  id: 'profile';
  displayName: string;
  dailyGoalMinutes: number;
  onboardingComplete: boolean;
  createdAt: number;
}

export interface AppSettings {
  id: 'settings';
  notificationsEnabled: boolean;
  dailyReminderTime: string; // "HH:mm"
  breakReminderMinutes: number; // 0 = off
  soundEnabled: boolean;
  theme: 'dark';
}

/** Persisted so an in-progress Focus Mode session survives refresh/tab-close/PWA reopen. */
export interface ActiveSessionState {
  id: 'active';
  sessionId: string;
  startTime: number;
  subject: string;
}
