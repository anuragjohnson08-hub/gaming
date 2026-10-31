import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bookmark, Command, Cpu, Flame, Gamepad2, GitCompare, HelpCircle, Layers, Search, Sparkles, X } from 'lucide-react';
import { CatalogItem } from '../types/nexus';
import { analyzeSearchIntent, formatINR } from '../utils/catalogLogic';
import { prefetchItem } from '../utils/prefetchManager';

/**
 * 3. COMMAND MENU (⌘K / Ctrl+K) & 4. SHORTCUT HINTS
 * Linear / Apple style Command Palette offering instant navigation,
 * actions, games, GPUs, search intent analysis, and keyboard shortcuts.
 */

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  items: CatalogItem[];
  initialQuery: string;
  onSelectItem: (item: CatalogItem) => void;
  onApplySearchToGrid: (query: string) => void;
  onCompareMatched: (items: CatalogItem[]) => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenMethodology?: () => void;
  onOpenSaved?: () => void;
  onOpenComparison?: () => void;
}

const POPULAR_COMMANDS = [
  { id: 'cmd-compare-top', title: 'Compare RTX 5070 vs RX 9070 XT', group: 'Actions', icon: GitCompare, shortcut: 'C' },
  { id: 'cmd-benchmarks', title: 'Jump to Benchmark Database & Matrix', group: 'Navigation', icon: Cpu, shortcut: 'B' },
  { id: 'cmd-saved', title: 'Open Saved Hardware & Reviews', group: 'Navigation', icon: Bookmark, shortcut: 'S' },
  { id: 'cmd-methodology', title: 'View Editorial Policy & Testing Rig', group: 'Navigation', icon: HelpCircle, shortcut: 'M' },
];

