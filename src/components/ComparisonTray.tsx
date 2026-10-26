import React from 'react';
import { GitCompare, Trash2, X } from 'lucide-react';
import { CatalogItem } from '../types/nexus';

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
  if (items.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Product Comparison Tray"
      className="fixed bottom-3 inset-x-3 sm:inset-x-6 lg:inset-x-8 z-30 pointer-events-none"
    >
      <div className="nexus-editorial-modal max-w-[1140px] mx-auto rounded-2xl !border-[#584CE8]/45 p-3 sm:px-5 sm:py-3.5 pointer-events-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <GitCompare className="w-4 h-4 text-[#584CE8] shrink-0" />
          <span className="text-xs font-mono text-[#312A75] font-extrabold whitespace-nowrap shrink-0">
            COMPARE ({items.length}/4):
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="nexus-editorial-control inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#312A75]"
              >
                <span className="truncate max-w-[130px] sm:max-w-[180px]">
                  {item.shortTitle}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label={`Remove ${item.shortTitle} from comparison`}
                  className="text-[#515E7B] hover:text-[#312A75] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#515E7B] hover:text-[#312A75] hover:bg-white/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
    </div>
  );
};
