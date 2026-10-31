import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Code2,
  Cpu,
  Gauge,
  HardDrive,
  Loader2,
  Monitor,
  Sparkles,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ResolutionKey } from '../types/nexus';

export interface HardwareIntelligenceReport {
  cpu: string;
  gpu: string;
  ram: string;
  game: string;
  resolution: string;
  avgFps: number;
  onePercentLowFps: number;
  frameTimeMs: number;
  vramUsageGb: number;
  systemPowerWatts: number;
  recommendedPreset: string;
  recommendedUpscaler: string;
  bottleneckComponent: string;
  playabilityTier: string;
  technicalVerdict: string;
  optimizationTips: string[];
}

const PRESET_CPUS = [
  'AMD Ryzen 7 9800X3D (8C/16T)',
  'AMD Ryzen 5 7600X (6C/12T)',
  'Intel Core i5-13400F (10C/16T)',
  'AMD Ryzen 5 5600X (6C/12T)',
  'Intel Core Ultra 9 285K (24C/24T)',
];

const PRESET_GPUS = [
  'NVIDIA GeForce RTX 5070 12GB GDDR7',
  'AMD Radeon RX 9070 XT 16GB GDDR6',
  'NVIDIA GeForce RTX 4060 8GB GDDR6',
  'NVIDIA GeForce GTX 1650 4GB GDDR6',
  'NVIDIA GeForce RTX 5090 32GB GDDR7',
];

const PRESET_RAMS = [
  '32GB DDR5-6000 CL30 Dual-Channel',
  '16GB DDR5-5600 CL36 Dual-Channel',
  '16GB DDR4-3200 CL16 Dual-Channel',
  '64GB DDR5-6400 CL32 Dual-Channel',
  '8GB DDR4-2666 Single-Channel',
];

const PRESET_GAMES = [
  'Cyberpunk 2077: Phantom Liberty',
  'Alan Wake 2',
  'Black Myth: Wukong',
  'Counter-Strike 2',
  'Elden Ring: Shadow of the Erdtree',
  'Forza Horizon 5',
];

