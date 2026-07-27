import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  sublabel?: string;
  accent?: 'amber' | 'violet' | 'success';
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  amber: 'text-[color:var(--color-amber)] bg-[color:var(--color-amber)]/10',
  violet: 'text-[color:var(--color-violet-soft)] bg-[color:var(--color-violet)]/10',
  success: 'text-[color:var(--color-success)] bg-[color:var(--color-success)]/10',
};

export function StatCard({ label, value, icon, sublabel, accent = 'amber' }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
            {label}
          </p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-2xl font-semibold text-[color:var(--color-text-primary)] sm:text-3xl">
            {value}
          </p>
          {sublabel && <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">{sublabel}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENT_CLASSES[accent]}`}>
          {icon}
        </div>
      </motion.div>
    </Card>
  );
}
