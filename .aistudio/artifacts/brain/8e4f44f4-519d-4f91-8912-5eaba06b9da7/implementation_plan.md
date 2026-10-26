# NEXUS — Editorial Typography, Hardware Lab Polish & Dual-Mode Upgrade

Upgrade NEXUS into a premier editorial hardware testing publication (inspired by Digital Foundry, The Verge, and Ars Technica) on top of the Pastel Color Grid & Frosted Glass UI aesthetic, complete with a live **UI Mode Switcher** that lets users toggle seamlessly between **Option 1 (Complete Editorial UI & Data Viz)** and **Option 2 (Pure Typography & Micro-Interactions)**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and functional choices were confirmed during clarification and govern this implementation:

- **Confirmed Decision 1 — Live Switcher Between Option 1 & Option 2**: A segmented mode toggle (`Lab + Data Viz` vs `Type + Motion`) will be accessible in the top utility bar (persisted in `localStorage`) so you can compare and switch between **Option 1 (Complete Editorial UI, Frosted Status Badges & 1080p/1440p/4K Progress Bars)** and **Option 2 (Pure Typography & Hover Micro-Interactions Only)** in real time.
- **Confirmed Decision 2 — Pastel Glass Theme with Hardware Lab Polish**: Retain the pastel aqua-cyan to periwinkle-lavender color grid and 3D geometric backdrop while upgrading surfaces with hairline micro-borders, dual-layer drop shadows, and high-contrast editorial typography (`#1E293B` / `text-slate-800` and `#2E276C` deep indigo).
- **Confirmed Decision 3 — 1080p, 1440p, and 4K Horizontal FPS Progress & Delta Bars**: Render sleek horizontal progress/delta bars for all three resolutions (`1080p`, `1440p`, and `4K`) on both the **Catalog Cards** and the **Individual Game & Hardware Review Pages** when Option 1 is active.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates NEXUS's typographic authority, numerical telemetry alignment, surface elevation, and visual benchmark clarity while preserving all 18 catalog items, the 15-rig Cross-Hardware & Sub-Minimum Performance Matrix, the 10-game All-Games Benchmark Suite, filter dropdown slide/fade animations, social sharing, and hardware comparison workflows.
- **Target Audience / Persona**: PC enthusiasts, hardware reviewers, and gamers who demand scannable, zero-jitter frame-rate telemetry and authoritative editorial presentation.
- **Key Value**: Eliminates numerical layout shift across resolution toggles via strict `tabular-nums` monospace discipline, communicates 1080p/1440p/4K performance scaling at a glance with horizontal delta bars, and provides instant switching between the full editorial lab treatment and the pure typography/micro-interaction mode.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **UI Mode Switching (`Option 1: Editorial Lab` ↔ `Option 2: Type & Motion`)**:
   - Users can click the mode switch pill in the top header/toolbar at any time to toggle between Option 1 and Option 2 without losing filter, search, comparison, or review state.
2. **Scanning 1080p / 1440p / 4K Telemetry on Catalog Cards**:
   - In **Option 1**, each card displays frosted glass status badges (`EDITOR'S PICK`, `DEMO DATA`, `LAB VERIFIED`) and a 3-tier `1080p / 1440p / 4K` benchmark readout backed by proportional horizontal progress bars color-coded by performance tier (Indigo `#584CE8` for 1080p, Royal Indigo `#4338CA` for 1440p, Deep Aqua-Teal `#266D75` for 4K).
   - In **Option 2**, the card preserves the existing compact 3-column layout structure while applying the new **Cabinet Grotesk**, **Inter**, and **JetBrains Mono** `tabular-nums` typography and smooth `scale-[1.01]` hover micro-interactions with glowing hairline borders.
3. **Deep-Dive Game & Hardware Review Telemetry**:
   - Both Game Review and Hardware Review views display symmetrical `tabular-nums` FPS, `1% Low`, frame-time (`ms`), wattage, and INR price figures, enhanced in Option 1 with horizontal progress/delta bars across resolution and preset tables.

### Visual Identity & Theme
- **Typography Hierarchy (Both Option 1 & Option 2)**:
  - **Display & Headlines (`Cabinet Grotesk`)**: Loaded via Fontshare CDN (`https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800,900&display=swap`) and applied with `font-family: 'Cabinet Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.025em;` to all major headlines, brand titles, card titles, and section headers.
  - **UI Body & Editorial Prose (`Inter`)**: Loaded via Google Fonts and applied (`font-family: 'Inter', sans-serif;`) to all paragraphs, subtitles, review verdicts, and specification descriptions with crisp high-contrast slate/indigo legibility (`#1E293B` / `text-slate-800` equivalent).
  - **Telemetry & Numerical Metrics (`JetBrains Mono`)**: Applied with `font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums;` to all FPS values, `1% Low` readouts, millisecond (`ms`) frame times, hardware retail prices (`₹`), clock speeds (`GHz`/`MHz`), thermal watts (`W`), and metric badges so numbers align symmetrically without jitter when toggling `1080p`, `1440p`, and `4K`.
