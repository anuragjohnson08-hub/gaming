import { useRef, useState } from 'react';

/**
 * 10. SWIPE-TO-DISMISS SHEETS
 * Smooth touch gesture tracker with rubber-banding resistance
 * and velocity threshold detection to dismiss modal sheets and drawers.
 */

interface SwipeToDismissOptions {
  onDismiss: () => void;
  threshold?: number;
}

export function useSwipeToDismiss({ onDismiss, threshold = 80 }: SwipeToDismissOptions) {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    startTimeRef.current = Date.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    if (deltaY > 0) {
      // Rubber-band resistance
      const resisted = Math.pow(deltaY, 0.88);
      setOffsetY(resisted);
    } else {
      setOffsetY(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = e.changedTouches[0].clientY - startYRef.current;
    const deltaTime = Date.now() - startTimeRef.current;
    const velocity = deltaY / (deltaTime || 1);

    if (deltaY > threshold || (velocity > 0.45 && deltaY > 30)) {
      onDismiss();
    }
    setOffsetY(0);
  };

  return {
    offsetY,
    isDragging,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
