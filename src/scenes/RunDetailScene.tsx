import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from 'remotion';
import { C } from '../theme';
import { BrowserFrame, Cursor, TryLapseLogo } from '../components';

const Chip = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    ready: { bg: 'rgba(34,197,94,0.12)', text: C.ready, border: 'rgba(34,197,94,0.25)' },
    warn: { bg: 'rgba(234,179,8,0.12)', text: C.warn, border: 'rgba(234,179,8,0.25)' },
    danger: { bg: 'rgba(239,68,68,0.12)', text: C.danger, border: 'rgba(239,68,68,0.25)' },
    info: { bg: 'rgba(59,130,246,0.12)', text: C.info, border: 'rgba(59,130,246,0.25)' },
    neutral: { bg: C.surface2, text: C.muted, border: C.border },
  };
  const s = colors[tone] ?? colors.neutral;
  return (
    <span style={{
      fontFamily: C.sans, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 999, paddingLeft: 9, paddingRight: 9, paddingTop: 3, paddingBottom: 3,
      display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

const issues = [
  {
    severity: 'P0', tone: 'danger',
    title: 'Checkout form silent failure on iOS Safari',
    dimension: 'Conversion',
    evidence: 'form.submit() returns undefined — no error thrown, no network request. Affects all mobile-user personas.',
    persona: 'mobile-user',
    recurring: 3,
  },
  {
    severity: 'P1', tone: 'warn',
    title: 'CSV export timeout exceeds 10s for large teams',
    dimension: 'Performance',
    evidence: 'enterprise-admin persona: export triggered at 09:14:22, response received at 09:14:34.1. No loading state shown.',
    persona: 'enterprise-admin',
    recurring: 2,
  },
  {
    severity: 'P1', tone: 'warn',
    title: 'Onboarding step 3 tooltip overlap on 375px viewport',
    dimension: 'Accessibility',
    evidence: 'Tooltip "What\'s next?" renders at y=842, overlapping the primary CTA button. Blocks new-user journey completion.',
    persona: 'new-user',
    recurring: 1,
  },
];

const dimensions = [
  { label: 'Auth & Security', score: 94, tone: 'ready' },
  { label: 'Core Flows', score: 71, tone: 'warn' },
  { label: 'Performance', score: 68, tone: 'warn' },
  { label: 'Accessibility', score: 74, tone: 'warn' },
  { label: 'Error Handling', score: 82, tone: 'ready' },
  { label: 'Conversion', score: 55, tone: 'danger' },
  { label: 'Onboarding', score: 77, tone: 'warn' },
  { label: 'Integration', score: 90, tone: 'ready' },
];

const IssueCard = ({ issue, delay, frame, fps, isHighlighted }: {
  issue: typeof issues[0]; delay: number; frame: number; fps: number; isHighlighted: boolean;
}) => {
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15 }, durationInFrames: 22 });
  const toneColor = issue.tone === 'danger' ? C.danger : issue.tone === 'warn' ? C.warn : C.ready;

  return (
    <div style={{
      background: isHighlighted ? `rgba(${issue.tone === 'danger' ? '239,68,68' : '234,179,8'},0.06)` : C.surface,
      border: `1px solid ${isHighlighted ? (issue.tone === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)') : C.border}`,
      borderLeft: `3px solid ${toneColor}`,
      borderRadius: 8,
      padding: '14px 16px',
      opacity: p,
      transform: `translateX(${interpolate(p, [0, 1], [20, 0])}px)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Chip tone={issue.tone}>{issue.severity}</Chip>
          <Chip tone="info">{issue.dimension}</Chip>
          <Chip>{issue.persona}</Chip>
          {issue.recurring > 1 && <Chip>seen {issue.recurring}× runs</Chip>}
        </div>
      </div>
      <div style={{ fontFamily: C.sans, fontSize: 14, fontWeight: 600, color: C.fg, marginBottom: 6, lineHeight: 1.35 }}>
        {issue.title}
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, lineHeight: 1.55 }}>
        {issue.evidence}
      </div>
    </div>
  );
};

const DimensionRow = ({ label, score, tone, delay, frame, fps }: {
  label: string; score: number; tone: string; delay: number; frame: number; fps: number;
}) => {
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 16 }, durationInFrames: 18 });
  const color = tone === 'ready' ? C.ready : tone === 'warn' ? C.warn : C.danger;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: p, transform: `translateX(${interpolate(p, [0, 1], [-10, 0])}px)`,
    }}>
      <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, width: 110, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: C.surface2, borderRadius: 3, height: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${score * p}%`,
          background: color,
          boxShadow: `0 0 6px ${color}60`,
        }} />
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 600, color, width: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(score * p)}
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
      { label: 'Dashboard', active: false },
      { label: 'Runs', active: true },
      { label: 'Trends', active: false },
      { label: 'Compare', active: false },
    ].map((item) => (
      <div key={item.label} style={{
        padding: '8px 10px', borderRadius: 7,
        background: item.active ? `rgba(124,111,236,0.15)` : 'transparent',
        color: item.active ? C.primary : C.muted,
        fontSize: 13, fontFamily: C.sans, fontWeight: item.active ? 600 : 400,
        border: item.active ? `1px solid rgba(124,111,236,0.2)` : '1px solid transparent',
      }}>
        {item.label}
      </div>
    ))}
  </div>
);

