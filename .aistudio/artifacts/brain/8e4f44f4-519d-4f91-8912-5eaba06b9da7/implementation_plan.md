# Persistent Sticky Navigation Menu Bar with Active Scroll Spy

A persistent, floating frosted glass section menu bar pinned to the top of the viewport that tracks and highlights the user's reading position across every section of the NEXUS platform.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user in Phase 1:
> - **Position & Style**: Sticky floating glass bar pinned to the top of the viewport.
> - **Navigation Coverage**: Covers every primary section of the website (`3D GPU Lab Showcase`, `Review Catalog & Filters`, `Benchmark Hierarchy Matrix`, `Accuracy & Methodology FAQ`, and `Publication & Lab Disclosure`).
> - **Scroll Pacing**: Active Scroll Spy (`IntersectionObserver` + scroll position tracker) dynamically highlighting the currently viewed section in real time.

---

## 1. Overview & Core Concept

- **What It Delivers**: A sleek, persistent in-page navigation bar that stays docked at the top as the user scrolls through long technical analyses, hardware benchmarks, and methodology documentation.
- **Target Experience**: Readers and hardware enthusiasts navigating deep editorial pages can jump to any section with a single click, see at a glance where they currently are, and quickly return to top without losing context.
- **Key Value**: Eliminates tedious manual scrolling across extensive benchmark tables and reviews, providing effortless spatial awareness and immediate access to all sections.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **At Page Load (Hero / Zero Scroll)**: The menu bar sits seamlessly docked beneath the main header, highlighting the `3D GPU Lab` tab.
2. **Scrolling Down the Page**: As the user scrolls past the Hero into the Review Catalog, Benchmark Matrix, or FAQ section, the menu bar remains pinned with a high-contrast frosted glass backdrop blur (`backdrop-blur-md`), dynamically sliding the active pill indicator to the visible section.
3. **Clicking a Navigation Pill**: Clicking any section pill triggers a smooth scroll (`scrollIntoView({ behavior: 'smooth' })`) with a calibrated scroll-margin offset so section headings are never obscured by the pinned bar.
4. **Quick Jump to Top**: A discreet "Top ↑" jump button appears once scrolled past the hero, enabling instant return to the beginning.

### Visual Identity & Theme
- **Glassmorphism Aesthetic**: Matches the pastel color grid with a dual-layer glass border (`1px solid rgba(255, 255, 255, 0.8)`), subtle shadow (`0 8px 24px -4px rgba(30, 41, 59, 0.12)`), and high-contrast typography.
- **Active Pill Indicator**: Active section indicator styled with Deep Indigo (`bg-[#584CE8] text-white shadow-xs font-bold`) with smooth sliding transitions, while inactive sections use crisp `#4A5578` text with hover contrast (`hover:text-[#2E276C] hover:bg-white/50`).
- **Tabular Font Hierarchy**: Section labels use `font-family: 'Cabinet Grotesk', sans-serif` for titles and `font-family: 'JetBrains Mono', monospace` for quick section index numbers (`01`, `02`, `03`, `04`, `05`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sticky Sub-Header Integration vs Floating Island Pill**
  - *Chosen Approach*: Pinned top sub-navigation bar integrated directly below the main sticky header (`sticky top-[68px] z-25`), forming a coherent unified command deck.
  - *Why*: Prevents awkward floating elements from blocking content in the center or bottom of the screen (especially keeping the persistent comparison tray and 3D GPU viewer unobstructed).
- **Decision 2: Scroll Spy Implementation (`IntersectionObserver` + Fallback)**
  - *Chosen Approach*: High-performance `IntersectionObserver` observing section threshold boundaries with a throttled passive window scroll listener fallback.
  - *Why*: Zero layout jank or main-thread blocking, ensuring 60+ FPS smooth scrolling even during Three.js 3D GPU rendering and animated chart interactions.
- **Decision 3: Universal Section Anchoring**
  - *Chosen Approach*: Assigning unambiguous semantic IDs and `scroll-mt-28` CSS utility classes to all target sections (`#nexus-hero-section`, `#nexus-catalog-section`, `#nexus-benchmark-section`, `#nexus-faq-section`, `#nexus-footer-section`).
  - *Why*: Guarantees accurate scroll positioning across both desktop viewports and mobile devices without header overlap.

---

## 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEXUS App Container                         │
├─────────────────────────────────────────────────────────────────┤
│ [Announcement Bar]                                              │
│ [Sticky Primary Header] (ActiveNav, Search, Compare, Auth)      │
├─────────────────────────────────────────────────────────────────┤
│ [Sticky Section Navigator] (NEW: Sticky Top Floating Glass Bar) │
│  ├── 01 3D GPU Lab        -> #nexus-hero-section                │
│  ├── 02 Review Catalog    -> #nexus-catalog-section             │
│  ├── 03 Benchmark Matrix  -> #nexus-benchmark-section           │
│  ├── 04 Methodology FAQ   -> #nexus-faq-section                 │
│  ├── 05 Lab Disclosure    -> #nexus-footer-section              │
│  └── Quick Return [Top ↑]                                       │
├─────────────────────────────────────────────────────────────────┤
│ [Main Content Views]                                            │
│  ├── HeroSection (#nexus-hero-section)                          │
│  ├── Catalog & Filters (#nexus-catalog-section)                 │
│  ├── BenchmarkExplorerSection (#nexus-benchmark-section)        │
│  └── FaqSection (#nexus-faq-section)                            │
├─────────────────────────────────────────────────────────────────┤
│ [Footer] (#nexus-footer-section)                                │
│ [Comparison Tray] (Bottom Dock)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Details
1. **`StickySectionNav.tsx` (New Component)**:
   - Tracks active section via `activeSectionId`.
   - Renders 5 section anchor buttons with index tags and active indicator.
   - Handles smooth scrolling with offset calculations.
   - Displays a "Top ↑" quick return button when scroll position exceeds 400px.
   - Fully accessible with `role="navigation"`, `aria-label="Section Navigation"`, and keyboard focus rings.
2. **`App.tsx` Integration**:
   - Mounts `<StickySectionNav />` right below `<Header />`.
   - Adds explicit `id` attributes and `scroll-mt-28` offset classes to all sections.
3. **`index.css` Styling**:
   - Adds `.nexus-sticky-subnav` glassmorphism styles with smooth horizontal overflow scrolling for mobile screens.
