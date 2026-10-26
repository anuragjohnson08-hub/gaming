import {
  CatalogItem,
  GraphicsPresetKey,
  ResolutionKey,
  UpscalingTech,
} from '../types/nexus';

export type SpecComplianceStatus =
  | 'Exceeds Recommended'
  | 'Meets Recommended'
  | 'Meets Minimum'
  | 'Below Minimum';

export type PlayabilityTier =
  | 'Competitive (120+ FPS)'
  | 'Smooth (60+ FPS)'
  | 'Playable (30–59 FPS)'
  | 'Struggling (20–29 FPS)'
  | 'Unplayable (<20 FPS)';

export type HardwareRigGroup =
  | 'catalog'
  | 'below-minimum'
  | 'baseline-desktop'
  | 'laptop-handheld';

export interface HardwareRigProfile {
  id: string;
  /** Matches CatalogItem.id when this rig is in the main NEXUS catalog */
  catalogItemId?: string;
  name: string;
  shortName: string;
  categoryLabel: string;
  group: HardwareRigGroup;
  vramGB: number;
  systemRamGB: number;
  /** Relative gaming throughput compared to Reference RTX 5080 + 9800X3D testbench (1.00) */
  relativeScale: number;
  supportsHardwareRT: boolean;
  supportsDlss: boolean;
  supportsMeshShaders: boolean;
  priceINR: number | null;
  architectureNote: string;
}

export interface GameSpecThreshold {
  minVramGB: number;
  recVramGB: number;
  minRelativeScale: number;
  recRelativeScale: number;
  requiresMeshShaders: boolean;
  baseVram1080pUltraGB: number;
  minimumGpuLabel: string;
  recommendedGpuLabel: string;
}

export interface HardwareGamePerformanceResult {
  gameId: string;
  gameTitle: string;
  gameShortTitle: string;
  rigId: string;
  rigName: string;
  rigShortName: string;
  catalogItemId?: string;
  specStatus: SpecComplianceStatus;
  belowMinimumReasons: string[];
  avgFps: number;
  onePercentLowFps: number;
  frameTimeMs: number;
  /** Triplet of Avg FPS at 1080p, 1440p, 4K for the selected preset/RT/upscaling */
  resolutionFps: Record<ResolutionKey, number>;
  /** Best achievable FPS at 1080p Low + Upscaling for survival/below-minimum playability */
  lowSpecSurvivalFps1080p: number;
  estimatedVramGB: number;
  rigVramGB: number;
  vramBottlenecked: boolean;
  effectiveUpscaler: UpscalingTech;
  effectiveRayTracing: boolean;
  playabilityTier: PlayabilityTier;
  survivalTuningTip: string;
}