const SUGGESTED_QUERIES = [
  'RTX 5070 vs RTX 4070',
  'Best GPU for 1440p',
  'Cyberpunk 2077 FPS',
  'Gaming laptop under INR 80,000',
  'Ryzen 7 9800X3D',
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  items,
  initialQuery,
  onSelectItem,
  onApplySearchToGrid,
  onCompareMatched,
  onNavigateSection,
  onOpenMethodology,
  onOpenSaved,
  onOpenComparison,
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

  const filteredCommands = query.trim() === ''
    ? POPULAR_COMMANDS
    : POPULAR_COMMANDS.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const totalEntries = matchedItems.length + (query.trim() === '' ? filteredCommands.length : 0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (totalEntries > 0 ? (prev + 1) % totalEntries : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (totalEntries > 0 ? (prev - 1 + totalEntries) % totalEntries : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (intent.isComparisonIntent && matchedItems.length >= 2) {
        onCompareMatched(matchedItems);
        onClose();
      } else if (activeIndex < matchedItems.length && matchedItems[activeIndex]) {
        onSelectItem(matchedItems[activeIndex]);
        onClose();
      } else {
        const cmdIdx = activeIndex - matchedItems.length;
        if (filteredCommands[cmdIdx]) {
          handleExecuteCommand(filteredCommands[cmdIdx].id);
        }
      }
    }
  };

  const handleExecuteCommand = (cmdId: string) => {
    onClose();
    if (cmdId === 'cmd-compare-top') {
      onOpenComparison?.();
    } else if (cmdId === 'cmd-benchmarks') {
      onNavigateSection?.('nexus-benchmark-section');
    } else if (cmdId === 'cmd-saved') {
      onOpenSaved?.();
    } else if (cmdId === 'cmd-methodology') {
      onOpenMethodology?.();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Menu & Search"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 bg-[#312A75]/25 backdrop-blur-md flex items-start justify-center pt-8 sm:pt-16 px-3 sm:px-6 nexus-safe-top"
    >
      <div className="nexus-panel-enter nexus-editorial-modal w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/80">
        {/* Command Menu Input Header with Keycap */}
        <div className="p-4 sm:px-5 border-b border-[#2E276C]/10 flex items-center gap-3 bg-white/75">
          <span className="w-8 h-8 rounded-xl bg-[#584CE8]/10 border border-[#584CE8]/20 flex items-center justify-center text-[#584CE8] shrink-0">
            <Command className="w-4 h-4" />
          </span>
          <label htmlFor="nexus-command-input" className="sr-only">
            Type a command or search reviews, hardware, and benchmarks
          </label>
          <input
            id="nexus-command-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search games, GPUs, or type a command ('RTX 5070 vs RTX 4070')..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-[#312A75] placeholder-[#515E7B]/70 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <kbd className="nexus-kbd hidden sm:inline-flex">ESC</kbd>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="nexus-hit-slop nexus-editorial-control px-2.5 py-1 rounded-full text-xs font-semibold text-[#515E7B] hover:text-[#312A75] cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close command palette"
              className="nexus-hit-slop p-1.5 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="px-5 py-2.5 border-b border-[#2E276C]/10 bg-white/45 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono font-bold text-[#266D75] tracking-[0.14em] shrink-0">
            QUICK:
          </span>
          {SUGGESTED_QUERIES.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                setActiveIndex(0);
              }}
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                query.toLowerCase() === suggestion.toLowerCase()
                  ? 'bg-[#584CE8] text-white shadow-xs'
                  : 'nexus-editorial-control text-[#4A5578] hover:text-[#312A75]'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Intent Detection Banner */}
        {intent.intentSummary && (
          <div className="px-5 py-3 bg-[#584CE8]/10 border-b border-[#584CE8]/20 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#584CE8]" />
              <span className="text-xs text-[#312A75] font-bold">
                {intent.intentSummary}
              </span>
            </div>
            {intent.isComparisonIntent && matchedItems.length >= 2 && (
              <button
                type="button"
                onClick={() => {
                  onCompareMatched(matchedItems);
                  onClose();
                }}
                className="nexus-hit-slop inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#584CE8] text-white font-mono text-xs font-bold hover:bg-[#4338CA] transition-colors cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Compare {matchedItems.length} Products</span>
                <kbd className="nexus-kbd !bg-white/20 !text-white !border-white/30 ml-1">↵</kbd>
              </button>
            )}
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#2E276C]/10 bg-white/30 p-2 space-y-1">
          {/* Quick Actions if query is empty */}
          {query.trim() === '' && (
            <div className="p-2">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] tracking-wider uppercase block mb-1.5 px-2">
                Actions & Quick Commands
              </span>
              <div className="space-y-1">
                {filteredCommands.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  const isSelected = activeIndex === matchedItems.length + idx;
                  return (
                    <div
                      key={cmd.id}
                      onClick={() => handleExecuteCommand(cmd.id)}
                      className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#584CE8]/12 text-[#312A75]'
                          : 'hover:bg-white/60 text-[#4A5578]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#584CE8]" />
                        <span className="text-xs font-semibold text-[#312A75]">{cmd.title}</span>
                      </div>
                      <kbd className="nexus-kbd">{cmd.shortcut}</kbd>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {matchedItems.length === 0 && query.trim() !== '' ? (
            <div className="p-8 text-center">
              <p className="font-display text-sm font-extrabold text-[#312A75]">
                No matching games or hardware found
              </p>
              <p className="text-xs text-[#515E7B] mt-1 font-medium">
                Try searching for 'Cyberpunk', 'RTX 5080', or '1440p'.
              </p>
            </div>
          ) : (
            matchedItems.map((item, index) => {
              const isSelected = index === activeIndex;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => {
                    setActiveIndex(index);
                    prefetchItem(item.id);
                  }}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#584CE8]/12 border border-[#584CE8]/30 shadow-xs'
                      : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-white/80 border border-black/5 flex items-center justify-center shrink-0">
                      {item.itemType === 'game' ? (
                        <Gamepad2 className="w-4 h-4 text-[#584CE8]" />
                      ) : (
                        <Cpu className="w-4 h-4 text-[#266D75]" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#584CE8] uppercase">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#515E7B] tabular-nums">
                          {formatINR(item.priceINR)}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-extrabold text-[#312A75] truncate text-balance">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#4A5578] truncate max-w-md font-medium">
                        {item.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="block text-[10px] font-mono font-bold text-[#266D75] tabular-nums">
                        SCORE: {item.overallScore.toFixed(1)}/10
                      </span>
                      <span className="block text-[10px] font-mono text-[#515E7B] tabular-nums">
                        1440p: {item.benchmarkStrip.values['1440p']} {item.benchmarkStrip.unit}
                      </span>
                    </div>
                    <kbd className="nexus-kbd">↵</kbd>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions & Shortcut Hints */}
        <div className="px-5 py-3 border-t border-[#2E276C]/10 bg-white/65 flex flex-wrap items-center justify-between text-xs text-[#515E7B] font-medium gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="nexus-kbd">↑</kbd>
              <kbd className="nexus-kbd">↓</kbd> Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="nexus-kbd">↵</kbd> Inspect
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="nexus-kbd">ESC</kbd> Close
            </span>
          </div>
          {query.trim() !== '' && (
            <button
              type="button"
              onClick={() => {
                onApplySearchToGrid(query);
                onClose();
              }}
              className="text-[#584CE8] hover:text-[#312A75] font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <span>Filter Catalog Grid ({matchedItems.length} results)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
