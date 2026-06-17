import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from 'remotion';
import { C } from '../theme';
import { BrowserFrame, Cursor, TryLapseLogo } from '../components';

const logLines = [
  { t: 10, text: '→  Starting rehearsal run · acme-corp/staging', color: C.primary },
  { t: 18, text: '→  Crawling 48 pages…', color: C.muted },
  { t: 28, text: '✓  Sitemap built · 48 routes discovered', color: C.ready },
  { t: 40, text: '→  Spawning 4 persona agents', color: C.muted },
  { t: 52, text: '→  [power-user] Login → Dashboard → Checkout', color: C.muted },
  { t: 60, text: '→  [new-user] Signup → Onboarding → First action', color: C.muted },
  { t: 68, text: '→  [mobile-user] iOS Safari · viewport 390×844', color: C.muted },
  { t: 76, text: '→  [enterprise-admin] SSO → Team management → Export', color: C.muted },
  { t: 90, text: '✓  [power-user] Login journey PASSED · 1.1s p95', color: C.ready },
  { t: 104, text: '✗  [mobile-user] Checkout form FAILED · silent submit error', color: C.danger },
  { t: 114, text: '   evidence: screenshot captured · DOM snapshot saved', color: C.muted },
  { t: 122, text: '✓  [new-user] Onboarding PASSED · 3 highlights captured', color: C.ready },
  { t: 132, text: '⚠  [enterprise-admin] Export CSV timeout > 10s · P1', color: C.warn },
  { t: 144, text: '✓  Scoring 8-axis evaluation rubric…', color: C.muted },
  { t: 155, text: '✓  Readiness score: 78/100 · Amber band', color: C.warn },
  { t: 162, text: '✓  Run complete · 8m 24s · $0.034 agent cost', color: C.ready },
];

const Chip = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    ready: { bg: 'rgba(34,197,94,0.12)', text: C.ready, border: 'rgba(34,197,94,0.25)' },
    warn: { bg: 'rgba(234,179,8,0.12)', text: C.warn, border: 'rgba(234,179,8,0.25)' },
    danger: { bg: 'rgba(239,68,68,0.12)', text: C.danger, border: 'rgba(239,68,68,0.25)' },
    info: { bg: 'rgba(59,130,246,0.12)', text: C.info, border: 'rgba(59,130,246,0.25)' },
    neutral: { bg: C.surface2, text: C.muted, border: C.border },
    running: { bg: 'rgba(124,111,236,0.12)', text: C.primary, border: 'rgba(124,111,236,0.25)' },
  };
  const s = colors[tone] ?? colors.neutral;
  return (
    <span style={{
      fontFamily: C.sans, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 999, paddingLeft: 9, paddingRight: 9, paddingTop: 3, paddingBottom: 3,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {children}
    </span>
  );
};

// Animated progress bar for agent
const AgentBar = ({ label, journeys, status, delay, frame, fps }: {
  label: string; journeys: string; status: string; delay: number; frame: number; fps: number;
}) => {
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15 }, durationInFrames: 20 });
  const statusTone = status === 'done' ? 'ready' : status === 'error' ? 'danger' : status === 'running' ? 'running' : 'neutral';
  const progressWidth = status === 'done' ? 100 : status === 'running' ? 55 + Math.sin(frame * 0.08) * 8 : 0;

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '12px 16px',
      opacity: p,
      transform: `translateX(${interpolate(p, [0, 1], [20, 0])}px)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {status === 'running' && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: C.primary,
              animation: 'pulse 1s infinite',
            }} />
          )}
          <span style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 600, color: C.fg }}>{label}</span>
        </div>
        <Chip tone={statusTone}>{status}</Chip>
      </div>
      <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginBottom: 8 }}>{journeys}</div>
      <div style={{ background: C.surface2, borderRadius: 3, height: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressWidth}%`,
          background: status === 'done' ? C.ready : status === 'error' ? C.danger : C.primary,
          borderRadius: 3,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
};

