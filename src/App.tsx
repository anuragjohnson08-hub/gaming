import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RotateCcw } from 'lucide-react';
import { AnnouncementBar, UiUpgradeMode } from './components/AnnouncementBar';
import { AuthModal } from './components/AuthModal';
import { BenchmarkExplorerSection } from './components/BenchmarkExplorerSection';
import { CatalogCard } from './components/CatalogCard';
import { ComparisonModal } from './components/ComparisonModal';
import { ComparisonTray } from './components/ComparisonTray';
import { FaqSection } from './components/FaqSection';
import { FilterToolbar } from './components/FilterToolbar';
import { Footer } from './components/Footer';
import { GameReviewView } from './components/GameReviewView';
import { HardwareReviewView } from './components/HardwareReviewView';
import { Header, NavTab } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PastelGlassBackdrop } from './components/PastelGlassBackdrop';
import { SearchOverlay } from './components/SearchOverlay';
import { MethodologyModal, SavedItemsDrawer } from './components/SideDrawers';
import { StickySectionNav } from './components/StickySectionNav';
import { CATALOG_ITEMS } from './data/catalogData';
import { CatalogItem, CategoryType, FilterState } from './types/nexus';
import {
  authenticateUserFromStore,
  NexusUser,
  registerUserInStore,
  simpleHash,
  StoredUserRecord,
} from './utils/authLogic';
import {
  analyzeSearchIntent,
  DEFAULT_FILTER_STATE,
  filterAndSortCatalog,
} from './utils/catalogLogic';
import { parseReviewIdFromSearch } from './utils/shareLogic';

gsap.registerPlugin(ScrollTrigger);

const SAVED_STORAGE_KEY = 'nexus_saved_items_v1';
const COMPARE_STORAGE_KEY = 'nexus_compare_items_v1';
const USERS_STORAGE_KEY = 'nexus_users_store_v1';
const ACTIVE_USER_STORAGE_KEY = 'nexus_active_user_v1';
const UI_MODE_STORAGE_KEY = 'nexus_ui_upgrade_mode_v1';

const SEEDED_REVIEWER_ACCOUNT: StoredUserRecord = {
  id: 'usr_demo_reviewer',
  name: 'Vikramaditya Rao',
  email: 'reviewer@nexus.gg',
  hardwareRig: 'RTX 5080 16GB · Ryzen 7 9800X3D · 32GB DDR5',
  createdAt: '2026-01-15',
  savedItemIds: ['game-cyberpunk-2077', 'gpu-rtx-5070', 'cpu-ryzen-7-9800x3d'],
  compareItemIds: [],
  passwordHash: simpleHash('nexus2026'),
};

