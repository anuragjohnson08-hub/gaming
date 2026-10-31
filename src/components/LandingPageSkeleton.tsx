import React from 'react';

/**
 * LandingPageSkeleton
 * A pixel-precise 1:1 structural wireframe skeleton of the NEXUS landing page.
 * Uses pulsating dark slate frosted glass surfaces with subtle luminous cyan and
 * violet shimmer sweeps while initial telemetry datasets & 3D models initialize.
 */
export const LandingPageSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      data-testid="landing-page-skeleton"
      className="nexus-skeleton-container w-full min-h-screen relative z-20 pointer-events-none select-none transition-opacity duration-400 ease-out"
    >
      {/* 1. Thin Announcement Bar Skeleton */}
      <div className="w-full h-8 px-3 sm:px-8 py-1.5 flex items-center justify-between border-b border-white/10 bg-[#1c2024]/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 rounded-full bg-white/10 animate-pulse" />
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-24 h-4 rounded-full bg-[#6357F2]/40 animate-pulse" />
            <div className="w-24 h-4 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
        <div className="hidden md:block w-72 h-3 rounded-full bg-white/10 animate-pulse mx-auto" />
        <div className="flex items-center gap-1.5">
          <div className="w-28 h-3.5 rounded-full bg-[#38BDF8]/20 animate-pulse" />
        </div>
      </div>

      {/* 2. Floating Frosted Glass Navigation Capsule Skeleton */}
      <header className="sticky top-2 z-30 px-3 sm:px-6 lg:px-8 mt-2">
        <div className="nexus-editorial-nav max-w-[1360px] mx-auto rounded-3xl py-3 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left Nav items */}
          <div className="hidden lg:flex items-center gap-6 flex-1">
            {['Home', 'Games', 'Hardware', 'Benchmarks', 'Reviews'].map((item, i) => (
              <div
                key={item}
                className="w-16 h-4 rounded-full bg-white/15 animate-pulse"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>

          {/* Center NEXUS Brand Logo */}
          <div className="flex items-center justify-center gap-2.5 mx-auto lg:mx-0">
            <div className="w-6 h-6 rounded-lg bg-[#6357F2]/60 animate-pulse" />
            <div className="w-20 h-5 rounded-md bg-white/20 animate-pulse" />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center justify-end gap-2 flex-1">
            <div className="w-36 h-8 rounded-full bg-white/10 border border-white/10 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 animate-pulse" />
          </div>
        </div>
      </header>

      {/* 2.5. Sticky Section Quick Nav Bar Skeleton */}
      <div className="sticky top-[64px] sm:top-[70px] z-25 px-3 sm:px-6 lg:px-8 mt-2.5">
        <div className="max-w-[1360px] mx-auto rounded-2xl px-4 py-2.5 bg-[#212529]/80 border border-white/10 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-24 h-4 rounded-full bg-[#38BDF8]/20 animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-20 h-6 rounded-full bg-white/10 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
          <div className="w-28 h-6 rounded-full bg-white/10 animate-pulse shrink-0" />
        </div>
      </div>

      {/* 3. Hero Section Skeleton */}
      <section className="px-3 sm:px-6 lg:px-8 pt-4 pb-6">
        <div className="nexus-editorial-panel max-w-[1360px] mx-auto rounded-3xl p-6 sm:p-8 lg:p-9 relative overflow-hidden min-h-[300px]">
          {/* Continuous Luminous Shimmer Sweep */}
          <div className="nexus-skeleton-shimmer absolute inset-0" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-24 h-3.5 rounded-full bg-[#38BDF8]/30 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-white/20" />
              <div className="w-36 h-3.5 rounded-full bg-white/15 animate-pulse" />
            </div>

            <div className="space-y-2.5">
              <div className="w-full max-w-xl h-10 rounded-xl bg-white/20 animate-pulse" />
              <div className="w-3/4 h-9 rounded-xl bg-white/15 animate-pulse" />
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3.5 rounded bg-white/10 animate-pulse" />
              <div className="w-5/6 h-3.5 rounded bg-white/10 animate-pulse" />
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-3">
              <div className="w-40 h-11 rounded-full bg-[#6357F2]/50 animate-pulse shadow-md shadow-[#6357F2]/20" />
              <div className="w-44 h-11 rounded-full bg-white/10 border border-white/10 animate-pulse" />
            </div>

            {/* Performance Stat Tickers in Frosted Well */}
            <div className="nexus-editorial-well mt-6 p-4 rounded-2xl grid grid-cols-3 gap-4 max-w-lg">
              {[1, 2, 3].map((s) => (
                <div key={s} className="space-y-1.5">
                  <div className="w-12 h-6 rounded bg-white/20 animate-pulse" />
                  <div className="w-20 h-3 rounded bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Filter Toolbar Skeleton */}
      <div className="px-3 sm:px-6 lg:px-8 mb-5">
        <div className="max-w-[1360px] mx-auto rounded-2xl p-3 bg-[#262B30]/80 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[1, 2, 3, 4, 5].map((f) => (
              <div
                key={f}
                className="w-28 h-8 rounded-full bg-white/10 border border-white/5 animate-pulse shrink-0"
                style={{ animationDelay: `${f * 60}ms` }}
              />
            ))}
          </div>
          <div className="w-36 h-8 rounded-full bg-white/10 border border-white/5 animate-pulse shrink-0" />
        </div>
      </div>

      {/* 5. Four-Column Catalog Cards Grid Skeleton */}
      <section className="px-3 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-[1360px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((cardIdx) => (
            <div
              key={cardIdx}
              className="nexus-editorial-card rounded-3xl p-4 flex flex-col justify-between space-y-3.5 relative overflow-hidden"
            >
              {/* Shimmer sweep effect */}
              <div
                className="nexus-skeleton-shimmer absolute inset-0"
                style={{ animationDelay: `${cardIdx * 110}ms` }}
              />

              {/* 4:3 Aspect Image Skeleton Area */}
              <div className="relative aspect-[4/3] w-full rounded-2xl bg-black/40 border border-white/10 animate-pulse overflow-hidden">
                <div className="absolute top-2.5 left-2.5 w-20 h-4 rounded-full bg-black/50 border border-white/10" />
                <div className="absolute bottom-2.5 right-2.5 w-14 h-4 rounded-full bg-black/50 border border-white/10" />
              </div>

              {/* Inner Frosted Sheet */}
              <div className="nexus-editorial-well rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-24 h-3.5 rounded-full bg-[#A78BFA]/30 animate-pulse" />
                  <div className="w-16 h-3.5 rounded-full bg-[#38BDF8]/30 animate-pulse" />
                </div>
                <div className="w-4/5 h-4 rounded-md bg-white/20 animate-pulse" />
                <div className="space-y-1 pt-0.5">
                  <div className="w-full h-3 rounded bg-white/10 animate-pulse" />
                  <div className="w-3/4 h-3 rounded bg-white/10 animate-pulse" />
                </div>

                {/* 3-Resolution Metric Bars Skeleton */}
                <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-1.5 text-center">
                  {['1080p', '1440p', '4K'].map((res) => (
                    <div key={res} className="p-1 rounded bg-black/30 border border-white/5 space-y-1">
                      <div className="w-8 h-2 rounded bg-white/10 mx-auto" />
                      <div className="w-10 h-3 rounded bg-white/25 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action Button */}
              <div className="w-full h-10 rounded-xl bg-[#6357F2]/30 border border-[#6357F2]/40 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

