import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C } from '../theme';
import { TryLapseLogo } from '../components';

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 13, stiffness: 90 }, durationInFrames: 28 });
  const tagP = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 14 }, durationInFrames: 26 });
  const subP = spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 15 }, durationInFrames: 24 });
  const chipP = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 16 }, durationInFrames: 20 });

  const fadeOut = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Subtle ambient orb pulse
  const orbScale = 1 + Math.sin(frame * 0.025) * 0.06;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeOut }}>
      {/* Ambient glow orbs */}
      <div style={{
        position: 'absolute',
        width: 700, height: 700,
        borderRadius: '50%',
        top: '5%', left: '25%',
        background: 'radial-gradient(circle, rgba(124,111,236,0.10) 0%, transparent 65%)',
        transform: `scale(${orbScale})`,
      }} />
      <div style={{
        position: 'absolute',
        width: 400, height: 400,
        borderRadius: '50%',
        bottom: '10%', right: '20%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 65%)',
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.4,
      }} />

      {/* Main content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 28,
      }}>
        {/* Logo lockup */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          opacity: logoP,
          transform: `translateY(${interpolate(logoP, [0, 1], [36, 0])}px)`,
        }}>
          {/* Logo mark */}
          <div style={{
            filter: `drop-shadow(0 0 20px ${C.primaryGlow}) drop-shadow(0 0 40px rgba(124,111,236,0.2))`,
          }}>
            <TryLapseLogo size={80} color={C.primary} />
          </div>

          <span style={{
            fontFamily: C.sans,
            fontSize: 72,
            fontWeight: 800,
            color: C.fg,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}>
            TryLapse
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: tagP,
          transform: `translateY(${interpolate(tagP, [0, 1], [22, 0])}px)`,
          fontFamily: C.sans,
          fontSize: 28,
          fontWeight: 400,
          color: C.muted,
          letterSpacing: '0.005em',
          textAlign: 'center',
        }}>
          Pre-launch readiness, observed.
        </div>

        {/* Sub line */}
        <div style={{
          opacity: subP * 0.65,
          transform: `translateY(${interpolate(subP, [0, 1], [16, 0])}px)`,
          fontFamily: C.sans,
          fontSize: 15,
          fontWeight: 400,
          color: C.muted,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}>
          AI-powered launch readiness for product teams
        </div>

        {/* Chip row */}
        <div style={{
          display: 'flex', gap: 10,
          opacity: chipP,
          transform: `translateY(${interpolate(chipP, [0, 1], [12, 0])}px)`,
          marginTop: 4,
        }}>
          {['Behavioral Testing', 'Evidence-bound', 'Zero auto-fix'].map((label) => (
            <div key={label} style={{
              fontFamily: C.sans,
              fontSize: 12,
              fontWeight: 500,
              color: C.muted,
              background: C.surface2,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 5,
              paddingBottom: 5,
              letterSpacing: '0.02em',
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
