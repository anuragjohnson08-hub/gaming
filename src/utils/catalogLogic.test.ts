import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_ITEMS } from '../data/catalogData';
import {
  analyzeSearchIntent,
  computeGameBenchmarkMetrics,
  DEFAULT_FILTER_STATE,
  filterAndSortCatalog,
  formatINR,
  hasActiveFilters,
} from './catalogLogic';

test('filterAndSortCatalog returns all 18 items by default in Featured order', () => {
  const results = filterAndSortCatalog(CATALOG_ITEMS, DEFAULT_FILTER_STATE);
  assert.equal(results.length, 18);
  assert.equal(results[0].id, 'game-cyberpunk-2077');
});

test('filterAndSortCatalog filters accurately by Category and Platform', () => {
  const gpus = filterAndSortCatalog(CATALOG_ITEMS, {
    ...DEFAULT_FILTER_STATE,
    category: 'Graphics Cards',
  });
  assert.equal(gpus.length, 3);
  assert.ok(gpus.every((item) => item.category === 'Graphics Cards'));

  const switchGames = filterAndSortCatalog(CATALOG_ITEMS, {
    ...DEFAULT_FILTER_STATE,
    platform: 'Nintendo Switch',
  });
  assert.equal(switchGames.length, 1);
  assert.equal(switchGames[0].id, 'game-civilization-vii');
});

test('filterAndSortCatalog sorts by Highest Rated and Best Performance accurately', () => {
  const highestRated = filterAndSortCatalog(CATALOG_ITEMS, {
    ...DEFAULT_FILTER_STATE,
    sortBy: 'Highest Rated',
  });
  assert.equal(highestRated[0].id, 'cpu-ryzen-7-9800x3d');
  assert.ok(highestRated[0].overallScore >= highestRated[1].overallScore);

  const bestPerf = filterAndSortCatalog(CATALOG_ITEMS, {
    ...DEFAULT_FILTER_STATE,
    category: 'Graphics Cards',
    sortBy: 'Best Performance',
  });
  assert.equal(bestPerf[0].id, 'gpu-rx-9070-xt');
});

test('analyzeSearchIntent handles natural language queries required by spec', () => {
  // 1. "RTX 5070 vs RTX 4070"
  const vsResult = analyzeSearchIntent('RTX 5070 vs RTX 4070', CATALOG_ITEMS);
  assert.equal(vsResult.intent.isComparisonIntent, true);
  assert.equal(vsResult.matchedItems.length, 2);

  // 2. "Best GPU for 1440p"
  const gpu1440p = analyzeSearchIntent('Best GPU for 1440p', CATALOG_ITEMS);
  assert.equal(gpu1440p.matchedItems.length, 3);
  assert.equal(gpu1440p.matchedItems[0].id, 'gpu-rx-9070-xt');

  // 3. "Cyberpunk 2077 FPS"
  const cpResult = analyzeSearchIntent('Cyberpunk 2077 FPS', CATALOG_ITEMS);
  assert.equal(cpResult.matchedItems.length, 1);
  assert.equal(cpResult.matchedItems[0].id, 'game-cyberpunk-2077');

  // 4. "Gaming laptop under ₹80,000"
  const laptopBudget = analyzeSearchIntent('Gaming laptop under ₹80,000', CATALOG_ITEMS);
  assert.equal(laptopBudget.matchedItems.length, 1);
  assert.equal(laptopBudget.matchedItems[0].id, 'laptop-lenovo-loq-15');
});

test('computeGameBenchmarkMetrics scales FPS with presets, Ray Tracing, and DLSS/FSR', () => {
  const base = { '1080p': 142, '1440p': 98, '4K': 56 };
  const nativeUltra = computeGameBenchmarkMetrics(base, 0.84, '1440p', 'Ultra', false, 'Off');
  assert.equal(nativeUltra.avgFps, 98);

  const rtUltra = computeGameBenchmarkMetrics(base, 0.84, '1440p', 'Ultra', true, 'Off');
  assert.ok(rtUltra.avgFps < nativeUltra.avgFps);

  const rtWithDlss = computeGameBenchmarkMetrics(base, 0.84, '1440p', 'Ultra', true, 'DLSS');
  assert.ok(rtWithDlss.avgFps > rtUltra.avgFps);
});

test('formatINR and hasActiveFilters behave deterministically', () => {
  assert.equal(formatINR(62500), 'INR 62,500');
  assert.equal(formatINR(null), 'Price unavailable');
  assert.equal(hasActiveFilters(DEFAULT_FILTER_STATE), false);
  assert.equal(hasActiveFilters({ ...DEFAULT_FILTER_STATE, category: 'Games' }), true);
});
