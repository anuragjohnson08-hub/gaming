import React, { useState } from 'react';
import { ArrowRight, GitCompare, SlidersHorizontal } from 'lucide-react';
import { ResolutionKey } from '../types/nexus';
import { InteractiveGpu3D } from './InteractiveGpu3D';

interface HeroSectionProps {
  gamesCount: number;
  hardwareCount: number;
  benchmarksCount: number;
  onExploreReviews: () => void;
  onCompareHardware: () => void;
  onInspectFeaturedGpu: () => void;
}

const HERO_TELEMETRY: Record<
  ResolutionKey,
  { avgFps: number; onePercentLow: number; frameTimeMs: string; vramGb: string }
> = {
  '1080p': { avgFps: 164, onePercentLow: 139, frameTimeMs: '6.1 ms', vramGb: '8.4 GB' },
  '1440p': { avgFps: 118, onePercentLow: 99, frameTimeMs: '8.5 ms', vramGb: '10.2 GB' },
  '4K': { avgFps: 68, onePercentLow: 56, frameTimeMs: '14.7 ms', vramGb: '11.8 GB' },
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  gamesCount,
  hardwareCount,
  benchmarksCount,
  onExploreReviews,
  onCompareHardware,
  onInspectFeaturedGpu,
}) => {
  const [heroRes, setHeroRes] = useState<ResolutionKey>('1440p');
  const activeStats = HERO_TELEMETRY[heroRes];

  return (
    <section
      id="nexus-hero-section"
      aria-label="Featured Performance Overview"
      className="scroll-mt-36 px-3 sm:px-6 lg:px-8 pt-4 pb-6"
    >
      <div className="nexus-editorial-panel max-w-[1360px] mx-auto rounded-3xl relative overflow-hidden">
        {/* Decorative 3D Pastel Shapes inside Hero Glass Panel for authentic refraction */}
        <svg
          viewBox="0 0 600 360"
          fill="none"
          aria-hidden="true"
          className="nexus-anim-hero-rimlight absolute right-0 top-0 h-full w-[58%] pointer-events-none opacity-85"
        >
          <defs>
            <radialGradient id="hero-orb-aqua" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#B8EFF4" />
              <stop offset="100%" stopColor="#94D5E8" />
            </radialGradient>
            <linearGradient id="hero-cube-lav" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F5F3FF" />
              <stop offset="50%" stopColor="#D3CDFA" />
              <stop offset="100%" stopColor="#A99FEF" />
            </linearGradient>
          </defs>
          <circle cx="460" cy="88" r="64" fill="url(#hero-orb-aqua)" opacity="0.65" />
          <g transform="translate(160, 240) rotate(-16)">
            <rect
              x="-52"
              y="-52"
              width="104"
              height="104"
              rx="22"
              fill="url(#hero-cube-lav)"
              opacity="0.65"
            />
          </g>
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[340px] lg:min-h-[380px]">
          {/* Left Column: Editorial Lead */}
          <div className="lg:col-span-6 p-6 sm:p-8 lg:px-9 lg:py-8 flex flex-col justify-between z-10">
            <div>
              {/* 1. Small eyebrow label */}
              <div className="nexus-anim-hero-eyebrow flex items-center gap-2.5 text-[11px] font-mono font-semibold tracking-[0.18em] text-[#266D75] mb-2.5">
                <span>ISSUE 2026.4</span>
                <span aria-hidden="true" className="text-[#2E276C]/30">/</span>
                <span>NEXUS PERFORMANCE LAB</span>
              </div>

              {/* 2. Main headline (Deep Indigo matching "Make It Pop!" in reference) */}
              <h1 className="nexus-anim-hero-headline font-display text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight text-[#312A75] leading-[1.12] max-w-xl">
                Know What Your Hardware Can Handle.
              </h1>

              {/* 3. Description */}
              <p className="nexus-anim-hero-desc mt-3 text-sm sm:text-[15px] text-[#4A5578] leading-relaxed max-w-xl font-medium">
                Independent game technical analyses, 1% low frame-time telemetry,
                and verified Indian retail price-to-performance benchmarks before
                you play or upgrade.
              </p>

              {/* 4 & 5. Primary & Secondary CTAs */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreReviews}
                  className="nexus-anim-hero-cta-primary nexus-hover-shake nexus-dock-circle-active inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Explore Reviews</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onCompareHardware}
                  className="nexus-anim-hero-cta-secondary nexus-editorial-control nexus-hover-shake inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[#2E276C] font-semibold text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  <GitCompare className="w-4 h-4 text-[#584CE8]" />
                  <span>Compare Hardware</span>
                </button>
              </div>
            </div>

            {/* 6. Performance statistics ledger inside frosted inner sheet */}
            <div className="nexus-editorial-well mt-6 p-4 rounded-2xl grid grid-cols-3 gap-4 max-w-lg">
              <div className="nexus-anim-hero-stat">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#312A75] tabular-nums">
                    {gamesCount}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#584CE8]">
                    DEMO SET
                  </span>
                </div>
                <p className="text-xs font-medium text-[#515E7B]">Games Reviewed</p>
              </div>

              <div className="nexus-anim-hero-stat border-l border-[#2E276C]/12 pl-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#312A75] tabular-nums">
                    {hardwareCount}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#266D75]">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs font-medium text-[#515E7B]">Hardware Tested</p>
              </div>

              <div className="nexus-anim-hero-stat border-l border-[#2E276C]/12 pl-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#584CE8] tabular-nums">
                    {benchmarksCount}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#515E7B]">
                    1080P–4K
                  </span>
                </div>
                <p className="text-xs font-medium text-[#515E7B]">Lab Benchmarks</p>
              </div>
            </div>
          </div>

          {/* Right Column: Translucent Glass Lab Bench Telemetry Instrument */}
          <div className="lg:col-span-6 relative p-4 sm:p-5 lg:p-6 flex flex-col justify-center bg-white/35 border-t lg:border-t-0 lg:border-l border-white/80 overflow-hidden has-[[data-gpu-fullscreen=true]]:overflow-visible has-[[data-gpu-fullscreen=true]]:z-[9999]">
            {/* Subtle pastel millimeter grid */}
            <div
              className="nexus-anim-ambient absolute inset-0 opacity-45 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(88,76,232,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(88,76,232,0.06) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="nexus-anim-hero-hardware relative z-10 has-[[data-gpu-fullscreen=true]]:z-[9999]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-semibold text-[#266D75] truncate">
                  ROG ASTRAL RTX 5090 32GB GDDR7 BTF OC · 3.8-SLOT
                </span>
                <button
                  type="button"
                  onClick={onInspectFeaturedGpu}
                  className="text-[11px] font-mono font-bold text-[#584CE8] hover:text-[#2E276C] underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Inspect Full Review →
                </button>
              </div>

              {/* Studio Hardware Frosted Glass Card with Interactive 3D GPU Model */}
              <div
                onClick={onInspectFeaturedGpu}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onInspectFeaturedGpu();
                  }
                }}
                aria-label="Inspect GeForce RTX 5070 12GB Performance Review"
                className="nexus-editorial-card group relative rounded-2xl p-3 sm:p-3.5 cursor-pointer overflow-hidden has-[[data-gpu-fullscreen=true]]:overflow-visible has-[[data-gpu-fullscreen=true]]:z-[9999]"
              >
                <InteractiveGpu3D onInspectFullReview={onInspectFeaturedGpu} />

                {/* Benchmark Telemetry Bar */}
                <div className="nexus-anim-hero-telemetry">
                  <div
                    className="mt-2.5 pt-2.5 border-t border-[#2E276C]/10 flex flex-wrap items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#584CE8]" />
                      <span className="text-[11px] font-mono font-semibold text-[#4A5578]">
                        PRESET: ULTRA · RYZEN 7 9800X3D
                      </span>
                    </div>

                    <div
                      role="group"
                      aria-label="Hero Benchmark Resolution"
                      className="nexus-editorial-well inline-flex items-center rounded-full p-0.5"
                    >
                      {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setHeroRes(res)}
                          className={`px-2.5 py-0.5 text-[11px] font-mono rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            heroRes === res
                              ? 'bg-[#584CE8] text-white font-bold shadow-xs'
                              : 'text-[#515E7B] hover:text-[#2E276C]'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="nexus-glass-dock mt-2.5 grid grid-cols-3 divide-x divide-[#2E276C]/10 rounded-xl py-2 px-1">
                    <div className="px-2.5">
                      <span className="block text-[10px] font-mono font-semibold text-[#515E7B]">
                        AVG FPS ({heroRes})
                      </span>
                      <span className="font-mono text-base sm:text-lg font-extrabold text-[#312A75] tabular-nums">
                        {activeStats.avgFps} FPS
                      </span>
                    </div>
                    <div className="px-2.5">
                      <span className="block text-[10px] font-mono font-semibold text-[#515E7B]">
                        1% LOW FPS
                      </span>
                      <span className="font-mono text-base sm:text-lg font-extrabold text-[#584CE8] tabular-nums">
                        {activeStats.onePercentLow} FPS
                      </span>
                    </div>
                    <div className="px-2.5">
                      <span className="block text-[10px] font-mono font-semibold text-[#515E7B]">
                        FRAME TIME
                      </span>
                      <span className="font-mono text-base sm:text-lg font-extrabold text-[#266D75] tabular-nums">
                        {activeStats.frameTimeMs}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
