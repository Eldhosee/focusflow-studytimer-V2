import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { generateId } from '../utils/id';

type ToastVariant = 'success' | 'info' | 'error';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, action?: Toast['action']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  error: TriangleAlert,
};

const ACCENTS: Record<ToastVariant, string> = {
  success: 'text-[color:var(--color-success)]',
  info: 'text-[color:var(--color-violet-soft)]',
  error: 'text-[color:var(--color-danger)]',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = 'info', action?: Toast['action']) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, variant, action }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="glass pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-card)]"
              >
                <Icon size={18} className={ACCENTS[t.variant]} />
                <p className="text-sm text-[color:var(--color-text-primary)]">{t.message}</p>
                {t.action && (
                  <button
                    onClick={() => {
                      t.action?.onClick();
                      dismiss(t.id);
                    }}
                    className="text-sm font-medium text-[color:var(--color-amber)] hover:text-[color:var(--color-amber-soft)]"
                  >
                    {t.action.label}
                  </button>
                )}
                <button
                  onClick={() => dismiss(t.id)}
                  className="ml-1 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
