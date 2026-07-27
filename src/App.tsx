import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { useAppData } from './contexts/AppDataContext';
import { FocusSessionProvider } from './contexts/FocusSessionContext';
import { AppShell } from './layouts/AppShell';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { TimerIcon } from 'lucide-react';

const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SessionsPage = lazy(() => import('./features/sessions/SessionsPage').then((m) => ({ default: m.SessionsPage })));
const CalendarPage = lazy(() => import('./features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const StatisticsPage = lazy(() => import('./features/statistics/StatisticsPage').then((m) => ({ default: m.StatisticsPage })));
const GoalsPage = lazy(() => import('./features/goals/GoalsPage').then((m) => ({ default: m.GoalsPage })));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const FocusPage = lazy(() => import('./features/focus/FocusPage').then((m) => ({ default: m.FocusPage })));

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[color:var(--color-base)]">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--color-amber-soft)] to-[color:var(--color-amber)] shadow-[var(--shadow-glow-amber)]"
      >
        <TimerIcon size={26} className="text-[#1a1206]" />
      </motion.div>
      <p className="font-[family-name:var(--font-display)] text-sm text-[color:var(--color-text-muted)]">
        Loading FocusFlow…
      </p>
    </div>
  );
}

function AppRoutes() {
  const { isLoading, profile } = useAppData();

  if (isLoading) return <SplashScreen />;
  if (!profile?.onboardingComplete) return <OnboardingPage />;

  return (
    <FocusSessionProvider>
      <Suspense fallback={<SplashScreen />}>
        <Routes>
          <Route
            path="/focus"
            element={
              <PageTransition>
                <FocusPage />
              </PageTransition>
            }
          />
          <Route
            path="/*"
            element={
              <AppShell>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PageTransition>
                        <DashboardPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/sessions"
                    element={
                      <PageTransition>
                        <SessionsPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <PageTransition>
                        <CalendarPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/statistics"
                    element={
                      <PageTransition>
                        <StatisticsPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/goals"
                    element={
                      <PageTransition>
                        <GoalsPage />
                      </PageTransition>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PageTransition>
                        <SettingsPage />
                      </PageTransition>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            }
          />
        </Routes>
      </Suspense>
    </FocusSessionProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <AppRoutes />
      </AnimatePresence>
    </BrowserRouter>
  );
}
