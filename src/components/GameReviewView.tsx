import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Cpu,
  GitCompare,
  Layers,
  Monitor,
  Sliders,
  Star,
} from 'lucide-react';
import {
  CatalogItem,
  GraphicsPresetKey,
  ResolutionKey,
  UpscalingTech,
} from '../types/nexus';
import { computeGameBenchmarkMetrics, formatINR } from '../utils/catalogLogic';
import {
  computeGameOnHardwarePerformance,
  HARDWARE_TEST_RIGS,
} from '../utils/hardwareGameMatrix';
import { ArtworkRenderer } from './ArtworkRenderer';
import { ShareReviewMenu } from './ShareReviewMenu';

type RigFilterTab = 'all' | 'below-minimum' | 'catalog' | 'portable';

interface GameReviewViewProps {
  item: CatalogItem;
  isCompared: boolean;
  isSaved: boolean;
  onBack: () => void;
  onToggleCompare: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
  onSelectCatalogItem?: (itemId: string) => void;
}

export const GameReviewView: React.FC<GameReviewViewProps> = ({
  item,
  isCompared,
  isSaved,
  onBack,
  onToggleCompare,
  onToggleSave,
  onSelectCatalogItem,
}) => {
  const details = item.gameDetails!;

  const [selectedRes, setSelectedRes] = useState<ResolutionKey>('1440p');
  const [selectedPreset, setSelectedPreset] = useState<GraphicsPresetKey>('Ultra');
  const [rtEnabled, setRtEnabled] = useState<boolean>(false);
  const [upscaling, setUpscaling] = useState<UpscalingTech>('Off');
  const [rigFilter, setRigFilter] = useState<RigFilterTab>('all');

  // Compute FPS across all 3 resolutions for current preset/RT/upscaling
  const resMetrics: Record<
    ResolutionKey,
    ReturnType<typeof computeGameBenchmarkMetrics>
  > = {
    '1080p': computeGameBenchmarkMetrics(
      details.baseUltraFps,
      details.frameTimeConsistency.onePercentLowRatio,
      '1080p',
      selectedPreset,
      details.supportedTech.rayTracing ? rtEnabled : false,
      upscaling
    ),
    '1440p': computeGameBenchmarkMetrics(
      details.baseUltraFps,
      details.frameTimeConsistency.onePercentLowRatio,
      '1440p',
      selectedPreset,
      details.supportedTech.rayTracing ? rtEnabled : false,
      upscaling
    ),
    '4K': computeGameBenchmarkMetrics(
      details.baseUltraFps,
      details.frameTimeConsistency.onePercentLowRatio,
      '4K',
      selectedPreset,
      details.supportedTech.rayTracing ? rtEnabled : false,
      upscaling
    ),
  };

  const activeMetric = resMetrics[selectedRes];

  // Available upscalers based on supportedTech
  const availableUpscalers: UpscalingTech[] = ['Off'];
  if (details.supportedTech.dlss) availableUpscalers.push('DLSS');
  if (details.supportedTech.fsr) availableUpscalers.push('FSR');
  if (details.supportedTech.xess) availableUpscalers.push('XeSS');

  return (
    <div className="nexus-page-enter max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      {/* Top Back Navigation & Action Bar (Styled like "← Make It Pop!" header in reference) */}
      <div className="nexus-editorial-panel rounded-2xl px-5 py-3.5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="nexus-hover-shake inline-flex items-center gap-2.5 text-sm sm:text-base font-display font-bold text-[#266D75] hover:text-[#312A75] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E3F49] stroke-[2.4]" />
          <span>Back to Discovery Grid</span>
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
            <span>{isCompared ? 'Added to Compare' : 'Compare Performance'}</span>
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
            <span>{isSaved ? 'Saved' : 'Save Review'}</span>
          </button>

          <ShareReviewMenu item={item} />
        </div>
      </div>

      {/* Header & Artwork Split */}
      <div className="nexus-editorial-panel rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-[#584CE8] mb-2.5">
              <span className="nexus-frosted-badge nexus-frosted-badge-indigo">
                GAME PERFORMANCE REVIEW
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
              <span className="text-slate-700 font-semibold">{details.engine}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#2E276C] tracking-[-0.025em]">
              {item.title}
            </h1>

            {/* Release, Platforms, Genre, Retail Info */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#515E7B] font-medium">
              <span>
                Developer: <strong className="text-[#312A75]">{details.developer}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Release: <strong className="text-[#312A75]">{item.releaseDate}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Platforms:{' '}
                <strong className="text-[#312A75]">
                  {item.platforms.join(', ')}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Genres:{' '}
                <strong className="text-[#312A75]">{item.genres.join(', ')}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                PC Retail:{' '}
                <strong className="text-[#266D75] font-mono font-bold">
                  {formatINR(item.priceINR)}
                </strong>
              </span>
            </div>

            {/* 1. Game Overview */}
            <p className="mt-5 text-sm sm:text-base text-[#4A5578] leading-relaxed max-w-2xl font-medium">
              {details.overview}
            </p>
          </div>

          {/* 4-Pillar Frosted Score Ledger */}
          <div className="nexus-editorial-well mt-6 rounded-2xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#2E276C]/10">
            <div className="p-3.5">
              <span className="text-[11px] font-mono font-bold text-[#515E7B] block">
                OVERALL SCORE (ED.)
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <Star className="w-4 h-4 text-[#584CE8] fill-[#584CE8] self-center" />
                <span className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums">
                  {item.overallScore.toFixed(1)}
                </span>
                <span className="text-xs text-[#515E7B]">/ 10</span>
              </div>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-mono font-bold text-[#515E7B] block">
                GRAPHICS QUALITY
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#584CE8] tabular-nums mt-1 block">
                {details.graphicsScore.toFixed(1)}{' '}
                <span className="text-xs font-normal text-[#515E7B]">/ 10</span>
              </span>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-mono font-bold text-[#515E7B] block">
                PERFORMANCE (MEAS.)
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#266D75] tabular-nums mt-1 block">
                {details.performanceScore.toFixed(1)}{' '}
                <span className="text-xs font-normal text-[#515E7B]">/ 10</span>
              </span>
            </div>

            <div className="p-3.5">
              <span className="text-[11px] font-mono font-bold text-[#515E7B] block">
                PC OPTIMIZATION
              </span>
              <span className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums mt-1 block">
                {details.optimizationScore.toFixed(1)}{' '}
                <span className="text-xs font-normal text-[#515E7B]">/ 10</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Artwork Box */}
        <div className="nexus-editorial-well lg:col-span-5 flex flex-col justify-between rounded-2xl overflow-hidden">
          <div className="aspect-[16/10] w-full">
            <ArtworkRenderer variant={item.artworkVariant} />
          </div>
          <div className="p-4 border-t border-white/85 text-xs text-[#4A5578] space-y-1 font-mono bg-white/60">
            <div className="text-[#312A75] font-bold">
              TESTBENCH CONFIGURATION ({item.dataStatusLabel})
            </div>
            <div>{details.testSystemSummary}</div>
            <div>
              Version: {details.testVersion} · Driver: {details.testDriver}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Resolution, Preset, Ray Tracing & Upscaling Benchmark Suite */}
      <section
        aria-label="Interactive Game Benchmark Suite"
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-mono font-bold tracking-[0.16em] text-[#266D75]">
              INTERACTIVE TELEMETRY LAB · {item.dataStatusLabel}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#312A75] mt-1">
              Resolution, Preset & Upscaling Benchmarks
            </h2>
          </div>

          {/* Interactive Controls Bar */}
          <div className="nexus-editorial-panel flex flex-wrap items-center gap-3 p-2.5 rounded-2xl">
            {/* Resolution Selector */}
            <div className="flex items-center gap-1" role="group" aria-label="Select Resolution">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] px-1.5">
                RES:
              </span>
              {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setSelectedRes(res)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    selectedRes === res
                      ? 'bg-[#584CE8] text-white font-bold shadow-xs'
                      : 'text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            <div className="h-5 w-[1px] bg-[#2E276C]/15 hidden sm:block" />

            {/* Graphics Preset Selector */}
            <div className="flex items-center gap-1" role="group" aria-label="Select Graphics Preset">
              <span className="text-[10px] font-mono font-bold text-[#515E7B] px-1.5">
                PRESET:
              </span>
              {(['Low', 'Medium', 'High', 'Ultra'] as GraphicsPresetKey[]).map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSelectedPreset(preset)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      selectedPreset === preset
                        ? 'bg-[#312A75] text-white font-bold shadow-xs'
                        : 'text-[#515E7B] hover:text-[#2E276C]'
                    }`}
                  >
                    {preset}
                  </button>
                )
              )}
            </div>

            {/* Ray Tracing Toggle */}
            {details.supportedTech.rayTracing && (
              <>
                <div className="h-5 w-[1px] bg-[#2E276C]/15 hidden sm:block" />
                <button
                  type="button"
                  onClick={() => setRtEnabled((prev) => !prev)}
                  aria-pressed={rtEnabled}
                  className={`px-3 py-1 rounded-xl text-xs font-mono border transition-colors cursor-pointer ${
                    rtEnabled
                      ? 'bg-[#266D75] border-[#266D75] text-white font-bold'
                      : 'border-white/90 bg-white/55 text-[#515E7B] hover:text-[#2E276C]'
                  }`}
                >
                  Ray Tracing: {rtEnabled ? 'ON' : 'OFF'}
                </button>
              </>
            )}

            {/* Upscaling Selector */}
            {availableUpscalers.length > 1 && (
              <>
                <div className="h-5 w-[1px] bg-[#2E276C]/15 hidden sm:block" />
                <div className="flex items-center gap-1" role="group" aria-label="Select Upscaling">
                  <span className="text-[10px] font-mono font-bold text-[#515E7B] px-1">
                    UPSCALE:
                  </span>
                  {availableUpscalers.map((tech) => (
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
              </>
            )}
          </div>
        </div>

        {/* Benchmark Visualization Bars + Frame-Time Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="nexus-editorial-panel lg:col-span-8 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#515E7B]">
              <span>
                CONFIG: {selectedPreset.toUpperCase()} PRESET · RT{' '}
                {details.supportedTech.rayTracing && rtEnabled ? 'ON' : 'OFF'} ·{' '}
                {upscaling === 'Off' ? 'NATIVE RESOLUTION' : `${upscaling} QUALITY`}
              </span>
              <span className="text-[#266D75]">HIGHER FPS IS BETTER</span>
            </div>

            {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => {
              const m = resMetrics[res];
              const isSelected = res === selectedRes;
              const avgWidthPct = Math.min(100, Math.round((m.avgFps / 240) * 100));
              const lowWidthPct = Math.min(
                100,
                Math.round((m.onePercentLowFps / 240) * 100)
              );

              return (
                <div
                  key={res}
                  onClick={() => setSelectedRes(res)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedRes(res);
                    }
                  }}
                  className={`nexus-editorial-well p-4 rounded-2xl transition-colors cursor-pointer ${
                    isSelected
                      ? '!border-[#584CE8] !bg-white/85 shadow-sm'
                      : 'hover:bg-white/75'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-extrabold text-[#312A75]">
                      {res} Resolution
                    </span>
                    <div className="flex items-center gap-4 font-mono tabular-nums">
                      <span className="text-[#312A75] font-extrabold">
                        Avg: {m.avgFps} FPS
                      </span>
                      <span className="text-[#584CE8] font-bold">
                        1% Low: {m.onePercentLowFps} FPS
                      </span>
                      <span className="text-[#266D75] font-bold">
                        {m.frameTimeMs} ms
                      </span>
                    </div>
                  </div>

                  {/* Pastel Indigo & Aqua Telemetry Bars */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full bg-white/85 rounded-full overflow-hidden border border-[#584CE8]/20">
                      <div
                        className="h-full rounded-full bg-[#584CE8] transition-all duration-200"
                        style={{ width: `${avgWidthPct}%` }}
                      />
                    </div>
                    <div className="h-1.5 w-full bg-white/75 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#266D75] transition-all duration-200"
                        style={{ width: `${lowWidthPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="text-[11px] text-[#515E7B] pt-2 border-t border-[#2E276C]/10 font-medium">
              Methodology Note ({item.dataStatusLabel}): Frame rates depend on the
              test system ({details.testSystemSummary}), game build ({details.testVersion}
              ), GPU drivers ({details.testDriver}), and ambient temperature.
            </p>
          </div>

          {/* Right Active Resolution Telemetry & Frame-Time Consistency Card */}
          <div className="nexus-editorial-panel lg:col-span-4 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#266D75] tracking-[0.14em]">
                SELECTED TARGET ({selectedRes})
              </span>
              <div className="mt-3 flex items-baseline gap-3">
                <span
                  data-testid="active-benchmark-fps"
                  className="font-mono text-4xl font-extrabold text-[#312A75] tabular-nums"
                >
                  {activeMetric.avgFps}
                </span>
                <span className="font-mono text-sm font-semibold text-[#515E7B]">
                  AVG FPS ({activeMetric.frameTimeMs} ms)
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#2E276C]/10 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#4A5578] font-medium">1% Low Frame Rate</span>
                  <span className="font-mono text-[#584CE8] font-bold tabular-nums">
                    {activeMetric.onePercentLowFps} FPS
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4A5578] font-medium">Frame-Time Pacing</span>
                  <span className="font-mono text-[#266D75] font-bold">
                    {details.frameTimeConsistency.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4A5578] font-medium">1% Low / Avg Ratio</span>
                  <span className="font-mono text-[#312A75] font-bold tabular-nums">
                    {Math.round(details.frameTimeConsistency.onePercentLowRatio * 100)}%
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs text-[#4A5578] leading-relaxed font-medium">
                {details.frameTimeConsistency.summary}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2E276C]/10 space-y-2 text-xs">
              <div className="font-mono text-[11px] text-[#312A75] font-bold">
                RAY TRACING & UPSCALING NOTES
              </div>
              <p className="text-[#4A5578] leading-relaxed">
                {details.rayTracingAssessment}
              </p>
              <p className="text-[#4A5578] leading-relaxed">
                {details.upscalingAssessment}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial & Technical Assessments — Frosted 3-Column Editorial Spread */}
      <section className="nexus-editorial-panel rounded-3xl p-6 sm:p-8 mb-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2E276C]/10">
        <div className="pb-6 md:pb-0 md:pr-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#584CE8] mb-2">
            <Layers className="w-4 h-4" />
            <span>01. GAMEPLAY ASSESSMENT</span>
          </div>
          <p className="text-sm text-[#4A5578] leading-relaxed font-medium">
            {details.gameplayAssessment}
          </p>
        </div>

        <div className="py-6 md:py-0 md:px-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#584CE8] mb-2">
            <Monitor className="w-4 h-4" />
            <span>02. GRAPHICS & ENGINE QUALITY</span>
          </div>
          <p className="text-sm text-[#4A5578] leading-relaxed font-medium">
            {details.graphicsAssessment}
          </p>
        </div>

        <div className="pt-6 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#266D75] mb-2">
            <Sliders className="w-4 h-4" />
            <span>03. OPTIMIZATION & SCALING</span>
          </div>
          <p className="text-sm text-[#4A5578] leading-relaxed font-medium">
            {details.optimizationAssessment}
          </p>
        </div>
      </section>

      {/* CPU & GPU Performance + System Requirements */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="nexus-editorial-panel lg:col-span-5 divide-y divide-[#2E276C]/10 rounded-3xl">
          <div className="p-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#584CE8] mb-2">
              <Cpu className="w-4 h-4" />
              <span>CPU THREAD SCALING ANALYSIS</span>
            </div>
            <p className="text-sm text-[#4A5578] leading-relaxed font-medium">
              {details.cpuPerformanceAnalysis}
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#266D75] mb-2">
              <Monitor className="w-4 h-4" />
              <span>GPU VRAM & SHADER THROUGHPUT</span>
            </div>
            <p className="text-sm text-[#4A5578] leading-relaxed font-medium">
              {details.gpuPerformanceAnalysis}
            </p>
          </div>
        </div>

        {/* System Requirements Comparison Table */}
        <div className="nexus-editorial-panel lg:col-span-7 p-6 rounded-3xl">
          <h3 className="font-display text-lg font-extrabold text-[#312A75] mb-4">
            Official & Lab-Verified PC System Requirements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="nexus-editorial-well p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="font-mono text-[#515E7B] font-bold">
                MINIMUM REQUIREMENTS
              </div>
              <div>
                <span className="text-[#515E7B] block">OS:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.minRequirements.os}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Processor:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.minRequirements.cpu}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Memory:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.minRequirements.ram}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Graphics:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.minRequirements.gpu}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Storage:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.minRequirements.storage}
                </span>
              </div>
              <div className="pt-2 border-t border-[#2E276C]/10 text-[#584CE8] font-semibold">
                Target: {details.minRequirements.notes}
              </div>
            </div>

            <div className="nexus-editorial-well p-4 rounded-2xl !border-[#584CE8]/45 space-y-2.5 text-xs">
              <div className="font-mono text-[#584CE8] font-bold">
                RECOMMENDED REQUIREMENTS
              </div>
              <div>
                <span className="text-[#515E7B] block">OS:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.recRequirements.os}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Processor:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.recRequirements.cpu}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Memory:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.recRequirements.ram}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Graphics:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.recRequirements.gpu}
                </span>
              </div>
              <div>
                <span className="text-[#515E7B] block">Storage:</span>
                <span className="text-[#312A75] font-semibold">
                  {details.recRequirements.storage}
                </span>
              </div>
              <div className="pt-2 border-t border-[#2E276C]/10 text-[#266D75] font-semibold">
                Target: {details.recRequirements.notes}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Hardware Performance Matrix — Including Below-Minimum & Legacy Rigs */}
      <section
        aria-label="Cross-Hardware Performance Matrix Including Below-Minimum Hardware"
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-[0.16em] text-[#266D75] block">
              ALL-HARDWARE COMPATIBILITY & SUB-MINIMUM SURVIVAL MATRIX · {item.dataStatusLabel}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#312A75] mt-1">
              Performance Across Every Hardware Tier (Including Below-Minimum Rigs)
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5578] mt-1 max-w-3xl font-medium">
              Live telemetry across {HARDWARE_TEST_RIGS.length} desktop GPUs, CPUs, laptops,
              handheld APUs, and sub-minimum legacy cards ({selectedRes} · {selectedPreset}{' '}
              Preset · RT {details.supportedTech.rayTracing && rtEnabled ? 'ON' : 'OFF'} ·{' '}
              {upscaling === 'Off' ? 'Native' : upscaling}). Even hardware that falls below
              official minimum requirements is benchmarked with low-spec survival tuning.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedRes('1080p');
                setSelectedPreset('Low');
                setRtEnabled(false);
                if (details.supportedTech.fsr) {
                  setUpscaling('FSR');
                } else if (details.supportedTech.dlss) {
                  setUpscaling('DLSS');
                } else {
                  setUpscaling('Off');
                }
              }}
              className="nexus-hover-shake px-4 py-2 rounded-full text-xs font-mono font-bold bg-[#266D75] text-white hover:bg-[#1E565D] transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
            >
              Test Low-Spec Survival Mode (1080p Low + Upscale)
            </button>
          </div>
        </div>

        {/* Filter Tabs for Hardware Matrix */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div
            className="nexus-editorial-panel inline-flex flex-wrap items-center gap-1 p-1.5 rounded-2xl"
            role="tablist"
            aria-label="Filter Hardware Tiers"
          >
            {(
              [
                { id: 'all', label: `All Tested Hardware (${HARDWARE_TEST_RIGS.length})` },
                {
                  id: 'below-minimum',
                  label: 'Below-Minimum & Legacy Rigs',
                },
                { id: 'catalog', label: 'Catalog Hardware (8)' },
                { id: 'portable', label: 'Laptops, Handhelds & iGPUs' },
              ] as { id: RigFilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={rigFilter === tab.id}
                onClick={() => setRigFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  rigFilter === tab.id
                    ? 'bg-[#584CE8] text-white shadow-xs'
                    : 'text-[#515E7B] hover:text-[#2E276C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[#515E7B] font-semibold">
            Minimum Spec Target:{' '}
            <strong className="text-[#312A75]">{details.minRequirements.gpu}</strong>
          </div>
        </div>

        {/* Hardware Matrix Table / Cards */}
        <div
          data-testid="game-hardware-matrix"
          className="nexus-editorial-panel rounded-3xl overflow-hidden divide-y divide-[#2E276C]/10"
        >
          {HARDWARE_TEST_RIGS.filter((rig) => {
            if (rigFilter === 'all') return true;
            const perf = computeGameOnHardwarePerformance(
              item,
              rig,
              selectedRes,
              selectedPreset,
              rtEnabled,
              upscaling
            );
            if (rigFilter === 'below-minimum') {
              return perf.specStatus === 'Below Minimum' || rig.group === 'below-minimum';
            }
            if (rigFilter === 'catalog') {
              return Boolean(rig.catalogItemId);
            }
            if (rigFilter === 'portable') {
              return (
                rig.categoryLabel.includes('Laptop') ||
                rig.categoryLabel.includes('Handheld') ||
                rig.categoryLabel.includes('iGPU')
              );
            }
            return true;
          }).map((rig) => {
            const perf = computeGameOnHardwarePerformance(
              item,
              rig,
              selectedRes,
              selectedPreset,
              rtEnabled,
              upscaling
            );
            const isBelowMin = perf.specStatus === 'Below Minimum';
            const barPct = Math.min(100, Math.round((perf.avgFps / 180) * 100));

            return (
              <div
                key={rig.id}
                data-testid={`hardware-matrix-row-${rig.id}`}
                className={`p-4 sm:p-5 transition-colors ${
                  isBelowMin
                    ? 'bg-amber-50/45 hover:bg-amber-50/75'
                    : 'hover:bg-white/60'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Col 1-5: Rig Identity, Architecture & Spec Status */}
                  <div className="lg:col-span-5 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span
                        className={
                          isBelowMin
                            ? 'text-[#B45309] font-bold inline-flex items-center gap-1'
                            : perf.specStatus === 'Exceeds Recommended'
                            ? 'text-[#584CE8] font-bold'
                            : perf.specStatus === 'Meets Recommended'
                            ? 'text-[#266D75] font-bold'
                            : 'text-[#515E7B] font-semibold'
                        }
                      >
                        {isBelowMin && <AlertTriangle className="w-3 h-3 shrink-0" />}
                        {perf.specStatus.toUpperCase()}
                      </span>
                      <span aria-hidden="true" className="text-[#515E7B]">
                        ·
                      </span>
                      <span className="text-[#515E7B] font-medium">
                        {rig.categoryLabel}
                      </span>
                      <span aria-hidden="true" className="text-[#515E7B]">
                        ·
                      </span>
                      <span className="text-[#312A75] font-bold tabular-nums">
                        {rig.vramGB} GB VRAM
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display text-sm sm:text-base font-extrabold text-[#312A75]">
                        {rig.name}
                      </h4>
                      {rig.catalogItemId && onSelectCatalogItem && (
                        <button
                          type="button"
                          onClick={() => onSelectCatalogItem(rig.catalogItemId!)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#584CE8] hover:text-[#2E276C] underline underline-offset-4 cursor-pointer"
                        >
                          <span>Inspect Hardware</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#4A5578] font-mono font-medium">
                      {rig.architectureNote} · {formatINR(rig.priceINR)}
                    </p>

                    {perf.belowMinimumReasons.length > 0 && (
                      <div className="pt-1 space-y-0.5">
                        {perf.belowMinimumReasons.map((reason) => (
                          <p
                            key={reason}
                            className="text-[11px] text-[#B45309] font-mono font-semibold"
                          >
                            ! {reason}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Col 6-9: Multi-Resolution FPS & Telemetry Bar */}
                  <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="text-[#4A5578] font-medium">
                        {selectedRes} {selectedPreset}:{' '}
                        <strong className="text-[#312A75] text-sm font-extrabold">
                          {perf.avgFps} FPS
                        </strong>
                      </span>
                      <span className="text-[#584CE8] font-bold">
                        1% Low: {perf.onePercentLowFps} FPS
                      </span>
                      <span className="text-[#266D75] font-bold">
                        {perf.frameTimeMs} ms
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-white/85 rounded-full overflow-hidden border border-[#584CE8]/20">
                      <div
                        className={`h-full rounded-full transition-all duration-200 ${
                          perf.avgFps >= 60
                            ? 'bg-[#584CE8]'
                            : perf.avgFps >= 30
                            ? 'bg-[#266D75]'
                            : 'bg-[#D97706]'
                        }`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-black/[0.08] border border-black/[0.08] rounded-xl bg-white/75 p-1.5 text-center font-mono text-[10px] tabular-nums">
                      {(['1080p', '1440p', '4K'] as const).map((rKey) => {
                        const rFps = perf.resolutionFps[rKey];
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
                  </div>

                  {/* Col 10-12: Playability Verdict, VRAM Check & Low-Spec Survival Ceiling */}
                  <div className="lg:col-span-3 nexus-editorial-well p-3.5 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#515E7B] font-semibold">PLAYABILITY:</span>
                      <span
                        className={`font-bold ${
                          perf.avgFps >= 60
                            ? 'text-[#584CE8]'
                            : perf.avgFps >= 30
                            ? 'text-[#266D75]'
                            : 'text-[#B45309]'
                        }`}
                      >
                        {perf.playabilityTier}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
                      <span className="text-[#515E7B] font-semibold">VRAM DRAW:</span>
                      <span
                        className={
                          perf.vramBottlenecked
                            ? 'text-[#B45309] font-bold'
                            : 'text-[#312A75] font-bold'
                        }
                      >
                        {perf.estimatedVramGB} / {perf.rigVramGB} GB
                        {perf.vramBottlenecked ? ' (OVERFLOW)' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] tabular-nums pt-1 border-t border-[#2E276C]/10">
                      <span className="text-[#515E7B] font-semibold">
                        1080p LOW SURVIVAL:
                      </span>
                      <span className="text-[#266D75] font-extrabold">
                        {perf.lowSpecSurvivalFps1080p} FPS
                      </span>
                    </div>

                    <p className="text-[11px] text-[#4A5578] leading-snug pt-1 font-medium">
                      {perf.survivalTuningTip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Verdict */}
      <section className="py-2">
        <div className="nexus-editorial-panel rounded-3xl !border-[#584CE8]/45 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-[#266D75] tracking-[0.16em]">
                16. NEXUS LAB VERDICT
              </span>
              <h3 className="font-display text-xl font-extrabold text-[#312A75] mt-1">
                Final Performance & Editorial Verdict
              </h3>
            </div>
            <div className="font-mono text-2xl font-extrabold text-[#584CE8] tabular-nums">
              {item.overallScore.toFixed(1)} / 10
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#4A5578] leading-relaxed max-w-4xl font-medium">
            {details.verdict}
          </p>

          <div className="mt-6 pt-6 border-t border-[#2E276C]/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="font-mono text-[#266D75] font-bold mb-2">
                STRENGTHS
              </div>
              <ul className="space-y-1.5 text-[#4A5578] font-medium">
                {details.pros.map((pro) => (
                  <li key={pro}>+ {pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[#584CE8] font-bold mb-2">
                LIMITATIONS
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
    </div>
  );
};
