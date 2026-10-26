import {
  CatalogItem,
  FilterState,
  GraphicsPresetKey,
  PriceRangeType,
  ResolutionKey,
  UpscalingTech,
} from '../types/nexus';

export const DEFAULT_FILTER_STATE: FilterState = {
  category: 'All',
  platform: 'All',
  genre: 'All',
  performanceTier: 'All',
  priceRange: 'All',
  sortBy: 'Featured',
  searchQuery: '',
};

export function matchesPriceRange(priceINR: number | null, range: PriceRangeType): boolean {
  if (range === 'All') return true;
  if (priceINR === null) return false;
  switch (range) {
    case 'Under INR 10,000':
      return priceINR < 10000;
    case 'INR 10,000 – 50,000':
      return priceINR >= 10000 && priceINR <= 50000;
    case 'INR 50,000 – 80,000':
      return priceINR > 50000 && priceINR <= 80000;
    case 'Above INR 80,000':
      return priceINR > 80000;
    default:
      return true;
  }
}

export interface SmartSearchIntent {
  isComparisonIntent: boolean;
  comparisonItemIds: string[];
  intentSummary: string | null;
}

/**
 * Evaluates natural language search queries such as:
 * - "RTX 5070 vs RTX 4070"
 * - "Best GPU for 1440p"
 * - "Cyberpunk 2077 FPS"
 * - "Gaming laptop under ₹80,000"
 */
export function analyzeSearchIntent(
  query: string,
  items: CatalogItem[]
): { matchedItems: CatalogItem[]; intent: SmartSearchIntent } {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      matchedItems: items,
      intent: { isComparisonIntent: false, comparisonItemIds: [], intentSummary: null },
    };
  }

  const qLower = trimmed.toLowerCase();

  // 1. Check for "vs" comparison queries e.g. "RTX 5070 vs RTX 4070"
  if (qLower.includes(' vs ') || qLower.includes(' versus ')) {
    const parts = qLower
      .split(/\s+(?:vs|versus)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const matched = items.filter((item) => {
        const hay = `${item.title} ${item.shortTitle} ${item.category} ${item.shortDescription}`.toLowerCase();
        return parts.some((part) => hay.includes(part));
      });
      return {
        matchedItems: matched,
        intent: {
          isComparisonIntent: matched.length >= 2,
          comparisonItemIds: matched.slice(0, 3).map((m) => m.id),
          intentSummary:
            matched.length >= 2
              ? `Direct comparison match: ${matched.map((m) => m.shortTitle).join(' vs ')}`
              : null,
        },
      };
    }
  }

  // 2. Check for "under ₹80,000" or "under 80000" or "under 80k" budget queries
  const underMatch = qLower.match(/under\s*₹?\s*([\d,]+)\s*(k)?/i);
  if (underMatch) {
    const rawNum = parseFloat(underMatch[1].replace(/,/g, ''));
    const limit = underMatch[2] ? rawNum * 1000 : rawNum;
    const isLaptopQuery = qLower.includes('laptop');
    const isGpuQuery = qLower.includes('gpu') || qLower.includes('graphics');

    const matched = items.filter((item) => {
      if (item.priceINR === null || item.priceINR > limit) return false;
      if (isLaptopQuery && item.category !== 'Gaming Laptops') return false;
      if (isGpuQuery && item.category !== 'Graphics Cards') return false;
      return true;
    });

    return {
      matchedItems: matched,
      intent: {
        isComparisonIntent: false,
        comparisonItemIds: [],
        intentSummary: `Showing verified hardware & games under ₹${limit.toLocaleString('en-IN')}`,
      },
    };
  }

  // 3. Check for "best gpu for 1440p" or "1440p gpu"
  if ((qLower.includes('gpu') || qLower.includes('graphics')) && qLower.includes('1440p')) {
    const matched = items
      .filter((item) => item.category === 'Graphics Cards')
      .sort((a, b) => b.benchmarkStrip.values['1440p'] - a.benchmarkStrip.values['1440p']);

    return {
      matchedItems: matched,
      intent: {
        isComparisonIntent: matched.length >= 2,
        comparisonItemIds: matched.slice(0, 3).map((m) => m.id),
        intentSummary: 'Ranked by 1440p Ultra Gaming Performance & Value',
      },
    };
  }

  // 4. General token-based semantic match across title, category, genres, specs, and description
  const tokens = qLower
    .replace(/[^\w\s₹\d.-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !['for', 'the', 'and', 'best', 'fps', 'review', 'test'].includes(t));

  const searchTerms = tokens.length > 0 ? tokens : [qLower];

  const matched = items.filter((item) => {
    const specText = item.hardwareDetails
      ? Object.values(item.hardwareDetails.technicalSpecs).join(' ')
      : item.gameDetails
        ? `${item.gameDetails.developer} ${item.gameDetails.engine}`
        : '';

    const haystack = [
      item.title,
      item.shortTitle,
      item.category,
      item.kickerText,
      item.shortDescription,
      item.performanceTier,
      ...item.platforms,
      ...item.genres,
      specText,
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.every((term) => {
      if (term === 'gpu') return item.category === 'Graphics Cards' || haystack.includes('gpu');
      if (term === 'cpu') return item.category === 'Processors' || haystack.includes('cpu');
      if (term === 'laptop' || term === 'laptops')
        return item.category === 'Gaming Laptops' || haystack.includes('laptop');
      if (term === 'monitor' || term === 'monitors')
        return item.category === 'Gaming Monitors' || haystack.includes('monitor');
      return haystack.includes(term);
    });
  });

  return {
    matchedItems: matched,
    intent: {
      isComparisonIntent: false,
      comparisonItemIds: [],
      intentSummary: qLower.includes('fps')
        ? 'Showing benchmarked FPS telemetry for matching titles'
        : null,
    },
  };
}

export function filterAndSortCatalog(
  items: CatalogItem[],
  filters: FilterState
): CatalogItem[] {
  const { matchedItems } = analyzeSearchIntent(filters.searchQuery, items);

  const filtered = matchedItems.filter((item) => {
    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }
    if (filters.platform !== 'All' && !item.platforms.includes(filters.platform)) {
      return false;
    }
    if (filters.genre !== 'All' && !item.genres.includes(filters.genre)) {
      return false;
    }
    if (
      filters.performanceTier !== 'All' &&
      item.performanceTier !== filters.performanceTier
    ) {
      return false;
    }
    if (!matchesPriceRange(item.priceINR, filters.priceRange)) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'Featured':
      sorted.sort((a, b) => a.featuredRank - b.featuredRank);
      break;
    case 'Highest Rated':
      sorted.sort((a, b) => b.overallScore - a.overallScore);
      break;
    case 'Best Performance':
      sorted.sort(
        (a, b) => b.benchmarkStrip.values['1440p'] - a.benchmarkStrip.values['1440p']
      );
      break;
    case 'Most Reviewed':
      sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    case 'Recently Released':
      sorted.sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
      break;
  }

  return sorted;
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.category !== 'All' ||
    filters.platform !== 'All' ||
    filters.genre !== 'All' ||
    filters.performanceTier !== 'All' ||
    filters.priceRange !== 'All' ||
    filters.searchQuery.trim() !== ''
  );
}

