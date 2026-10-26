import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Link2,
  Share2,
  X,
} from 'lucide-react';
import { CatalogItem } from '../types/nexus';
import { buildReviewSharePayload } from '../utils/shareLogic';

interface ShareReviewMenuProps {
  item: CatalogItem;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below for restricted iframe contexts
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

export const ShareReviewMenu: React.FC<ShareReviewMenuProps> = ({ item }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copiedMode, setCopiedMode] = useState<'link' | 'summary' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);

  const sharePayload = useMemo(() => {
    const baseUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://nexus.gg/';
    return buildReviewSharePayload(item, baseUrl);
  }, [item]);

  const supportsNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsClosing(false);
    setIsRendered(true);
  }, []);

  const closeMenu = useCallback(() => {
    if (!isRendered || isClosing) return;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      closeTimerRef.current = null;
    }, 180);
  }, [isRendered, isClosing]);

  const toggleMenu = () => {
    if (isRendered && !isClosing) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Close on outside click or Escape key with smooth out animation
  useEffect(() => {
    if (!isRendered || isClosing) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, isClosing, closeMenu]);

  const handleCopyDirectLink = async () => {
    await copyTextToClipboard(sharePayload.directUrl);
    setCopiedMode('link');
    window.setTimeout(() => {
      setCopiedMode((prev) => (prev === 'link' ? null : prev));
    }, 2600);
  };

  const handleCopySummary = async () => {
    await copyTextToClipboard(
      `${sharePayload.shareSummary} ${sharePayload.directUrl}`
    );
    setCopiedMode('summary');
    window.setTimeout(() => {
      setCopiedMode((prev) => (prev === 'summary' ? null : prev));
    }, 2600);
  };

  const handleNativeShare = async () => {
    if (!supportsNativeShare) return;
    try {
      await navigator.share({
        title: sharePayload.shareTitle,
        text: sharePayload.shareSummary,
        url: sharePayload.directUrl,
      });
      closeMenu();
    } catch {
      // User cancelled native share sheet
    }
  };

  const isOpen = isRendered && !isClosing;

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        data-testid="share-review-button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Share ${item.shortTitle} review`}
        onClick={toggleMenu}
        className={`nexus-hover-shake inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          isOpen || copiedMode === 'link'
            ? 'nexus-dock-circle-active'
            : 'nexus-editorial-control text-[#2E276C] hover:text-[#584CE8]'
        }`}
      >
        {copiedMode === 'link' ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-semibold">Link Copied</span>
          </>
        ) : (
          <>
            <Share2
              className={`w-3.5 h-3.5 ${
                isOpen ? 'text-white' : 'text-[#584CE8]'
              }`}
            />
            <span>Share</span>
          </>
        )}
      </button>

      {isRendered && (
        <div
          role="dialog"
          aria-label={`Share ${item.title}`}
          data-testid="share-review-popover"
          className={`${
            isClosing ? 'nexus-panel-exit' : 'nexus-panel-enter'
          } nexus-editorial-modal absolute left-0 sm:left-auto sm:right-0 mt-2 w-[min(350px,calc(100vw-24px))] sm:w-[360px] rounded-2xl overflow-hidden z-40 origin-top-left sm:origin-top-right`}
        >
          {/* Popover Header */}
          <div className="px-4 py-3 border-b border-[#2E276C]/10 bg-white/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Share2 className="w-3.5 h-3.5 text-[#584CE8] shrink-0" />
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-[#312A75] uppercase truncate">
                SHARE REVIEW DISPATCH
              </span>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close share menu"
              className="nexus-hover-shake p-1 rounded-full text-[#515E7B] hover:text-[#2E276C] hover:bg-white/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Direct Review Link + Copy Button */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-[0.12em] text-[#515E7B] uppercase mb-1.5">
                <span className="inline-flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-[#584CE8]" />
                  <span>DIRECT REVIEW LINK</span>
                </span>
                {copiedMode === 'link' && (
                  <span
                    data-testid="share-copied-status"
                    className="text-[#266D75] font-bold"
                  >
                    COPIED TO CLIPBOARD
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  aria-label="Direct link to review"
                  data-testid="share-direct-url-input"
                  value={sharePayload.directUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  className="nexus-editorial-well flex-1 min-w-0 rounded-xl px-3 py-2 text-xs font-mono text-[#312A75] focus:outline-none focus:border-[#584CE8]"
                />
                <button
                  type="button"
                  data-testid="copy-direct-link-button"
                  onClick={handleCopyDirectLink}
                  className={`nexus-hover-shake px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    copiedMode === 'link'
                      ? 'bg-[#266D75] text-white'
                      : 'bg-[#584CE8] hover:bg-[#473BD4] text-white'
                  }`}
                >
                  {copiedMode === 'link' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Benchmark Citation Copy (for Discord / Forums) */}
            <div className="pt-3 border-t border-[#2E276C]/10">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold tracking-[0.12em] text-[#515E7B] uppercase">
                  BENCHMARK CITATION SNIPPET
                </span>
                <button
                  type="button"
                  data-testid="copy-summary-button"
                  onClick={handleCopySummary}
                  className="nexus-hover-shake inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#584CE8] hover:text-[#2E276C] transition-colors cursor-pointer"
                >
                  {copiedMode === 'summary' ? (
                    <>
                      <Check className="w-3 h-3 text-[#266D75]" />
                      <span className="text-[#266D75]">Citation Copied</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>
              </div>
              <p className="nexus-editorial-well rounded-xl p-2.5 text-[11px] text-[#4A5578] leading-relaxed font-mono">
                {sharePayload.shareSummary}
              </p>
            </div>

            {/* Popular Social Platforms */}
            <div className="pt-3 border-t border-[#2E276C]/10">
              <span className="block text-[10px] font-mono font-bold tracking-[0.12em] text-[#515E7B] uppercase mb-2">
                SHARE TO PLATFORM
              </span>

              <div className="grid grid-cols-2 gap-2">
                {sharePayload.platforms.map((platform) => (
                  <a
                    key={platform.id}
                    href={platform.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`share-platform-${platform.id}`}
                    onClick={closeMenu}
                    className="nexus-editorial-control nexus-hover-shake px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs text-[#2E276C] hover:text-[#584CE8] transition-colors"
                  >
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#584CE8]/14 font-mono text-[10px] font-bold text-[#584CE8] flex items-center justify-center shrink-0">
                        {platform.badge}
                      </span>
                      <span className="truncate font-semibold">
                        {platform.label}
                      </span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#515E7B] shrink-0" />
                  </a>
                ))}

                {supportsNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="nexus-editorial-control nexus-hover-shake px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs text-[#2E276C] hover:text-[#584CE8] transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#266D75]/15 font-mono text-[10px] font-bold text-[#266D75] flex items-center justify-center shrink-0">
                        OS
                      </span>
                      <span className="truncate font-semibold">More Options</span>
                    </span>
                    <Share2 className="w-3.5 h-3.5 text-[#515E7B] shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
