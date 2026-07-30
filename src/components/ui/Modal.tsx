import type { ReactNode } from "react";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;

  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 28,
            }}
            onClick={(e) => e.stopPropagation()}
            className={`
              w-full
              ${SIZE_CLASSES[size]}
              rounded-2xl
              border
              border-[color:var(--color-border)]
              bg-[color:var(--color-surface)]
              shadow-2xl
              overflow-hidden
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-6 py-5">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[color:var(--color-text-primary)]">
                {title}
              </h2>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="
                  rounded-lg
                  p-2
                  transition-colors
                  text-[color:var(--color-text-muted)]
                  hover:bg-[color:var(--color-surface-hover)]
                  hover:text-[color:var(--color-text-primary)]
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[75vh] overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}