export const HARDWARE_TEST_RIGS: HardwareRigProfile[] = [
  {
    id: 'rig-reference-rtx-5080',
    name: 'RTX 5080 16GB + Ryzen 7 9800X3D (Lab Reference)',
    shortName: 'RTX 5080 16GB Ref',
    categoryLabel: 'Enthusiast Reference',
    group: 'baseline-desktop',
    vramGB: 16,
    systemRamGB: 32,
    relativeScale: 1.0,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 118000,
    architectureNote: 'Blackwell Flagship Testbench · 16GB GDDR7',
  },
  {
    id: 'rig-cpu-9800x3d',
    catalogItemId: 'cpu-ryzen-7-9800x3d',
    name: 'AMD Ryzen 7 9800X3D (Paired w/ RTX 5080 Testbed)',
    shortName: 'Ryzen 7 9800X3D',
    categoryLabel: 'Processors',
    group: 'catalog',
    vramGB: 16,
    systemRamGB: 32,
    relativeScale: 1.04,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 46900,
    architectureNote: '8C/16T · 96MB 2nd-Gen 3D V-Cache',
  },
  {
    id: 'rig-rx-9070-xt',
    catalogItemId: 'gpu-rx-9070-xt',
    name: 'AMD Radeon RX 9070 XT 16GB',
    shortName: 'RX 9070 XT 16GB',
    categoryLabel: 'Graphics Cards',
    group: 'catalog',
    vramGB: 16,
    systemRamGB: 32,
    relativeScale: 0.86,
    supportsHardwareRT: true,
    supportsDlss: false,
    supportsMeshShaders: true,
    priceINR: 58900,
    architectureNote: 'RDNA 4 · 16GB GDDR6 · FSR 4 ML',
  },
  {
    id: 'rig-rtx-5070',
    catalogItemId: 'gpu-rtx-5070',
    name: 'NVIDIA GeForce RTX 5070 12GB',
    shortName: 'RTX 5070 12GB',
    categoryLabel: 'Graphics Cards',
    group: 'catalog',
    vramGB: 12,
    systemRamGB: 32,
    relativeScale: 0.84,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 62500,
    architectureNote: 'Blackwell · 12GB GDDR7 · 672 GB/s',
  },
  {
    id: 'rig-rtx-4070-super',
    catalogItemId: 'gpu-rtx-4070-super',
    name: 'NVIDIA GeForce RTX 4070 Super 12GB',
    shortName: 'RTX 4070 Super 12GB',
    categoryLabel: 'Graphics Cards',
    group: 'catalog',
    vramGB: 12,
    systemRamGB: 32,
    relativeScale: 0.71,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 54200,
    architectureNote: 'Ada Lovelace · 12GB GDDR6X',
  },
  {
    id: 'rig-zephyrus-g16',
    catalogItemId: 'laptop-zephyrus-g16-2026',
    name: 'ASUS ROG Zephyrus G16 OLED (115W Laptop GPU)',
    shortName: 'ROG Zephyrus G16',
    categoryLabel: 'Gaming Laptops',
    group: 'catalog',
    vramGB: 8,
    systemRamGB: 32,
    relativeScale: 0.66,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 189990,
    architectureNote: 'Ryzen AI 9 HX 370 · 115W Laptop GPU · 32GB LPDDR5X',
  },
  {
    id: 'rig-lenovo-loq-15',
    catalogItemId: 'laptop-lenovo-loq-15',
    name: 'Lenovo LOQ 15 Gen 9 (RTX 4060 8GB Laptop)',
    shortName: 'Lenovo LOQ 15 (4060)',
    categoryLabel: 'Gaming Laptops',
    group: 'catalog',
    vramGB: 8,
    systemRamGB: 16,
    relativeScale: 0.52,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 76990,
    architectureNote: 'Full 115W RTX 4060 Laptop 8GB · 16GB DDR5',
  },
  {
    id: 'rig-monitor-aw2725df',
    catalogItemId: 'monitor-aw2725df-oled',
    name: 'Alienware AW2725DF 360Hz QD-OLED (RTX 5070 Host Rig)',
    shortName: 'AW2725DF QD-OLED Rig',
    categoryLabel: 'Gaming Monitors',
    group: 'catalog',
    vramGB: 12,
    systemRamGB: 32,
    relativeScale: 0.84,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 74500,
    architectureNote: '2560x1440 360Hz QD-OLED · 0.03ms GtG',
  },
  {
    id: 'rig-peripheral-viper-v3',
    catalogItemId: 'peripheral-razer-viper-v3-pro',
    name: 'Razer Viper V3 Pro 8KHz (Esports 9800X3D Testbed)',
    shortName: 'Viper V3 Pro 8K Rig',
    categoryLabel: 'Gaming Peripherals',
    group: 'catalog',
    vramGB: 16,
    systemRamGB: 32,
    relativeScale: 0.96,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 14499,
    architectureNote: '8,000 Hz HyperPolling · 0.54ms Click Latency',
  },
  {
    id: 'rig-rtx-3060-12gb',
    name: 'NVIDIA GeForce RTX 3060 12GB (Entry Desktop)',
    shortName: 'RTX 3060 12GB',
    categoryLabel: 'Entry Desktop GPU',
    group: 'baseline-desktop',
    vramGB: 12,
    systemRamGB: 16,
    relativeScale: 0.49,
    supportsHardwareRT: true,
    supportsDlss: true,
    supportsMeshShaders: true,
    priceINR: 24500,
    architectureNote: 'Ampere · 12GB GDDR6 · Mainstream Minimum Baseline',
  },
  {
    id: 'rig-rx-6600-8gb',
    name: 'AMD Radeon RX 6600 8GB (Budget 1080p Desktop)',
    shortName: 'Radeon RX 6600 8GB',
    categoryLabel: 'Budget Desktop GPU',
    group: 'baseline-desktop',
    vramGB: 8,
    systemRamGB: 16,
    relativeScale: 0.43,
    supportsHardwareRT: true,
    supportsDlss: false,
    supportsMeshShaders: true,
    priceINR: 19200,
    architectureNote: 'RDNA 2 · 8GB GDDR6 · 132W Board Power',
  },
  {
    id: 'rig-gtx-1650-4gb',
    name: 'GeForce GTX 1650 4GB (Below-Minimum Legacy GPU)',
    shortName: 'GTX 1650 4GB (Low-Spec)',
    categoryLabel: 'Below-Minimum GPU',
    group: 'below-minimum',
    vramGB: 4,
    systemRamGB: 16,
    relativeScale: 0.25,
    supportsHardwareRT: false,
    supportsDlss: false,
    supportsMeshShaders: true,
    priceINR: 11500,
    architectureNote: 'Turing TU117 · 4GB VRAM · No RT Cores / No DLSS',
  },
  {
    id: 'rig-radeon-780m-handheld',
    name: 'AMD Radeon 780M iGPU / Handheld APU (Sub-Minimum)',
    shortName: 'Radeon 780M iGPU / Handheld',
    categoryLabel: 'Handheld / iGPU',
    group: 'below-minimum',
    vramGB: 4,
    systemRamGB: 16,
    relativeScale: 0.21,
    supportsHardwareRT: false,
    supportsDlss: false,
    supportsMeshShaders: true,
    priceINR: 42000,
    architectureNote: 'RDNA 3 Integrated 12CU · 4GB Shared Carveout RAM',
  },
  {
    id: 'rig-gtx-1050ti-4gb',
    name: 'GeForce GTX 1050 Ti 4GB (Below-Minimum Pascal)',
    shortName: 'GTX 1050 Ti 4GB (Legacy)',
    categoryLabel: 'Below-Minimum GPU',
    group: 'below-minimum',
    vramGB: 4,
    systemRamGB: 8,
    relativeScale: 0.18,
    supportsHardwareRT: false,
    supportsDlss: false,
    supportsMeshShaders: false,
    priceINR: 8900,
    architectureNote: 'Pascal GP107 (2016) · 4GB GDDR5 · No Mesh Shaders',
  },
  {
    id: 'rig-iris-xe-igpu',
    name: 'Intel Iris Xe 80EU Laptop iGPU (Ultra-Low-Spec)',
    shortName: 'Intel Iris Xe iGPU (2GB)',
    categoryLabel: 'Sub-Minimum Office iGPU',
    group: 'below-minimum',
    vramGB: 2,
    systemRamGB: 8,
    relativeScale: 0.12,
    supportsHardwareRT: false,
    supportsDlss: false,
    supportsMeshShaders: false,
    priceINR: 38000,
    architectureNote: 'Integrated Shared DDR4 · 2GB Dynamic VRAM Ceiling',
  },
];

