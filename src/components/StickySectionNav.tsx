import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUp,
  BarChart3,
  BookOpen,
  Cpu,
  FileText,
  HelpCircle,
  Layers,
  Search,
} from 'lucide-react';

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
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Active Scroll Spy: track scroll position and visible sections
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 40);
        setShowScrollTop(scrollY > 450);

        // Calculate visible section based on scroll offset
        const headerOffset = 150;
        let currentActive = SECTION_NAV_ITEMS[0].id;

        for (let i = 0; i < SECTION_NAV_ITEMS.length; i++) {
          const item = SECTION_NAV_ITEMS[i];
          const el = document.getElementById(item.targetId);
          if (el) {
            const rect = el.getBoundingClientRect();
            // If top of element is near or above header offset
            if (rect.top <= headerOffset + 80) {
              currentActive = item.id;
            }
          }
        }

        // Special case: if scrolled near the bottom, activate footer
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
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasOpenDetailView]);

  const handleScrollToTarget = (targetId: string, id: string) => {
    setActiveSectionId(id);

    if (onNavigateToSection) {
      onNavigateToSection(targetId);
    }

    // Smooth programmatic scroll with calibrated sticky header compensation
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        const yOffset = -132;
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
      aria-label="In-Page Section Quick Navigation"
      className="sticky top-[64px] sm:top-[70px] z-25 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-200"
    >
      <div className="max-w-[1360px] mx-auto pointer-events-auto">
        <div
          className={`rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 px-3 py-2 sm:px-4 sm:py-2.5 ${
            isScrolled
              ? 'bg-white/85 backdrop-blur-xl border border-white/90 shadow-md shadow-[#2E276C]/8'
              : 'bg-white/65 backdrop-blur-md border border-white/70 shadow-xs'
          }`}
        >
          {/* Left: Section Navigation Links (Horizontal scroll on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="hidden xl:inline-flex items-center gap-1.5 pr-2 border-r border-[#2E276C]/10 text-[10px] font-mono font-bold tracking-wider text-[#266D75] uppercase whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#584CE8] animate-pulse" />
              <span>NAVIGATE PAGE</span>
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
                  className={`group relative inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-mono text-xs transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#584CE8] text-white font-bold shadow-xs'
                      : 'text-[#4A5578] hover:text-[#2E276C] hover:bg-white/70 font-semibold'
                  }`}
                >
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      isActive ? 'text-indigo-200' : 'text-[#266D75]'
                    }`}
                  >
                    {item.index}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? 'text-white'
                        : 'text-[#584CE8] group-hover:scale-105 transition-transform'
                    }`}
                  />
                  <span className="hidden sm:inline font-sans">
                    {item.label}
                  </span>
                  <span className="sm:hidden font-sans">
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Active Section Indicator & Quick Jump to Top */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active section reading badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2E276C]/6 border border-[#2E276C]/10 text-[11px] font-mono">
              <span className="text-[#515E7B]">VIEWING:</span>
              <span className="font-bold text-[#584CE8] truncate max-w-[120px]">
                {activeLabel}
              </span>
            </div>

            {/* Quick search shortcut trigger */}
            {onOpenSearch && (
              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="Quick Search"
                title="Search Catalog (⌘K)"
                className="hidden lg:inline-flex items-center gap-1 p-1.5 rounded-full nexus-editorial-control text-[#4A5578] hover:text-[#584CE8] cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick Jump to Top Button */}
            {showScrollTop && (
              <button
                type="button"
                onClick={handleScrollToTop}
                aria-label="Scroll back to top of page"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#312A75] hover:bg-[#584CE8] text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer animate-in fade-in zoom-in-95 duration-150"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Top</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
