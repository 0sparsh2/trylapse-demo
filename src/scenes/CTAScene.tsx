import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C } from '../theme';
import { TryLapseLogo } from '../components';

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoP = spring({ frame, fps, config: { damping: 13, stiffness: 90 }, durationInFrames: 26 });
  const headlineP = spring({ frame: Math.max(0, frame - 16), fps, config: { damping: 14 }, durationInFrames: 24 });
  const subP = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 15 }, durationInFrames: 22 });
  const ctaP = spring({ frame: Math.max(0, frame - 48), fps, config: { damping: 14 }, durationInFrames: 20 });
  const featP = spring({ frame: Math.max(0, frame - 64), fps, config: { damping: 15 }, durationInFrames: 18 });

  const fadeOut = interpolate(frame, [188, 210], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const orbScale1 = 1 + Math.sin(frame * 0.022) * 0.07;
  const orbScale2 = 1 + Math.sin(frame * 0.018 + 1.5) * 0.06;

  const features = [
    '4 AI personas per run',
    '8-axis readiness scoring',
    'Evidence-bound — no hallucinations',
    'Ships as a CLI in minutes',
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeIn * fadeOut }}>
      {/* Animated ambient orbs */}
      <div style={{
        position: 'absolute', width: 800, height: 800, borderRadius: '50%',
        top: '-15%', left: '15%',
        background: 'radial-gradient(circle, rgba(124,111,236,0.13) 0%, transparent 60%)',
        transform: `scale(${orbScale1})`,
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        bottom: '5%', right: '10%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 60%)',
        transform: `scale(${orbScale2})`,
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        bottom: '20%', left: '5%',
        background: 'radial-gradient(circle, rgba(234,179,8,0.05) 0%, transparent 60%)',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        opacity: 0.35,
      }} />

      {/* Main content */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 20,
          opacity: logoP,
          transform: `translateY(${interpolate(logoP, [0, 1], [28, 0])}px)`,
        }}>
          <div style={{ filter: `drop-shadow(0 0 18px ${C.primaryGlow})` }}>
            <TryLapseLogo size={68} color={C.primary} />
          </div>
          <span style={{ fontFamily: C.sans, fontSize: 56, fontWeight: 800, color: C.fg, letterSpacing: '-0.04em', lineHeight: 1 }}>
            TryLapse
          </span>
        </div>

        {/* Main headline */}
        <div style={{
          opacity: headlineP,
          transform: `translateY(${interpolate(headlineP, [0, 1], [22, 0])}px)`,
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: C.sans, fontSize: 64, fontWeight: 800,
            color: C.fg, letterSpacing: '-0.04em', lineHeight: 1.05,
            margin: 0,
          }}>
            Ship with confidence.
          </h1>
        </div>

        {/* Sub */}
        <div style={{
          opacity: subP * 0.75,
          transform: `translateY(${interpolate(subP, [0, 1], [16, 0])}px)`,
          fontFamily: C.sans, fontSize: 20, color: C.muted,
          textAlign: 'center', lineHeight: 1.5,
          maxWidth: 560,
        }}>
          Rehearse every user journey with AI personas before your users see it. Evidence-bound readiness in minutes.
        </div>

        {/* CTA */}
        <div style={{
          opacity: ctaP,
          transform: `translateY(${interpolate(ctaP, [0, 1], [14, 0])}px)`,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{
            fontFamily: C.mono, fontSize: 18, fontWeight: 700,
            padding: '14px 40px',
            borderRadius: 12,
            background: C.primary,
            color: 'white',
            boxShadow: `0 4px 24px rgba(124,111,236,0.45), 0 0 0 1px rgba(124,111,236,0.4)`,
            letterSpacing: '0.01em',
          }}>
            trylapse.dev
          </div>
          <div style={{
            fontFamily: C.sans, fontSize: 14,
            padding: '14px 24px',
            borderRadius: 12,
            background: 'transparent',
            color: C.muted,
            border: `1px solid ${C.border}`,
          }}>
            npm install -g trylapse
          </div>
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
          opacity: featP,
          transform: `translateY(${interpolate(featP, [0, 1], [10, 0])}px)`,
        }}>
          {features.map((f, i) => (
            <div key={f} style={{
              fontFamily: C.sans, fontSize: 12, fontWeight: 500,
              color: C.muted,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              paddingLeft: 14, paddingRight: 14, paddingTop: 6, paddingBottom: 6,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.ready} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {f}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
