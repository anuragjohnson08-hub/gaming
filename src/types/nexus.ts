export type CategoryType =
  | 'All'
  | 'Games'
  | 'Graphics Cards'
  | 'Processors'
  | 'Gaming Laptops'
  | 'Gaming Monitors'
  | 'Gaming Peripherals';

export type PlatformType =
  | 'All'
  | 'PC'
  | 'PlayStation'
  | 'Xbox'
  | 'Nintendo Switch'
  | 'Mobile';

export type GenreType =
  | 'All'
  | 'Action'
  | 'RPG'
  | 'FPS'
  | 'Racing'
  | 'Strategy'
  | 'Open World'
  | 'Simulation';

export type PerformanceTierType =
  | 'All'
  | 'Entry Level'
  | 'Mid-Range'
  | 'High-End'
  | 'Enthusiast';

export type PriceRangeType =
  | 'All'
  | 'Under INR 10,000'
  | 'INR 10,000 – 50,000'
  | 'INR 50,000 – 80,000'
  | 'Above INR 80,000';

export type SortOption =
  | 'Featured'
  | 'Highest Rated'
  | 'Best Performance'
  | 'Most Reviewed'
  | 'Recently Released';

export type ResolutionKey = '1080p' | '1440p' | '4K';
export type GraphicsPresetKey = 'Low' | 'Medium' | 'High' | 'Ultra';
export type UpscalingTech = 'Off' | 'DLSS' | 'FSR' | 'XeSS';

export interface ResolutionFpsTriplet {
  '1080p': number;
  '1440p': number;
  '4K': number;
}

export interface SystemRequirements {
  os: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
  notes: string;
}

export interface GameReviewDetails {
  overview: string;
  developer: string;
  publisher: string;
  engine: string;
  testVersion: string;
  testDriver: string;
  testSystemSummary: string;
  gameplayScore: number;
  graphicsScore: number;
  performanceScore: number;
  optimizationScore: number;
  gameplayAssessment: string;
  graphicsAssessment: string;
  optimizationAssessment: string;
  minRequirements: SystemRequirements;
  recRequirements: SystemRequirements;
  cpuPerformanceAnalysis: string;
  gpuPerformanceAnalysis: string;
  frameTimeConsistency: {
    rating: 'Excellent' | 'Good' | 'Moderate' | 'Stutter-Prone';
    onePercentLowRatio: number; // e.g., 0.84 means 1% low is 84% of avg FPS
    summary: string;
  };
  supportedTech: {
    rayTracing: boolean;
    dlss: boolean;
    fsr: boolean;
    xess: boolean;
  };
  rayTracingAssessment: string;
  upscalingAssessment: string;
  /** Base Ultra Native FPS at 1080p, 1440p, 4K on reference testbench */
  baseUltraFps: ResolutionFpsTriplet;
  verdict: string;
  pros: string[];
  cons: string[];
}

export interface CompetitorBenchmark {
  name: string;
  fps1440p: number;
  priceINR: number | null;
  isCurrent?: boolean;
}

export interface HardwareComparisonSpecs {
  architecture?: string;
  vramOrCache?: string;
  memoryBandwidth?: string;
  coreCount?: string;
  threadCount?: string;
  boostClock?: string;
  displaySpec?: string;
  batteryWh?: string;
  coolingSolution?: string;
  platformCompatibility?: string;
  upscalingSupport?: string;
  rayTracingTier?: string;
  weightOrForm?: string;
}

export interface HardwareReviewDetails {
  manufacturer: string;
  modelCode: string;
  priceINR: number | null;
  priceSource: string;
  priceLastUpdated: string;
  gamingScore: number;
  valueScore: number;
  efficiencyScore: number;
  productivityScore: number;
  priceToPerformanceScore: number;
  powerConsumptionW: number | null;
  temperatureLoadC: number | null;
  noiseLevelDb: number | null;
  perfPerRupeeSummary: string;
  technicalSpecs: Record<string, string>;
  comparisonSpecs: HardwareComparisonSpecs;
  pros: string[];
  cons: string[];
  recommendedUseCases: string[];
  competitors: CompetitorBenchmark[];
  buyingRecommendation: string;
  testSystemSummary: string;
}

export type ArtworkVariant =
  | 'gpu-rtx-5070'
  | 'gpu-rx-9070xt'
  | 'gpu-rtx-4070s'
  | 'cpu-ryzen-9800x3d'
  | 'laptop-zephyrus-g16'
  | 'laptop-lenovo-loq'
  | 'monitor-aw2725df'
  | 'peripheral-viper-v3'
  | 'game-cyberpunk'
  | 'game-wukong'
  | 'game-forza'
  | 'game-civ7'
  | 'game-alan-wake-2'
  | 'game-cs2'
  | 'game-elden-ring'
  | 'game-rdr2'
  | 'game-starfield'
  | 'game-gtav-rt';

export interface CatalogItem {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  itemType: 'game' | 'hardware';
  category: Exclude<CategoryType, 'All'>;
  platforms: Exclude<PlatformType, 'All'>[];
  genres: Exclude<GenreType, 'All'>[];
  performanceTier: Exclude<PerformanceTierType, 'All'>;
  priceINR: number | null;
  releaseDate: string; // YYYY-MM-DD
  featuredRank: number;
  reviewCount: number;
  overallScore: number; // out of 10, e.g. 9.4
  starRating: number; // out of 5, e.g. 4.7
  kickerText: string; // e.g. "EDITOR'S PICK · 4K READY"
  shortDescription: string;
  artworkVariant: ArtworkVariant;
  isBenchmarked: boolean;
  dataStatusLabel: 'DEMO DATA' | 'NOT BENCHMARKED';
  benchmarkStrip: {
    label: string;
    unit: 'FPS' | 'PTS' | 'HZ';
    values: ResolutionFpsTriplet;
  };
  cardMetrics: {
    label: string;
    score: string;
    type: 'editorial' | 'measured';
  }[];
  gameDetails?: GameReviewDetails;
  hardwareDetails?: HardwareReviewDetails;
}

export interface FilterState {
  category: CategoryType;
  platform: PlatformType;
  genre: GenreType;
  performanceTier: PerformanceTierType;
  priceRange: PriceRangeType;
  sortBy: SortOption;
  searchQuery: string;
}
