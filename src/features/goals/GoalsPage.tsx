import { useEffect,useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Target, Trash2,Pencil  } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { useLiveSessions } from '../../hooks/useLiveSessions';
import { goalRepository } from '../../database/repositories';
import type { GoalPeriod } from '../../types/models';
import { goalFormSchema, type GoalForm } from '../../utils/validation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfettiBurst } from '../../components/ui/ConfettiBurst';
import { useToast } from '../../contexts/ToastContext';
import { formatDurationShort, startOfDayMs, endOfDayMs } from '../../utils/time';
import { totalSeconds } from '../../utils/stats';

function periodRangeSeconds(period: GoalPeriod, sessions: ReturnType<typeof useLiveSessions>['sessions']) {
  const now = Date.now();
  let start: number;
  if (period === 'daily') start = startOfDayMs(now);
  else if (period === 'weekly') start = now - 6 * 24 * 60 * 60 * 1000;
  else if (period === 'monthly') start = now - 29 * 24 * 60 * 60 * 1000;
  else start = 0;
  const end = endOfDayMs(now);
  return totalSeconds(sessions.filter((s) => s.startTime >= start && s.startTime <= end));
}

export function GoalsPage() {
  const { goals, refreshGoals } = useAppData();
  const { sessions } = useLiveSessions();
  const { show } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
const [editingGoal, setEditingGoal] = useState<(typeof goals)[number] | null>(null);
const [confettiTrigger, setConfettiTrigger] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalForm>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: { period: 'daily', targetMinutes: 60, label: '' },
  });
useEffect(() => {
  if (editingGoal) {
    reset({
      period: editingGoal.period,
      targetMinutes: editingGoal.targetMinutes,
      label: editingGoal.label ?? '',
    });
  } else {
    reset({
      period: 'daily',
      targetMinutes: 60,
      label: '',
    });
  }
}, [editingGoal, reset]);
  const goalsWithProgress = useMemo(
    () =>
      goals
        .filter((g) => g.active)
        .map((g) => {
          const seconds = periodRangeSeconds(g.period, sessions);
          const progress = Math.min(1, seconds / Math.max(1, g.targetMinutes * 60));
          return { goal: g, seconds, progress };
        }),
    [goals, sessions]
  );

 const onSubmit = async (data: GoalForm) => {
  if (editingGoal) {
    await goalRepository.update(editingGoal.id, {
      period: data.period,
      targetMinutes: data.targetMinutes,
      label: data.label || undefined,
    });

    show('Goal updated.', 'success');
  } else {
    await goalRepository.create({
      period: data.period,
      targetMinutes: data.targetMinutes,
      label: data.label || undefined,
      active: true,
    });

    show('Goal created.', 'success');
  }

  await refreshGoals();

  setEditingGoal(null);
  setModalOpen(false);
  reset();
};
  const handleDelete = async (id: string) => {
    await goalRepository.remove(id);
    await refreshGoals();
    show('Goal removed.', 'info');
  };

  const handleCelebrate = () => setConfettiTrigger((n) => n + 1);

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <ConfettiBurst trigger={confettiTrigger} />
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-text-primary)]">
          Your goals
        </h2>
        <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => setModalOpen(true)}>
          New goal
        </Button>
      </div>

      {goalsWithProgress.length === 0 ? (
        <EmptyState
          icon={<Target size={22} />}
          title="No active goals"
          description="Set a daily, weekly, or monthly study goal to stay on track."
          action={
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Create a goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {goalsWithProgress.map(({ goal, seconds, progress }) => (
            <Card key={goal.id} className="flex flex-col items-center gap-4 text-center">
              <div className="flex w-full items-center justify-between">
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                  {goal.period}
                </span>
                <div className="flex items-center gap-2">
    <button
  onClick={() => {
    setEditingGoal(goal);
    setModalOpen(true);
  }}
  className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-amber)]"
  aria-label="Edit goal"
>
      <Pencil size={14} />
    </button>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-danger)]"
                  aria-label="Delete goal"
                >
                  <Trash2 size={14} />
                </button>
              </div>
               </div>

              <ProgressRing
                progress={progress}
                size={128}
                strokeWidth={11}
                color={progress >= 1 ? 'var(--color-success)' : 'var(--color-amber)'}
              >
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-xl font-semibold text-[color:var(--color-text-primary)]">
                    {Math.round(progress * 100)}%
                  </p>
                </div>
              </ProgressRing>

              <div>
                <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
                  {goal.label || `${goal.period[0].toUpperCase()}${goal.period.slice(1)} goal`}
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  {formatDurationShort(seconds)} of {formatDurationShort(goal.targetMinutes * 60)}
                </p>
              </div>

              {progress >= 1 && (
                <button
                  onClick={handleCelebrate}
                  className="text-xs font-medium text-[color:var(--color-success)] hover:underline"
                >
                  Goal complete — celebrate 🎉
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen}   title={editingGoal ? 'Edit goal' : 'New goal'} onClose={() => {
    setModalOpen(false);
    setEditingGoal(null);
  }}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">Period</label>
            <select
              {...register('period')}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-amber-dim)]"
            >
              <option value="daily" className="bg-[#14141F]">Daily</option>
              <option value="weekly" className="bg-[#14141F]">Weekly</option>
              <option value="monthly" className="bg-[#14141F]">Monthly</option>
              <option value="custom" className="bg-[#14141F]">Custom</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">
              Target minutes
            </label>
            <input
              type="number"
              {...register('targetMinutes', { valueAsNumber: true })}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-amber-dim)]"
            />
            {errors.targetMinutes && (
              <p className="mt-1 text-xs text-[color:var(--color-danger)]">{errors.targetMinutes.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-text-secondary)]">
              Label <span className="text-[color:var(--color-text-muted)]">(optional)</span>
            </label>
            <input
              {...register('label')}
              placeholder="Exam prep sprint"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-white/[0.03] px-4 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-muted)] focus:border-[color:var(--color-amber-dim)]"
            />
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button
  type="button"
  variant="ghost"
  onClick={() => {
    setModalOpen(false);
    setEditingGoal(null);
  }}
>
  Cancel
</Button>
            <Button type="submit" variant="primary">
  {editingGoal ? 'Save changes' : 'Create goal'}
</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