export const RunDetailScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0-25: browser + header enter
  // 25-120: issues stagger in
  // 120-200: dimension grid
  // 200-270: cursor highlights P0 issue
  // 270-300: fade out

  const browserP = spring({ frame, fps, config: { damping: 16, mass: 1.0 }, durationInFrames: 28 });
  const headerP = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 15 }, durationInFrames: 22 });

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = interpolate(frame, [278, 300], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Cursor: hovers over P0 issue card then dimension grid
  const cursorX = interpolate(frame, [0, 50, 160, 220, 280], [400, 600, 400, 900, 1100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [0, 50, 160, 220, 280], [300, 280, 300, 600, 450], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorOpacity = interpolate(frame, [10, 25, 260, 278], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const isP0Highlighted = frame >= 60 && frame <= 150;

  const orbScale = 1 + Math.sin(frame * 0.02) * 0.04;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeIn * fadeOut }}>
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        top: '-10%', right: '-5%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 60%)',
        transform: `scale(${orbScale})`,
      }} />

      <div style={{
        position: 'absolute', top: 60, left: 110, width: 1700, height: 940,
        transform: `scale(${interpolate(browserP, [0, 1], [0.93, 1])})`,
        transformOrigin: 'top center',
        opacity: browserP,
      }}>
        <BrowserFrame url="app.trylapse.dev/acme-corp/runs/20250615-144122" style={{ height: '100%' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <Sidebar />

            <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
              {/* Header */}
              <div style={{
                padding: '22px 28px 16px',
                borderBottom: `1px solid ${C.border}`,
                opacity: headerP,
              }}>
                <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Runs / Jun 15 · 2:41 PM
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h1 style={{ fontFamily: C.sans, fontSize: 20, fontWeight: 700, color: C.fg, letterSpacing: '-0.02em', marginBottom: 8 }}>
                      Rehearsal results
                    </h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Chip tone="warn">78/100 · Amber</Chip>
                      <Chip tone="danger">3 blockers</Chip>
                      <Chip tone="ready">12 highlights</Chip>
                      <Chip>48 pages</Chip>
                      <Chip>8m 24s</Chip>
                      <Chip tone="info">staging</Chip>
                    </div>
                  </div>
                  {/* Launch gate */}
                  <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 10,
                    padding: '10px 16px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: C.sans, fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Launch gate</div>
                    <div style={{ fontFamily: C.sans, fontSize: 16, fontWeight: 700, color: C.danger }}>NOT READY</div>
                    <div style={{ fontFamily: C.sans, fontSize: 10, color: C.muted, marginTop: 2 }}>Fix P0 before promoting</div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px 28px', display: 'flex', gap: 20 }}>
                {/* Left: Issues + highlights */}
                <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Issues section */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 600, color: C.fg }}>Blockers to fix before launch</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {issues.map((issue, i) => (
                        <IssueCard
                          key={issue.title}
                          issue={issue}
                          delay={28 + i * 22}
                          frame={frame}
                          fps={fps}
                          isHighlighted={i === 0 && isP0Highlighted}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Top highlight */}
                  <div style={{
                    background: 'rgba(34,197,94,0.05)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderLeft: `3px solid ${C.ready}`,
                    borderRadius: 8,
                    padding: '14px 16px',
                    opacity: spring({ frame: Math.max(0, frame - 110), fps, config: { damping: 15 }, durationInFrames: 20 }),
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.ready} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, fontWeight: 500 }}>Top highlight</span>
                      <Chip tone="ready">Delight</Chip>
                    </div>
                    <div style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 600, color: C.fg, marginBottom: 6 }}>
                      Onboarding tooltip copy landed well with new-user
                    </div>
                    <div style={{ fontFamily: C.sans, fontSize: 12, fontStyle: 'italic', color: 'rgba(244,244,245,0.7)', borderLeft: `2px solid ${C.ready}`, paddingLeft: 10 }}>
                      &ldquo;Exactly what I needed to see at this moment — the product explains itself.&rdquo;
                    </div>
                    <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginTop: 6 }}>
                      — new-user, Onboarding step 2
                    </div>
                  </div>
                </div>

                {/* Right: Dimension rollup */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 600, color: C.fg }}>8-axis evaluation</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dimensions.map((d, i) => (
                      <DimensionRow
                        key={d.label}
                        {...d}
                        delay={90 + i * 14}
                        frame={frame}
                        fps={fps}
                      />
                    ))}
                  </div>
                  {/* Score summary */}
                  <div style={{
                    borderTop: `1px solid ${C.border}`,
                    paddingTop: 12,
                    opacity: spring({ frame: Math.max(0, frame - 200), fps, config: { damping: 15 }, durationInFrames: 18 }),
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: C.sans, fontSize: 11, color: C.muted }}>Composite readiness</span>
                      <span style={{ fontFamily: C.sans, fontSize: 18, fontWeight: 800, color: C.warn, fontVariantNumeric: 'tabular-nums' }}>78</span>
                    </div>
                    <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginTop: 6 }}>
                      Derived from issue severity · P0 in Conversion pulls band to Amber
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Cursor x={cursorX} y={cursorY} isClicking={false} isPointer opacity={cursorOpacity} />
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};
