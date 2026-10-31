import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  Cpu,
  GitCompare,
  Laptop,
  Menu,
  Monitor,
  Search,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CategoryType } from '../types/nexus';
import { NexusUser } from '../utils/authLogic';
import { useSafeTriangle } from '../utils/useSafeTriangle';

/**
 * 20. AMAZON SAFE TRIANGLE, 4. SHORTCUT HINTS, 13. HIT SLOP, 14. SAFE AREAS, 16. TABULAR NUMBERS
 */

export type NavTab = 'Home' | 'Games' | 'Hardware' | 'Benchmarks' | 'Reviews';

interface HeaderProps {
  activeNav: NavTab;
  onSelectNav: (nav: NavTab) => void;
  onOpenSearch: () => void;
  onOpenComparison: () => void;
  onOpenSaved: () => void;
  onOpenMethodology: () => void;
  onOpenAuth: () => void;
  currentUser: NexusUser | null;
  compareCount: number;
  savedCount: number;
  onQuickCategorySelect: (cat: CategoryType) => void;
}

export const NexusLogoMark: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <polygon
      points="16,2 28,9 28,23 16,30 4,23 4,9"
      stroke="#584CE8"
      strokeWidth="1.9"
      fill="rgba(88, 76, 232, 0.14)"
    />
    <path
      d="M10 21V11L22 21V11"
      stroke="#2E276C"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="2" r="2.2" fill="#266D75" />
    <circle cx="16" cy="30" r="2.2" fill="#266D75" />
  </svg>
);

