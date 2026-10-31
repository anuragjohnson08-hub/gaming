import React from 'react';
import { ArrowRight, GitCompare } from 'lucide-react';

interface HeroSectionProps {
  gamesCount: number;
  hardwareCount: number;
  benchmarksCount: number;
  onExploreReviews: () => void;
  onCompareHardware: () => void;
  onInspectFeaturedGpu?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  gamesCount,
  hardwareCount,
  benchmarksCount,
  onExploreReviews,
  onCompareHardware,
}) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[280px] lg:min-h-[300px]">
          {/* Editorial Lead */}
          <div className="lg:col-span-12 p-6 sm:p-8 lg:px-9 lg:py-8 flex flex-col justify-between z-10">
            <div>
              {/* 1. Small eyebrow label */}
              <div className="nexus-anim-hero-eyebrow flex items-center gap-2.5 text-[11px] font-mono font-semibold tracking-[0.18em] text-[#38BDF8] mb-2.5">
                <span>ISSUE 2026.4</span>
                <span aria-hidden="true" className="text-white/30">/</span>
                <span>NEXUS PERFORMANCE LAB</span>
              </div>

              {/* 2. Main headline (Crisp white matching dark theme) */}
              <h1 className="nexus-anim-hero-headline font-display text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight text-[#FFFFFF] leading-[1.12] max-w-2xl">
                Know What Your Hardware Can Handle.
              </h1>

              {/* 3. Description */}
              <p className="nexus-anim-hero-desc mt-3 text-sm sm:text-[15px] text-[#94A3B8] leading-relaxed max-w-2xl font-medium">
                Independent game technical analyses, 1% low frame-time telemetry,
                and verified Indian retail price-to-performance benchmarks before
                you play or upgrade.
              </p>

              {/* 4 & 5. Primary & Secondary CTAs */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreReviews}
                  className="nexus-anim-hero-cta-primary nexus-hover-shake nexus-dock-circle-active inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-[#6357F2]/40"
                >
                  <span>Explore Reviews</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onCompareHardware}
                  className="nexus-anim-hero-cta-secondary nexus-editorial-control nexus-hover-shake inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[#F1F5F9] font-semibold text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  <GitCompare className="w-4 h-4 text-[#C4B5FD]" />
                  <span>Compare Hardware</span>
                </button>
              </div>
            </div>

            {/* 6. Performance statistics ledger inside frosted inner sheet */}
            <div className="nexus-editorial-well mt-6 p-4 rounded-2xl grid grid-cols-3 gap-4 max-w-lg">
              <div className="nexus-anim-hero-stat">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#FFFFFF] tabular-nums">
                    {gamesCount}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#C4B5FD]">
                    DEMO SET
                  </span>
                </div>
                <p className="text-xs font-medium text-[#94A3B8]">Games Reviewed</p>
              </div>

              <div className="nexus-anim-hero-stat border-l border-white/10 pl-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#FFFFFF] tabular-nums">
                    {hardwareCount}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#38BDF8]">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs font-medium text-[#94A3B8]">Hardware Tested</p>
              </div>

              <div className="nexus-anim-hero-stat border-l border-white/10 pl-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-lg sm:text-xl font-extrabold text-[#A78BFA] tabular-nums">
                    {benchmarksCount}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#94A3B8]">
                    1080P–4K
                  </span>
                </div>
                <p className="text-xs font-medium text-[#94A3B8]">Lab Benchmarks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

