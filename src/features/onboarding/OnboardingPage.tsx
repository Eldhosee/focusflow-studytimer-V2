import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, TimerIcon, X } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { Button } from '../../components/ui/Button';

type Step = 'welcome' | 'setup';

export function OnboardingPage() {
  const { completeOnboarding } = useAppData();
  const [step, setStep] = useState<Step>('welcome');
  const [displayName, setDisplayName] = useState('');
  const [dailyGoal, setDailyGoal] = useState(120);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addSubject = () => {
    const trimmed = subjectDraft.trim();
    if (trimmed && !subjectList.includes(trimmed)) {
      setSubjectList((prev) => [...prev, trimmed]);
    }
    setSubjectDraft('');
  };

  const handleFinish = async () => {
    setSubmitting(true);
    await completeOnboarding(displayName.trim() || 'there', dailyGoal, subjectList);
    setSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[color:var(--color-base)] px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(242,169,78,0.12) 0%, transparent 60%)',
        }}
      />
      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--color-amber-soft)] to-[color:var(--color-amber)] shadow-[var(--shadow-glow-amber)]">
              <TimerIcon size={30} className="text-[#1a1206]" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-[color:var(--color-text-primary)]">
                FocusFlow
              </h1>
              <p className="mt-3 text-[color:var(--color-text-secondary)]">Study deeply. Track effortlessly.</p>
            </div>
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={() => setStep('setup')}>
              Get Started
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative z-10 w-full max-w-md rounded-3xl p-8"
          >
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[color:var(--color-text-primary)]">
              A little setup
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">Everything else is automatic.</p>

            <div className="mt-6 flex flex-col gap-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">
                  Display name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Sarah, John, etc."
                  className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-amber-dim)]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-[color:var(--color-text-secondary)]">Daily goal</label>
                  <span className="font-[family-name:var(--font-mono)] text-sm text-[color:var(--color-amber-soft)]">
                    {Math.floor(dailyGoal / 60)}h {dailyGoal % 60}m
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={480}
                  step={15}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-[color:var(--color-amber)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">
                  Subjects <span className="text-[color:var(--color-text-muted)]">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={subjectDraft}
                    onChange={(e) => setSubjectDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                    placeholder="e.g. Data Structures"
                    className="flex-1 rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-amber-dim)]"
                  />
                  <Button variant="secondary" size="md" onClick={addSubject} icon={<Plus size={16} />} type="button" />
                </div>
                {subjectList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {subjectList.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-xs text-[color:var(--color-text-secondary)]"
                      >
                        {s}
                        <button
                          onClick={() => setSubjectList((prev) => prev.filter((x) => x !== s))}
                          aria-label={`Remove ${s}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-8"
              onClick={handleFinish}
              disabled={submitting}
            >
              {submitting ? 'Setting up…' : 'Finish'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