const HARDWARE_CATEGORIES: { name: CategoryType; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Graphics Cards', icon: Cpu },
  { name: 'Processors', icon: Cpu },
  { name: 'Gaming Laptops', icon: Laptop },
  { name: 'Gaming Monitors', icon: Monitor },
];

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  onSelectNav,
  onOpenSearch,
  onOpenComparison,
  onOpenSaved,
  onOpenMethodology,
  onOpenAuth,
  currentUser,
  compareCount,
  savedCount,
  onQuickCategorySelect,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hardwareMenuOpen, setHardwareMenuOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);

  // 20. Amazon Safe Triangle Hook
  const { handlePointerLeave, handlePointerEnter } = useSafeTriangle(
    submenuRef,
    hardwareMenuOpen,
    () => setHardwareMenuOpen(false),
    260
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavTab[] = ['Home', 'Games', 'Hardware', 'Benchmarks', 'Reviews'];

  return (
    <header className="sticky top-2 z-30 px-3 sm:px-6 lg:px-8 nexus-safe-top">
      <div
        className={`nexus-anim-nav-capsule max-w-[1360px] mx-auto rounded-3xl transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? 'nexus-editorial-nav-scrolled py-2.5 px-4 sm:px-6'
            : 'nexus-editorial-nav py-3 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left Navigation (Desktop) with Safe Triangle Dropdown */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 flex-1 relative"
          >
            {navItems.map((item) => {
              const isActive = activeNav === item;
              const isHardware = item === 'Hardware';

              return (
                <div
                  key={item}
                  className="relative"
                  onPointerLeave={isHardware ? handlePointerLeave : undefined}
                >
                  <button
                    type="button"
                    onClick={() => onSelectNav(item)}
                    onPointerEnter={() => {
                      if (isHardware) {
                        handlePointerEnter();
                        setHardwareMenuOpen(true);
                      } else {
                        setHardwareMenuOpen(false);
                      }
                    }}
                    className={`nexus-anim-nav-link group/nav relative text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer py-1 inline-flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#584CE8] ${
                      isActive
                        ? 'text-[#2E276C]'
                        : 'text-[#515E7B] hover:text-[#2E276C]'
                    }`}
                  >
                    <span>{item}</span>
                    {isHardware && (
                      <ChevronDown className="w-3 h-3 text-[#515E7B] transition-transform group-hover/nav:translate-y-0.5" />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="nexus-active-nav-underline"
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#584CE8]"
                      />
                    )}
                  </button>

                  {/* 20. Amazon Safe Triangle Protected Submenu with Motion */}
                  <AnimatePresence>
                    {isHardware && hardwareMenuOpen && (
                      <motion.div
                        ref={submenuRef}
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        onPointerEnter={handlePointerEnter}
                        onPointerLeave={() => setHardwareMenuOpen(false)}
                        className="absolute top-full left-0 mt-2 w-56 nexus-editorial-modal rounded-2xl p-2 shadow-xl border border-white/90 bg-white/95 backdrop-blur-xl z-50"
                      >
                        <span className="text-[10px] font-mono font-bold text-[#266D75] px-3 py-1.5 block tracking-wider uppercase">
                          Lab Categories
                        </span>
                        {HARDWARE_CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => {
                                onQuickCategorySelect(cat.name);
                                setHardwareMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#312A75] hover:bg-[#584CE8]/12 hover:text-[#584CE8] transition-colors cursor-pointer"
                            >
                              <Icon className="w-3.5 h-3.5 text-[#584CE8]" />
                              <span>{cat.name}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Mobile Hamburger Trigger */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="nexus-hit-slop nexus-editorial-control p-2 rounded-full text-[#2E276C] hover:text-[#584CE8] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center Brand Identity */}
          <button
            type="button"
            onClick={() => onSelectNav('Home')}
            className="flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#584CE8] rounded-xl px-1 sm:px-2 py-0.5 shrink-0"
            aria-label="NEXUS Home"
          >
            <span className="nexus-anim-logo-symbol inline-flex">
              <NexusLogoMark className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-105" />
            </span>
            <span className="nexus-anim-logo-wordmark font-display text-base sm:text-xl font-extrabold tracking-[0.14em] sm:tracking-[0.18em] text-[#2E276C] whitespace-nowrap shrink-0">
              NEXUS
            </span>
          </button>

          {/* Right Controls */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-1">
            {/* Search / Command Menu Trigger with Keycap */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search games, hardware, and benchmarks (⌘K)"
              className="nexus-anim-nav-action nexus-editorial-control inline-flex items-center gap-2 p-2 xl:px-3.5 xl:py-1.5 rounded-full text-xs text-[#2E276C] hover:text-[#584CE8] transition-colors cursor-pointer whitespace-nowrap shrink-0 group"
            >
              <span className="w-5 h-5 rounded-full border border-[#1E3F49]/65 flex items-center justify-center text-[#1E3F49]">
                <Search className="w-3 h-3 stroke-[2.2]" />
              </span>
              <span className="hidden xl:inline font-medium text-[#4A5578]">
                Search catalog...
              </span>
              <kbd className="nexus-kbd hidden xl:inline-flex">⌘K</kbd>
            </button>

            {/* Compare Button */}
            <button
              type="button"
              onClick={onOpenComparison}
              aria-label={`Compare Hardware (${compareCount} selected)`}
              className={`nexus-hit-slop nexus-anim-nav-action relative p-2 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#584CE8] ${
                compareCount > 0 ? 'nexus-dock-circle-active' : 'nexus-dock-circle-idle'
              }`}
              title="Hardware Comparison Table"
            >
              <GitCompare className="w-4 h-4" />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#2E276C] text-white font-mono text-[10px] font-bold flex items-center justify-center tabular-nums border border-white">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Saved Items */}
            <button
              type="button"
              onClick={onOpenSaved}
              aria-label={`Saved Items (${savedCount} saved)`}
              className={`nexus-hit-slop nexus-anim-nav-action relative p-2 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#584CE8] ${
                savedCount > 0 ? 'nexus-dock-circle-active' : 'nexus-dock-circle-idle'
              }`}
              title="Saved Reviews & Hardware"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#266D75] text-white font-mono text-[10px] font-bold flex items-center justify-center tabular-nums border border-white">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Methodology */}
            <button
              type="button"
              onClick={onOpenMethodology}
              aria-label="Testbench Specifications and Methodology"
              className="nexus-hit-slop nexus-anim-nav-action nexus-dock-circle-idle hidden sm:inline-flex p-2 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#584CE8]"
              title="Lab Testbench & Methodology"
            >
              <Cpu className="w-4 h-4" />
            </button>

            {/* User Profile / Sign In Button */}
            <button
              type="button"
              onClick={onOpenAuth}
              data-testid="header-auth-button"
              aria-label={
                currentUser
                  ? `Account Profile (${currentUser.name})`
                  : 'Sign In or Sign Up'
              }
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign In / Sign Up'}
              className={`nexus-hit-slop nexus-anim-nav-action inline-flex items-center gap-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#584CE8] ${
                currentUser
                  ? 'pl-1.5 pr-3 py-1 nexus-dock-circle-active'
                  : 'nexus-dock-circle-idle p-2 md:px-3 md:py-1.5'
              }`}
            >
              {currentUser ? (
                <>
                  <span className="w-5 h-5 rounded-full bg-white text-[#584CE8] font-mono text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden md:inline text-xs font-semibold max-w-[90px] truncate text-white">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#584CE8]" />
                  <span className="hidden md:inline text-xs font-semibold text-[#2E276C]">
                    Sign In
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="nexus-panel-enter nexus-editorial-modal lg:hidden mt-2 rounded-2xl p-4 shadow-xl">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeNav === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    onSelectNav(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#584CE8] text-white shadow-sm'
                      : 'text-[#4A5578] hover:bg-white/60 hover:text-[#2E276C]'
                  }`}
                >
                  <span>{item}</span>
                  {isActive && (
                    <span className="text-[11px] font-mono text-white/90">ACTIVE</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