- **Sleek Hardware Lab Surface System (Option 1) vs Micro-Interaction Polish (Option 2)**:
  - **Hairline Micro-Borders**: Crisp `1px solid rgba(15, 23, 42, 0.08)` outer micro-borders paired with inner `rgba(255, 255, 255, 0.78)` specular highlights on the pastel frosted glass surfaces.
  - **Dual-Layer Drop Shadows (Option 1)**: `box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.65), 0 10px 30px -5px rgba(30, 41, 59, 0.18)` for authoritative lab depth.
  - **Frosted Glass Status Badges (Option 1)**: Semi-translucent frosted glass pills for `'EDITOR’S PICK'`, `'DEMO DATA'`, and `'LAB VERIFIED'` with crisp high-contrast `JetBrains Mono` labels.
  - **Interactive Hover Polish (Option 1 & Option 2)**: Smooth card scale transition (`hover:scale-[1.01]`), glowing periwinkle/aqua hairline borders on hover, and tactile button press states (`active:scale-[0.98]`) alongside the existing hover-shake and filter dropdown slide/fade animations.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Font Delivery for Cabinet Grotesk, Inter, and JetBrains Mono**:
  - *Chosen Approach*: Load **Cabinet Grotesk** from Fontshare's official CDN and **Inter** + **JetBrains Mono** from Google Fonts in `index.html`, with metric-compatible geometric fallback definitions in CSS.
  - *Why*: Cabinet Grotesk is a signature Foundry typeface hosted on Fontshare rather than Google Fonts; loading both stylesheets guarantees authentic rendering of all three requested typefaces.
- **Decision 2 — Non-Destructive Mode Switching (`option1` vs `option2`)**:
  - *Chosen Approach*: Provide a top-level `uiUpgradeMode` state (`'option1' | 'option2'`) in the application root, passed down to the Header, Filter Toolbar, Catalog Cards, Benchmark Explorer, and Review views, and reflected as a root `data-ui-mode` attribute for CSS rules.
  - *Why*: Lets the user experience Option 1's full Hardware Lab redesign (dual-layer shadows, frosted glass status badges, and 1080p/1440p/4K progress/delta bars) and switch instantaneously to Option 2's pure typography and hover micro-interactions without reloading or losing state.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Application Root (App.tsx)                            │
│  • State: uiUpgradeMode ('option1' | 'option2') persisted in localStorage    │
│  • Root Attribute: data-ui-mode="option1" | "option2"                        │
│  • Backdrop: PastelGlassBackdrop (Aqua-to-Lavender Grid + 3D Shapes)         │
└───────────────────┬──────────────────────────────────────┬───────────────────┘
                    │                                      │
                    ▼                                      ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────────┐
│   Header & FilterToolbar              │  │   Discovery Grid & CatalogCard    │
│ • Cabinet Grotesk Brand & Section H2  │  │ • Cabinet Grotesk Card Titles     │
│ • Live Mode Switcher Pill:            │  │ • Inter High-Contrast Descriptions│
│   [Option 1: Lab UI] [Option 2: Type] │  │ • JetBrains Mono Tabular Metrics  │
│ • Sharp Pill Filter Buttons +         │  │ • Hover scale-[1.01] + Glow Border│
│   Slide-Down/Up & Text Fade Menus     │  │ • Option 1: Frosted Glass Badges  │
└───────────────────────────────────────┘  │   + 1080p/1440p/4K Progress Bars  │
                                           └─────────────────┬─────────────────┘
                                                             │
                                                             ▼
                                           ┌───────────────────────────────────┐
                                           │ GameReviewView & HardwareReview   │
                                           │ • Tabular-Nums Resolution Toggles │
                                           │   (Zero layout shift 1080p/1440p) │
                                           │ • 1080p, 1440p & 4K Horizontal    │
                                           │   Progress/Delta Bars in Matrices │
                                           └───────────────────────────────────┘
```

### Interactive Component & State Mapping
- **Typography & CSS System**:
  - Configure `--font-display: 'Cabinet Grotesk', sans-serif`, `--font-sans: 'Inter', sans-serif`, and `--font-mono: 'JetBrains Mono', monospace`.
  - Apply `letter-spacing: -0.025em` and `font-weight: 700` to all headings, brand wordmarks, and section headers.
  - Apply `font-variant-numeric: tabular-nums` to all numeric readouts, resolution buttons, INR prices, frame times (`ms`), and scores.
  - Define `[data-ui-mode="option1"]` and `[data-ui-mode="option2"]` surface rules for hairline micro-borders (`1px solid rgba(0, 0, 0, 0.08)`), dual-layer drop shadows, and glowing hover hairline borders (`scale-[1.01]`).
- **Header & Filter Toolbar**:
  - Add the interactive **UI Mode Switcher** (`Option 1: Lab UI` / `Option 2: Type Only`) in the top bar / announcement utility strip so users can switch modes from any screen.
  - Refine the top navigation bar with backdrop-blur glassmorphism and sharp pill-shaped filter controls while preserving all 5 filter dropdown IDs (`#filter-category`, `#filter-platform`, `#filter-genre`, `#filter-tier`, `#filter-price`) and their slide-down/up + text fade-in/out animations.
- **Catalog Cards & Review Pages**:
  - Add semi-translucent frosted glass status badges (`EDITOR'S PICK` for items with score $\ge 9.2$, `DEMO DATA`, and `LAB VERIFIED`) in Option 1.
  - Render proportional horizontal FPS progress bars for `1080p`, `1440p`, and `4K` inside each card's benchmark strip and across the Game Review and Hardware Review benchmark matrices.
