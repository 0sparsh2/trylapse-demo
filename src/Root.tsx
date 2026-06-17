import React from 'react';
import { Composition } from 'remotion';
import { TryLapseVideo } from './TryLapseVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TryLapseDemo"
      component={TryLapseVideo}
      durationInFrames={1365}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