export const GAME_SPEC_THRESHOLDS: Record<string, GameSpecThreshold> = {
  'game-cyberpunk-2077': {
    minVramGB: 6,
    recVramGB: 12,
    minRelativeScale: 0.30,
    recRelativeScale: 0.65,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 8.4,
    minimumGpuLabel: 'GTX 1060 6GB / RX 580 8GB',
    recommendedGpuLabel: 'RTX 4070 Super 12GB / RX 7900 GRE',
  },
  'game-black-myth-wukong': {
    minVramGB: 6,
    recVramGB: 12,
    minRelativeScale: 0.32,
    recRelativeScale: 0.68,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 8.8,
    minimumGpuLabel: 'GTX 1060 6GB / RX 580 8GB',
    recommendedGpuLabel: 'RTX 4070 12GB / RX 7800 XT 16GB',
  },
  'game-forza-horizon-5': {
    minVramGB: 4,
    recVramGB: 8,
    minRelativeScale: 0.20,
    recRelativeScale: 0.48,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 6.4,
    minimumGpuLabel: 'GTX 970 4GB / RX 470 4GB',
    recommendedGpuLabel: 'RTX 3060 Ti 8GB / RX 6700 XT 12GB',
  },
  'game-civilization-vii': {
    minVramGB: 2,
    recVramGB: 6,
    minRelativeScale: 0.15,
    recRelativeScale: 0.42,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 4.2,
    minimumGpuLabel: 'GTX 1050 Ti 4GB / RX 470 / Arc A380',
    recommendedGpuLabel: 'RTX 3060 12GB / RX 6600 XT 8GB',
  },
  'game-alan-wake-2': {
    minVramGB: 6,
    recVramGB: 12,
    minRelativeScale: 0.38,
    recRelativeScale: 0.70,
    requiresMeshShaders: true,
    baseVram1080pUltraGB: 9.2,
    minimumGpuLabel: 'RTX 2060 6GB / RX 6600 8GB (Mesh Shaders)',
    recommendedGpuLabel: 'RTX 4070 12GB / RX 7800 XT 16GB',
  },
  'game-counter-strike-2': {
    minVramGB: 2,
    recVramGB: 8,
    minRelativeScale: 0.11,
    recRelativeScale: 0.45,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 3.6,
    minimumGpuLabel: 'GTX 950 2GB / Iris Xe iGPU',
    recommendedGpuLabel: 'RTX 4060 8GB / RX 7600 8GB',
  },
  'game-elden-ring-sote': {
    minVramGB: 4,
    recVramGB: 8,
    minRelativeScale: 0.24,
    recRelativeScale: 0.50,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 5.8,
    minimumGpuLabel: 'GTX 1060 3GB / RX 580 4GB',
    recommendedGpuLabel: 'RTX 3060 Ti 8GB / RX 6750 XT 12GB',
  },
  'game-red-dead-redemption-2': {
    minVramGB: 2,
    recVramGB: 6,
    minRelativeScale: 0.17,
    recRelativeScale: 0.40,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 5.4,
    minimumGpuLabel: 'GTX 770 2GB / Radeon R9 280 3GB',
    recommendedGpuLabel: 'GTX 1060 6GB / RX 480 4GB',
  },
  'game-starfield': {
    minVramGB: 8,
    recVramGB: 12,
    minRelativeScale: 0.36,
    recRelativeScale: 0.68,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 8.2,
    minimumGpuLabel: 'GTX 1070 Ti 8GB / RX 5700 8GB',
    recommendedGpuLabel: 'RTX 4070 12GB / RX 7800 XT 16GB',
  },
  'game-gta-v-enhanced': {
    minVramGB: 4,
    recVramGB: 8,
    minRelativeScale: 0.18,
    recRelativeScale: 0.46,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 5.2,
    minimumGpuLabel: 'GTX 1630 4GB / RX 6400 4GB',
    recommendedGpuLabel: 'RTX 3060 8GB / RX 6600 XT 8GB',
  },
};

