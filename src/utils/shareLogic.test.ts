import assert from 'node:assert/strict';
import test from 'node:test';
import { CATALOG_ITEMS } from '../data/catalogData';
import {
  buildReviewDirectUrl,
  buildReviewSharePayload,
  parseReviewIdFromSearch,
} from './shareLogic';

test('buildReviewDirectUrl appends ?review=<id> cleanly and strips hashes', () => {
  const url = buildReviewDirectUrl(
    'https://nexus.example.com/?sort=featured#top',
    'gpu-rtx-5070'
  );
  assert.equal(
    url,
    'https://nexus.example.com/?sort=featured&review=gpu-rtx-5070'
  );
});

test('parseReviewIdFromSearch extracts valid review ID or returns null', () => {
  assert.equal(
    parseReviewIdFromSearch('?review=game-cyberpunk-2077'),
    'game-cyberpunk-2077'
  );
  assert.equal(parseReviewIdFromSearch('?category=Games'), null);
  assert.equal(parseReviewIdFromSearch(''), null);
});

test('buildReviewSharePayload generates direct URL, telemetry summary, and 5 platform share links', () => {
  const item = CATALOG_ITEMS.find((i) => i.id === 'gpu-rtx-5070')!;
  const payload = buildReviewSharePayload(item, 'https://nexus.example.com/');

  assert.equal(
    payload.directUrl,
    'https://nexus.example.com/?review=gpu-rtx-5070'
  );
  assert.ok(payload.shareTitle.includes('9.1/10'));
  assert.ok(payload.shareSummary.includes('118 FPS'));
  assert.ok(payload.shareSummary.includes('INR 62,500'));
  assert.equal(payload.platforms.length, 5);

  const platformIds = payload.platforms.map((p) => p.id);
  assert.deepEqual(platformIds, ['x', 'reddit', 'whatsapp', 'linkedin', 'email']);

  const xLink = payload.platforms.find((p) => p.id === 'x')!;
  assert.ok(xLink.href.startsWith('https://twitter.com/intent/tweet?'));
  assert.ok(
    xLink.href.includes(
      encodeURIComponent('https://nexus.example.com/?review=gpu-rtx-5070')
    )
  );
});
