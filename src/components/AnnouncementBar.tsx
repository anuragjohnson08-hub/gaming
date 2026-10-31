import React from 'react';
import { ChevronDown, Layers, Type } from 'lucide-react';

export type UiUpgradeMode = 'option1' | 'option2';

interface AnnouncementBarProps {
  onOpenMethodology: () => void;
  uiUpgradeMode?: UiUpgradeMode;
  onChangeUiUpgradeMode?: (mode: UiUpgradeMode) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onOpenMethodology,
  uiUpgradeMode = 'option1',
  onChangeUiUpgradeMode,
}) => {
  return (
    <div className="nexus-announcement-bar min-h-8 py-1 w-full text-[11px] tracking-[0.12em] text-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 px-3 sm:px-8 select-none z-40 relative">
      {/* Left: Live Mode Switcher between Option 1 & Option 2 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="hidden xl:inline font-mono text-[10px] font-bold text-[#94A3B8] tracking-[0.08em]">
          UI MODE:
        </span>
        <div
          role="group"
          aria-label="Switch between Option 1 and Option 2 UI modes"
          data-testid="ui-upgrade-mode-switcher"
          className="inline-flex items-center gap-1 p-0.5 rounded-full bg-white/10 border border-white/10 shadow-xs"
        >
          <button
            type="button"
            data-testid="ui-mode-option1"
            aria-pressed={uiUpgradeMode === 'option1'}
            onClick={() => onChangeUiUpgradeMode?.('option1')}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-normal transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              uiUpgradeMode === 'option1'
                ? 'bg-[#6357F2] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-[#FFFFFF]'
            }`}
            title="Option 1: Complete Editorial UI, Frosted Badges & 1080p/1440p/4K Progress Bars"
          >
            <Layers className="w-3 h-3" />
            <span>Option 1: Lab UI + Bars</span>
          </button>

          <button
            type="button"
            data-testid="ui-mode-option2"
            aria-pressed={uiUpgradeMode === 'option2'}
            onClick={() => onChangeUiUpgradeMode?.('option2')}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-normal transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              uiUpgradeMode === 'option2'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'text-[#94A3B8] hover:text-[#FFFFFF]'
            }`}
            title="Option 2: Pure Typography (Cabinet Grotesk + Inter + JetBrains Mono) & Hover Micro-Interactions"
          >
            <Type className="w-3 h-3" />
            <span>Option 2: Type & Motion</span>
          </button>
        </div>
      </div>

      <p className="mx-auto font-semibold text-center truncate text-[#CBD5E1] hidden md:block">
        INDEPENDENT REVIEWS • REAL-WORLD PERFORMANCE • NO BS
      </p>

      <div className="flex items-center justify-end shrink-0 ml-auto md:ml-0">
        <button
          type="button"
          onClick={onOpenMethodology}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.10em] font-bold text-[#A78BFA] hover:text-[#38BDF8] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#6357F2]"
          aria-label="Open Benchmark Database and Methodology"
        >
          <span>BENCHMARK DATABASE</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
