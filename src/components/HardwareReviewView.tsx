import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Flame,
  GitCompare,
  IndianRupee,
  Star,
  Volume2,
  Zap,
} from 'lucide-react';
import { CATALOG_ITEMS } from '../data/catalogData';
import {
  CatalogItem,
  GraphicsPresetKey,
  ResolutionKey,
  UpscalingTech,
} from '../types/nexus';
import { formatINR } from '../utils/catalogLogic';
import {
  computeGameOnHardwarePerformance,
  getRigForCatalogHardware,
  HARDWARE_TEST_RIGS,
} from '../utils/hardwareGameMatrix';
import { ArtworkRenderer } from './ArtworkRenderer';
import { ShareReviewMenu } from './ShareReviewMenu';

interface HardwareReviewViewProps {
  item: CatalogItem;
  isCompared: boolean;
  isSaved: boolean;
  onBack: () => void;
  onToggleCompare: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
  onOpenComparisonTable: () => void;
  onSelectCatalogItem?: (itemId: string) => void;
}

export const HardwareReviewView: React.FC<HardwareReviewViewProps> = ({
  item,
  isCompared,
  isSaved,
  onBack,
  onToggleCompare,
  onToggleSave,
  onOpenComparisonTable,
  onSelectCatalogItem,
}) => {
  const details = item.hardwareDetails!;
  const [selectedRes, setSelectedRes] = useState<ResolutionKey>('1440p');
  const [selectedPreset, setSelectedPreset] = useState<GraphicsPresetKey>('Ultra');
  const [rtEnabled, setRtEnabled] = useState<boolean>(false);
  const [upscaling, setUpscaling] = useState<UpscalingTech>('Off');
  const [subMinBaselineId, setSubMinBaselineId] = useState<string>('rig-gtx-1650-4gb');

  const currentRig = getRigForCatalogHardware(item.id);
  const subMinRig =
    HARDWARE_TEST_RIGS.find((r) => r.id === subMinBaselineId) ??
    HARDWARE_TEST_RIGS.find((r) => r.id === 'rig-gtx-1650-4gb')!;
  const allGames = CATALOG_ITEMS.filter((c) => c.itemType === 'game');
  const subMinimumRigs = HARDWARE_TEST_RIGS.filter((r) => r.group === 'below-minimum');

  return (
    <div className="nexus-page-enter max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* 12. Predictive Back Navigation & Action Bar with 13. Hit Slop & 4. Shortcut Hints */}
      <div className="nexus-editorial-panel rounded-2xl px-5 py-3.5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          title="Return to Catalog Discovery Grid (ESC)"
          className="nexus-hit-slop nexus-hover-shake inline-flex items-center gap-2.5 text-sm sm:text-base font-display font-bold text-[#266D75] hover:text-[#312A75] transition-colors cursor-pointer group"
        >
          <span className="w-7 h-7 rounded-full bg-white/80 border border-[#1E3F49]/20 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
            <ArrowLeft className="w-4 h-4 text-[#1E3F49] stroke-[2.4]" />
          </span>
          <div className="flex flex-col text-left">
            <span>Back to Discovery Grid</span>
            <span className="text-[10px] font-mono text-[#584CE8] font-semibold -mt-0.5">
              ← Return to 14 benchmarked reviews
            </span>
          </div>
          <kbd className="nexus-kbd ml-1">ESC</kbd>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onToggleCompare(item)}
            className={`nexus-hover-shake inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isCompared
                ? 'nexus-dock-circle-active'
                : 'nexus-editorial-control text-[#2E276C] hover:text-[#584CE8]'
            }`}
          >
            {isCompared ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <GitCompare className="w-3.5 h-3.5 text-[#584CE8]" />
            )}
            <span>{isCompared ? 'Added to Compare' : 'Add to Compare'}</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleSave(item)}
            className={`nexus-hover-shake inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isSaved
                ? 'nexus-dock-circle-active'
                : 'nexus-editorial-control text-[#2E276C] hover:text-[#584CE8]'
            }`}
          >
            <Bookmark
              className="w-3.5 h-3.5"
              fill={isSaved ? 'currentColor' : 'none'}
            />
            <span>{isSaved ? 'Saved' : 'Save Hardware'}</span>
          </button>

          <ShareReviewMenu item={item} />
        </div>
      </div>

      {/* Contiguous Product Overview & Pricing Module */}
      <div className="nexus-editorial-panel rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
        {/* Left Studio Product Image */}
        <div className="nexus-editorial-well lg:col-span-5 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="aspect-[4/3] w-full">
            <ArtworkRenderer variant={item.artworkVariant} />
          </div>
          <div className="p-4 border-t border-white/85 text-xs font-mono text-[#4A5578] space-y-1 bg-white/60">
            <div className="text-[#312A75] font-bold">
              LAB TESTBENCH CONFIGURATION ({item.dataStatusLabel})
            </div>
            <div>{details.testSystemSummary}</div>
          </div>
        </div>

        {/* Right Hardware Summary, INR Pricing & Score Matrix */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#584CE8] mb-2.5">
              <span className="nexus-frosted-badge nexus-frosted-badge-indigo">
                {item.category.toUpperCase()}
              </span>
              {item.overallScore >= 9.2 && (
                <span className="nexus-frosted-badge nexus-frosted-badge-gold">
                  EDITOR’S PICK
                </span>
              )}
              <span className="nexus-frosted-badge nexus-frosted-badge-teal">
                LAB VERIFIED
              </span>
              <span className="nexus-frosted-badge">
                {item.dataStatusLabel}
              </span>
              <span className="text-slate-700 font-semibold">
                {details.manufacturer} · {details.modelCode}
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2E276C] tracking-[-0.025em]">
              {item.title}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#4A5578] leading-relaxed font-medium">
              {item.shortDescription}
            </p>

            {/* Indian Retail Pricing & Source Box */}
            <div className="nexus-editorial-well mt-5 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#515E7B] block">
                  VERIFIED INDIA RETAIL PRICE (INR)
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#266D75] tabular-nums mt-0.5">
                  {formatINR(details.priceINR)}
                </div>
                <span className="text-[11px] text-[#515E7B] font-medium block mt-1">
                  Source: {details.priceSource} · Updated: {details.priceLastUpdated}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isCompared) onToggleCompare(item);
                  onOpenComparisonTable();
                }}
                className="nexus-hover-shake nexus-dock-circle-active px-5 py-2.5 rounded-full font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Compare vs Competitors
              </button>
            </div>
          </div>

          {/* 5-Metric Frosted Hardware Score Ledger */}
          <div className="nexus-editorial-well mt-6 rounded-2xl grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#2E276C]/10">
            <div className="p-3">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                OVERALL
              </span>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-[#584CE8] fill-[#584CE8]" />
                <span className="font-mono text-lg font-extrabold text-[#312A75] tabular-nums">
                  {item.overallScore.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="p-3">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                GAMING PERF
              </span>
              <span className="font-mono text-lg font-extrabold text-[#584CE8] tabular-nums mt-1 block">
                {details.gamingScore.toFixed(1)} / 10
              </span>
            </div>

            <div className="p-3">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                PRODUCTIVITY
              </span>
              <span className="font-mono text-lg font-extrabold text-[#266D75] tabular-nums mt-1 block">
                {details.productivityScore.toFixed(1)} / 10
              </span>
            </div>

            <div className="p-3">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                EFFICIENCY
              </span>
              <span className="font-mono text-lg font-extrabold text-[#312A75] tabular-nums mt-1 block">
                {details.efficiencyScore.toFixed(1)} / 10
              </span>
            </div>

            <div className="p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                VALUE SCORE
              </span>
              <span className="font-mono text-lg font-extrabold text-[#584CE8] tabular-nums mt-1 block">
                {details.valueScore.toFixed(1)} / 10
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Power, Thermals, Acoustics & Performance-Per-Rupee Telemetry */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="nexus-editorial-panel lg:col-span-5 grid grid-cols-3 divide-x divide-[#2E276C]/10 rounded-3xl">
          <div className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#584CE8]">
              <Zap className="w-4 h-4" />
              <span>POWER</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums">
                {details.powerConsumptionW !== null
                  ? `${details.powerConsumptionW}W`
                  : 'N/A'}
              </span>
              <span className="block text-[11px] font-medium text-[#515E7B] mt-0.5">
                Avg Gaming Load
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#266D75]">
              <Flame className="w-4 h-4" />
              <span>THERMALS</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums">
                {details.temperatureLoadC !== null
                  ? `${details.temperatureLoadC}°C`
                  : 'N/A'}
              </span>
              <span className="block text-[11px] font-medium text-[#515E7B] mt-0.5">
                Peak Sustained
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#584CE8]">
              <Volume2 className="w-4 h-4" />
              <span>NOISE</span>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums">
                {details.noiseLevelDb !== null
                  ? `${details.noiseLevelDb} dBA`
                  : 'N/A'}
              </span>
              <span className="block text-[11px] font-medium text-[#515E7B] mt-0.5">
                At 50cm Distance
              </span>
            </div>
          </div>
        </div>

        {/* Performance-per-Rupee Analysis */}
        <div className="nexus-editorial-panel lg:col-span-7 p-6 rounded-3xl flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#266D75] mb-2">
            <IndianRupee className="w-4 h-4 text-[#584CE8]" />
            <span>
              PERFORMANCE-PER-RUPEE ANALYSIS (SCORE:{' '}
              {details.priceToPerformanceScore.toFixed(1)} / 10)
            </span>
          </div>
          <p className="text-sm text-[#4A5578] leading-relaxed font-medium">
            {details.perfPerRupeeSummary}
          </p>
        </div>
      </section>

      {/* Resolution Benchmarks & Competitor Comparison Chart */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Multi-Resolution Performance */}
        <div className="nexus-editorial-panel lg:col-span-5 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#266D75]">
                18-GAME GEOMETRIC MEAN ({item.dataStatusLabel})
              </span>
              <h2 className="font-display text-lg font-extrabold text-[#312A75]">
                Performance by Resolution
              </h2>
            </div>

            <div className="nexus-editorial-well flex items-center gap-1 p-1 rounded-xl">
              {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setSelectedRes(res)}
                  className={`px-2 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    selectedRes === res
                      ? 'bg-[#584CE8] text-white font-bold shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => {
              const val = item.benchmarkStrip.values[res];
              const pct = Math.min(100, Math.round((val / 220) * 100));
              return (
                <div
                  key={res}
                  className={`nexus-editorial-well p-3.5 rounded-2xl ${
                    selectedRes === res
                      ? '!border-[#584CE8] !bg-white/85 shadow-xs'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-[#312A75] font-extrabold">{res}</span>
                    <span className="text-[#584CE8] font-bold tabular-nums">
                      {val} {item.benchmarkStrip.unit}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-white/85 rounded-full overflow-hidden border border-[#584CE8]/20">
                    <div
                      className="h-full rounded-full bg-[#584CE8]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Competing Products Comparison */}
        <div className="nexus-editorial-panel lg:col-span-7 p-6 rounded-3xl">
          <div className="mb-4">
            <span className="text-[10px] font-mono font-bold text-[#266D75]">
              DIRECT SEGMENT RIVALS · 1440P BENCHMARK & INR PRICE
            </span>
            <h2 className="font-display text-lg font-extrabold text-[#312A75]">
              Comparison Against Competing Products
            </h2>
          </div>

          <div className="space-y-4">
            {details.competitors.map((comp) => {
              const maxMetric = Math.max(
                ...details.competitors.map((c) => c.fps1440p),
                140
              );
              const barPct = Math.min(
                100,
                Math.round((comp.fps1440p / maxMetric) * 100)
              );

              return (
                <div
                  key={comp.name}
                  className={`nexus-editorial-well p-4 rounded-2xl ${
                    comp.isCurrent
                      ? '!border-[#584CE8] !bg-white/85 shadow-xs'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                    <span className="font-bold text-[#312A75]">
                      {comp.name}{' '}
                      {comp.isCurrent && (
                        <span className="text-[10px] font-mono text-[#584CE8] ml-1">
                          (THIS PRODUCT)
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-4 font-mono tabular-nums">
                      <span className="text-[#584CE8] font-extrabold">
                        {comp.fps1440p} {item.benchmarkStrip.unit}
                      </span>
                      <span className="text-[#266D75] font-bold">
                        {formatINR(comp.priceINR)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-white/85 rounded-full overflow-hidden border border-[#584CE8]/20">
                    <div
                      className={`h-full rounded-full ${
                        comp.isCurrent ? 'bg-[#584CE8]' : 'bg-[#266D75]'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tested Games Performance Matrix (All 10 Games + Sub-Minimum Baseline Comparison) */}
      <section
        aria-label="Tested Games Performance Matrix on This Hardware and Below-Minimum Rigs"
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-[0.16em] text-[#266D75] block">
              ALL-GAMES HARDWARE BENCHMARK MATRIX · {allGames.length} TITLES TESTED
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#312A75] mt-1">
              Every Game Tested on {item.shortTitle} (Plus Sub-Minimum Rig Baseline)
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5578] mt-1 max-w-3xl font-medium">
              Evaluates {item.shortTitle} ({currentRig.vramGB} GB VRAM) across all{' '}
              {allGames.length} benchmarked games alongside a selectable Below-Minimum GPU
              baseline ({subMinRig.shortName})—showing exact frame rates even when settings
              or legacy GPUs fall below official minimum requirements.
            </p>
          </div>

          {/* Interactive Resolution, Preset, RT, Upscaling Controls */}
          <div className="nexus-editorial-panel flex flex-wrap items-center gap-2.5 p-2.5 rounded-2xl">
            {/* Resolution */}
            <div className="flex items-center gap-1" role="group" aria-label="Game Matrix Resolution">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] px-1">
                RES:
              </span>
              {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setSelectedRes(res)}
                  className={`px-2 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    selectedRes === res
                      ? 'bg-[#584CE8] text-white font-bold shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-[#2E276C]/15 hidden sm:block" />

            {/* Preset */}
            <div className="flex items-center gap-1" role="group" aria-label="Game Matrix Preset">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] px-1">
                PRESET:
              </span>
              {(['Low', 'Medium', 'High', 'Ultra'] as GraphicsPresetKey[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSelectedPreset(preset)}
                  className={`px-2 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedPreset === preset
                      ? 'bg-[#312A75] text-white font-bold shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-[#2E276C]/15 hidden sm:block" />

            {/* RT Toggle */}
            <button
              type="button"
              onClick={() => setRtEnabled((prev) => !prev)}
              aria-pressed={rtEnabled}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                rtEnabled
                  ? 'bg-[#266D75] border-[#266D75] text-white font-bold'
                  : 'border-white/90 bg-white/55 text-[#515E7B] hover:text-[#2E276C]'
              }`}
            >
              RT: {rtEnabled ? 'ON' : 'OFF'}
            </button>

            <div className="h-4 w-[1px] bg-[#2E276C]/15 hidden sm:block" />

            {/* Upscaling */}
            <div className="flex items-center gap-1" role="group" aria-label="Game Matrix Upscaling">
              {(['Off', 'DLSS', 'FSR'] as UpscalingTech[]).map((tech) => (
                <button
                  key={tech}
                  type="button"
                  onClick={() => setUpscaling(tech)}
                  className={`px-2 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    upscaling === tech
                      ? 'bg-[#266D75] text-white font-bold shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub-Minimum Baseline Selector Strip */}
        <div className="nexus-editorial-panel flex flex-wrap items-center justify-between gap-3 mb-5 p-4 rounded-2xl">
          <div className="text-xs text-[#4A5578] font-medium">
            <span className="font-mono text-[#266D75] font-bold">
              SUB-MINIMUM HARDWARE COMPARISON BASELINE:
            </span>{' '}
            Select a below-minimum GPU/iGPU to see how every game performs on sub-minimum
            hardware vs <strong className="text-[#312A75]">{item.shortTitle}</strong>:
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {subMinimumRigs.map((rig) => (
              <button
                key={rig.id}
                type="button"
                onClick={() => setSubMinBaselineId(rig.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  subMinBaselineId === rig.id
                    ? 'bg-[#266D75] text-white font-bold shadow-xs'
                    : 'nexus-editorial-control text-[#515E7B] hover:text-[#2E276C]'
                }`}
              >
                {rig.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* All 10 Games Benchmark Rows */}
        <div
          data-testid="hardware-games-matrix"
          className="nexus-editorial-panel rounded-3xl overflow-hidden divide-y divide-[#2E276C]/10"
        >
          {allGames.map((game) => {
            const thisPerf = computeGameOnHardwarePerformance(
              game,
              currentRig,
              selectedRes,
              selectedPreset,
              rtEnabled,
              upscaling
            );
            const subMinPerf = computeGameOnHardwarePerformance(
              game,
              subMinRig,
              selectedRes,
              selectedPreset,
              rtEnabled,
              upscaling
            );
            const isThisBelowMin = thisPerf.specStatus === 'Below Minimum';
            const speedupRatio = (thisPerf.avgFps / Math.max(1, subMinPerf.avgFps)).toFixed(
              1
            );

            return (
              <div
                key={game.id}
                data-testid={`hardware-game-row-${game.id}`}
                className="p-4 sm:p-5 hover:bg-white/60 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Col 1-4: Game Identity & Minimum Requirement Info */}
                  <div className="lg:col-span-4 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span
                        className={
                          isThisBelowMin
                            ? 'text-[#B45309] font-bold inline-flex items-center gap-1'
                            : thisPerf.specStatus === 'Exceeds Recommended'
                            ? 'text-[#584CE8] font-bold'
                            : 'text-[#266D75] font-bold'
                        }
                      >
                        {isThisBelowMin && <AlertTriangle className="w-3 h-3 shrink-0" />}
                        {thisPerf.specStatus.toUpperCase()}
                      </span>
                      <span aria-hidden="true" className="text-[#515E7B]">
                        ·
                      </span>
                      <span className="text-[#515E7B] font-medium">
                        {game.genres.slice(0, 2).join(', ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-sm sm:text-base font-extrabold text-[#312A75]">
                        {game.shortTitle}
                      </h4>
                      {onSelectCatalogItem && (
                        <button
                          type="button"
                          onClick={() => onSelectCatalogItem(game.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#584CE8] hover:text-[#2E276C] underline underline-offset-4 cursor-pointer"
                        >
                          <span>Full Game Review</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#4A5578] font-mono font-medium">
                      Min Spec GPU: {game.gameDetails?.minRequirements.gpu}
                    </p>
                  </div>

                  {/* Col 5-8: Performance on THIS Hardware */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-[#312A75] font-bold">
                        {item.shortTitle}:{' '}
                        <strong className="text-[#584CE8] text-sm font-extrabold">
                          {thisPerf.avgFps} FPS
                        </strong>
                      </span>
                      <span className="text-[#515E7B] font-semibold">
                        1% Low: {thisPerf.onePercentLowFps} FPS
                      </span>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-black/[0.08] border border-black/[0.08] rounded-xl bg-white/75 p-1.5 text-center font-mono text-[10px] tabular-nums">
                      {(['1080p', '1440p', '4K'] as const).map((rKey) => {
                        const rFps = thisPerf.resolutionFps[rKey];
                        const rPct = Math.max(
                          10,
                          Math.min(100, Math.round((rFps / 180) * 100))
                        );
                        return (
                          <div key={rKey} className="px-1.5 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">{rKey}</span>
                              <span className="text-[#1E293B] font-bold">
                                {rFps} FPS
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-900/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rKey === '1080p'
                                    ? 'bg-[#584CE8]'
                                    : rKey === '1440p'
                                    ? 'bg-[#4338CA]'
                                    : 'bg-[#266D75]'
                                }`}
                                style={{ width: `${rPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#515E7B] font-semibold tabular-nums">
                      <span>
                        VRAM: {thisPerf.estimatedVramGB}/{thisPerf.rigVramGB} GB
                      </span>
                      <span className="text-[#584CE8] font-bold">
                        {thisPerf.playabilityTier}
                      </span>
                    </div>
                  </div>

                  {/* Col 9-12: Below-Minimum Baseline Rig Performance & Survival Tuning */}
                  <div className="lg:col-span-4 nexus-editorial-well p-3.5 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#B45309] font-bold truncate">
                        {subMinRig.shortName} ({subMinPerf.specStatus})
                      </span>
                      <span className="text-[#266D75] font-extrabold tabular-nums shrink-0">
                        {speedupRatio}x Faster Here
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                      <span className="text-[#515E7B] font-semibold">
                        At {selectedRes} {selectedPreset}:
                      </span>
                      <span className="text-[#312A75] font-bold">
                        {subMinPerf.avgFps} Avg / {subMinPerf.onePercentLowFps} 1% Low FPS
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                      <span className="text-[#515E7B] font-semibold">
                        Sub-Min 1080p Low Survival:
                      </span>
                      <span className="text-[#266D75] font-extrabold">
                        {subMinPerf.lowSpecSurvivalFps1080p} FPS
                      </span>
                    </div>

                    <p className="text-[11px] text-[#4A5578] leading-snug pt-1 border-t border-[#2E276C]/10 font-medium">
                      {subMinPerf.survivalTuningTip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Technical Specifications & Recommended Use Cases */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="nexus-editorial-panel lg:col-span-7 p-6 rounded-3xl">
          <h3 className="font-display text-lg font-extrabold text-[#312A75] mb-4">
            Complete Technical Specifications
          </h3>
          <dl className="divide-y divide-[#2E276C]/10 text-xs">
            {Object.entries(details.technicalSpecs).map(([key, value]) => (
              <div
                key={key}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <dt className="text-[#515E7B] font-mono font-semibold">{key}</dt>
                <dd className="text-[#312A75] font-bold sm:text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="nexus-editorial-panel lg:col-span-5 divide-y divide-[#2E276C]/10 rounded-3xl">
          <div className="p-6">
            <h3 className="font-display text-base font-extrabold text-[#312A75] mb-3">
              Recommended Use Cases
            </h3>
            <ul className="space-y-2 text-xs text-[#4A5578] font-medium">
              {details.recommendedUseCases.map((useCase) => (
                <li key={useCase} className="flex items-start gap-2">
                  <span className="text-[#584CE8] font-mono font-bold">→</span>
                  <span>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div>
              <div className="font-mono text-[#266D75] font-bold mb-2">
                ADVANTAGES
              </div>
              <ul className="space-y-1.5 text-[#4A5578] font-medium">
                {details.pros.map((pro) => (
                  <li key={pro}>+ {pro}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-[#2E276C]/10">
              <div className="font-mono text-[#584CE8] font-bold mb-2">
                DISADVANTAGES
              </div>
              <ul className="space-y-1.5 text-[#4A5578] font-medium">
                {details.cons.map((con) => (
                  <li key={con}>- {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Buying Recommendation */}
      <section className="py-2">
        <div className="nexus-editorial-panel rounded-3xl !border-[#584CE8]/45 p-6 sm:p-8">
          <span className="text-[11px] font-mono font-bold text-[#266D75] tracking-[0.16em]">
            NEXUS BUYING RECOMMENDATION
          </span>
          <h3 className="font-display text-xl font-extrabold text-[#312A75] mt-1 mb-3">
            Should You Upgrade to the {item.shortTitle}?
          </h3>
          <p className="text-sm sm:text-base text-[#4A5578] leading-relaxed max-w-4xl font-medium">
            {details.buyingRecommendation}
          </p>
        </div>
      </section>
    </div>
  );
};
