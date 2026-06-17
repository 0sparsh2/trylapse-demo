import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { C } from '../theme';

const problems = [
  {
    icon: '⚡',
    title: 'P0 blockers reach production',
    body: 'Critical flows break after every deploy — discovered by users, not your team.',
    color: C.danger,
  },
  {
    icon: '🔍',
    title: 'No systematic pre-launch checks',
    body: 'Manual testing can\'t cover all personas, journeys, and edge-cases before launch.',
    color: C.warn,
  },
  {
    icon: '🕐',
    title: 'Hours debugging, not shipping',
    body: 'Evidence is scattered — screenshots, logs, Slack threads — with no single source of truth.',
    color: C.info,
  },
];

interface CardProps {
  icon: string;
  title: string;
  body: string;
  color: string;
  frame: number;
  enterAt: number;
  exitAt: number;
  fps: number;
}

const ProblemCard: React.FC<CardProps> = ({ icon, title, body, color, frame, enterAt, exitAt, fps }) => {
  const enterP = spring({ frame: Math.max(0, frame - enterAt), fps, config: { damping: 15, stiffness: 90 }, durationInFrames: 22 });
  const exitP = interpolate(frame, [exitAt, exitAt + 18], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = enterP * exitP;

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      opacity,
      transform: `translateX(${interpolate(enterP, [0, 1], [40, 0])}px)`,
      boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
      maxWidth: 680,
    }}>
      <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1.2, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: C.sans, fontSize: 17, fontWeight: 600, color: C.fg, marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontFamily: C.sans, fontSize: 14, color: C.muted, lineHeight: 1.6 }}>
          {body}
        </div>
      </div>
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Headline
  const headlineP = spring({ frame, fps, config: { damping: 14 }, durationInFrames: 24 });
  const headlineExit = interpolate(frame, [150, 168], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Bridge statement
  const bridgeP = spring({ frame: Math.max(0, frame - 158), fps, config: { damping: 13 }, durationInFrames: 26 });
  const bridgeExit = interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Scene fade in
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const orbScale = 1 + Math.sin(frame * 0.02) * 0.05;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeIn }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: 800, height: 800,
        borderRadius: '50%',
        top: '-10%', right: '-5%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 60%)',
        transform: `scale(${orbScale})`,
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 32,
        paddingLeft: 80, paddingRight: 80,
      }}>
        {/* Headline */}
        {frame < 175 && (
          <div style={{
            opacity: headlineP * headlineExit,
            transform: `translateY(${interpolate(headlineP, [0, 1], [-20, 0])}px)`,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: C.sans, fontSize: 13, fontWeight: 600,
              color: C.danger, letterSpacing: '0.14em', textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              The Problem
            </div>
            <h2 style={{
              fontFamily: C.sans, fontSize: 54, fontWeight: 800,
              color: C.fg, letterSpacing: '-0.03em', lineHeight: 1.1,
              marginBottom: 48,
            }}>
              Teams ship blind.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              {problems.map((p, i) => (
                <ProblemCard
                  key={p.title}
                  {...p}
                  frame={frame}
                  enterAt={24 + i * 22}
                  exitAt={130 + i * 8}
                  fps={fps}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bridge */}
        {frame >= 155 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            opacity: bridgeP * bridgeExit,
            transform: `translateY(${interpolate(bridgeP, [0, 1], [30, 0])}px)`,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: C.surface2,
              border: `1px solid ${C.borderStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 24,
              boxShadow: `0 0 20px ${C.primaryGlow}`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: C.sans, fontSize: 48, fontWeight: 800,
              color: C.fg, letterSpacing: '-0.03em',
              textAlign: 'center', lineHeight: 1.15,
            }}>
              There&rsquo;s a better way.
            </h2>
            <div style={{
              fontFamily: C.sans, fontSize: 20, color: C.muted,
              marginTop: 16, textAlign: 'center',
            }}>
              Rehearse every journey before users do.
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
