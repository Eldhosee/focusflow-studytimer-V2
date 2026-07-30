import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppSettings, Goal, Subject, UserProfile } from '../types/models';
import {
  goalRepository,
  profileRepository,
  settingsRepository,
  subjectRepository,
} from '../database/repositories';

interface AppDataContextValue {
  profile: UserProfile | null;
  subjects: Subject[];
  settings: AppSettings | null;
  goals: Goal[];
  isLoading: boolean;

  refreshProfile: () => Promise<void>;
  refreshSubjects: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshGoals: () => Promise<void>;

  addSubject: (name: string, color: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  completeOnboarding: (
    displayName: string,
    dailyGoalMinutes: number,
    subjectNames: string[]
  ) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const SUBJECT_PALETTE = [
  '#f2a94e',
  '#7c83fd',
  '#5fd9a4',
  '#e9707a',
  '#61c7f2',
  '#c98bf5',
];

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const p = await profileRepository.get();
    setProfile(p ?? null);
  }, []);

  const refreshSubjects = useCallback(async () => {
    const s = await subjectRepository.all();
    setSubjects(s);
  }, []);

  const refreshSettings = useCallback(async () => {
    const s = await settingsRepository.get();
    setSettings(s);
  }, []);

  const refreshGoals = useCallback(async () => {
    const g = await goalRepository.all();
    setGoals(g);
  }, []);

  const addSubject = useCallback(
    async (name: string, color: string) => {
      await subjectRepository.create(name, color);
      await refreshSubjects();
    },
    [refreshSubjects]
  );

  const deleteSubject = useCallback(
    async (id: string) => {
      await subjectRepository.remove(id);
      await refreshSubjects();
    },
    [refreshSubjects]
  );

  useEffect(() => {
    (async () => {
      await subjectRepository.ensureDefault();

      await Promise.all([
        refreshProfile(),
        refreshSubjects(),
        refreshSettings(),
        refreshGoals(),
      ]);

      setIsLoading(false);
    })();
  }, [refreshProfile, refreshSubjects, refreshSettings, refreshGoals]);

  const completeOnboarding = useCallback(
    async (
      displayName: string,
      dailyGoalMinutes: number,
      subjectNames: string[]
    ) => {
      await profileRepository.save({
        displayName,
        dailyGoalMinutes,
        onboardingComplete: true,
        createdAt: Date.now(),
      });

      for (let i = 0; i < subjectNames.length; i++) {
        const name = subjectNames[i].trim();

        if (!name) continue;

        await subjectRepository.create(
          name,
          SUBJECT_PALETTE[i % SUBJECT_PALETTE.length]
        );
      }

      await goalRepository.create({
        period: 'daily',
        targetMinutes: dailyGoalMinutes,
        active: true,
        label: 'Daily goal',
      });

      await Promise.all([
        refreshProfile(),
        refreshSubjects(),
        refreshGoals(),
      ]);
    },
    [refreshProfile, refreshSubjects, refreshGoals]
  );

  const value: AppDataContextValue = {
    profile,
    subjects,
    settings,
    goals,
    isLoading,

    refreshProfile,
    refreshSubjects,
    refreshSettings,
    refreshGoals,

    addSubject,
    deleteSubject,

    completeOnboarding,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);

  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return ctx;
}