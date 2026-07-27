import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from '../../utils/clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-[color:var(--color-amber-soft)] to-[color:var(--color-amber)] text-[#0b1220] font-semibold shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_8px_20px_-6px_rgba(79,140,255,0.55)] hover:brightness-105 active:brightness-95',

  secondary:
    'glass text-[color:var(--color-text-primary)] hover:border-[color:var(--color-amber-dim)]',

  ghost:
    'text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-white/5',

  danger:
    'text-[color:var(--color-danger)] hover:bg-[color:var(--color-danger)]/10',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3.5 text-base gap-2.5 rounded-2xl',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
