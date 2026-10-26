import React from 'react';
import { Bookmark, Cpu, ShieldCheck, Trash2, X } from 'lucide-react';
import { TESTBENCH_DISCLOSURE } from '../data/catalogData';
import { CatalogItem } from '../types/nexus';
import { formatINR } from '../utils/catalogLogic';

interface SavedItemsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: CatalogItem[];
  onSelectItem: (item: CatalogItem) => void;
  onRemoveSaved: (id: string) => void;
  onClearSaved: () => void;
}

export const SavedItemsDrawer: React.FC<SavedItemsDrawerProps> = ({
  isOpen,
  onClose,
  savedItems,
  onSelectItem,
  onRemoveSaved,
  onClearSaved,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved Reviews and Hardware"
      className="fixed inset-0 z-50 bg-[#312A75]/25 backdrop-blur-md flex justify-end"
    >
      <div className="nexus-editorial-modal w-full max-w-md border-l border-white/90 h-full flex flex-col justify-between">
        <div className="p-5 border-b border-[#2E276C]/10 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#584CE8]" />
            <h2 className="font-display text-base font-extrabold text-[#312A75]">
              Saved Reviews & Hardware ({savedItems.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved items drawer"
            className="p-1.5 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {savedItems.length === 0 ? (
            <div className="nexus-editorial-well text-center py-12 px-4 rounded-2xl border-dashed">
              <p className="text-sm font-extrabold text-[#312A75]">
                No saved items yet
              </p>
              <p className="text-xs text-[#4A5578] mt-1 font-medium">
                Click the bookmark icon on any game review or hardware card to save
                it here for quick reference.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="nexus-editorial-card p-3.5 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-[#584CE8] block">
                    {item.category} · {formatINR(item.priceINR)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                    className="font-display text-sm font-extrabold text-[#312A75] hover:text-[#584CE8] truncate block text-left cursor-pointer"
                  >
                    {item.title}
                  </button>
                  <span className="text-xs font-mono font-bold text-[#266D75] tabular-nums">
                    Score: {item.overallScore.toFixed(1)}/10 · 1440p:{' '}
                    {item.benchmarkStrip.values['1440p']} {item.benchmarkStrip.unit}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveSaved(item.id)}
                  aria-label={`Remove ${item.shortTitle} from saved`}
                  className="p-2 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {savedItems.length > 0 && (
          <div className="p-4 border-t border-[#2E276C]/10 bg-white/60 flex items-center justify-between">
            <span className="text-xs text-[#515E7B] font-medium">
              Persisted in browser storage
            </span>
            <button
              type="button"
              onClick={onClearSaved}
              className="text-xs text-[#584CE8] hover:text-[#312A75] font-bold cursor-pointer"
            >
              Clear All Saved
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTopic?: string;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  activeTopic = 'How We Test & Benchmark Database',
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="NEXUS Review Methodology and Testbench Configuration"
      className="fixed inset-0 z-50 bg-[#312A75]/25 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="nexus-panel-enter nexus-editorial-modal w-full max-w-2xl rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2E276C]/10 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-[#584CE8]" />
            <h2 className="font-display text-base sm:text-lg font-extrabold text-[#312A75]">
              {activeTopic}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close methodology dialog"
            className="p-1.5 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs sm:text-sm text-[#4A5578] max-h-[80vh] overflow-y-auto">
          <div className="nexus-editorial-well p-4 rounded-2xl !border-[#584CE8]/45">
            <div className="flex items-center gap-2 text-xs font-mono text-[#584CE8] font-bold mb-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>TRANSPARENCY & DEMO DATASET DISCLOSURE</span>
            </div>
            <p className="text-xs leading-relaxed text-[#312A75] font-medium">
              {TESTBENCH_DISCLOSURE.methodologyNote}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-extrabold text-[#312A75] mb-2">
              Reference Testbench Configuration ({TESTBENCH_DISCLOSURE.rigName})
            </h3>
            <dl className="nexus-editorial-well divide-y divide-[#2E276C]/10 rounded-2xl px-4 text-xs font-mono">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#515E7B] font-semibold">Processor</dt>
                <dd className="text-[#312A75] font-bold text-right">
                  {TESTBENCH_DISCLOSURE.cpu}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#515E7B] font-semibold">Reference GPU</dt>
                <dd className="text-[#312A75] font-bold text-right">
                  {TESTBENCH_DISCLOSURE.gpuReference}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#515E7B] font-semibold">System Memory</dt>
                <dd className="text-[#312A75] font-bold text-right">
                  {TESTBENCH_DISCLOSURE.memory}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#515E7B] font-semibold">Motherboard</dt>
                <dd className="text-[#312A75] font-bold text-right">
                  {TESTBENCH_DISCLOSURE.motherboard}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#515E7B] font-semibold">OS & Environment</dt>
                <dd className="text-[#312A75] font-bold text-right">
                  {TESTBENCH_DISCLOSURE.os} · {TESTBENCH_DISCLOSURE.ambientTemp}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2 text-xs leading-relaxed font-medium">
            <h3 className="font-display text-sm font-extrabold text-[#312A75]">
              Editorial Independence & Pricing Policy
            </h3>
            <p>
              NEXUS separates qualitative editorial evaluation (gameplay design,
              build quality, acoustics) from quantitative lab measurements (average
              FPS, 1% low frame pacing, board power draw, and performance per
              Indian Rupee). Retail prices in INR are cross-referenced against
              verified Indian hardware retailers with explicit update timestamps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
