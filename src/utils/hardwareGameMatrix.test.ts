import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG_ITEMS } from '../data/catalogData';
import {
  computeGameOnHardwarePerformance,
  getRigForCatalogHardware,
  HARDWARE_TEST_RIGS,
} from './hardwareGameMatrix';

test('all 10 games compute valid telemetry across all hardware rigs including below-minimum GPUs', () => {
  const games = CATALOG_ITEMS.filter((item) => item.itemType === 'game');
  assert.equal(games.length, 10);
  assert.ok(HARDWARE_TEST_RIGS.length >= 13);

  for (const game of games) {
    for (const rig of HARDWARE_TEST_RIGS) {
      const res = computeGameOnHardwarePerformance(
        game,
        rig,
        '1080p',
        'Ultra',
        false,
        'Off'
      );
      assert.ok(res.avgFps >= 9);
      assert.ok(
        res.resolutionFps['1080p'] > res.resolutionFps['1440p'] &&
          res.resolutionFps['1440p'] >= res.resolutionFps['4K']
      );
      assert.ok(res.onePercentLowFps >= 4 && res.onePercentLowFps <= res.avgFps);
      assert.ok(res.lowSpecSurvivalFps1080p >= res.avgFps);
      assert.ok(res.survivalTuningTip.length > 10);
    }
  }
});

test('below-minimum hardware is accurately flagged with specific reasons and survival FPS', () => {
  const alanWake = CATALOG_ITEMS.find((i) => i.id === 'game-alan-wake-2')!;
  const gtx1050ti = HARDWARE_TEST_RIGS.find((r) => r.id === 'rig-gtx-1050ti-4gb')!;
  const rtx5070 = getRigForCatalogHardware('gpu-rtx-5070');

  const lowSpecPerf = computeGameOnHardwarePerformance(
    alanWake,
    gtx1050ti,
    '1080p',
    'Ultra',
    false,
    'Off'
  );
  assert.equal(lowSpecPerf.specStatus, 'Below Minimum');
  assert.ok(lowSpecPerf.belowMinimumReasons.length >= 2);
  assert.ok(
    lowSpecPerf.belowMinimumReasons.some((r) => r.includes('Mesh Shaders'))
  );
  assert.ok(lowSpecPerf.lowSpecSurvivalFps1080p > lowSpecPerf.avgFps);

  const highEndPerf = computeGameOnHardwarePerformance(
    alanWake,
    rtx5070,
    '1440p',
    'High',
    false,
    'DLSS'
  );
  assert.ok(
    highEndPerf.specStatus === 'Meets Recommended' ||
      highEndPerf.specStatus === 'Exceeds Recommended'
  );
  assert.equal(highEndPerf.belowMinimumReasons.length, 0);
  assert.ok(highEndPerf.avgFps > 60);
});

test('even sub-minimum iGPU can run lightweight games like Counter-Strike 2 at playable Low FPS', () => {
  const cs2 = CATALOG_ITEMS.find((i) => i.id === 'game-counter-strike-2')!;
  const irisXe = HARDWARE_TEST_RIGS.find((r) => r.id === 'rig-iris-xe-igpu')!;

  const perfLow = computeGameOnHardwarePerformance(
    cs2,
    irisXe,
    '1080p',
    'Low',
    false,
    'FSR'
  );
  assert.ok(perfLow.avgFps >= 60);
});