/**
 * Calculates deterministic, realistic game benchmark metrics when the user toggles
 * Resolution, Graphics Preset (Low / Medium / High / Ultra), Ray Tracing, and Upscaling (DLSS / FSR / XeSS).
 */
export function computeGameBenchmarkMetrics(
  baseUltraFps: { '1080p': number; '1440p': number; '4K': number },
  onePercentLowRatio: number,
  resolution: ResolutionKey,
  preset: GraphicsPresetKey,
  rayTracing: boolean,
  upscaling: UpscalingTech
): {
  avgFps: number;
  onePercentLowFps: number;
  frameTimeMs: number;
} {
  const base = baseUltraFps[resolution];

  const presetMultiplier: Record<GraphicsPresetKey, number> = {
    Low: 1.48,
    Medium: 1.29,
    High: 1.14,
    Ultra: 1.0,
  };

  const rtMultiplier = rayTracing ? 0.66 : 1.0;

  const upscalingMultiplier: Record<UpscalingTech, number> = {
    Off: 1.0,
    DLSS: 1.42,
    FSR: 1.38,
    XeSS: 1.33,
  };

  const rawAvg =
    base * presetMultiplier[preset] * rtMultiplier * upscalingMultiplier[upscaling];
  const avgFps = Math.max(18, Math.round(rawAvg));

  // Ray tracing slightly widens 1% low variance unless upscaling is active
  const effectiveLowRatio = rayTracing
    ? Math.max(0.68, onePercentLowRatio - 0.04)
    : onePercentLowRatio;
  const onePercentLowFps = Math.max(12, Math.round(avgFps * effectiveLowRatio));
  const frameTimeMs = Number((1000 / avgFps).toFixed(1));

  return {
    avgFps,
    onePercentLowFps,
    frameTimeMs,
  };
}

export function formatINR(priceINR: number | null): string {
  if (priceINR === null || Number.isNaN(priceINR)) {
    return 'Price unavailable';
  }
  return `INR ${priceINR.toLocaleString('en-IN')}`;
}
