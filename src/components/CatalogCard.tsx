import React from 'react';
import { ArrowRight, Bookmark, Check, GitCompare, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { CATALOG_ITEMS } from '../data/catalogData';
import { CatalogItem } from '../types/nexus';
import { formatINR } from '../utils/catalogLogic';
import {
  computeGameOnHardwarePerformance,
  getRigForCatalogHardware,
  HARDWARE_TEST_RIGS,
} from '../utils/hardwareGameMatrix';
import { prefetchItem } from '../utils/prefetchManager';
import { UiUpgradeMode } from './AnnouncementBar';
import { ArtworkRenderer } from './ArtworkRenderer';

interface CatalogCardProps {
  item: CatalogItem;
  isCompared: boolean;
  isSaved: boolean;
  onSelectItem: (item: CatalogItem) => void;
  onToggleCompare: (item: CatalogItem) => void;
  onToggleSave: (item: CatalogItem) => void;
  uiUpgradeMode?: UiUpgradeMode;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({
  item,
  isCompared,
  isSaved,
  onSelectItem,
  onToggleCompare,
  onToggleSave,
  uiUpgradeMode = 'option1',
}) => {
  const actionLabel =
    item.itemType === 'game' ? 'Read Full Review' : 'View Benchmarks';

  const isEditorsPick = item.overallScore >= 9.2;

  // Compute quick cross-telemetry preview for the card
  const subMinRig = HARDWARE_TEST_RIGS.find((r) => r.id === 'rig-gtx-1650-4gb')!;
  const midRig = HARDWARE_TEST_RIGS.find((r) => r.id === 'rig-rtx-5070')!;

  const gameLowSpecPerf =
    item.itemType === 'game'
      ? computeGameOnHardwarePerformance(item, subMinRig, '1080p', 'Low', false, 'FSR')
      : null;
  const gameMidPerf =
    item.itemType === 'game'
      ? computeGameOnHardwarePerformance(item, midRig, '1440p', 'Ultra', false, 'Off')
      : null;

  const hardwareRig =
    item.itemType === 'hardware' ? getRigForCatalogHardware(item.id) : null;
  const previewGames =
    item.itemType === 'hardware' && hardwareRig
      ? ['game-cyberpunk-2077', 'game-alan-wake-2', 'game-counter-strike-2']
          .map((gid) => CATALOG_ITEMS.find((c) => c.id === gid))
          .filter((g): g is CatalogItem => Boolean(g))
          .map((g) => ({
            shortTitle: g.shortTitle,
            perf: computeGameOnHardwarePerformance(
              g,
              hardwareRig,
              '1440p',
              'High',
              false,
              'Off'
            ),
          }))
      : [];

  const maxResValue = Math.max(
    item.benchmarkStrip.values['1080p'],
    item.benchmarkStrip.values['1440p'],
    item.benchmarkStrip.values['4K'],
    200
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      data-testid={`catalog-card-${item.id}`}
      onMouseEnter={() => prefetchItem(item.id)}
      className="nexus-anim-card nexus-editorial-card group rounded-3xl flex flex-col justify-between p-4"
    >
      <div>
        {/* A. 4:3 Image Container with Pastel Glass Frame & 8. BlurHash Micro-Placeholder */}
        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white/55 border border-black/[0.08] shadow-xs mb-3.5">
          {/* Subtle BlurHash-style animated color shimmer underneath */}
          <div className="absolute inset-0 nexus-skeleton opacity-40 pointer-events-none" />

          <div
            onClick={() => onSelectItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectItem(item);
              }
            }}
            aria-label={`Open ${item.title}`}
            className="w-full h-full cursor-pointer transition-transform duration-300 ease-out group-hover:scale-[1.02] relative z-0"
          >
            <ArtworkRenderer variant={item.artworkVariant} />
          </div>

          {/* Soft Frosted Header Scrim at top */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/90 via-white/50 to-transparent pointer-events-none" />

          {/* Top Left Kicker / Frosted Status Badges */}
          <div className="absolute top-2.5 left-2.5 right-20 pointer-events-none flex flex-wrap items-center gap-1.5">
            {uiUpgradeMode === 'option1' ? (
              <>
                {isEditorsPick && (
                  <span className="nexus-frosted-badge nexus-frosted-badge-gold">
                    EDITOR’S PICK
                  </span>
                )}
                <span className="nexus-frosted-badge nexus-frosted-badge-indigo truncate max-w-[140px]">
                  {item.category.toUpperCase()}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-mono font-bold tracking-[0.12em] text-[#1F5E66] uppercase truncate block">
                {item.kickerText}
              </span>
            )}
          </div>

          {/* Top Right Quick Actions: 13. Hit Slop & 4. Shortcut Hints */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(item);
              }}
              aria-label={
                isCompared
                  ? `Remove ${item.shortTitle} from comparison`
                  : `Add ${item.shortTitle} to comparison`
              }
              title={isCompared ? 'Remove from Compare (C)' : 'Add to Compare (C)'}
              className={`nexus-hit-slop nexus-hover-shake w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isCompared
                  ? 'nexus-dock-circle-active'
                  : 'bg-white/85 text-[#1E293B] border border-black/15 hover:border-[#584CE8] hover:text-[#584CE8]'
              }`}
            >
              {isCompared ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <GitCompare className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(item);
              }}
              aria-label={
                isSaved
                  ? `Remove ${item.shortTitle} from saved items`
                  : `Save ${item.shortTitle}`
              }
              title={isSaved ? 'Remove Bookmark (S)' : 'Save Item (S)'}
              className={`nexus-hit-slop nexus-hover-shake w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isSaved
                  ? 'nexus-dock-circle-active'
                  : 'bg-white/85 text-[#1E293B] border border-black/15 hover:border-[#584CE8] hover:text-[#584CE8]'
              }`}
            >
              <Bookmark
                className="w-3.5 h-3.5"
                fill={isSaved ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Inner Frosted Sheet */}
        <div className="nexus-editorial-well rounded-2xl p-3.5">
          {/* Category · Tier · Price Metadata Line */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-700 mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[#584CE8] font-semibold">{item.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-800">{item.performanceTier}</span>
            </div>
            <span className="font-mono text-[#266D75] font-bold tabular-nums shrink-0">
              {formatINR(item.priceINR)}
            </span>
          </div>

          {/* C. Card Title — Cabinet Grotesk Bold (-0.025em) */}
          <h2 className="font-display text-base font-bold tracking-[-0.025em] text-[#2E276C] group-hover:text-[#584CE8] transition-colors line-clamp-1">
            <button
              type="button"
              onClick={() => onSelectItem(item)}
              className="text-left w-full truncate cursor-pointer focus-visible:outline-2 focus-visible:outline-[#584CE8]"
            >
              {item.title}
            </button>
          </h2>

          {/* D. Short Description — Inter crisp high-contrast text-slate-800 */}
          <p className="mt-1 text-xs text-slate-800 leading-relaxed line-clamp-2 min-h-[38px]">
            {item.shortDescription}
          </p>

          {/* E. Review and Performance Metrics (Editorial vs Measured) */}
          <div className="mt-3 pt-2.5 border-t border-black/[0.08]">
            <div className="flex items-center justify-between text-xs mb-2 gap-1.5">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#584CE8] fill-[#584CE8]" />
                <span className="font-mono font-bold text-[#1E293B] tabular-nums">
                  {item.overallScore.toFixed(1)}
                </span>
                <span className="font-mono text-slate-600 text-[11px] tabular-nums">
                  / 10 ({item.reviewCount})
                </span>
              </div>
              {uiUpgradeMode === 'option1' ? (
                <span className="nexus-frosted-badge nexus-frosted-badge-teal">
                  LAB VERIFIED
                </span>
              ) : (
                <span className="text-[10px] font-mono font-semibold text-[#266D75] tabular-nums">
                  {item.itemType === 'game' ? 'EDITORIAL + LAB' : 'LAB VERIFIED'}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {item.cardMetrics.slice(0, 2).map((metric) => (
                <div
                  key={metric.label}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-slate-800">
                    {metric.label}{' '}
                    <span className="text-[9px] font-mono text-slate-600 uppercase">
                      ({metric.type === 'editorial' ? 'Ed.' : 'Meas.'})
                    </span>
                  </span>
                  <span className="font-mono text-[#1E293B] font-bold tabular-nums">
                    {metric.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* F. Benchmark Telemetry Strip (Option 1: Horizontal Progress/Delta Bars | Option 2: Compact 3-Column Strip) */}
          <div className="mt-3 pt-2.5 border-t border-black/[0.08]">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-700 mb-2 gap-1">
              <span className="font-semibold truncate">
                {item.benchmarkStrip.label} ({item.benchmarkStrip.unit})
              </span>
              {uiUpgradeMode === 'option1' ? (
                <span className="nexus-frosted-badge">
                  {item.dataStatusLabel}
                </span>
              ) : (
                <span className="text-[#266D75] font-bold shrink-0">
                  {item.dataStatusLabel}
                </span>
              )}
            </div>

            {uiUpgradeMode === 'option1' ? (
              <div
                data-testid={`card-fps-bars-${item.id}`}
                className="bg-white/70 border border-black/[0.08] rounded-xl p-2 space-y-1.5"
              >
                {(['1080p', '1440p', '4K'] as const).map((res) => {
                  const val = item.benchmarkStrip.values[res];
                  const pct = Math.max(
                    12,
                    Math.min(100, Math.round((val / maxResValue) * 100))
                  );
                  const barColor =
                    res === '1080p'
                      ? 'bg-[#584CE8]'
                      : res === '1440p'
                      ? 'bg-[#4338CA]'
                      : 'bg-[#266D75]';
                  return (
                    <div key={res} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                        <span className="text-slate-700 font-semibold">{res}</span>
                        <span className="text-[#1E293B] font-bold">
                          {val} {item.benchmarkStrip.unit}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-900/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/65 border border-black/[0.08] grid grid-cols-3 divide-x divide-black/[0.08] text-center rounded-xl py-1.5">
                {(['1080p', '1440p', '4K'] as const).map((res) => (
                  <div key={res} className="px-1">
                    <span className="block text-[10px] font-mono text-slate-600 tabular-nums">
                      {res}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1E293B] tabular-nums">
                      {item.benchmarkStrip.values[res]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cross-Hardware / Below-Minimum & Multi-Game Summary Line */}
            {item.itemType === 'game' && gameLowSpecPerf && gameMidPerf && (
              <div className="mt-2 pt-2 border-t border-black/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-700 tabular-nums">
                <span className="truncate">
                  RTX 5070:{' '}
                  <strong className="text-[#1E293B] tabular-nums">
                    {gameMidPerf.avgFps} FPS
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate text-[#266D75]">
                  Sub-Min GTX 1650 (Low):{' '}
                  <strong className="text-[#1E293B] tabular-nums">
                    {gameLowSpecPerf.avgFps} FPS
                  </strong>
                </span>
              </div>
            )}

            {item.itemType === 'hardware' && previewGames.length > 0 && (
              <div className="mt-2 pt-2 border-t border-black/[0.08] flex items-center justify-between gap-1 text-[10px] font-mono text-slate-700 tabular-nums">
                {previewGames.map((pg, idx) => (
                  <React.Fragment key={pg.shortTitle}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <span className="truncate">
                      {pg.shortTitle.split(':')[0].split(' ')[0]}:{' '}
                      <strong className="text-[#1E293B] tabular-nums">
                        {pg.perf.avgFps} FPS
                      </strong>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* G. Bottom Frosted Dock Bar */}
      <div className="nexus-glass-dock mt-3.5 p-1.5 rounded-2xl flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelectItem(item)}
          className="nexus-hover-shake flex-1 py-2 px-3.5 rounded-xl bg-[#584CE8] hover:bg-[#473BD4] text-white font-semibold text-xs inline-flex items-center justify-between gap-2 transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 shadow-[0_6px_16px_rgba(88,76,232,0.28)] group/btn"
        >
          <span>{actionLabel}</span>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
          </span>
        </button>
      </div>
    </motion.article>
  );
};
