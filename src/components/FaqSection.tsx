import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  DollarSign,
  HelpCircle,
  Layers,
  Search,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  category: 'telemetry' | 'testbench' | 'pricing' | 'ethics' | 'updates';
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  detailedPoints: string[];
  metricsBadge?: string;
}

export const BENCHMARK_FAQ_DATA: FaqItem[] = [
  {
    id: 'accuracy-variance',
    category: 'telemetry',
    categoryLabel: 'Benchmarking & Telemetry',
    question: 'How does NEXUS ensure benchmark accuracy and eliminate run-to-run variance?',
    shortAnswer:
      'Every benchmark figure is the mathematical average of three consecutive reproducible gameplay runs, conducted only after a 10-minute thermal pre-soak.',
    detailedPoints: [
      'Thermal Stabilization: All GPUs and CPUs are pre-heated with an unrecorded 10-minute burn-in loop so boost clocks settle at steady-state junction temperatures rather than artificially high cold-silicon burst frequencies.',
      'Three-Pass Validation: We execute a minimum of three identical 90-second test loops. If the variance between passes exceeds 1.5%, the dataset is discarded and repeated.',
      'Controlled Ambient Climate: Laboratory testing occurs in an environmentally stabilized room maintained at 21.0°C ± 0.5°C with clean, filtered intake airflow.',
      'Dedicated Background Isolation: Clean Windows 11 Pro installations with background telemetry, Windows Updates, Xbox Game Bar, and third-party overlays disabled.',
    ],
    metricsBadge: '±1.5% Variance Limit',
  },
  {
    id: 'frametimes-one-percent-lows',
    category: 'telemetry',
    categoryLabel: 'Benchmarking & Telemetry',
    question: 'Why do you prioritize 1% Low FPS and frame times (ms) over Average FPS?',
    shortAnswer:
      'Average FPS hides micro-stuttering and uneven frame delivery. A game running at 120 FPS with 30 FPS 1% lows feels significantly jerkier than a consistent 80 FPS presentation.',
    detailedPoints: [
      'Micro-Stutter Detection: 1% and 0.1% percentiles calculate the lowest 10 and 1 frames out of every 1,000, revealing sudden frame pacing spikes or asset streaming hiccups.',
      'Frame Time Uniformity: Real-time telemetry is recorded using OCAT and PresentMon at the Windows DWM/hardware flip level, tracking frame duration in milliseconds (e.g., 16.6ms for 60Hz, 8.3ms for 120Hz).',
      'Engine Pacing vs. Hardware Bound: We differentiate between game engine stutter (shader compilation, garbage collection) and GPU fill-rate limits so you know whether a patch or a better GPU is needed.',
    ],
    metricsBadge: 'PresentMon / OCAT 1% Low',
  },
  {
    id: 'reference-testbench',
    category: 'testbench',
    categoryLabel: 'Testbench Rig & Hardware',
    question: 'What reference testbench hardware is used to eliminate system bottlenecks?',
    shortAnswer:
      'All graphics card performance evaluations are conducted on our standardized flagship reference testbench powered by the AMD Ryzen 7 9800X3D.',
    detailedPoints: [
      'Processor: AMD Ryzen 7 9800X3D (8 Cores / 16 Threads, 104MB 3D V-Cache) running at stock Precision Boost 2 to eliminate CPU bottlenecks even at 1080p high-refresh.',
      'Memory: 32GB (2× 16GB) G.Skill Trident Z5 Neo DDR5-6000 CL30 EXPO 1:1 UCLK:MCLK.',
      'Motherboard: ASUS ROG Crosshair X670E Hero (PCIe 5.0 x16 enabled, Resizable-BAR permanently forced ON).',
      'Storage: Crucial T700 2TB PCIe Gen 5.0 NVMe SSD (DirectStorage enabled, games installed on dedicated non-OS drive).',
      'Power & Cooling: Corsair AX1200i 1200W Titanium PSU with dedicated 12V-2x6 cables; Noctua NH-D15 G2 chromax.black on an open-air Dimastech bench.',
    ],
    metricsBadge: 'Ryzen 7 9800X3D · PCIe 5.0',
  },
  {
    id: 'indian-pricing-value',
    category: 'pricing',
    categoryLabel: 'Indian Pricing & Availability',
    question: 'How are Indian retail prices (INR) and Price-to-Performance ratios verified?',
    shortAnswer:
      'We track actual shelf prices from authorized Indian distributors and retailers, including 18% GST and local import duties, rather than raw dollar conversions.',
    detailedPoints: [
      'Verified Indian Retailers: Prices are sampled across major authorized dealers including MDComputers, PrimeABGB, Vedant Computers, Computech, and official brand storefronts.',
      'Inclusive of 18% GST: All ₹ (INR) figures include local Indian Goods and Services Tax, import duties, and standard Indian warranty coverage.',
      'Cost-Per-Frame Metric: Calculated by dividing the real Indian retail price by sustained 1440p Ultra average FPS, giving you the actual ₹-per-FPS investment value.',
      'Street Price vs. Paper MSRP: When a new GPU or CPU launches with inflated street pricing, we reflect the real street acquisition price, not paper MSRP.',
    ],
    metricsBadge: 'Real Street ₹ with 18% GST',
  },
  {
    id: 'review-ethics-samples',
    category: 'ethics',
    categoryLabel: 'Review Ethics & Samples',
    question: 'Are review units provided by manufacturers or purchased at retail?',
    shortAnswer:
      'NEXUS operates under strict editorial independence. We use both manufacturer press review kits and retail-purchased samples, auditing each against retail vBIOS standards.',
    detailedPoints: [
      'Zero Sponsored Scoring: No hardware vendor or game studio can purchase editorial ratings, benchmark placements, or "Editor’s Choice" accolades.',
      'Golden Sample Auditing: All press loaners have their silicon clocks, vBIOS power envelopes, and acoustic curves cross-checked against anonymously purchased retail units.',
      'Disclosure Policy: When a manufacturer loans a card for launch day testing, it is clearly flagged as "Press Loaner" in our test disclosure ledger with a mandatory return cycle.',
      'Zero Affiliate Pressure: Recommendation algorithms are based purely on telemetry scores and price-per-frame formulas, never affiliate commission margins.',
    ],
    metricsBadge: 'Audited Silicon · 100% Independent',
  },
  {
    id: 'upscaling-driver-reproducibility',
    category: 'updates',
    categoryLabel: 'Drivers & Upscaling Policy',
    question: 'How do you handle DLSS, FSR, XeSS, Frame Generation, and driver updates?',
    shortAnswer:
      'Native resolution rendering (TAA/SMAA) is our primary benchmark baseline; temporal upscaling and Frame Gen are always tested and displayed in isolated comparison tiers.',
    detailedPoints: [
      'Native Baseline First: Every GPU is benchmarked at native 1080p, 1440p, and 4K resolution with zero upscaling to establish pure silicon compute and rasterization power.',
      'Explicit Upscaler Labeling: DLSS (Quality), FSR 3.1 (Quality), and XeSS (Ultra Quality) are recorded in dedicated upscaling matrices so users can see exact image fidelity vs. performance trade-offs.',
      'Frame Generation Disclosed: Multi-Frame Generation / AMD Fluid Motion Frames (AFMF) is never combined with native numbers to prevent misleading frame time data.',
      'Locked Driver Versions: Every review specifies the exact WHQL display driver version (e.g., GeForce 572.16 / Radeon Adrenalin 25.1.1) and game patch build ID.',
    ],
    metricsBadge: 'Native First · DLSS/FSR Isolated',
  },
];

