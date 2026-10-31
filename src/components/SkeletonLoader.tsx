import React from 'react';

/**
 * 1. SKELETON LOADERS
 * Clean, shimmering content placeholders preventing layout shifts
 * while live telemetry or filters revalidate.
 */

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'line' | 'avatar' | 'rect';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
}) => {
  if (variant === 'card') {
    return (
      <div className={`nexus-editorial-card rounded-3xl p-4 flex flex-col justify-between ${className}`}>
        <div className="w-full aspect-[4/3] rounded-2xl nexus-skeleton mb-3.5" />
        <div className="space-y-2">
          <div className="h-3 w-1/3 rounded-full nexus-skeleton" />
          <div className="h-5 w-4/5 rounded-full nexus-skeleton" />
          <div className="h-3 w-full rounded-full nexus-skeleton" />
        </div>
        <div className="mt-4 pt-3 border-t border-[#2E276C]/10 flex items-center justify-between">
          <div className="h-4 w-20 rounded-full nexus-skeleton" />
          <div className="h-7 w-24 rounded-full nexus-skeleton" />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className={`rounded-full nexus-skeleton ${className}`} />;
  }

  if (variant === 'line') {
    return <div className={`h-3 rounded-full nexus-skeleton ${className}`} />;
  }

  return <div className={`rounded-xl nexus-skeleton ${className}`} />;
};
