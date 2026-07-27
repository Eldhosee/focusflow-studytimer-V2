import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from '../../utils/clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, className, padded = true, ...rest }: CardProps) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl shadow-[var(--shadow-card)]',
        padded && 'p-5 sm:p-6',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