export function getRigForCatalogHardware(hardwareItemId: string): HardwareRigProfile {
  const found = HARDWARE_TEST_RIGS.find((r) => r.catalogItemId === hardwareItemId);
  return found ?? HARDWARE_TEST_RIGS[0];
}

export function classifyPlayability(avgFps: number): PlayabilityTier {
  if (avgFps >= 120) return 'Competitive (120+ FPS)';
  if (avgFps >= 60) return 'Smooth (60+ FPS)';
  if (avgFps >= 30) return 'Playable (30–59 FPS)';
  if (avgFps >= 20) return 'Struggling (20–29 FPS)';
  return 'Unplayable (<20 FPS)';
}

function computeSingleResolutionFps(
  baseRefFps: number,
  rig: HardwareRigProfile,
  threshold: GameSpecThreshold,
  resolution: ResolutionKey,
  preset: GraphicsPresetKey,
  effectiveRT: boolean,
  effectiveUpscaler: UpscalingTech
): {
  avgFps: number;
  vramRequiredGB: number;
  vramBottlenecked: boolean;
} {
  const presetFpsMult: Record<GraphicsPresetKey, number> = {
    Low: 1.54,
    Medium: 1.32,
    High: 1.15,
    Ultra: 1.0,
  };

  const presetVramMult: Record<GraphicsPresetKey, number> = {
    Low: 0.56,
    Medium: 0.72,
    High: 0.86,
    Ultra: 1.0,
  };

  const resVramMult: Record<ResolutionKey, number> = {
    '1080p': 1.0,
    '1440p': 1.24,
    '4K': 1.62,
  };

  const upscaleVramRelief: Record<UpscalingTech, number> = {
    Off: 1.0,
    DLSS: 0.86,
    FSR: 0.87,
    XeSS: 0.88,
  };

  const upscaleFpsMult: Record<UpscalingTech, number> = {
    Off: 1.0,
    DLSS: 1.44,
    FSR: 1.39,
    XeSS: 1.34,
  };

  const rtVramAdd = effectiveRT ? 1.8 : 0;
  const vramRequiredGB = Number(
    (
      (threshold.baseVram1080pUltraGB *
        presetVramMult[preset] *
        resVramMult[resolution] +
        rtVramAdd) *
      upscaleVramRelief[effectiveUpscaler]
    ).toFixed(1)
  );

  const vramBottlenecked = vramRequiredGB > rig.vramGB;
  const vramOverflowRatio = vramBottlenecked
    ? Math.max(0.54, Math.pow(rig.vramGB / vramRequiredGB, 0.65))
    : 1.0;

  // Mesh shader penalty if game mandates DX12 Mesh Shaders and GPU lacks hardware support
  const meshShaderMult =
    threshold.requiresMeshShaders && !rig.supportsMeshShaders ? 0.65 : 1.0;

  // Ray tracing penalty
  const rtFpsMult = effectiveRT ? (rig.supportsHardwareRT ? 0.65 : 0.38) : 1.0;

  const rawFps =
    baseRefFps *
    rig.relativeScale *
    presetFpsMult[preset] *
    rtFpsMult *
    upscaleFpsMult[effectiveUpscaler] *
    vramOverflowRatio *
    meshShaderMult;

  const minFloor = resolution === '1080p' ? 9 : resolution === '1440p' ? 6 : 3;
  const avgFps = Math.max(minFloor, Math.round(rawFps));

  return {
    avgFps,
    vramRequiredGB,
    vramBottlenecked,
  };
}

