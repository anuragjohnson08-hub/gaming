import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, GitCompare, Search, X } from 'lucide-react';
import { CatalogItem } from '../types/nexus';
import { analyzeSearchIntent, formatINR } from '../utils/catalogLogic';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogItem[];
  initialQuery: string;
  onSelectItem: (item: CatalogItem) => void;
  onApplySearchToGrid: (query: string) => void;
  onCompareMatched: (items: CatalogItem[]) => void;
}

const SUGGESTED_QUERIES = [
  'RTX 5070 vs RTX 4070',
  'Best GPU for 1440p',
  'Cyberpunk 2077 FPS',
  'Gaming laptop under INR 80,000',
  'Ryzen 7 9800X3D',
  '360Hz QD-OLED',
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  items,
  initialQuery,
  onSelectItem,
  onApplySearchToGrid,
  onCompareMatched,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setActiveIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const { matchedItems, intent } = analyzeSearchIntent(query, items);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        matchedItems.length > 0 ? (prev + 1) % matchedItems.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        matchedItems.length > 0
          ? (prev - 1 + matchedItems.length) % matchedItems.length
          : 0
      );
    } else if (e.key === 'Enter' && query.trim() !== '') {
      e.preventDefault();
      if (intent.isComparisonIntent && matchedItems.length >= 2) {
        onCompareMatched(matchedItems);
        onClose();
      } else if (matchedItems[activeIndex]) {
        onSelectItem(matchedItems[activeIndex]);
        onClose();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search NEXUS Catalog"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 bg-[#312A75]/25 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-6"
    >
      <div className="nexus-panel-enter nexus-editorial-modal w-full max-w-2xl rounded-3xl overflow-hidden">
        {/* Search Input Header */}
        <div className="p-4 sm:px-5 border-b border-[#2E276C]/10 flex items-center gap-3 bg-white/65">
          <span className="w-7 h-7 rounded-full border border-[#1E3F49]/65 flex items-center justify-center text-[#1E3F49] shrink-0">
            <Search className="w-4 h-4 stroke-[2.2]" />
          </span>
          <label htmlFor="nexus-search-input" className="sr-only">
            Search games, GPUs, CPUs, laptops, monitors, and benchmarks
          </label>
          <input
            id="nexus-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search games, GPUs, CPUs, laptops, or 'RTX 5070 vs RTX 4070'..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-[#312A75] placeholder-[#515E7B]/70 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="nexus-editorial-control px-2.5 py-1 rounded-full text-xs font-semibold text-[#515E7B] hover:text-[#312A75] cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search overlay"
            className="p-1.5 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Suggestions */}
        <div className="px-5 py-3 border-b border-[#2E276C]/10 bg-white/45">
          <span className="text-[10px] font-mono font-bold text-[#266D75] tracking-[0.14em] block mb-2">
            POPULAR BENCHMARK QUERIES:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {SUGGESTED_QUERIES.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion);
                  setActiveIndex(0);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  query.toLowerCase() === suggestion.toLowerCase()
                    ? 'bg-[#584CE8] text-white'
                    : 'nexus-editorial-control text-[#4A5578] hover:text-[#312A75]'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Comparison Banner if "vs" or multi-GPU query detected */}
        {intent.intentSummary && (
          <div className="px-5 py-3 bg-[#584CE8]/12 border-b border-[#584CE8]/30 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[#312A75] font-bold">
              {intent.intentSummary}
            </span>
            {intent.isComparisonIntent && matchedItems.length >= 2 && (
              <button
                type="button"
                onClick={() => {
                  onCompareMatched(matchedItems);
                  onClose();
                }}
                className="nexus-dock-circle-active inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-semibold text-xs transition-colors cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare Side-by-Side Now</span>
              </button>
            )}
          </div>
        )}

        {/* Instant Results List */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-[#2E276C]/10">
          {matchedItems.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <p className="text-sm font-extrabold text-[#312A75]">
                No matching games, hardware, or benchmarks found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[#4A5578] mt-1 font-medium">
                Try searching for a GPU model (RTX 5070, RX 9070 XT), CPU (Ryzen 7
                9800X3D), or game title (Cyberpunk 2077).
              </p>
            </div>
          ) : (
            matchedItems.map((item, idx) => {
              const isHighlighted = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSelectItem(item);
                      onClose();
                    }
                  }}
                  className={`px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-white/75' : 'bg-transparent'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-[#515E7B]">
                      <span className="text-[#584CE8] font-mono font-bold">
                        {item.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium">{item.performanceTier}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#266D75] font-bold tabular-nums">
                        {formatINR(item.priceINR)}
                      </span>
                    </div>
                    <p className="font-display text-sm font-extrabold text-[#312A75] truncate mt-0.5">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#4A5578] truncate">
                      {item.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right font-mono tabular-nums hidden sm:block">
                      <span className="text-[10px] text-[#515E7B] block">
                        1440P AVG
                      </span>
                      <span className="text-xs font-extrabold text-[#266D75]">
                        {item.benchmarkStrip.values['1440p']}{' '}
                        {item.benchmarkStrip.unit}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#584CE8]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-[#2E276C]/10 bg-white/60 flex items-center justify-between text-xs text-[#515E7B] font-medium">
          <span>Use ↑↓ arrows to navigate · Enter to inspect</span>
          {query.trim() !== '' && (
            <button
              type="button"
              onClick={() => {
                onApplySearchToGrid(query);
                onClose();
              }}
              className="text-[#584CE8] hover:text-[#312A75] font-bold cursor-pointer"
            >
              Filter Discovery Grid ({matchedItems.length} results) →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
