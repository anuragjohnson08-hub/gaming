import React from 'react';
import { GitCompare, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CatalogItem } from '../types/nexus';
import { useSwipeToDismiss } from '../utils/useSwipeToDismiss';

/**
 * 10. SWIPE-TO-DISMISS, 11. INTERRUPTIBLE ANIMATIONS (motion/react), 13. HIT SLOP, 14. SAFE AREAS, 16. TABULAR NUMBERS
 */

interface ComparisonTrayProps {
  items: CatalogItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onOpenComparison: () => void;
}

export const ComparisonTray: React.FC<ComparisonTrayProps> = ({
  items,
  onRemoveItem,
  onClearAll,
  onOpenComparison,
}) => {
  const { offsetY, touchHandlers } = useSwipeToDismiss({ onDismiss: onClearAll, threshold: 75 });

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          role="region"
          aria-label="Product Comparison Tray"
          className="fixed bottom-3 inset-x-3 sm:inset-x-6 lg:inset-x-8 z-30 pointer-events-none nexus-safe-bottom"
        >
          <div
            {...touchHandlers}
            style={{
              transform: offsetY > 0 ? `translateY(${offsetY}px)` : undefined,
              transition: offsetY === 0 ? 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
            className="nexus-editorial-modal max-w-[1140px] mx-auto rounded-2xl !border-[#584CE8]/45 p-3 sm:px-5 sm:py-3.5 pointer-events-auto flex flex-wrap items-center justify-between gap-3 shadow-2xl relative"
          >
            <div className="w-10 h-1 rounded-full bg-slate-300/80 mx-auto -mt-1 mb-1 sm:hidden w-full flex justify-center cursor-grab" />

            <div className="flex items-center gap-2.5">
              <GitCompare className="w-4 h-4 text-[#584CE8] shrink-0" />
              <span className="text-xs font-mono text-[#312A75] font-extrabold whitespace-nowrap shrink-0">
                COMPARE (<span className="tabular-nums">{items.length}</span>/4):
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                      className="nexus-editorial-control inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#312A75]"
                    >
                      <span className="truncate max-w-[130px] sm:max-w-[180px]">
                        {item.shortTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Remove ${item.shortTitle} from comparison`}
                        className="nexus-hit-slop text-[#515E7B] hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClearAll}
                className="nexus-hit-slop inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#515E7B] hover:text-red-600 hover:bg-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={onOpenComparison}
                className="nexus-dock-circle-active px-4 py-2 rounded-full font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {items.length >= 2 ? 'Compare Side-by-Side' : 'Open Compare Matrix'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