const Sidebar = () => (
  <div style={{
    width: 196, background: C.surface,
    borderRight: `1px solid ${C.border}`,
    padding: '20px 12px',
    display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, paddingBottom: 24, paddingTop: 4 }}>
      <TryLapseLogo size={28} color={C.primary} />
      <span style={{ fontFamily: C.sans, fontSize: 15, fontWeight: 700, color: C.fg, letterSpacing: '-0.02em' }}>TryLapse</span>
    </div>
    {[
      { label: 'Dashboard', icon: '□', active: false },
      { label: 'Runs', icon: '◎', active: true },
      { label: 'Trends', icon: '↗', active: false },
    ].map((item) => (
      <div key={item.label} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7,
        background: item.active ? `rgba(124,111,236,0.15)` : 'transparent',
        color: item.active ? C.primary : C.muted,
        fontSize: 13, fontFamily: C.sans, fontWeight: item.active ? 600 : 400,
        border: item.active ? `1px solid rgba(124,111,236,0.2)` : '1px solid transparent',
      }}>
        <span style={{ fontSize: 12 }}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

export const RunScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0-20: click ripple, button presses (from DashboardScene handoff)
  // 20-80: "Job queued" banner slides in, agent cards appear
  // 80-220: log lines stream in
  // 220-270: completion state

  const bannerP = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 14 }, durationInFrames: 22 });
  const headerP = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 15 }, durationInFrames: 22 });

  // Visible log lines up to current frame
  const visibleLogs = logLines.filter((l) => frame >= l.t + 20);

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [248, 270], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const agents = [
    { label: 'power-user', journeys: 'Login → Dashboard → Checkout', status: frame < 40 ? 'queued' : frame < 130 ? 'running' : 'done', delay: 30 },
    { label: 'new-user', journeys: 'Signup → Onboarding → First action', status: frame < 50 ? 'queued' : frame < 140 ? 'running' : 'done', delay: 42 },
    { label: 'mobile-user', journeys: 'iOS Safari · Checkout flow', status: frame < 60 ? 'queued' : frame < 120 ? 'running' : 'error', delay: 54 },
    { label: 'enterprise-admin', journeys: 'SSO → Team mgmt → Export', status: frame < 70 ? 'queued' : frame < 155 ? 'running' : 'done', delay: 66 },
  ];

  const isComplete = frame >= 165;
  const completionP = spring({ frame: Math.max(0, frame - 165), fps, config: { damping: 14 }, durationInFrames: 22 });

  const cursorX = interpolate(frame, [0, 5, 10, 15], [362, 360, 380, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [0, 5, 10, 15], [200, 198, 205, 198], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isClicking = frame <= 8;
  const cursorOpacity = interpolate(frame, [0, 3, 20, 30], [1, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeIn * fadeOut }}>
      {/* Ambient */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        top: '10%', left: '30%',
        background: 'radial-gradient(circle, rgba(124,111,236,0.07) 0%, transparent 60%)',
      }} />

      <div style={{
        position: 'absolute', top: 60, left: 110, width: 1700, height: 940,
      }}>
        <BrowserFrame url="app.trylapse.dev/acme-corp/runs" style={{ height: '100%' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <Sidebar />

            <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
              {/* Active job banner */}
              <div style={{
                padding: '10px 24px',
                background: 'rgba(124,111,236,0.08)',
                borderBottom: `1px solid rgba(124,111,236,0.18)`,
                display: 'flex', alignItems: 'center', gap: 12,
                opacity: bannerP,
                transform: `translateY(${interpolate(bannerP, [0, 1], [-8, 0])}px)`,
              }}>
                {/* Spinner */}
                <div style={{
                  width: 14, height: 14,
                  border: `2px solid rgba(124,111,236,0.3)`,
                  borderTopColor: C.primary,
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                <span style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 500, color: C.primary }}>
                  Rehearsal running · 4 agents · 12 journeys
                </span>
                <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginLeft: 'auto' }}>
                  {Math.min(100, Math.round((frame / 165) * 100))}% complete
                </span>
              </div>

              {/* Page header */}
              <div style={{
                padding: '22px 28px 16px',
                borderBottom: `1px solid ${C.border}`,
                opacity: headerP,
              }}>
                <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>Runs</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h1 style={{ fontFamily: C.sans, fontSize: 20, fontWeight: 700, color: C.fg, letterSpacing: '-0.02em' }}>
                    Current rehearsal
                  </h1>
                  {isComplete && (
                    <div style={{
                      opacity: completionP,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Chip tone="warn">78/100 · Amber</Chip>
                      <Chip tone="danger">3 blockers</Chip>
                      <Chip tone="ready">12 highlights</Chip>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Agent grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {agents.map((a) => (
                    <AgentBar key={a.label} {...a} frame={frame} fps={fps} />
                  ))}
                </div>

                {/* Log stream */}
                <div style={{
                  background: '#050508',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '16px 18px',
                  minHeight: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <div style={{ fontFamily: C.sans, fontSize: 10, color: C.muted, fontWeight: 500, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Agent stream
                  </div>
                  {visibleLogs.map((log, i) => {
                    const lineP = spring({ frame: Math.max(0, frame - (log.t + 20)), fps, config: { damping: 18, stiffness: 160 }, durationInFrames: 8 });
                    return (
                      <div key={i} style={{
                        fontFamily: C.mono, fontSize: 11.5, color: log.color,
                        lineHeight: 1.5,
                        opacity: lineP,
                        transform: `translateX(${interpolate(lineP, [0, 1], [-6, 0])}px)`,
                      }}>
                        {log.text}
                      </div>
                    );
                  })}
                  {/* Blinking cursor */}
                  {!isComplete && (
                    <div style={{
                      width: 7, height: 13,
                      background: C.muted,
                      marginTop: 2,
                      opacity: Math.round(frame / 8) % 2 === 0 ? 1 : 0,
                    }} />
                  )}
                </div>

                {/* Completion summary */}
                {isComplete && (
                  <div style={{
                    opacity: completionP,
                    transform: `translateY(${interpolate(completionP, [0, 1], [10, 0])}px)`,
                    background: 'rgba(34,197,94,0.05)',
                    border: `1px solid rgba(34,197,94,0.15)`,
                    borderRadius: 10,
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: `1px solid rgba(34,197,94,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ready} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: C.sans, fontSize: 14, fontWeight: 600, color: C.fg, marginBottom: 3 }}>
                        Rehearsal complete · 8m 24s
                      </div>
                      <div style={{ fontFamily: C.sans, fontSize: 12, color: C.muted }}>
                        Readiness score 78/100 (Amber) · 3 blockers to fix before launch · 12 highlights
                      </div>
                    </div>
                    <button style={{
                      marginLeft: 'auto', flexShrink: 0,
                      fontFamily: C.sans, fontSize: 12, fontWeight: 600,
                      padding: '8px 18px', borderRadius: 7,
                      background: C.primary, color: 'white', border: 'none', cursor: 'pointer',
                    }}>
                      View results →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Click cursor */}
          <Cursor x={cursorX} y={cursorY} isClicking={isClicking} isPointer opacity={cursorOpacity} />
        </BrowserFrame>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AbsoluteFill>
  );
};