export default function App() {
  const appRootRef = useRef<HTMLDivElement>(null);
  const hasPlayedIntroRef = useRef(false);

  const [uiUpgradeMode, setUiUpgradeMode] = useState<UiUpgradeMode>(() => {
    try {
      const saved = localStorage.getItem(UI_MODE_STORAGE_KEY);
      if (saved === 'option1' || saved === 'option2') return saved;
    } catch {
      // ignore
    }
    return 'option1';
  });

  useEffect(() => {
    try {
      localStorage.setItem(UI_MODE_STORAGE_KEY, uiUpgradeMode);
    } catch {
      // ignore
    }
  }, [uiUpgradeMode]);

  const [activeNav, setActiveNav] = useState<NavTab>('Home');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const fromQuery = parseReviewIdFromSearch(window.location.search);
    if (fromQuery && CATALOG_ITEMS.some((i) => i.id === fromQuery)) {
      return fromQuery;
    }
    return null;
  });

  // Sync selectedItemId to ?review=<id> query param so direct links work seamlessly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (selectedItemId) {
        url.searchParams.set('review', selectedItemId);
      } else {
        url.searchParams.delete('review');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore history errors
    }
  }, [selectedItemId]);

  // User Accounts Store in localStorage
  const [usersStore, setUsersStore] = useState<StoredUserRecord[]>(() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [SEEDED_REVIEWER_ACCOUNT];
  });

  // Currently Authenticated User
  const [currentUser, setCurrentUser] = useState<NexusUser | null>(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as NexusUser;
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });

  // Persisted Compare & Saved IDs
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return ['game-cyberpunk-2077'];
  });

  // Modals & Drawers
  const [searchOpen, setSearchOpen] = useState(false);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [savedDrawerOpen, setSavedDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [methodologyModal, setMethodologyModal] = useState<{
    open: boolean;
    topic: string;
  }>({
    open: false,
    topic: 'How We Test & Benchmark Database',
  });

  const gridRef = useRef<HTMLDivElement>(null);

  // Persist users store
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersStore));
    } catch {
      // ignore
    }
  }, [usersStore]);

  // Persist active user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Persist compareIds and sync to user record if logged in
  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(compareIds));
    } catch {
      // ignore
    }
    if (currentUser) {
      setUsersStore((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, compareItemIds: compareIds } : u
        )
      );
    }
  }, [compareIds, currentUser?.id]);

  // Persist savedIds and sync to user record if logged in
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // ignore
    }
    if (currentUser) {
      setUsersStore((prev) =>
        prev.map((u) =>
          u.id === currentUser.id ? { ...u, savedItemIds: savedIds } : u
        )
      );
    }
  }, [savedIds, currentUser?.id]);

  // Coordinated 6-Phase GSAP Entrance Animation & ScrollTrigger Reveal
  useEffect(() => {
    if (hasPlayedIntroRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hasPlayedIntroRef.current = true;
      return;
    }

    hasPlayedIntroRef.current = true;

    const ctx = gsap.context(() => {
      const easeCurve = 'power3.out';
      const tl = gsap.timeline({
        defaults: { ease: easeCurve },
      });

      // Phase 1 — Ambient Appearance (0–400ms)
      tl.fromTo(
        '.nexus-anim-ambient',
        { opacity: 0 },
        { opacity: 1, duration: 0.4, clearProps: 'opacity' },
        0
      );

      // Phase 2 — Logo Reveal (200–900ms): Symbol first, then wordmark
      tl.fromTo(
        '.nexus-anim-logo-symbol',
        { opacity: 0, y: 18, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, clearProps: 'all' },
        0.2
      ).fromTo(
        '.nexus-anim-logo-wordmark',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, clearProps: 'all' },
        0.32
      );

      // Phase 3 — Navigation Entrance (400–1100ms)
      tl.fromTo(
        '.nexus-anim-nav-capsule',
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' },
        0.4
      )
        .fromTo(
          '.nexus-anim-nav-link',
          { opacity: 0, y: -8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.045,
            clearProps: 'all',
          },
          0.52
        )
        .fromTo(
          '.nexus-anim-nav-action',
          { opacity: 0, y: -8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.04,
            clearProps: 'all',
          },
          0.68
        );

      // Phase 4 — Hero Content Reveal (600–1500ms)
      tl.fromTo(
        '.nexus-anim-hero-eyebrow',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.42, clearProps: 'all' },
        0.6
      )
        .fromTo(
          '.nexus-anim-hero-headline',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.52, clearProps: 'all' },
          0.7
        )
        .fromTo(
          '.nexus-anim-hero-desc',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.48, clearProps: 'all' },
          0.82
        )
        .fromTo(
          '.nexus-anim-hero-cta-primary',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, clearProps: 'all' },
          0.94
        )
        .fromTo(
          '.nexus-anim-hero-cta-secondary',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.4, clearProps: 'all' },
          1.02
        )
        .fromTo(
          '.nexus-anim-hero-stat',
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.38,
            stagger: 0.05,
            clearProps: 'all',
          },
          1.1
        );

      // Phase 5 — Hero Artwork Reveal (700–1700ms)
      tl.fromTo(
        '.nexus-anim-hero-rimlight',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.65, clearProps: 'all' },
        0.7
      )
        .fromTo(
          '.nexus-anim-hero-hardware',
          { opacity: 0, x: 42, scale: 0.97 },
          { opacity: 1, x: 0, scale: 1, duration: 0.72, clearProps: 'all' },
          0.74
        )
        .fromTo(
          '.nexus-anim-hero-telemetry',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, clearProps: 'all' },
          1.16
        );

      // Phase 6 — Discovery Grid Entrance (1000–1900ms)
      tl.fromTo(
        '.nexus-anim-filter-toolbar',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, clearProps: 'all' },
        1.0
      ).fromTo(
        '.nexus-anim-card',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.04,
          clearProps: 'all',
        },
        1.12
      );

      // Scroll-Triggered Reveals for Sections Below the Fold (once: true)
      const scrollSections = gsap.utils.toArray<HTMLElement>(
        '.nexus-scroll-section'
      );
      scrollSections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'all',
            scrollTrigger: {
              trigger: sec,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    }, appRootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  // Global Cmd/Ctrl + K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auth Handlers
  const handleLogin = (email: string, password: string) => {
    const res = authenticateUserFromStore(usersStore, email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSavedIds(res.user.savedItemIds);
      if (res.user.compareItemIds.length > 0) {
        setCompareIds(res.user.compareItemIds);
      }
    }
    return { success: res.success, error: res.error };
  };

  const handleSignUp = (input: {
    name: string;
    email: string;
    password: string;
    hardwareRig?: string;
  }) => {
    const res = registerUserInStore(usersStore, {
      ...input,
      initialSavedIds: savedIds,
      initialCompareIds: compareIds,
    });
    if (res.success && res.user) {
      setUsersStore(res.updatedUsers);
      setCurrentUser(res.user);
    }
    return { success: res.success, error: res.error };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthModalOpen(false);
  };

  const handleUpdateRig = (newRig: string) => {
    if (!currentUser) return;
    const updatedUser: NexusUser = {
      ...currentUser,
      hardwareRig: newRig.trim(),
    };
    setCurrentUser(updatedUser);
    setUsersStore((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, hardwareRig: newRig.trim() } : u
      )
    );
  };

  // Filtered and sorted items
  const filteredItems = useMemo(
    () => filterAndSortCatalog(CATALOG_ITEMS, filters),
    [filters]
  );

  const searchAnalysis = useMemo(
    () => analyzeSearchIntent(filters.searchQuery, CATALOG_ITEMS),
    [filters.searchQuery]
  );

  // Dataset statistics for Hero
  const gamesCount = useMemo(
    () => CATALOG_ITEMS.filter((i) => i.itemType === 'game').length,
    []
  );
  const hardwareCount = useMemo(
    () => CATALOG_ITEMS.filter((i) => i.itemType === 'hardware').length,
    []
  );
  const benchmarksCount = CATALOG_ITEMS.length * 3;

  const selectedItem = useMemo(
    () => CATALOG_ITEMS.find((i) => i.id === selectedItemId) || null,
    [selectedItemId]
  );

  const comparedItems = useMemo(
    () =>
      compareIds
        .map((id) => CATALOG_ITEMS.find((i) => i.id === id))
        .filter((i): i is CatalogItem => Boolean(i)),
    [compareIds]
  );

  const savedItems = useMemo(
    () =>
      savedIds
        .map((id) => CATALOG_ITEMS.find((i) => i.id === id))
        .filter((i): i is CatalogItem => Boolean(i)),
    [savedIds]
  );

  const handleUpdateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'category') {
      if (value === 'Games') setActiveNav('Games');
      else if (value === 'All') setActiveNav('Home');
      else setActiveNav('Hardware');
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTER_STATE);
    setActiveNav('Home');
  };

  const handleSelectNav = (nav: NavTab) => {
    setActiveNav(nav);
    setSelectedItemId(null);

    if (nav === 'Home') {
      setFilters(DEFAULT_FILTER_STATE);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (nav === 'Games') {
      setFilters({
        ...DEFAULT_FILTER_STATE,
        category: 'Games',
      });
      gridRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (nav === 'Hardware') {
      setFilters({
        ...DEFAULT_FILTER_STATE,
        category: 'Graphics Cards',
      });
      gridRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (nav === 'Reviews') {
      setFilters({
        ...DEFAULT_FILTER_STATE,
        sortBy: 'Highest Rated',
      });
      gridRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (nav === 'Benchmarks') {
      setTimeout(() => {
        const el = document.getElementById('nexus-benchmark-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
    }
  };

  const handleToggleCompare = (item: CatalogItem) => {
    setCompareIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), item.id];
      }
      return [...prev, item.id];
    });
  };

  const handleToggleSave = (item: CatalogItem) => {
    setSavedIds((prev) =>
      prev.includes(item.id)
        ? prev.filter((id) => id !== item.id)
        : [...prev, item.id]
    );
  };

  const handleOpenItemDetail = (item: CatalogItem) => {
    setSelectedItemId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareMatched = (itemsToCompare: CatalogItem[]) => {
    setCompareIds(itemsToCompare.slice(0, 4).map((i) => i.id));
    setComparisonModalOpen(true);
  };

  return (
    <div
      ref={appRootRef}
      data-ui-mode={uiUpgradeMode}
      className="min-h-screen relative text-[#1E293B] flex flex-col justify-between pb-16 overflow-x-hidden"
    >
      {/* Ambient Pastel Color Grid & 3D Geometric Shapes Backdrop */}
      <PastelGlassBackdrop />

      <div className="relative z-10">
        {/* 1. Thin Announcement Bar with Live Option 1 / Option 2 Switcher */}
        <AnnouncementBar
          uiUpgradeMode={uiUpgradeMode}
          onChangeUiUpgradeMode={setUiUpgradeMode}
          onOpenMethodology={() =>
            setMethodologyModal({
              open: true,
              topic: 'NEXUS Benchmark Database & Lab Methodology',
            })
          }
        />

        {/* 2. Floating Frosted Glass Navigation */}
        <Header
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenComparison={() => {
            if (compareIds.length === 0) {
              setCompareIds(['gpu-rtx-5070', 'gpu-rx-9070-xt']);
            }
            setComparisonModalOpen(true);
          }}
          onOpenSaved={() => setSavedDrawerOpen(true)}
          onOpenMethodology={() =>
            setMethodologyModal({
              open: true,
              topic: 'Reference Testbench & Review Methodology',
            })
          }
          onOpenAuth={() => setAuthModalOpen(true)}
          currentUser={currentUser}
          compareCount={compareIds.length}
          savedCount={savedIds.length}
          onQuickCategorySelect={(cat: CategoryType) => {
            setSelectedItemId(null);
            handleUpdateFilter('category', cat);
          }}
        />

        {/* 2.5. Persistent Sticky In-Page Section Quick Navigation Menu Bar with Active Scroll Spy */}
        <StickySectionNav
          onNavigateToSection={(targetId) => {
            if (selectedItemId) {
              setSelectedItemId(null);
            }
          }}
          onOpenSearch={() => setSearchOpen(true)}
          hasOpenDetailView={Boolean(selectedItemId)}
        />

        {/* Main Content Area: Detail Page vs Discovery Storefront */}
        <main>
          {selectedItem ? (
            selectedItem.itemType === 'game' ? (
              <GameReviewView
                item={selectedItem}
                isCompared={compareIds.includes(selectedItem.id)}
                isSaved={savedIds.includes(selectedItem.id)}
                onBack={() => setSelectedItemId(null)}
                onToggleCompare={handleToggleCompare}
                onToggleSave={handleToggleSave}
                onSelectCatalogItem={(id) => {
                  const found = CATALOG_ITEMS.find((c) => c.id === id);
                  if (found) handleOpenItemDetail(found);
                }}
              />
            ) : (
              <HardwareReviewView
                item={selectedItem}
                isCompared={compareIds.includes(selectedItem.id)}
                isSaved={savedIds.includes(selectedItem.id)}
                onBack={() => setSelectedItemId(null)}
                onToggleCompare={handleToggleCompare}
                onToggleSave={handleToggleSave}
                onOpenComparisonTable={() => setComparisonModalOpen(true)}
                onSelectCatalogItem={(id) => {
                  const found = CATALOG_ITEMS.find((c) => c.id === id);
                  if (found) handleOpenItemDetail(found);
                }}
              />
            )
          ) : (
            <div className="nexus-page-enter">
              {/* 3. Spacious Two-Column Hero Banner */}
              <HeroSection
                gamesCount={gamesCount}
                hardwareCount={hardwareCount}
                benchmarksCount={benchmarksCount}
                onExploreReviews={() =>
                  gridRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                onCompareHardware={() => {
                  if (compareIds.length === 0) {
                    setCompareIds(['gpu-rtx-5070', 'gpu-rx-9070-xt']);
                  }
                  setComparisonModalOpen(true);
                }}
                onInspectFeaturedGpu={() => {
                  const rtx5070 = CATALOG_ITEMS.find(
                    (i) => i.id === 'gpu-rtx-5070'
                  );
                  if (rtx5070) handleOpenItemDetail(rtx5070);
                }}
              />

              {/* 4. Horizontal Filter & Sorting Toolbar */}
              <div ref={gridRef} id="nexus-catalog-section" className="scroll-mt-36">
                <FilterToolbar
                  filters={filters}
                  onUpdateFilter={handleUpdateFilter}
                  onResetFilters={handleResetFilters}
                  resultsCount={filteredItems.length}
                  intentBanner={{
                    summary: searchAnalysis.intent.intentSummary,
                    canCompare:
                      searchAnalysis.intent.isComparisonIntent &&
                      searchAnalysis.matchedItems.length >= 2,
                    onTriggerCompare: () =>
                      handleCompareMatched(searchAnalysis.matchedItems),
                  }}
                />
              </div>

              {/* 5. Four-Column Gaming & Hardware Review Discovery Grid */}
              <section
                aria-label="Gaming Reviews and Hardware Performance Grid"
                className="px-3 sm:px-6 lg:px-8"
              >
                <div className="max-w-[1360px] mx-auto">
                  {filteredItems.length === 0 ? (
                    <div className="nexus-editorial-panel rounded-3xl p-12 text-center my-4">
                      <p className="font-display text-lg font-extrabold text-[#312A75]">
                        No reviews or hardware match your current filters
                      </p>
                      <p className="text-xs sm:text-sm text-[#4A5578] mt-1.5 max-w-md mx-auto font-medium">
                        Try clearing one of your active category, platform, genre,
                        or price filters to view our full benchmarked catalog.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="nexus-hover-shake nexus-dock-circle-active mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      data-testid="discovery-grid"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
                    >
                      {filteredItems.map((item) => (
                        <CatalogCard
                          key={item.id}
                          item={item}
                          isCompared={compareIds.includes(item.id)}
                          isSaved={savedIds.includes(item.id)}
                          onSelectItem={handleOpenItemDetail}
                          onToggleCompare={handleToggleCompare}
                          onToggleSave={handleToggleSave}
                          uiUpgradeMode={uiUpgradeMode}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* 6. Interactive Benchmark & Comparison Hierarchy Section */}
              <BenchmarkExplorerSection
                items={CATALOG_ITEMS}
                onSelectItem={handleOpenItemDetail}
                onCompareGpuPair={(ids) => {
                  setCompareIds(ids);
                  setComparisonModalOpen(true);
                }}
              />
            </div>
          )}
        </main>

        {/* Collapsible Hardware Benchmarking Accuracy & Review Methodology FAQ */}
        <FaqSection
          onOpenMethodologyModal={(topic) =>
            setMethodologyModal({ open: true, topic })
          }
        />
      </div>

      {/* 7. Refined Footer */}
      <Footer
        onOpenPolicyModal={(topic) =>
          setMethodologyModal({ open: true, topic })
        }
        onFilterCategory={(cat) => {
          setSelectedItemId(null);
          handleUpdateFilter('category', cat);
          gridRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Persistent Bottom Comparison Tray */}
      <ComparisonTray
        items={comparedItems}
        onRemoveItem={(id) =>
          setCompareIds((prev) => prev.filter((item) => item !== id))
        }
        onClearAll={() => setCompareIds([])}
        onOpenComparison={() => setComparisonModalOpen(true)}
      />

      {/* Side-by-Side Comparison Modal */}
      <ComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        selectedItems={comparedItems}
        allItems={CATALOG_ITEMS}
        onToggleCompare={handleToggleCompare}
        onClearCompare={() => setCompareIds([])}
        onSelectDetail={handleOpenItemDetail}
      />

      {/* Instant Search Overlay */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={CATALOG_ITEMS}
        initialQuery={filters.searchQuery}
        onSelectItem={handleOpenItemDetail}
        onApplySearchToGrid={(q) => {
          setSelectedItemId(null);
          handleUpdateFilter('searchQuery', q);
        }}
        onCompareMatched={handleCompareMatched}
      />

      {/* Saved Items Drawer */}
      <SavedItemsDrawer
        isOpen={savedDrawerOpen}
        onClose={() => setSavedDrawerOpen(false)}
        savedItems={savedItems}
        onSelectItem={handleOpenItemDetail}
        onRemoveSaved={(id) =>
          setSavedIds((prev) => prev.filter((item) => item !== id))
        }
        onClearSaved={() => setSavedIds([])}
      />

      {/* User Authentication & Profile Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        savedItems={savedItems}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
        onSelectSavedItem={handleOpenItemDetail}
        onUpdateRig={handleUpdateRig}
      />

      {/* Methodology & Editorial Policy Modal */}
      <MethodologyModal
        isOpen={methodologyModal.open}
        onClose={() => setMethodologyModal((prev) => ({ ...prev, open: false }))}
        activeTopic={methodologyModal.topic}
      />
    </div>
  );
}
