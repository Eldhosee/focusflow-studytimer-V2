import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[color:var(--color-border)] px-6 py-16 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-amber)]/10 text-[color:var(--color-amber)]">
        {icon}
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-text-primary)]">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-[color:var(--color-text-muted)]">{description}</p>
      {action}
    </motion.div>
  );
}
