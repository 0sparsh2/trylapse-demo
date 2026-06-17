import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface AnimatedNumberProps {
  value: number;
  startFrame?: number;
  duration?: number;
  decimals?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  startFrame = 0,
  duration = 45,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const current = value * progress;
  return <>{current.toFixed(decimals)}</>;
};
