import { clsx } from '../../utils/clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-lg bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04] bg-[length:200%_100%]',
        className
      )}
      style={{ animation: 'shimmer 1.6s ease-in-out infinite' }}
    />
  );
}
