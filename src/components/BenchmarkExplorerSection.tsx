import React, { useState } from 'react';
import { ArrowUpRight, BarChart3, GitCompare, SlidersHorizontal } from 'lucide-react';
import { CatalogItem, ResolutionKey } from '../types/nexus';
import { formatINR } from '../utils/catalogLogic';

interface BenchmarkExplorerSectionProps {
  items: CatalogItem[];
  onSelectItem: (item: CatalogItem) => void;
  onCompareGpuPair: (ids: string[]) => void;
}

export const BenchmarkExplorerSection: React.FC<
  BenchmarkExplorerSectionProps
> = ({ items, onSelectItem, onCompareGpuPair }) => {
  const [resolution, setResolution] = useState<ResolutionKey>('1440p');
  const [tab, setTab] = useState<'gpu' | 'games'>('gpu');

  const gpuItems = items
    .filter(
      (i) =>
        i.category === 'Graphics Cards' ||
        i.category === 'Processors' ||
        i.category === 'Gaming Laptops'
    )
    .sort(
      (a, b) =>
        b.benchmarkStrip.values[resolution] -
        a.benchmarkStrip.values[resolution]
    );

  const gameItems = items
    .filter((i) => i.itemType === 'game')
    .sort(
      (a, b) =>
        b.benchmarkStrip.values[resolution] -
        a.benchmarkStrip.values[resolution]
    );

  const displayedList = tab === 'gpu' ? gpuItems : gameItems;
  const maxVal = Math.max(
    ...displayedList.map((i) => i.benchmarkStrip.values[resolution]),
    180
  );

  return (
    <section
      id="nexus-benchmark-section"
      aria-label="Interactive Benchmark Hierarchy"
      className="nexus-scroll-section px-3 sm:px-6 lg:px-8 pt-12 pb-6"
    >
      <div className="nexus-editorial-panel max-w-[1360px] mx-auto rounded-3xl p-6 sm:p-8 lg:p-10">
        {/* Asymmetric 12-Column Editorial Layout: 4-Col Left Editorial Brief + 8-Col Structured Data Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column (4 Cols): Editorial Methodology & Controls */}
          <div className="lg:col-span-4 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.14em] text-[#266D75]">
                <BarChart3 className="w-3.5 h-3.5 text-[#584CE8]" />
                <span>NEXUS BENCHMARK DATABASE · DEMO DATA</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#312A75] tracking-tight mt-2">
                Real-World Frame Rate Hierarchy ({resolution} Ultra)
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5578] leading-relaxed mt-2.5 font-medium">
                Every GPU, processor, laptop, and game is tested on our climate-controlled
                22°C open-air testbench using hardware frame-time capture. Switch resolution
                targets below or launch a direct multi-column shootout.
              </p>
            </div>

            {/* Dataset Mode Selector */}
            <div className="space-y-2 pt-2 border-t border-[#2E276C]/10">
              <span className="block text-[10px] font-mono font-bold tracking-[0.14em] text-[#266D75] uppercase">
                01. SELECT BENCHMARK INDEX
              </span>
              <div
                role="group"
                aria-label="Benchmark Hierarchy Category"
                className="nexus-editorial-well grid grid-cols-2 gap-1 p-1 rounded-2xl"
              >
                <button
                  type="button"
                  onClick={() => setTab('gpu')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'gpu'
                      ? 'bg-[#584CE8] text-white shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  GPUs, CPUs & Laptops
                </button>
                <button
                  type="button"
                  onClick={() => setTab('games')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'games'
                      ? 'bg-[#584CE8] text-white shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  Tested Games
                </button>
              </div>
            </div>

            {/* Resolution Target Selector */}
            <div className="space-y-2">
              <span className="block text-[10px] font-mono font-bold tracking-[0.14em] text-[#266D75] uppercase">
                02. TARGET RENDER RESOLUTION
              </span>
              <div
                role="group"
                aria-label="Benchmark Resolution Filter"
                className="nexus-editorial-well flex items-center justify-between p-1.5 rounded-2xl"
              >
                <div className="flex items-center gap-1.5 px-2 text-xs font-mono font-semibold text-[#515E7B]">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#584CE8]" />
                  <span>RES</span>
                </div>
                <div className="flex items-center gap-1">
                  {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolution(res)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                        resolution === res
                          ? 'bg-[#266D75] text-white font-bold shadow-xs'
                          : 'text-[#515E7B] hover:text-[#2E276C]'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Shootout CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  onCompareGpuPair([
                    'gpu-rtx-5070',
                    'gpu-rx-9070-xt',
                    'gpu-rtx-4070-super',
                  ])
                }
                className="nexus-editorial-control w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold text-[#2E276C] transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <GitCompare className="w-3.5 h-3.5 text-[#584CE8]" />
                  <span>Compare Top 1440p GPUs</span>
                </span>
                <span className="font-mono text-[11px] font-bold text-[#584CE8]">
                  3-WAY MATRIX →
                </span>
              </button>
            </div>
          </div>

          {/* Right Column (8 Cols): Structured Frosted Glass Telemetry Table */}
          <div className="lg:col-span-8 nexus-editorial-well rounded-2xl overflow-hidden">
            {/* Table Column Headers */}
            <div className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-3 border-b border-[#2E276C]/10 bg-white/60 text-[10px] font-mono font-bold tracking-[0.14em] text-[#266D75] uppercase">
              <div className="col-span-1">RANK</div>
              <div className="col-span-5 sm:col-span-4">HARDWARE / TITLE</div>
              <div className="hidden sm:block sm:col-span-2 text-right">RETAIL (INR)</div>
              <div className="col-span-6 sm:col-span-5 text-right">
                {resolution} GEOMETRIC MEAN (HIGHER IS BETTER)
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#2E276C]/10">
              {displayedList.map((item, idx) => {
                const fps = item.benchmarkStrip.values[resolution];
                const widthPct = Math.min(100, Math.round((fps / maxVal) * 100));
                const isTopRank = idx === 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectItem(item);
                      }
                    }}
                    className="grid grid-cols-12 gap-3 items-center px-4 sm:px-6 py-3.5 hover:bg-white/65 transition-colors cursor-pointer group"
                  >
                    {/* Rank */}
                    <div className="col-span-1 font-mono text-xs font-bold text-[#584CE8] tabular-nums">
                      0{idx + 1}
                    </div>

                    {/* Product / Game Title & Category */}
                    <div className="col-span-5 sm:col-span-4 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-extrabold text-[#312A75] group-hover:text-[#584CE8] transition-colors truncate">
                          {item.shortTitle}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#584CE8] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                      <span className="block text-[11px] font-medium text-[#515E7B] truncate">
                        {item.category} · {item.performanceTier}
                      </span>
                    </div>

                    {/* INR Price */}
                    <div className="hidden sm:block sm:col-span-2 text-right font-mono text-xs font-bold text-[#266D75] tabular-nums">
                      {formatINR(item.priceINR)}
                    </div>

                    {/* Telemetry Bar + FPS Value */}
                    <div className="col-span-6 sm:col-span-5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                        <span className="text-[10px] font-semibold text-[#515E7B]">
                          Score: {item.overallScore.toFixed(1)}/10
                        </span>
                        <span
                          className={`font-extrabold ${
                            isTopRank ? 'text-[#584CE8]' : 'text-[#312A75]'
                          }`}
                        >
                          {fps} {item.benchmarkStrip.unit}
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-white/80 rounded-full overflow-hidden border border-[#584CE8]/20">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            isTopRank ? 'bg-[#584CE8]' : 'bg-[#266D75]'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
