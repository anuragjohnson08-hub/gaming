import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  Cpu,
  FileText,
  HelpCircle,
  Search,
} from 'lucide-react';
import { motion } from 'motion/react';

export interface SectionNavItem {
  id: string;
  targetId: string;
  index: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  {
    id: 'hero',
    targetId: 'nexus-hero-section',
    index: '01',
    label: '3D GPU Lab',
    shortLabel: 'GPU Lab',
    icon: Cpu,
  },
  {
    id: 'catalog',
    targetId: 'nexus-catalog-section',
    index: '02',
    label: 'Review Catalog',
    shortLabel: 'Catalog',
    icon: BookOpen,
  },
  {
    id: 'benchmarks',
    targetId: 'nexus-benchmark-section',
    index: '03',
    label: 'Benchmark Matrix',
    shortLabel: 'Benchmarks',
    icon: BarChart3,
  },
  {
    id: 'faq',
    targetId: 'nexus-faq-section',
    index: '04',
    label: 'Methodology FAQ',
    shortLabel: 'FAQ',
    icon: HelpCircle,
  },
  {
    id: 'footer',
    targetId: 'nexus-footer-section',
    index: '05',
    label: 'Lab Disclosure',
    shortLabel: 'Disclosure',
    icon: FileText,
  },
];

interface StickySectionNavProps {
  onNavigateToSection?: (targetId: string) => void;
  onOpenSearch?: () => void;
  hasOpenDetailView?: boolean;
}

export const StickySectionNav: React.FC<StickySectionNavProps> = ({
  onNavigateToSection,
  onOpenSearch,
  hasOpenDetailView = false,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('hero');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [isDynamicIsland, setIsDynamicIsland] = useState<boolean>(false);
  const navSlotRef = useRef<HTMLElement | null>(null);
  const initialTopRef = useRef<number>(115);

  useEffect(() => {
    if (navSlotRef.current) {
      const rect = navSlotRef.current.getBoundingClientRect();
      const topDoc = rect.top + window.scrollY;
      if (topDoc > 0) {
        initialTopRef.current = topDoc;
      }
    }
  }, []);

  // Active Scroll Spy & Dynamic Island threshold detection
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const triggerThreshold = Math.max(88, initialTopRef.current - 12);

        setIsDynamicIsland(scrollY > triggerThreshold);
        setShowScrollTop(scrollY > 420);

        const headerOffset = 140;
        let currentActive = SECTION_NAV_ITEMS[0].id;

        for (let i = 0; i < SECTION_NAV_ITEMS.length; i++) {
          const item = SECTION_NAV_ITEMS[i];
          const el = document.getElementById(item.targetId);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= headerOffset + 80) {
              currentActive = item.id;
            }
          }
        }

        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 160
        ) {
          currentActive = 'footer';
        }

        setActiveSectionId(currentActive);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasOpenDetailView]);

  const handleScrollToTarget = (targetId: string, id: string) => {
    setActiveSectionId(id);

    if (onNavigateToSection) {
      onNavigateToSection(targetId);
    }

    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        const yOffset = -96;
        const y =
          el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 50);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSectionId('hero');
  };

  const activeLabel = useMemo(() => {
    return (
      SECTION_NAV_ITEMS.find((item) => item.id === activeSectionId)?.label ||
      'Overview'
    );
  }, [activeSectionId]);

  return (
    <nav
      ref={navSlotRef}
      aria-label="In-Page Section Quick Navigation"
      className="relative z-40 px-3 sm:px-6 lg:px-8 min-h-[52px]"
    >
      <div
        className={
          isDynamicIsland
            ? 'fixed top-3 inset-x-0 z-50 flex justify-center px-3 pointer-events-none'
            : 'max-w-[1360px] mx-auto pointer-events-auto'
        }
      >
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 32,
            mass: 0.8,
          }}
          className={
            isDynamicIsland
              ? 'pointer-events-auto rounded-full bg-[#090B10]/94 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_28px_rgba(99,87,242,0.32),0_1px_0_rgba(255,255,255,0.18)_inset] flex items-center justify-between gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 max-w-[96vw] w-auto'
              : 'pointer-events-auto rounded-2xl bg-[#212529]/80 backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5 w-full'
          }
        >
          {/* Left: Dynamic Island Sensor Pill + Section Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span
              className={`inline-flex items-center gap-1.5 pr-2 border-r border-white/15 text-[10px] font-mono font-bold tracking-wider uppercase whitespace-nowrap ${
                isDynamicIsland
                  ? 'text-[#38BDF8]'
                  : 'hidden xl:inline-flex text-[#38BDF8]'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6357F2] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]" />
              </span>
              <span className={isDynamicIsland ? 'hidden sm:inline' : ''}>
                {isDynamicIsland ? 'ISLAND' : 'NAVIGATE PAGE'}
              </span>
            </span>

            {SECTION_NAV_ITEMS.map((item) => {
              const isActive = activeSectionId === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleScrollToTarget(item.targetId, item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group relative inline-flex items-center gap-1.5 ${
                    isDynamicIsland ? 'px-2.5 py-1' : 'px-2.5 sm:px-3 py-1.5'
                  } rounded-full font-mono text-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/10 font-semibold'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dynamic-island-active-pill"
                      transition={{
                        type: 'spring',
                        stiffness: 440,
                        damping: 30,
                      }}
                      className="absolute inset-0 rounded-full bg-[#6357F2] shadow-md shadow-[#6357F2]/45 -z-10"
                    />
                  )}
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      isActive ? 'text-indigo-200' : 'text-[#38BDF8]'
                    }`}
                  >
                    {item.index}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-white'
                        : 'text-[#C4B5FD] group-hover:scale-105 transition-transform'
                    }`}
                  />
                  <span
                    className={
                      isDynamicIsland
                        ? 'hidden md:inline font-sans text-[11px]'
                        : 'hidden sm:inline font-sans'
                    }
                  >
                    {isDynamicIsland ? item.shortLabel : item.label}
                  </span>
                  <span
                    className={
                      isDynamicIsland
                        ? 'md:hidden font-sans text-[11px]'
                        : 'sm:hidden font-sans'
                    }
                  >
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Section Indicator & Quick Jump to Top */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className={`hidden ${
                isDynamicIsland ? 'lg:flex' : 'md:flex'
              } items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/12 text-[11px] font-mono`}
            >
              <span className="text-[#94A3B8]">VIEWING:</span>
              <span className="font-bold text-[#38BDF8] truncate max-w-[110px]">
                {activeLabel}
              </span>
            </div>

            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Quick Search"
                title="Search Catalog (⌘K)"
                className="hidden sm:inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[#E2E8F0] hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            {showScrollTop && (
              <button
                type="button"
                onClick={handleScrollToTop}
                aria-label="Scroll back to top of page"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#6357F2] hover:bg-[#4F46E5] text-white font-mono text-xs font-bold transition-all shadow-md shadow-[#6357F2]/40 cursor-pointer"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Top</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};
