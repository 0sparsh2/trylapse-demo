import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { HeroScene } from './scenes/HeroScene';
import { ProblemScene } from './scenes/ProblemScene';
import { DashboardScene } from './scenes/DashboardScene';
import { RunScene } from './scenes/RunScene';
import { RunDetailScene } from './scenes/RunDetailScene';
import { CTAScene } from './scenes/CTAScene';

// Crossfade overlap: 15 frames between every clip.
// Each scene's fadeIn spans [0, 15] and fadeOut spans [duration-15, duration].
// During the 15-frame overlap both scenes are visible → smooth dissolve.
//
// Scene     Duration  From    Ends-at
// Hero        90       0        90
// Problem    210      75       285
// Dashboard  360     270       630
// Run        270     615       885
// RunDetail  300     870      1170
// CTA        210    1155      1365
//
// Total: 1365 frames = 45.5 s @ 30 fps

const OVERLAP = 15;

export const TryLapseVideo: React.FC = () => {
  const durations = [90, 210, 360, 270, 300, 210];

  // Compute sequence start positions with overlap
  const froms = durations.reduce<number[]>((acc, dur, i) => {
    if (i === 0) return [0];
    return [...acc, acc[i - 1] + durations[i - 1] - OVERLAP];
  }, []);

  return (
    <AbsoluteFill>
      <Sequence from={froms[0]} durationInFrames={durations[0]}>
        <HeroScene />
      </Sequence>
      <Sequence from={froms[1]} durationInFrames={durations[1]}>
        <ProblemScene />
      </Sequence>
      <Sequence from={froms[2]} durationInFrames={durations[2]}>
        <DashboardScene />
      </Sequence>
      <Sequence from={froms[3]} durationInFrames={durations[3]}>
        <RunScene />
      </Sequence>
      <Sequence from={froms[4]} durationInFrames={durations[4]}>
        <RunDetailScene />
      </Sequence>
      <Sequence from={froms[5]} durationInFrames={durations[5]}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