interface FaqSectionProps {
  onOpenMethodologyModal?: (topic: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  onOpenMethodologyModal,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(['accuracy-variance']);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    setOpenIds(BENCHMARK_FAQ_DATA.map((item) => item.id));
  };

  const handleCollapseAll = () => {
    setOpenIds([]);
  };

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Topics', count: BENCHMARK_FAQ_DATA.length },
      {
        id: 'telemetry',
        label: 'Benchmarking & Telemetry',
        count: BENCHMARK_FAQ_DATA.filter((i) => i.category === 'telemetry').length,
      },
      {
        id: 'testbench',
        label: 'Testbench Rig',
        count: BENCHMARK_FAQ_DATA.filter((i) => i.category === 'testbench').length,
      },
      {
        id: 'pricing',
        label: 'Indian Pricing (₹)',
        count: BENCHMARK_FAQ_DATA.filter((i) => i.category === 'pricing').length,
      },
      {
        id: 'ethics',
        label: 'Review Ethics',
        count: BENCHMARK_FAQ_DATA.filter((i) => i.category === 'ethics').length,
      },
      {
        id: 'updates',
        label: 'Drivers & Upscalers',
        count: BENCHMARK_FAQ_DATA.filter((i) => i.category === 'updates').length,
      },
    ];
  }, []);

  const filteredFaqs = useMemo(() => {
    return BENCHMARK_FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.detailedPoints.some((p) => p.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      id="nexus-faq-section"
      aria-label="Benchmarking Accuracy and Methodology FAQ"
      className="nexus-scroll-section scroll-mt-36 mt-16 px-3 sm:px-6 lg:px-8 relative z-10"
    >
      <div className="nexus-editorial-panel max-w-[1360px] mx-auto rounded-3xl p-6 sm:p-9 lg:p-11 relative overflow-hidden">
        {/* Subtle background blueprint accents */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 100% 0%, rgba(88,76,232,0.18) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(38,109,117,0.15) 0%, transparent 60%)',
          }}
        />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-5 pb-8 border-b border-[#2E276C]/10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-[0.18em] text-[#266D75] mb-2 uppercase">
              <HelpCircle className="w-3.5 h-3.5 text-[#584CE8]" />
              <span>NEXUS PERFORMANCE LAB · METHODOLOGY & ACCURACY FAQ</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#312A75] tracking-tight leading-tight">
              Hardware Benchmarking Accuracy & Methodology
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5578] mt-2 leading-relaxed font-medium">
              Transparent answers regarding how we capture 1% low frame times,
              maintain our Ryzen 7 9800X3D reference testbench, verify Indian retail
              pricing, and audit silicon for zero-bias reporting.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExpandAll}
              className="nexus-editorial-control px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold text-[#312A75] cursor-pointer transition-colors"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="nexus-editorial-control px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold text-[#515E7B] cursor-pointer transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Filter Controls: Category Tabs & Search Bar */}
        <div className="relative z-10 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div
            role="tablist"
            aria-label="FAQ Topics"
            className="flex flex-wrap items-center gap-1.5"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#584CE8] text-white shadow-sm'
                      : 'nexus-editorial-control text-[#4A5578] hover:text-[#2E276C]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                      active
                        ? 'bg-white/25 text-white'
                        : 'bg-[#2E276C]/8 text-[#515E7B]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#515E7B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQ questions..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full nexus-editorial-control text-xs text-[#1E293B] placeholder:text-[#515E7B]/70 outline-none focus:border-[#584CE8] transition-colors"
            />
          </div>
        </div>

        {/* Accordion Container */}
        <div className="relative z-10 mt-6 space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="nexus-editorial-well p-8 rounded-2xl text-center border-dashed">
              <p className="text-sm font-extrabold text-[#312A75]">
                No questions found matching "{searchQuery}"
              </p>
              <p className="text-xs text-[#515E7B] mt-1">
                Try searching for keywords like "Ryzen", "variance", "1% low", or "GST".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 text-xs font-mono font-bold text-[#584CE8] hover:underline cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            filteredFaqs.map((item, idx) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="nexus-editorial-card rounded-2xl border border-white/60 overflow-hidden transition-all duration-200"
                >
                  {/* Collapsible Header Button */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(item.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#584CE8]/10 text-[#584CE8] font-mono text-xs font-bold tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#266D75] uppercase">
                            {item.categoryLabel}
                          </span>
                          {item.metricsBadge && (
                            <span className="nexus-frosted-badge text-[9px] font-mono font-semibold text-[#584CE8] border border-[#584CE8]/20 bg-white/70">
                              {item.metricsBadge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-sm sm:text-base font-extrabold text-[#2E276C] leading-snug">
                          {item.question}
                        </h3>
                      </div>
                    </div>

                    <div className="shrink-0 p-1.5 rounded-full bg-white/80 text-[#312A75] border border-white/80 shadow-xs">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#584CE8]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#515E7B]" />
                      )}
                    </div>
                  </button>

                  {/* Expandable Body */}
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-[#2E276C]/8 animate-in fade-in duration-200">
                      {/* Short summary punchline */}
                      <p className="text-xs sm:text-sm text-[#1E293B] font-semibold leading-relaxed bg-[#584CE8]/5 p-3 rounded-xl border-l-3 border-[#584CE8]">
                        {item.shortAnswer}
                      </p>

                      {/* Detailed technical bullet points */}
                      <ul className="mt-3.5 space-y-2">
                        {item.detailedPoints.map((point, pIdx) => {
                          const [title, ...descParts] = point.split(': ');
                          const desc = descParts.join(': ');
                          return (
                            <li
                              key={pIdx}
                              className="text-xs sm:text-[13px] text-[#4A5578] leading-relaxed flex items-start gap-2.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#266D75] mt-1.5 shrink-0" />
                              <span>
                                {desc ? (
                                  <>
                                    <strong className="text-[#312A75] font-bold">
                                      {title}:
                                    </strong>{' '}
                                    {desc}
                                  </>
                                ) : (
                                  point
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Callout & Modal Link */}
        <div className="relative z-10 mt-8 pt-6 border-t border-[#2E276C]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 p-4 sm:p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#584CE8]/10 text-[#584CE8] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#312A75]">
                Want to examine our full hardware testing harness specification?
              </p>
              <p className="text-[11px] text-[#515E7B]">
                Read our complete open testbench disclosure, thermal protocols, and
                software stack.
              </p>
            </div>
          </div>

          {onOpenMethodologyModal && (
            <button
              type="button"
              onClick={() =>
                onOpenMethodologyModal('NEXUS Benchmark Database & Lab Methodology')
              }
              className="nexus-hover-shake nexus-dock-circle-active inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Inspect Lab Protocols →</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
