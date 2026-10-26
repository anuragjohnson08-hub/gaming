import React, { useEffect, useRef } from 'react';

interface LavaBlobState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  baseRadius: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  vRot: number;
  phase: number;
  phaseSpeed: number;
  gradient: string;
  coreHighlight: string;
  opacity: number;
}

const INITIAL_BLOBS: Omit<
  LavaBlobState,
  'vx' | 'vy' | 'targetX' | 'targetY' | 'scaleX' | 'scaleY' | 'rotation' | 'vRot' | 'phase'
>[] = [
  {
    x: 14,
    y: 82,
    baseRadius: 250,
    phaseSpeed: 0.014,
    gradient:
      'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #7CE8F2 28%, #266D75 74%, #1D4E56 100%)',
    coreHighlight: 'rgba(181, 238, 242, 0.88)',
    opacity: 0.88,
  },
  {
    x: 28,
    y: 24,
    baseRadius: 210,
    phaseSpeed: 0.018,
    gradient:
      'radial-gradient(circle at 30% 25%, #FAF8FF 0%, #B4AAFA 34%, #584CE8 78%, #312A75 100%)',
    coreHighlight: 'rgba(196, 188, 252, 0.85)',
    opacity: 0.86,
  },
  {
    x: 52,
    y: 68,
    baseRadius: 280,
    phaseSpeed: 0.012,
    gradient:
      'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #99F6E4 32%, #0D9488 76%, #134E4A 100%)',
    coreHighlight: 'rgba(153, 246, 228, 0.82)',
    opacity: 0.84,
  },
  {
    x: 76,
    y: 22,
    baseRadius: 240,
    phaseSpeed: 0.016,
    gradient:
      'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #D8B4FE 32%, #7C3AED 78%, #3B0764 100%)',
    coreHighlight: 'rgba(216, 180, 254, 0.85)',
    opacity: 0.86,
  },
  {
    x: 84,
    y: 78,
    baseRadius: 260,
    phaseSpeed: 0.015,
    gradient:
      'radial-gradient(circle at 30% 28%, #FFFFFF 0%, #A5F3FC 30%, #4F46E5 78%, #2E276C 100%)',
    coreHighlight: 'rgba(165, 243, 252, 0.85)',
    opacity: 0.88,
  },
  {
    x: 42,
    y: 38,
    baseRadius: 185,
    phaseSpeed: 0.021,
    gradient:
      'radial-gradient(circle at 34% 26%, #FFF5FA 0%, #F5D0FE 35%, #6366F1 80%, #312A75 100%)',
    coreHighlight: 'rgba(245, 208, 254, 0.84)',
    opacity: 0.84,
  },
  {
    x: 64,
    y: 44,
    baseRadius: 170,
    phaseSpeed: 0.023,
    gradient:
      'radial-gradient(circle at 30% 26%, #FFFFFF 0%, #67E8F9 34%, #0284C7 78%, #1E3A8A 100%)',
    coreHighlight: 'rgba(103, 232, 249, 0.84)',
    opacity: 0.85,
  },
  {
    x: 18,
    y: 52,
    baseRadius: 165,
    phaseSpeed: 0.02,
    gradient:
      'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #C4B5FD 34%, #4338CA 78%, #1E1B4B 100%)',
    coreHighlight: 'rgba(196, 181, 253, 0.85)',
    opacity: 0.85,
  },
  {
    x: 56,
    y: 14,
    baseRadius: 150,
    phaseSpeed: 0.025,
    gradient:
      'radial-gradient(circle at 32% 28%, #FFFFFF 0%, #99F6E4 35%, #584CE8 82%, #2E276C 100%)',
    coreHighlight: 'rgba(167, 243, 208, 0.85)',
    opacity: 0.82,
  },
  {
    x: 88,
    y: 48,
    baseRadius: 155,
    phaseSpeed: 0.022,
    gradient:
      'radial-gradient(circle at 30% 25%, #FFFFFF 0%, #DDD6FE 35%, #584CE8 78%, #266D75 100%)',
    coreHighlight: 'rgba(221, 214, 254, 0.85)',
    opacity: 0.82,
  },
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Interactive & Autonomous Lava Lamp Background with True Random Motion.
 * Combines SVG metaball goo fusion (#nexus-lava-goo) with a continuous
 * random-walk buoyancy physics loop so molten pastel/indigo/aqua lava blobs
 * rise, sink, merge, split, and morph organically behind the frosted glass UI.
 */
export const PastelGlassBackdrop: React.FC = () => {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const specularRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const states: LavaBlobState[] = INITIAL_BLOBS.map((cfg, i) => ({
      ...cfg,
      vx: randomBetween(-0.035, 0.035),
      vy: randomBetween(-0.045, 0.045),
      targetX: randomBetween(8, 92),
      targetY: randomBetween(8, 92),
      scaleX: 1,
      scaleY: 1,
      rotation: i * 36,
      vRot: randomBetween(-0.14, 0.14),
      phase: randomBetween(0, Math.PI * 2),
    }));

    let rafId = 0;

    const tick = () => {
      for (let i = 0; i < states.length; i++) {
        const b = states[i];
        b.phase += b.phaseSpeed;

        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        const dist = Math.hypot(dx, dy);

        // Pick a fresh random waypoint whenever the blob gets close or randomly on a thermal pulse
        if (dist < 6 || Math.random() < 0.004) {
          b.targetX = randomBetween(6, 94);
          // Lava lamp thermal convection: alternate between rising toward top and sinking to base
          b.targetY =
            Math.random() < 0.5
              ? randomBetween(5, 42)
              : randomBetween(58, 95);
        }

        // Smooth steering toward the random target + organic Perlin-like harmonic turbulence
        const steerX = (dx / Math.max(dist, 1)) * 0.0022;
        const steerY = (dy / Math.max(dist, 1)) * 0.0026;

        b.vx =
          (b.vx + steerX + Math.sin(b.phase * 1.3 + i) * 0.0009) * 0.985;
        b.vy =
          (b.vy + steerY + Math.cos(b.phase * 0.9 + i * 1.7) * 0.0011) * 0.985;

        b.x += b.vx;
        b.y += b.vy;

        // Soft boundary bounce inside viewport percentage [4..96]
        if (b.x < 4) {
          b.x = 4;
          b.vx = Math.abs(b.vx) * 0.8;
          b.targetX = randomBetween(25, 85);
        } else if (b.x > 96) {
          b.x = 96;
          b.vx = -Math.abs(b.vx) * 0.8;
          b.targetX = randomBetween(15, 75);
        }

        if (b.y < 4) {
          b.y = 4;
          b.vy = Math.abs(b.vy) * 0.8;
          b.targetY = randomBetween(50, 92);
        } else if (b.y > 96) {
          b.y = 96;
          b.vy = -Math.abs(b.vy) * 0.8;
          b.targetY = randomBetween(8, 48);
        }

        // Organic lava wax stretching and squishing
        b.scaleX = 1 + Math.sin(b.phase) * 0.22 + Math.cos(b.phase * 0.6) * 0.08;
        b.scaleY = 1 + Math.cos(b.phase) * 0.24 - Math.sin(b.phase * 0.7) * 0.09;
        b.rotation += b.vRot;

        const r1 = Math.round(50 + Math.sin(b.phase * 1.1) * 18);
        const r2 = Math.round(50 + Math.cos(b.phase * 0.9) * 18);
        const r3 = Math.round(50 + Math.sin(b.phase * 0.7 + 1.2) * 18);
        const r4 = Math.round(50 + Math.cos(b.phase * 1.3 + 2.1) * 18);
        const borderRadius = `${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${r4}% ${100 - r4}% ${100 - r3}%`;

        const el = blobRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${b.x}vw, ${b.y}vh, 0) translate(-50%, -50%) rotate(${b.rotation.toFixed(
            1
          )}deg) scale(${b.scaleX.toFixed(3)}, ${b.scaleY.toFixed(3)})`;
          el.style.borderRadius = borderRadius;
        }

        const specEl = specularRefs.current[i];
        if (specEl) {
          specEl.style.transform = `translate3d(${b.x}vw, ${b.y}vh, 0) translate(-50%, -50%) rotate(${(
            -b.rotation * 0.6
          ).toFixed(1)}deg) scale(${(b.scaleX * 0.88).toFixed(3)}, ${(
            b.scaleY * 0.88
          ).toFixed(3)})`;
          specEl.style.borderRadius = borderRadius;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="lava-lamp-backdrop"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* 1. Base Luminous Pastel Aqua-Cyan to Periwinkle-Lavender Chamber */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #AEEBF0 0%, #C8F3F7 26%, #E2EEFC 52%, #D7D1FA 78%, #C1B9F7 100%)',
        }}
      />

      {/* 2. SVG Metaball Goo Filter Definition for Authentic Lava Lamp Fusion */}
      <svg className="hidden" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="nexus-lava-goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* 3. Primary Metaball Lava Lamp Layer (Blobs Merge & Pinch Together) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'url(#nexus-lava-goo)' }}
      >
        {INITIAL_BLOBS.map((blob, idx) => (
          <div
            key={`lava-goo-${idx}`}
            ref={(el) => {
              blobRefs.current[idx] = el;
            }}
            data-testid={`lava-blob-${idx}`}
            className="nexus-lava-blob absolute top-0 left-0 will-change-transform"
            style={{
              width: `${blob.baseRadius}px`,
              height: `${blob.baseRadius}px`,
              background: blob.gradient,
              opacity: blob.opacity,
              transform: `translate3d(${blob.x}vw, ${blob.y}vh, 0) translate(-50%, -50%)`,
              borderRadius: '54% 46% 61% 39% / 48% 58% 42% 52%',
              boxShadow: `0 18px 44px rgba(49, 42, 117, 0.22), inset 0 8px 22px rgba(255, 255, 255, 0.75)`,
            }}
          />
        ))}
      </div>

      {/* 4. 3D Specular Wax Sheen Layer (Gives Each Lava Globule Depth & Refraction) */}
      <div className="absolute inset-0 w-full h-full opacity-75 mix-blend-overlay">
        {INITIAL_BLOBS.map((blob, idx) => (
          <div
            key={`lava-specular-${idx}`}
            ref={(el) => {
              specularRefs.current[idx] = el;
            }}
            className="absolute top-0 left-0 will-change-transform blur-md"
            style={{
              width: `${Math.round(blob.baseRadius * 0.72)}px`,
              height: `${Math.round(blob.baseRadius * 0.72)}px`,
              background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, ${blob.coreHighlight} 48%, transparent 76%)`,
              transform: `translate3d(${blob.x}vw, ${blob.y}vh, 0) translate(-50%, -50%)`,
              borderRadius: '50%',
            }}
          />
        ))}
      </div>

      {/* 5. Architectural Color Grid Overlay (Preserves the Crisp Pastel Grid Reference) */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.44) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.44) 1px, transparent 1px),
            linear-gradient(to right, rgba(88, 76, 232, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(88, 76, 232, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '96px 96px, 96px 96px, 24px 24px, 24px 24px',
        }}
      />
    </div>
  );
};
