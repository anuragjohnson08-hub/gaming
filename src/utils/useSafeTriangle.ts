import { useEffect, useRef } from 'react';

/**
 * 20. AMAZON SAFE TRIANGLE
 * Prevents premature dropdown/megamenu closure when moving the mouse
 * diagonally across whitespace toward a submenu panel.
 * Uses cursor vector tracking and triangular hit-testing.
 */

interface Point {
  x: number;
  y: number;
}

function isPointInTriangle(p: Point, p0: Point, p1: Point, p2: Point): boolean {
  const dX = p.x - p2.x;
  const dY = p.y - p2.y;
  const dX21 = p2.x - p1.x;
  const dY12 = p1.y - p2.y;
  const D = dY12 * (p0.x - p2.x) + dX21 * (p0.y - p2.y);
  const s = dY12 * dX + dX21 * dY;
  const t = (p2.y - p0.y) * dX + (p0.x - p2.x) * dY;
  if (D < 0) return s <= 0 && t <= 0 && s + t >= D;
  return s >= 0 && t >= 0 && s + t <= D;
}

export function useSafeTriangle(
  submenuRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
  delayMs: number = 240
) {
  const lastMousePosRef = useRef<Point>({ x: 0, y: 0 });
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (!isOpen || !submenuRef.current) {
      onClose();
      return;
    }

    const rect = submenuRef.current.getBoundingClientRect();
    const cursor = lastMousePosRef.current;

    // Corner coordinates of the target submenu
    const topLeft: Point = { x: rect.left, y: rect.top };
    const bottomLeft: Point = { x: rect.left, y: rect.bottom };

    // Check if cursor is heading toward submenu corners
    const insideSafeTriangle = isPointInTriangle(cursor, { x: e.clientX, y: e.clientY }, topLeft, bottomLeft);

    if (insideSafeTriangle) {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => {
        onClose();
      }, delayMs);
    } else {
      onClose();
    }
  };

  const handlePointerEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  return {
    handlePointerLeave,
    handlePointerEnter,
  };
}