/**
 * Computes deterministic performance telemetry for ANY game on ANY hardware rig,
 * including rigs that fall below the game's official minimum requirements.
 */
export function computeGameOnHardwarePerformance(
  game: CatalogItem,
  rig: HardwareRigProfile,
  resolution: ResolutionKey = '1440p',
  preset: GraphicsPresetKey = 'Ultra',
  rayTracing: boolean = false,
  upscaling: UpscalingTech = 'Off'
): HardwareGamePerformanceResult {
  const details = game.gameDetails!;
  const threshold: GameSpecThreshold = GAME_SPEC_THRESHOLDS[game.id] ?? {
    minVramGB: 4,
    recVramGB: 8,
    minRelativeScale: 0.25,
    recRelativeScale: 0.6,
    requiresMeshShaders: false,
    baseVram1080pUltraGB: 6.5,
    minimumGpuLabel: details.minRequirements.gpu,
    recommendedGpuLabel: details.recRequirements.gpu,
  };

  // Determine SpecComplianceStatus & explicit below-minimum reasons
  const belowMinimumReasons: string[] = [];
  if (rig.vramGB < threshold.minVramGB) {
    belowMinimumReasons.push(
      `${rig.vramGB} GB VRAM is below the ${threshold.minVramGB} GB minimum (${threshold.minimumGpuLabel})`
    );
  }
  if (rig.relativeScale < threshold.minRelativeScale) {
    belowMinimumReasons.push(
      `Shader throughput (${Math.round(rig.relativeScale * 100)}% of ref) is below official minimum tier (${threshold.minimumGpuLabel})`
    );
  }
  if (threshold.requiresMeshShaders && !rig.supportsMeshShaders) {
    belowMinimumReasons.push(
      'Lacks DX12 Ultimate Mesh Shaders — runs via heavy vertex-shader emulation fallback'
    );
  }

  let specStatus: SpecComplianceStatus;
  if (belowMinimumReasons.length > 0) {
    specStatus = 'Below Minimum';
  } else if (
    rig.relativeScale >= threshold.recRelativeScale * 1.15 &&
    rig.vramGB >= threshold.recVramGB
  ) {
    specStatus = 'Exceeds Recommended';
  } else if (
    rig.relativeScale >= threshold.recRelativeScale &&
    rig.vramGB >= threshold.recVramGB
  ) {
    specStatus = 'Meets Recommended';
  } else {
    specStatus = 'Meets Minimum';
  }

  // Resolve supported upscaling and ray tracing on this rig + game combination
  const effectiveRayTracing = details.supportedTech.rayTracing && rayTracing;
  let effectiveUpscaler: UpscalingTech = upscaling;
  if (upscaling === 'DLSS' && (!details.supportedTech.dlss || !rig.supportsDlss)) {
    effectiveUpscaler = details.supportedTech.fsr ? 'FSR' : 'Off';
  } else if (upscaling === 'FSR' && !details.supportedTech.fsr) {
    effectiveUpscaler = 'Off';
  } else if (upscaling === 'XeSS' && !details.supportedTech.xess) {
    effectiveUpscaler = details.supportedTech.fsr ? 'FSR' : 'Off';
  }

  const res1080 = computeSingleResolutionFps(
    details.baseUltraFps['1080p'],
    rig,
    threshold,
    '1080p',
    preset,
    effectiveRayTracing,
    effectiveUpscaler
  );
  const res1440 = computeSingleResolutionFps(
    details.baseUltraFps['1440p'],
    rig,
    threshold,
    '1440p',
    preset,
    effectiveRayTracing,
    effectiveUpscaler
  );
  const res4K = computeSingleResolutionFps(
    details.baseUltraFps['4K'],
    rig,
    threshold,
    '4K',
    preset,
    effectiveRayTracing,
    effectiveUpscaler
  );

  const activeResCalc =
    resolution === '1080p' ? res1080 : resolution === '1440p' ? res1440 : res4K;

  // Calculate best low-spec survival FPS (1080p Low + best supported upscaler, RT Off)
  const survivalUpscaler: UpscalingTech =
    details.supportedTech.dlss && rig.supportsDlss
      ? 'DLSS'
      : details.supportedTech.fsr
      ? 'FSR'
      : details.supportedTech.xess
      ? 'XeSS'
      : 'Off';

  const survivalCalc = computeSingleResolutionFps(
    details.baseUltraFps['1080p'],
    rig,
    threshold,
    '1080p',
    'Low',
    false,
    survivalUpscaler
  );

  // 1% Low calculation accounts for VRAM overflow stutter and RT overhead
  let lowRatio = details.frameTimeConsistency.onePercentLowRatio;
  if (activeResCalc.vramBottlenecked) {
    lowRatio = Math.max(0.52, lowRatio - 0.18);
  } else if (specStatus === 'Below Minimum') {
    lowRatio = Math.max(0.62, lowRatio - 0.08);
  } else if (effectiveRayTracing) {
    lowRatio = Math.max(0.68, lowRatio - 0.04);
  }

  const avgFps = activeResCalc.avgFps;
  const onePercentLowFps = Math.max(5, Math.round(avgFps * lowRatio));
  const frameTimeMs = Number((1000 / avgFps).toFixed(1));
  const playabilityTier = classifyPlayability(avgFps);

  // Build contextual survival / optimization tip
  let survivalTuningTip: string;
  if (specStatus === 'Below Minimum') {
    survivalTuningTip = `Below Minimum Spec: Switch to 1080p Low${
      survivalUpscaler !== 'Off' ? ` + ${survivalUpscaler} Quality` : ' (900p Scale)'
    } (RT Off) to reach ~${survivalCalc.avgFps} FPS and keep VRAM under ${rig.vramGB} GB.`;
  } else if (activeResCalc.vramBottlenecked) {
    survivalTuningTip = `VRAM Buffer Exceeded (${activeResCalc.vramRequiredGB} GB needed vs ${rig.vramGB} GB available): Lower Texture Quality to Medium or enable ${
      survivalUpscaler !== 'Off' ? survivalUpscaler : '1080p output'
    } to eliminate PCIe stutter.`;
  } else if (avgFps < 60) {
    survivalTuningTip = `To cross 60+ FPS on ${rig.shortName}, step down from ${preset} to High/Medium or enable ${
      survivalUpscaler !== 'Off' ? `${survivalUpscaler} Quality` : '1080p resolution'
    }.`;
  } else {
    survivalTuningTip = `Optimal Headroom: Sustains ${avgFps} Avg FPS (${onePercentLowFps} 1% Low) at ${resolution} ${preset} within ${rig.vramGB} GB VRAM budget.`;
  }

  return {
    gameId: game.id,
    gameTitle: game.title,
    gameShortTitle: game.shortTitle,
    rigId: rig.id,
    rigName: rig.name,
    rigShortName: rig.shortName,
    catalogItemId: rig.catalogItemId,
    specStatus,
    belowMinimumReasons,
    avgFps,
    onePercentLowFps,
    frameTimeMs,
    resolutionFps: {
      '1080p': res1080.avgFps,
      '1440p': res1440.avgFps,
      '4K': res4K.avgFps,
    },
    lowSpecSurvivalFps1080p: survivalCalc.avgFps,
    estimatedVramGB: activeResCalc.vramRequiredGB,
    rigVramGB: rig.vramGB,
    vramBottlenecked: activeResCalc.vramBottlenecked,
    effectiveUpscaler,
    effectiveRayTracing,
    playabilityTier,
    survivalTuningTip,
  };
}
