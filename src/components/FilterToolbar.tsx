import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CategoryType,
  FilterState,
  GenreType,
  PerformanceTierType,
  PlatformType,
  PriceRangeType,
  SortOption,
} from '../types/nexus';
import { hasActiveFilters } from '../utils/catalogLogic';

interface FilterToolbarProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  resultsCount: number;
  intentBanner?: {
    summary: string | null;
    canCompare: boolean;
    onTriggerCompare?: () => void;
  };
}

interface AnimatedFilterDropdownProps<T extends string> {
  id: string;
  ariaLabel: string;
  prefixLabel: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

function AnimatedFilterDropdown<T extends string>({
  id,
  ariaLabel,
  prefixLabel,
  value,
  options,
  onChange,
}: AnimatedFilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isActive = value !== 'All';
  const triggerText = value === 'All' ? `${prefixLabel}: All` : value;

  return (
    <div ref={containerRef} className="relative inline-block">
      <motion.button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 440, damping: 24 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`nexus-filter-trigger-pill inline-flex items-center justify-between gap-2 text-xs rounded-full px-3.5 py-2 cursor-pointer font-semibold focus:outline-none focus:border-[#584CE8] ${
          isActive
            ? '!border-[#584CE8] !bg-[#584CE8]/15 !text-[#312A75] font-bold shadow-xs'
            : 'text-[#1E293B]'
        }`}
      >
        <span className="relative overflow-hidden inline-grid items-center min-h-[18px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={triggerText}
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.92 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative inline-grid items-center"
            >
              {/* Layer 1: Pops out upward on hover, pops back in on leave */}
              <motion.span
                animate={{
                  y: isHovered ? '-115%' : '0%',
                  scale: isHovered ? 0.9 : 1,
                  opacity: isHovered ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 460, damping: 28 }}
                className="nexus-filter-trigger-label col-start-1 row-start-1 inline-block whitespace-nowrap"
              >
                {triggerText}
              </motion.span>

              {/* Layer 2: Pops in from below with a spring scale boost on hover, pops out on leave */}
              <motion.span
                aria-hidden="true"
                animate={{
                  y: isHovered ? '0%' : '115%',
                  scale: isHovered ? 1.05 : 0.9,
                  opacity: isHovered ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 460, damping: 26 }}
                className="col-start-1 row-start-1 inline-block whitespace-nowrap text-[#584CE8] font-bold"
              >
                {triggerText}
              </motion.span>
            </motion.span>
          </AnimatePresence>
        </span>

        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isHovered ? 1.15 : 1,
          }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          className="inline-flex items-center justify-center shrink-0"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 ${
              isActive || isOpen || isHovered ? 'text-[#584CE8]' : 'text-slate-600'
            }`}
          />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            aria-label={`${ariaLabel} options`}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 440, damping: 30, mass: 0.7 }}
            style={{ transformOrigin: 'top left' }}
            className="absolute left-0 top-full mt-2 min-w-[220px] z-50 rounded-2xl p-1.5 bg-white/96 backdrop-blur-2xl border border-[#2E276C]/15 shadow-[0_22px_48px_-8px_rgba(30,41,59,0.28),0_0_0_1px_rgba(255,255,255,0.95)_inset] overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-[#2E276C]/10 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-[0.14em] text-[#266D75] uppercase">
                {prefixLabel} Filter
              </span>
              <span className="text-[10px] font-mono text-[#515E7B] tabular-nums">
                {options.length} options
              </span>
            </div>

            <div className="space-y-0.5">
              {options.map((opt, idx) => {
                const isSelected = opt === value;
                const optLabel = opt === 'All' ? `${prefixLabel}: All` : opt;
                return (
                  <motion.button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: 'spring',
                      stiffness: 460,
                      damping: 26,
                      delay: idx * 0.015,
                    }}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`group/opt w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#584CE8] text-white font-bold shadow-xs'
                        : 'text-[#1E293B] font-semibold hover:bg-[#584CE8]/12 hover:text-[#584CE8]'
                    }`}
                  >
                    <span className="truncate inline-block transition-transform duration-150 ease-out group-hover/opt:scale-[1.04] origin-left">
                      {optLabel}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CATEGORIES: CategoryType[] = [
  'All',
  'Games',
  'Graphics Cards',
  'Processors',
  'Gaming Laptops',
  'Gaming Monitors',
  'Gaming Peripherals',
];

const PLATFORMS: PlatformType[] = [
  'All',
  'PC',
  'PlayStation',
  'Xbox',
  'Nintendo Switch',
  'Mobile',
];

const GENRES: GenreType[] = [
  'All',
  'Action',
  'RPG',
  'FPS',
  'Racing',
  'Strategy',
  'Open World',
  'Simulation',
];

const PERFORMANCE_TIERS: PerformanceTierType[] = [
  'All',
  'Entry Level',
  'Mid-Range',
  'High-End',
  'Enthusiast',
];

const PRICE_RANGES: PriceRangeType[] = [
  'All',
  'Under INR 10,000',
  'INR 10,000 – 50,000',
  'INR 50,000 – 80,000',
  'Above INR 80,000',
];

const SORT_OPTIONS: SortOption[] = [
  'Featured',
  'Highest Rated',
  'Best Performance',
  'Most Reviewed',
  'Recently Released',
];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  resultsCount,
  intentBanner,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isFiltered = hasActiveFilters(filters);

  return (
    <section
      aria-label="Catalog Filters and Sorting"
      className="nexus-anim-filter-toolbar px-3 sm:px-6 lg:px-8 pb-5 relative z-20"
    >
      <div className="nexus-editorial-panel max-w-[1360px] mx-auto px-4 sm:px-6 py-3.5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Desktop Left Side: FILTER BY dropdowns */}
          <div className="hidden lg:flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-[0.14em] text-[#266D75] mr-1.5 whitespace-nowrap shrink-0">
              FILTER BY:
            </span>

            {/* Category */}
            <AnimatedFilterDropdown
              id="filter-category"
              ariaLabel="Filter by Category"
              prefixLabel="Category"
              value={filters.category}
              options={CATEGORIES}
              onChange={(val) => onUpdateFilter('category', val)}
            />

            {/* Platform */}
            <AnimatedFilterDropdown
              id="filter-platform"
              ariaLabel="Filter by Platform"
              prefixLabel="Platform"
              value={filters.platform}
              options={PLATFORMS}
              onChange={(val) => onUpdateFilter('platform', val)}
            />

            {/* Genre */}
            <AnimatedFilterDropdown
              id="filter-genre"
              ariaLabel="Filter by Genre"
              prefixLabel="Genre"
              value={filters.genre}
              options={GENRES}
              onChange={(val) => onUpdateFilter('genre', val)}
            />

            {/* Performance Tier */}
            <AnimatedFilterDropdown
              id="filter-tier"
              ariaLabel="Filter by Performance Tier"
              prefixLabel="Tier"
              value={filters.performanceTier}
              options={PERFORMANCE_TIERS}
              onChange={(val) => onUpdateFilter('performanceTier', val)}
            />

            {/* Price Range */}
            <AnimatedFilterDropdown
              id="filter-price"
              ariaLabel="Filter by Price"
              prefixLabel="Price"
              value={filters.priceRange}
              options={PRICE_RANGES}
              onChange={(val) => onUpdateFilter('priceRange', val)}
            />

            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#584CE8] hover:text-white bg-[#584CE8]/12 hover:bg-[#584CE8] border border-[#584CE8]/30 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Mobile / Tablet Filter Drawer Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen((prev) => !prev)}
              aria-expanded={mobileDrawerOpen}
              className="nexus-editorial-control inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2E276C] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#584CE8]" />
              <span>Filter Catalog</span>
              {isFiltered && (
                <span className="font-mono text-[10px] text-[#584CE8]">• ACTIVE</span>
              )}
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-2.5 py-2 rounded-xl text-xs font-semibold text-[#584CE8] hover:text-[#2E276C] border border-[#584CE8]/35 bg-white/50"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Side: RESULTS count + SORT BY */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-[11px] font-mono font-semibold tracking-[0.12em] text-[#515E7B] whitespace-nowrap shrink-0">
              RESULTS:{' '}
              <span
                data-testid="results-count"
                className="text-[#312A75] font-extrabold tabular-nums"
              >
                {resultsCount}
              </span>
            </div>

            <div className="h-4 w-[1px] bg-[#2E276C]/15 hidden sm:block" />

            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-by-select"
                className="hidden sm:inline text-[11px] font-mono font-semibold tracking-[0.14em] text-[#266D75] whitespace-nowrap shrink-0"
              >
                SORT BY:
              </label>
              <select
                id="sort-by-select"
                aria-label="Sort Results By"
                value={filters.sortBy}
                onChange={(e) =>
                  onUpdateFilter('sortBy', e.target.value as SortOption)
                }
                className="nexus-editorial-control text-xs font-semibold rounded-xl px-3 py-2 text-[#2E276C] focus:outline-none focus:border-[#584CE8] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-white text-[#2E276C]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Search Query / Natural Language Intent Banner */}
        {(filters.searchQuery.trim() !== '' || intentBanner?.summary) && (
          <div className="mt-3 pt-3 border-t border-[#2E276C]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-[#4A5578]">
              {filters.searchQuery.trim() !== '' && (
                <span>
                  Query:{' '}
                  <strong className="text-[#312A75] font-mono">
                    &ldquo;{filters.searchQuery}&rdquo;
                  </strong>
                </span>
              )}
              {intentBanner?.summary && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#584CE8] font-semibold">
                    {intentBanner.summary}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {intentBanner?.canCompare && intentBanner.onTriggerCompare && (
                <button
                  type="button"
                  onClick={intentBanner.onTriggerCompare}
                  className="px-3.5 py-1 rounded-full nexus-dock-circle-active font-semibold text-xs transition-colors cursor-pointer"
                >
                  Open Side-by-Side Comparison
                </button>
              )}
              <button
                type="button"
                onClick={() => onUpdateFilter('searchQuery', '')}
                className="inline-flex items-center gap-1 text-[#515E7B] hover:text-[#2E276C] font-medium cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Search</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Collapsible Filter Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#2E276C]/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <select
              aria-label="Mobile Filter by Category"
              value={filters.category}
              onChange={(e) =>
                onUpdateFilter('category', e.target.value as CategoryType)
              }
              className="nexus-editorial-control text-xs rounded-xl px-3 py-2.5 text-[#2E276C]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'Category: All' : cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Mobile Filter by Platform"
              value={filters.platform}
              onChange={(e) =>
                onUpdateFilter('platform', e.target.value as PlatformType)
              }
              className="nexus-editorial-control text-xs rounded-xl px-3 py-2.5 text-[#2E276C]"
            >
              {PLATFORMS.map((plat) => (
                <option key={plat} value={plat}>
                  {plat === 'All' ? 'Platform: All' : plat}
                </option>
              ))}
            </select>

            <select
              aria-label="Mobile Filter by Genre"
              value={filters.genre}
              onChange={(e) => onUpdateFilter('genre', e.target.value as GenreType)}
              className="nexus-editorial-control text-xs rounded-xl px-3 py-2.5 text-[#2E276C]"
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === 'All' ? 'Genre: All' : genre}
                </option>
              ))}
            </select>

            <select
              aria-label="Mobile Filter by Performance Tier"
              value={filters.performanceTier}
              onChange={(e) =>
                onUpdateFilter(
                  'performanceTier',
                  e.target.value as PerformanceTierType
                )
              }
              className="nexus-editorial-control text-xs rounded-xl px-3 py-2.5 text-[#2E276C]"
            >
              {PERFORMANCE_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier === 'All' ? 'Tier: All' : tier}
                </option>
              ))}
            </select>

            <select
              aria-label="Mobile Filter by Price"
              value={filters.priceRange}
              onChange={(e) =>
                onUpdateFilter('priceRange', e.target.value as PriceRangeType)
              }
              className="nexus-editorial-control text-xs rounded-xl px-3 py-2.5 text-[#2E276C] sm:col-span-2"
            >
              {PRICE_RANGES.map((price) => (
                <option key={price} value={price}>
                  {price === 'All' ? 'Price: All' : price}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </section>
  );
};
