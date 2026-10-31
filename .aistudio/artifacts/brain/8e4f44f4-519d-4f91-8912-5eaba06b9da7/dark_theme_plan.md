# Architecture & Theme Plan: Dark Slate Theme (#212529) with Glowing Pastel Accents

This implementation plan transitions NEXUS from the light cyan backdrop to a dark slate background (`#212529` / `RGB: 33, 37, 41` / `CMYK: 16, 10, 0, 84`), balanced with luminous pastel and vibrant accent glows across all cards, navigation bars, benchmark grids, and typography.

---

## 1. Design Vision & Color Palette

### Base Surfaces
- **App Body & Canvas**: `#212529` (Rich Dark Slate / Charcoal) with subtle deep slate gradient falloff (`#212529` to `#16191c`).
- **Glass Panels & Editorial Cards**: Dark frosted glass surfaces:
  - Base: `linear-gradient(165deg, rgba(38, 43, 49, 0.78) 0%, rgba(29, 33, 38, 0.88) 100%)`
  - Backdrop Blur: `backdrop-filter: blur(24px) saturate(160%)`
  - Subtle luminous hairline borders: `1px solid rgba(255, 255, 255, 0.10)`
  - Inner glow: `inset 0 1px 1px rgba(255, 255, 255, 0.12)`

### Glowing Pastel Accents & Highlights
- **Vibrant Indigo / Violet**: `#7C6EF8` / `#584CE8` (primary interactive controls, active badges, and focus rings).
- **Luminous Aqua / Teal**: `#38BDF8` / `#2DD4BF` (benchmark meters, lab telemetry tags, and frame-time indicators).
- **Soft Lavender / Pink**: `#C4B5FD` / `#F472B6` (specular reflections, ambient glass refractions).
- **Ambient Backdrop Animation (`PastelGlassBackdrop`)**:
  - The lava blobs will glow like luminous plasma against the `#212529` dark room chamber, casting vibrant ambient colors beneath dark frosted glass without washing out legibility.

### High-Contrast Typography
- **Headings & Titles (`font-display`)**: `#F8FAFC` (pure crisp off-white) with balanced contrast.
- **Body & Secondary Copy**: `#CBD5E1` and `#94A3B8` (soft slate grey, highly readable on `#212529`).
- **Code & Tabular Numerals (`font-mono`)**: `#7DD3FC` and `#A5B4FC` (luminous cyan & indigo).

---

## 2. Key Components to Update

### 1. `index.html` & `src/index.css`
- Update body background in `index.html` from `bg-[#CCF2F7]` to `bg-[#212529] text-[#F1F5F9]`.
- Update CSS variables in `:root`:
  - `--bg-primary: #212529;`
  - `--bg-secondary: #1a1e22;`
  - `--text-main: #F1F5F9;`
  - `--text-display: #FFFFFF;`
  - `--text-secondary: #94A3B8;`
- Update `.nexus-editorial-panel`, `.nexus-editorial-card`, `.nexus-editorial-nav`, `.nexus-editorial-modal`, `.nexus-editorial-control`, and `.nexus-editorial-well` to sleek dark glass styles with soft neon/pastel hover glows (`0 0 25px rgba(124, 110, 248, 0.25)`).

### 2. `src/components/PastelGlassBackdrop.tsx`
- Change the base background from light cyan gradient to `#212529` dark slate chamber.
- Adjust lava blobs' blend mode and gradients so they glow softly like an illuminated dark neon lava lamp.
- Tune the architectural color grid lines to subtle dark slate tones (`rgba(255, 255, 255, 0.05)`).

### 3. Navigation Bars (`Header.tsx` & `StickySectionNav.tsx`)
- Shift floating navigation capsules from white glass to dark frosted glass (`bg-[#212529]/80 backdrop-blur-xl border-white/10`).
- Ensure active nav pills and section indicators pop brightly with `#584CE8` and `#38BDF8`.

### 4. Cards & Modals (`CatalogCard.tsx`, `HeroSection.tsx`, `FilterToolbar.tsx`, etc.)
- Update text colors from dark slate `#1E293B` to crisp white `#F8FAFC` and soft silver `#94A3B8`.
- Ensure buttons (such as "Explore Reviews", "Compare Hardware", and filter pills) have high contrast against the dark card surfaces.

---

## 3. Verification & Quality Assurance
- Run `compile_applet` and `lint_applet` to ensure zero compilation and typing errors.
- Verify readability and WCAG AAA/AA contrast ratios across all text elements, benchmark bars, and modal overlays.
- Verify smooth performance and reduced-motion compliance.
