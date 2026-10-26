import { CatalogItem } from '../types/nexus';
import { formatINR } from './catalogLogic';

export interface SharePlatformLink {
  id: 'x' | 'reddit' | 'linkedin' | 'whatsapp' | 'email';
  label: string;
  badge: string;
  href: string;
}

export interface ReviewSharePayload {
  directUrl: string;
  shareTitle: string;
  shareSummary: string;
  platforms: SharePlatformLink[];
}

/**
 * Builds a clean, canonical direct URL for an individual game or hardware review.
 */
export function buildReviewDirectUrl(baseUrl: string, itemId: string): string {
  const cleanId = itemId.trim();
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('review', cleanId);
    url.hash = '';
    return url.toString();
  } catch {
    const baseWithoutHash = baseUrl.split('#')[0].split('?')[0];
    return `${baseWithoutHash}?review=${encodeURIComponent(cleanId)}`;
  }
}

/**
 * Extracts a `?review=<id>` parameter from a URL search string if present.
 */
export function parseReviewIdFromSearch(search: string): string | null {
  if (!search) return null;
  try {
    const params = new URLSearchParams(
      search.startsWith('?') ? search : `?${search}`
    );
    const val = params.get('review');
    return val && val.trim().length > 0 ? val.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Generates the share text, direct URL, and encoded platform share links for a review item.
 */
export function buildReviewSharePayload(
  item: CatalogItem,
  baseUrl: string
): ReviewSharePayload {
  const directUrl = buildReviewDirectUrl(baseUrl, item.id);
  const scoreStr = `${item.overallScore.toFixed(1)}/10`;
  const metric1440p = `${item.benchmarkStrip.values['1440p']} ${item.benchmarkStrip.unit}`;
  const priceStr = formatINR(item.priceINR);

  const shareTitle = `${item.title} (${scoreStr}) — NEXUS Performance Lab`;
  const shareSummary = `${item.shortTitle} scored ${scoreStr} on NEXUS (${
    item.benchmarkStrip.label
  } 1440p: ${metric1440p} · Retail: ${priceStr}).`;

  const encodedUrl = encodeURIComponent(directUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedSummaryWithUrl = encodeURIComponent(
    `${shareSummary} ${directUrl}`
  );
  const encodedTweetText = encodeURIComponent(shareSummary);

  const platforms: SharePlatformLink[] = [
    {
      id: 'x',
      label: 'X (Twitter)',
      badge: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTweetText}&url=${encodedUrl}`,
    },
    {
      id: 'reddit',
      label: 'Reddit',
      badge: 'RD',
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      badge: 'WA',
      href: `https://api.whatsapp.com/send?text=${encodedSummaryWithUrl}`,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      badge: 'IN',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      id: 'email',
      label: 'Email',
      badge: 'EM',
      href: `mailto:?subject=${encodedTitle}&body=${encodedSummaryWithUrl}`,
    },
  ];

  return {
    directUrl,
    shareTitle,
    shareSummary,
    platforms,
  };
}