export const HardwareIntelligenceEngine: React.FC = () => {
  const [cpu, setCpu] = useState(PRESET_CPUS[0]);
  const [gpu, setGpu] = useState(PRESET_GPUS[0]);
  const [ram, setRam] = useState(PRESET_RAMS[0]);
  const [game, setGame] = useState(PRESET_GAMES[0]);
  const [resolution, setResolution] = useState<ResolutionKey>('1440p');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [report, setReport] = useState<HardwareIntelligenceReport>({
    cpu: PRESET_CPUS[0],
    gpu: PRESET_GPUS[0],
    ram: PRESET_RAMS[0],
    game: PRESET_GAMES[0],
    resolution: '1440p',
    avgFps: 108,
    onePercentLowFps: 89,
    frameTimeMs: 9.3,
    vramUsageGb: 10.2,
    systemPowerWatts: 345,
    recommendedPreset: 'Ultra (Ray Tracing Medium)',
    recommendedUpscaler: 'DLSS 4 Quality',
    bottleneckComponent: 'GPU Bound (99% Core Utilization)',
    playabilityTier: 'Smooth 60+ FPS / High-Refresh Ready',
    technicalVerdict:
      'The Ryzen 7 9800X3D 3D V-Cache eliminates traversal stutter in Dogtown, allowing the RTX 5070 12GB GDDR7 to sustain 108 FPS average with tight 9.3ms frame times at 1440p.',
    optimizationTips: [
      'Enable DLSS Quality (Transformer Model) to keep 1440p VRAM allocation safely under the 12GB buffer when Ray Tracing is active.',
      'Set Crowd Density to High instead of Ultra in dense city districts for a +11% uplift in 1% low frame pacing.',
      'Keep EXPO/XMP enabled on your 32GB DDR5-6000 kit to maximize Infinity Fabric bandwidth during asset streaming.',
    ],
  });

  const handleRunEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpu.trim() || !gpu.trim() || !ram.trim() || !game.trim()) {
      setErrorMsg('Please provide your CPU, GPU, RAM, and target game.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/hardware-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpu: cpu.trim(),
          gpu: gpu.trim(),
          ram: ram.trim(),
          game: game.trim(),
          resolution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || `Engine returned status ${response.status}.`
        );
      }

      setReport(data as HardwareIntelligenceReport);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to contact the NEXUS AI Hardware Intelligence Engine.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="nexus-ai-engine"
      data-testid="hardware-intelligence-engine"
      className="mt-8 pt-8 border-t border-[#2E276C]/15"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.14em] text-[#584CE8] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#584CE8]" />
            <span>NEXUS AI HARDWARE INTELLIGENCE ENGINE · GEMINI SCHEMA V1</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#312A75] tracking-tight mt-1">
            Custom Rig Telemetry & Real-World FPS Estimator
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5578] mt-1 max-w-2xl font-medium">
            Enter any CPU, GPU, system memory, target game, and resolution. Our
            AI Hardware Intelligence Engine synthesizes real-world benchmark data
            into a strict JSON telemetry schema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRawJson((prev) => !prev)}
          className="nexus-editorial-control inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-mono font-bold text-[#312A75] hover:text-[#584CE8] transition-colors cursor-pointer"
        >
          <Code2 className="w-3.5 h-3.5 text-[#584CE8]" />
          <span>{showRawJson ? 'View Visual Telemetry' : 'Inspect JSON Schema Output'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5-Column Hardware Input Form */}
        <form
          onSubmit={handleRunEstimate}
          className="lg:col-span-5 nexus-editorial-well rounded-2xl p-5 space-y-4"
        >
          <div>
            <label
              htmlFor="ai-cpu-input"
              className="block text-[10px] font-mono font-bold tracking-[0.12em] text-[#266D75] uppercase mb-1.5"
            >
              01. PROCESSOR (CPU)
            </label>
            <input
              id="ai-cpu-input"
              list="nexus-cpu-presets"
              type="text"
              value={cpu}
              onChange={(e) => setCpu(e.target.value)}
              placeholder="e.g., AMD Ryzen 7 9800X3D"
              className="w-full rounded-xl bg-white/85 border border-black/10 px-3.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#584CE8]"
            />
            <datalist id="nexus-cpu-presets">
              {PRESET_CPUS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              htmlFor="ai-gpu-input"
              className="block text-[10px] font-mono font-bold tracking-[0.12em] text-[#266D75] uppercase mb-1.5"
            >
              02. GRAPHICS CARD (GPU)
            </label>
            <input
              id="ai-gpu-input"
              list="nexus-gpu-presets"
              type="text"
              value={gpu}
              onChange={(e) => setGpu(e.target.value)}
              placeholder="e.g., NVIDIA GeForce RTX 5070 12GB"
              className="w-full rounded-xl bg-white/85 border border-black/10 px-3.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#584CE8]"
            />
            <datalist id="nexus-gpu-presets">
              {PRESET_GPUS.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="ai-ram-input"
                className="block text-[10px] font-mono font-bold tracking-[0.12em] text-[#266D75] uppercase mb-1.5"
              >
                03. SYSTEM MEMORY (RAM)
              </label>
              <input
                id="ai-ram-input"
                list="nexus-ram-presets"
                type="text"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                placeholder="e.g., 32GB DDR5-6000"
                className="w-full rounded-xl bg-white/85 border border-black/10 px-3.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#584CE8]"
              />
              <datalist id="nexus-ram-presets">
                {PRESET_RAMS.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <span className="block text-[10px] font-mono font-bold tracking-[0.12em] text-[#266D75] uppercase mb-1.5">
                04. TARGET RESOLUTION
              </span>
              <div className="grid grid-cols-3 gap-1 bg-white/85 border border-black/10 p-1 rounded-xl">
                {(['1080p', '1440p', '4K'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-1 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer tabular-nums ${
                      resolution === res
                        ? 'bg-[#584CE8] text-white'
                        : 'text-[#515E7B] hover:text-[#312A75]'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="ai-game-input"
              className="block text-[10px] font-mono font-bold tracking-[0.12em] text-[#266D75] uppercase mb-1.5"
            >
              05. TARGET GAME WORKLOAD
            </label>
            <input
              id="ai-game-input"
              list="nexus-game-presets"
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="e.g., Cyberpunk 2077: Phantom Liberty"
              className="w-full rounded-xl bg-white/85 border border-black/10 px-3.5 py-2 text-xs font-semibold text-[#1E293B] focus:outline-none focus:border-[#584CE8]"
            />
            <datalist id="nexus-game-presets">
              {PRESET_GAMES.map((gm) => (
                <option key={gm} value={gm} />
              ))}
            </datalist>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-500/12 border border-red-500/30 flex items-start gap-2 text-xs font-semibold text-red-900"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="nexus-dock-circle-active w-full py-2.5 px-4 rounded-xl font-semibold text-xs inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Benchmark Telemetry...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Estimate Real-World Performance</span>
              </>
            )}
          </button>
        </form>

        {/* Right 7-Column Telemetry & Schema Output */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {showRawJson ? (
              <motion.div
                key="raw-json-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="nexus-editorial-well rounded-2xl p-5 bg-[#1E293B]/95 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/15 text-[11px] text-emerald-300">
                  <span>APPLICATION/JSON · STRICT SCHEMA RESPONSE</span>
                  <span>200 OK</span>
                </div>
                <pre className="leading-relaxed text-[11px] text-indigo-100">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </motion.div>
            ) : (
              <motion.div
                key="visual-telemetry-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="nexus-editorial-well rounded-2xl p-5 space-y-5"
              >
                {/* Header Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#2E276C]/10">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#584CE8] uppercase block">
                      {report.game} · {report.resolution}
                    </span>
                    <h4 className="font-display text-base sm:text-lg font-extrabold text-[#312A75]">
                      {report.gpu} + {report.cpu}
                    </h4>
                  </div>
                  <span className="nexus-frosted-badge nexus-frosted-badge-teal">
                    {report.playabilityTier}
                  </span>
                </div>

                {/* Primary 4-Metric Telemetry Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="nexus-editorial-card rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#515E7B]">
                      <Gauge className="w-3.5 h-3.5 text-[#584CE8]" />
                      <span>AVERAGE FPS</span>
                    </div>
                    <div className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums mt-1">
                      {report.avgFps}{' '}
                      <span className="text-xs font-semibold text-[#584CE8]">FPS</span>
                    </div>
                  </div>

                  <div className="nexus-editorial-card rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#515E7B]">
                      <Activity className="w-3.5 h-3.5 text-[#266D75]" />
                      <span>1% LOW FPS</span>
                    </div>
                    <div className="font-mono text-2xl font-extrabold text-[#266D75] tabular-nums mt-1">
                      {report.onePercentLowFps}{' '}
                      <span className="text-xs font-semibold">FPS</span>
                    </div>
                  </div>

                  <div className="nexus-editorial-card rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#515E7B]">
                      <HardDrive className="w-3.5 h-3.5 text-[#584CE8]" />
                      <span>VRAM ALLOCATION</span>
                    </div>
                    <div className="font-mono text-2xl font-extrabold text-[#312A75] tabular-nums mt-1">
                      {Number(report.vramUsageGb).toFixed(1)}{' '}
                      <span className="text-xs font-semibold text-[#515E7B]">GB</span>
                    </div>
                  </div>

                  <div className="nexus-editorial-card rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#515E7B]">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>FRAME TIME / TDP</span>
                    </div>
                    <div className="font-mono text-lg font-extrabold text-[#312A75] tabular-nums mt-1.5">
                      {Number(report.frameTimeMs).toFixed(1)}ms · {report.systemPowerWatts}W
                    </div>
                  </div>
                </div>

                {/* Preset, Upscaler & Bottleneck Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white/70 border border-black/[0.08] rounded-xl p-3">
                    <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                      RECOMMENDED PRESET
                    </span>
                    <span className="font-bold text-[#312A75] mt-0.5 block">
                      {report.recommendedPreset}
                    </span>
                  </div>
                  <div className="bg-white/70 border border-black/[0.08] rounded-xl p-3">
                    <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                      RECOMMENDED UPSCALER
                    </span>
                    <span className="font-bold text-[#584CE8] mt-0.5 block">
                      {report.recommendedUpscaler}
                    </span>
                  </div>
                  <div className="bg-white/70 border border-black/[0.08] rounded-xl p-3">
                    <span className="text-[10px] font-mono font-bold text-[#515E7B] block">
                      LIMITING COMPONENT
                    </span>
                    <span className="font-bold text-[#266D75] mt-0.5 block">
                      {report.bottleneckComponent}
                    </span>
                  </div>
                </div>

                {/* Technical Verdict & Optimization Tips */}
                <div className="space-y-3 pt-2 border-t border-[#2E276C]/10">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#266D75] uppercase mb-1">
                      <Cpu className="w-3.5 h-3.5 text-[#584CE8]" />
                      <span>AI LAB TECHNICAL VERDICT</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1E293B] leading-relaxed font-medium">
                      {report.technicalVerdict}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#266D75] uppercase mb-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#584CE8]" />
                      <span>TUNING & FRAME-PACING RECOMMENDATIONS</span>
                    </div>
                    <ul className="space-y-1.5">
                      {report.optimizationTips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-[#334155] font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#266D75] shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
