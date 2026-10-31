import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * 5. UNDO TOASTS & 2. OPTIMISTIC UPDATES
 * Floating notification providing instant feedback on user actions
 * (e.g. removed from compare, unsaved item) with a countdown timer
 * and one-click rollback powered by motion/react spring animations.
 */

export interface ToastAction {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo: () => void;
  durationMs?: number;
}

interface UndoToastProps {
  toast: ToastAction | null;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    const duration = toast.durationMs || 5000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    setProgress(100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [toast, onDismiss]);

  const secondsRemaining = toast
    ? Math.max(1, Math.ceil((progress / 100) * ((toast.durationMs || 5000) / 1000)))
    : 0;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-4 sm:right-6 z-50 pointer-events-auto"
        >
          <div className="nexus-editorial-modal rounded-2xl p-3.5 sm:px-4 shadow-xl border border-white/90 bg-white/90 backdrop-blur-xl flex flex-col gap-2 min-w-[300px] max-w-md">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs sm:text-sm font-semibold text-[#1E293B] truncate">
                {toast.message}
              </p>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    toast.onUndo();
                    onDismiss();
                  }}
                  className="nexus-hit-slop inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#584CE8] hover:bg-[#4338CA] text-white text-xs font-bold font-mono tracking-tight cursor-pointer transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{toast.undoLabel || 'Undo'}</span>
                  <span className="font-mono tabular-nums text-[10px] opacity-80">
                    ({secondsRemaining}s)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Dismiss toast"
                  className="nexus-hit-slop p-1 rounded-full text-[#515E7B] hover:text-[#1E293B] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Linear progress countdown bar */}
            <div className="w-full bg-[#584CE8]/15 h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#584CE8] h-full transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
