import React from 'react';
import { Check, GitCompare, Plus, Trash2, X } from 'lucide-react';
import { CatalogItem } from '../types/nexus';
import { formatINR } from '../utils/catalogLogic';
import { ArtworkRenderer } from './ArtworkRenderer';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: CatalogItem[];
  allItems: CatalogItem[];
  onToggleCompare: (item: CatalogItem) => void;
  onClearCompare: () => void;
  onSelectDetail: (item: CatalogItem) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  allItems,
  onToggleCompare,
  onClearCompare,
  onSelectDetail,
}) => {
  if (!isOpen) return null;

  // Quick-add suggestions if fewer than 4 items are selected
  const suggestedHardware = allItems.filter(
    (item) =>
      !selectedItems.some((s) => s.id === item.id) &&
      (selectedItems.length === 0 ||
        item.category === selectedItems[0].category ||
        item.itemType === 'hardware')
  );

  // Compute best values for subtle indicator highlighting
  const max1080p = Math.max(
    ...selectedItems.map((i) => i.benchmarkStrip.values['1080p']),
    0
  );
  const max1440p = Math.max(
    ...selectedItems.map((i) => i.benchmarkStrip.values['1440p']),
    0
  );
  const max4k = Math.max(
    ...selectedItems.map((i) => i.benchmarkStrip.values['4K']),
    0
  );
  const maxScore = Math.max(...selectedItems.map((i) => i.overallScore), 0);

  const validPrices = selectedItems
    .map((i) => i.priceINR)
    .filter((p): p is number => p !== null);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hardware and Game Performance Comparison"
      className="fixed inset-0 z-50 bg-[#312A75]/25 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="nexus-panel-enter nexus-editorial-modal w-full max-w-[1260px] rounded-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#2E276C]/10 flex flex-wrap items-center justify-between gap-4 bg-white/60">
          <div className="flex items-center gap-2.5">
            <GitCompare className="w-5 h-5 text-[#584CE8]" />
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#312A75]">
                NEXUS Side-by-Side Performance & Spec Comparison
              </h2>
              <p className="text-xs text-[#4A5578] font-medium">
                Real-world measured frame rates and architectural efficiency take
                precedence over raw paper specifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedItems.length > 0 && (
              <button
                type="button"
                onClick={onClearCompare}
                className="nexus-editorial-control inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#515E7B] hover:text-[#312A75] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison table"
              className="p-2 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Selector Strip to Add/Swap Compatible Products */}
          <div className="nexus-editorial-well p-4 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-[#266D75]">
                QUICK-ADD COMPATIBLE PRODUCTS TO COMPARE (UP TO 4):
              </span>
              <span className="text-[11px] font-mono font-bold text-[#584CE8]">
                {selectedItems.length} / 4 SELECTED
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {suggestedHardware.slice(0, 6).map((cand) => (
                <button
                  key={cand.id}
                  type="button"
                  disabled={selectedItems.length >= 4}
                  onClick={() => onToggleCompare(cand)}
                  className="nexus-editorial-control inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#312A75] transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 text-[#584CE8]" />
                  <span>{cand.shortTitle}</span>
                  <span className="text-[10px] font-mono text-[#515E7B]">
                    ({cand.category})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedItems.length === 0 ? (
            <div className="nexus-editorial-well text-center py-12 px-4 rounded-2xl border-dashed">
              <p className="text-base font-extrabold text-[#312A75]">
                No items selected for comparison yet.
              </p>
              <p className="text-xs text-[#4A5578] mt-1 font-medium">
                Select two or more GPUs, CPUs, Laptops, or Games using the quick-add
                buttons above or from any discovery card.
              </p>
            </div>
          ) : (
            <div className="nexus-editorial-well overflow-x-auto rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#2E276C]/10 bg-white/65">
                    <th className="p-4 w-52 text-xs font-mono font-bold text-[#266D75] align-top">
                      SPECIFICATION / METRIC
                    </th>
                    {selectedItems.map((item) => (
                      <th key={item.id} className="p-4 align-top min-w-[210px]">
                        <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-white/90 mb-3">
                          <ArtworkRenderer variant={item.artworkVariant} />
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#584CE8] block">
                              {item.category}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectDetail(item);
                              }}
                              className="font-display text-sm font-extrabold text-[#312A75] hover:text-[#584CE8] text-left cursor-pointer"
                            >
                              {item.shortTitle}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleCompare(item)}
                            aria-label={`Remove ${item.shortTitle}`}
                            className="p-1 rounded-full text-[#515E7B] hover:text-[#312A75] hover:bg-white/75 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E276C]/10 text-xs font-mono tabular-nums">
                  {/* Price (INR) */}
                  <tr className="bg-white/45">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      India Retail Price (INR)
                    </td>
                    {selectedItems.map((item) => {
                      const isLowest =
                        selectedItems.length > 1 &&
                        minPrice !== null &&
                        item.priceINR === minPrice;
                      return (
                        <td
                          key={item.id}
                          className={`p-3.5 font-extrabold ${
                            isLowest ? 'text-[#266D75]' : 'text-[#312A75]'
                          }`}
                        >
                          {formatINR(item.priceINR)}
                          {isLowest && (
                            <span className="ml-2 text-[10px] text-[#266D75]">
                              LOWEST PRICE
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Overall Score */}
                  <tr className="bg-white/25">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      NEXUS Overall Score
                    </td>
                    {selectedItems.map((item) => {
                      const isBest =
                        selectedItems.length > 1 && item.overallScore === maxScore;
                      return (
                        <td
                          key={item.id}
                          className={`p-3.5 font-extrabold ${
                            isBest ? 'text-[#584CE8]' : 'text-[#312A75]'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {item.overallScore.toFixed(1)} / 10
                            {isBest && <Check className="w-3.5 h-3.5 text-[#584CE8]" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 1080p Benchmark */}
                  <tr className="bg-white/45">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      1080p Avg Benchmark (DEMO DATA)
                    </td>
                    {selectedItems.map((item) => {
                      const v = item.benchmarkStrip.values['1080p'];
                      const isBest = selectedItems.length > 1 && v === max1080p;
                      return (
                        <td
                          key={item.id}
                          className={`p-3.5 font-extrabold ${
                            isBest ? 'text-[#584CE8]' : 'text-[#312A75]'
                          }`}
                        >
                          {v} {item.benchmarkStrip.unit}
                          {isBest && (
                            <span className="ml-2 text-[10px] text-[#584CE8]">
                              TOP
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* 1440p Benchmark */}
                  <tr className="bg-white/25">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      1440p Avg Benchmark (DEMO DATA)
                    </td>
                    {selectedItems.map((item) => {
                      const v = item.benchmarkStrip.values['1440p'];
                      const isBest = selectedItems.length > 1 && v === max1440p;
                      return (
                        <td
                          key={item.id}
                          className={`p-3.5 font-extrabold ${
                            isBest ? 'text-[#584CE8]' : 'text-[#312A75]'
                          }`}
                        >
                          {v} {item.benchmarkStrip.unit}
                          {isBest && (
                            <span className="ml-2 text-[10px] text-[#584CE8]">
                              TOP
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* 4K Benchmark */}
                  <tr className="bg-white/45">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      4K Avg Benchmark (DEMO DATA)
                    </td>
                    {selectedItems.map((item) => {
                      const v = item.benchmarkStrip.values['4K'];
                      const isBest = selectedItems.length > 1 && v === max4k;
                      return (
                        <td
                          key={item.id}
                          className={`p-3.5 font-extrabold ${
                            isBest ? 'text-[#584CE8]' : 'text-[#312A75]'
                          }`}
                        >
                          {v} {item.benchmarkStrip.unit}
                          {isBest && (
                            <span className="ml-2 text-[10px] text-[#584CE8]">
                              TOP
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Architecture / Engine */}
                  <tr className="bg-white/25">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      Architecture / Engine
                    </td>
                    {selectedItems.map((item) => (
                      <td key={item.id} className="p-3.5 text-[#312A75] font-sans font-medium">
                        {item.hardwareDetails?.comparisonSpecs.architecture ||
                          item.gameDetails?.engine ||
                          '—'}
                      </td>
                    ))}
                  </tr>

                  {/* VRAM / Cache / Core Config */}
                  <tr className="bg-white/45">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      VRAM / Cache / Memory
                    </td>
                    {selectedItems.map((item) => (
                      <td key={item.id} className="p-3.5 text-[#312A75] font-sans font-medium">
                        {item.hardwareDetails?.comparisonSpecs.vramOrCache ||
                          item.gameDetails?.recRequirements.gpu ||
                          '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Memory Bandwidth / Cores */}
                  <tr className="bg-white/25">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      Bandwidth / Core Count / Display
                    </td>
                    {selectedItems.map((item) => (
                      <td key={item.id} className="p-3.5 text-[#312A75] font-sans font-medium">
                        {item.hardwareDetails?.comparisonSpecs.memoryBandwidth ||
                          item.hardwareDetails?.comparisonSpecs.coreCount ||
                          item.hardwareDetails?.comparisonSpecs.displaySpec ||
                          item.gameDetails?.recRequirements.cpu ||
                          '—'}
                      </td>
                    ))}
                  </tr>

                  {/* Power Consumption */}
                  <tr className="bg-white/45">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      Power Draw & Load Temp
                    </td>
                    {selectedItems.map((item) => (
                      <td key={item.id} className="p-3.5 text-[#312A75] font-bold">
                        {item.hardwareDetails
                          ? `${item.hardwareDetails.powerConsumptionW ?? '—'}W · ${
                              item.hardwareDetails.temperatureLoadC ?? '—'
                            }°C`
                          : 'System Dependent'}
                      </td>
                    ))}
                  </tr>

                  {/* Upscaling & Ray Tracing Support */}
                  <tr className="bg-white/25">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      Upscaling & Ray Tracing
                    </td>
                    {selectedItems.map((item) => (
                      <td key={item.id} className="p-3.5 text-[#312A75] font-sans font-medium">
                        {item.hardwareDetails?.comparisonSpecs.upscalingSupport ||
                          (item.gameDetails
                            ? [
                                item.gameDetails.supportedTech.rayTracing && 'RT',
                                item.gameDetails.supportedTech.dlss && 'DLSS',
                                item.gameDetails.supportedTech.fsr && 'FSR',
                                item.gameDetails.supportedTech.xess && 'XeSS',
                              ]
                                .filter(Boolean)
                                .join(' · ')
                            : 'Standard')}
                      </td>
                    ))}
                  </tr>

                  {/* Performance per Rupee / Value Score */}
                  <tr className="bg-white/45">
                    <td className="p-3.5 text-[#4A5578] font-sans font-semibold">
                      Value / Perf-per-Rupee Score
                    </td>
                    {selectedItems.map((item) => (
                      <td key={item.id} className="p-3.5 text-[#266D75] font-extrabold">
                        {item.hardwareDetails
                          ? `${item.hardwareDetails.priceToPerformanceScore.toFixed(
                              1
                            )} / 10`
                          : `Optimization: ${item.gameDetails?.optimizationScore.toFixed(
                              1
                            )} / 10`}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
