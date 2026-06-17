import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  spring, interpolate,
} from 'remotion';
import { C } from '../theme';
import { BrowserFrame, Cursor, AnimatedNumber, TryLapseLogo } from '../components';

// ── Mini UI primitives ───────────────────────────────────────────────────────

const Chip = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    ready: { bg: 'rgba(34,197,94,0.12)', text: C.ready, border: 'rgba(34,197,94,0.25)' },
    warn: { bg: 'rgba(234,179,8,0.12)', text: C.warn, border: 'rgba(234,179,8,0.25)' },
    danger: { bg: 'rgba(239,68,68,0.12)', text: C.danger, border: 'rgba(239,68,68,0.25)' },
    info: { bg: 'rgba(59,130,246,0.12)', text: C.info, border: 'rgba(59,130,246,0.25)' },
    neutral: { bg: C.surface2, text: C.muted, border: C.border },
    violet: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  };
  const s = colors[tone] ?? colors.neutral;
  return (
    <span style={{
      fontFamily: C.sans, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 999, paddingLeft: 9, paddingRight: 9, paddingTop: 3, paddingBottom: 3,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

const Panel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    ...style,
  }}>
    {children}
  </div>
);

// Readiness gauge (SVG arc)
const ReadinessGauge = ({ value, progress }: { value: number; progress: number }) => {
  const animated = Math.round(value * progress);
  const tone = value >= 80 ? 'ready' : value >= 65 ? 'warn' : 'danger';
  const color = { ready: C.ready, warn: C.warn, danger: C.danger }[tone];
  const radius = 56;
  const cx = 72, cy = 72;
  const circumference = 2 * Math.PI * radius;
  const dash = ((animated / 100) * circumference).toFixed(2);
  const bandLabel = { ready: 'Green', warn: 'Amber', danger: 'Red' }[tone];

  return (
    <div style={{ position: 'relative', width: 144, height: 144, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 144 144" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        {/* Glow ring */}
        <circle cx={cx} cy={cy} r={radius + 6} stroke={color} strokeWidth="0.8" fill="none" opacity="0.12" />
        {/* Track */}
        <circle cx={cx} cy={cy} r={radius} stroke={C.border} strokeWidth="6" fill="none" />
        {/* Arc */}
        <circle cx={cx} cy={cy} r={radius} stroke={color} strokeWidth="6" strokeLinecap="round" fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontFamily: C.sans, fontSize: 34, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {animated}
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 2 }}>/ 100</div>
        <div style={{ marginTop: 6 }}>
          <Chip tone={tone}>{bandLabel}</Chip>
        </div>
      </div>
    </div>
  );
};

// Sparkline SVG
const Sparkline = ({ values, color = C.ready, height = 32 }: { values: number[]; color?: string; height?: number }) => {
  const w = 200;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const denom = Math.max(values.length - 1, 1);
  const pts = values.map((v, i) => ({
    x: (i / denom) * w,
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));
  const points = pts.map(({ x, y }) => `${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={points} />
      {pts.map(({ x, y }, i) => (
        <circle key={i} cx={x} cy={y} r="2" fill={color} />
      ))}
    </svg>
  );
};

// ── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ progress }: { progress: number }) => {
  const items = [
    { icon: 'grid', label: 'Dashboard', active: true },
    { icon: 'activity', label: 'Runs', active: false },
    { icon: 'trending-up', label: 'Trends', active: false },
    { icon: 'git-compare', label: 'Compare', active: false },
    { icon: 'settings', label: 'Config', active: false },
  ];

  const icons: Record<string, React.ReactNode> = {
    grid: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    activity: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    'trending-up': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    'git-compare': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" /></svg>,
    settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  };

  return (
    <div style={{
      width: 196,
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      flexShrink: 0,
      opacity: progress,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, paddingBottom: 24, paddingTop: 4 }}>
        <TryLapseLogo size={28} color={C.primary} />
        <span style={{ fontFamily: C.sans, fontSize: 15, fontWeight: 700, color: C.fg, letterSpacing: '-0.02em' }}>
          TryLapse
        </span>
      </div>

      {/* Workspace chip */}
      <div style={{
        paddingLeft: 8, paddingRight: 8, marginBottom: 8,
        fontFamily: C.mono, fontSize: 10, color: C.muted,
      }}>
        acme-corp / staging
      </div>

      {/* Nav items */}
      {items.map((item) => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px',
          borderRadius: 7,
          background: item.active ? `rgba(124,111,236,0.15)` : 'transparent',
          color: item.active ? C.primary : C.muted,
          fontSize: 13,
          fontFamily: C.sans,
          fontWeight: item.active ? 600 : 400,
          cursor: 'default',
          border: item.active ? `1px solid rgba(124,111,236,0.2)` : '1px solid transparent',
        }}>
          {icons[item.icon]}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Situation Report ─────────────────────────────────────────────────────────

const SituationReport = ({ progress }: { progress: number }) => {
  const bullets = [
    'Login flow passes across all 4 personas with consistent latency under 1.2s.',
    'Checkout journey has a P0 blocker: form submission silently fails on iOS Safari.',
    'Onboarding completion rate dropped 12% vs prior run — correlates with tooltip regression.',
  ];

  return (
    <div style={{
      background: C.surfaceGlass,
      border: `1px solid ${C.borderStrong}`,
      borderRadius: 12,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [12, 0])}px)`,
    }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${C.primary} 0%, rgba(124,111,236,0.15) 100%)`,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 600, color: C.fg }}>Situation report</span>
        <Chip>AI + rules</Chip>
        <Chip tone="warn">Softening</Chip>
      </div>

      <p style={{ fontFamily: C.sans, fontSize: 13, fontWeight: 500, color: 'rgba(244,244,245,0.88)', lineHeight: 1.55, marginBottom: 10, maxWidth: 600 }}>
        Readiness score declined 4 pts vs prior run. Checkout blocker is the primary driver — fix before any canary promotion.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
        {bullets.map((b) => (
          <div key={b} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(124,111,236,0.5)', marginTop: 5, flexShrink: 0 }} />
            <span style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>

      {/* Mini cards */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        paddingTop: 14,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
      }}>
        {/* Top blocker */}
        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontFamily: C.sans, fontSize: 10, color: C.muted, fontWeight: 500, marginBottom: 7 }}>Top signal</div>
          <div style={{ fontFamily: C.sans, fontSize: 12, fontWeight: 600, color: C.fg, lineHeight: 1.35, marginBottom: 7 }}>
            Checkout form silent failure on iOS Safari
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <Chip tone="danger">P0</Chip>
            <Chip>Conversion</Chip>
          </div>
        </div>

        {/* Readiness trend */}
        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontFamily: C.sans, fontSize: 10, color: C.muted, fontWeight: 500, marginBottom: 7 }}>Readiness trend</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: C.sans, fontSize: 24, fontWeight: 800, color: C.warn, fontVariantNumeric: 'tabular-nums' }}>78</span>
            <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>/ 100 · Amber</span>
            <span style={{
              fontFamily: C.mono, fontSize: 10, fontWeight: 600, color: C.danger,
              background: 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: 4,
            }}>−4</span>
          </div>
          <Sparkline values={[82, 85, 81, 83, 80, 78]} color={C.warn} height={28} />
        </div>

        {/* Highlight */}
        <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontFamily: C.sans, fontSize: 10, color: C.muted, fontWeight: 500, marginBottom: 7 }}>Latest highlight</div>
          <div style={{ fontFamily: C.sans, fontSize: 12, fontWeight: 600, color: C.fg, lineHeight: 1.35, marginBottom: 6 }}>
            Onboarding tooltip copy landed well
          </div>
          <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            &ldquo;Exactly what I needed to see&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Stats row ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, hint, tone, delay, frame, fps }: {
  label: string; value: string; hint: string; tone?: string;
  delay: number; frame: number; fps: number;
}) => {
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 15 }, durationInFrames: 20 });
  const color = tone === 'ready' ? C.ready : tone === 'warn' ? C.warn : tone === 'danger' ? C.danger : C.fg;
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '14px 18px',
      opacity: p,
      transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`,
    }}>
      <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: C.sans, fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 4 }}>{hint}</div>
    </div>
  );
};

// ── Recent runs table ────────────────────────────────────────────────────────

const RecentRuns = ({ progress }: { progress: number }) => {
  const runs = [
    { id: 'Jun 15 · 2:41 PM', env: 'staging', readiness: 78, tone: 'warn', blockers: 3, delights: 12, duration: '8m 24s' },
    { id: 'Jun 15 · 10:02 AM', env: 'staging', readiness: 82, tone: 'ready', blockers: 1, delights: 15, duration: '7m 58s' },
    { id: 'Jun 14 · 6:15 PM', env: 'prod-canary', readiness: 85, tone: 'ready', blockers: 0, delights: 18, duration: '9m 12s' },
  ];

  return (
    <Panel style={{
      overflow: 'hidden',
      opacity: progress,
      transform: `translateY(${interpolate(progress, [0, 1], [10, 0])}px)`,
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span style={{ fontFamily: C.sans, fontSize: 14, fontWeight: 600, color: C.fg }}>Recent runs</span>
        </div>
        <span style={{ fontFamily: C.sans, fontSize: 12, color: C.muted }}>View all →</span>
      </div>
      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {['Run', 'Env', 'Readiness', 'Blockers', 'Highlights', 'Duration'].map((h) => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 16px',
                fontFamily: C.sans, fontSize: 11, color: C.muted, fontWeight: 500,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => {
            const color = r.tone === 'ready' ? C.ready : r.tone === 'warn' ? C.warn : C.danger;
            return (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 16px', fontFamily: C.mono, fontSize: 11, color: C.muted }}>{r.id}</td>
                <td style={{ padding: '10px 16px' }}>
                  <Chip tone={r.env === 'prod-canary' ? 'violet' : 'info'}>{r.env}</Chip>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ fontFamily: C.mono, fontSize: 13, fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' }}>{r.readiness}</span>
                </td>
                <td style={{ padding: '10px 16px', fontFamily: C.mono, fontSize: 12, color: C.danger, fontVariantNumeric: 'tabular-nums' }}>{r.blockers}</td>
                <td style={{ padding: '10px 16px', fontFamily: C.mono, fontSize: 12, color: C.ready, fontVariantNumeric: 'tabular-nums' }}>{r.delights}</td>
                <td style={{ padding: '10px 16px', fontFamily: C.mono, fontSize: 11, color: C.muted }}>{r.duration}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
};

// ── Main Scene ───────────────────────────────────────────────────────────────

export const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timing
  // 0-40: browser enters
  // 40-80: sidebar + header
  // 80-150: situation report
  // 150-230: gauge + stats
  // 230-290: runs table
  // 290-360: cursor interaction, fade out

  const browserP = spring({ frame, fps, config: { damping: 16, mass: 1.1 }, durationInFrames: 35 });
  const browserScale = interpolate(browserP, [0, 1], [0.92, 1]);
  const browserOpacity = browserP;

  const sidebarP = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 16 }, durationInFrames: 25 });
  const headerP = spring({ frame: Math.max(0, frame - 42), fps, config: { damping: 16 }, durationInFrames: 25 });
  const situationP = spring({ frame: Math.max(0, frame - 80), fps, config: { damping: 16 }, durationInFrames: 30 });
  const gaugeP = spring({ frame: Math.max(0, frame - 135), fps, config: { damping: 18 }, durationInFrames: 70 });
  const runsP = spring({ frame: Math.max(0, frame - 225), fps, config: { damping: 16 }, durationInFrames: 25 });

  // Cursor
  // 295-330: move to "Run rehearsal" button (approx x=1020, y=195 within browser content)
  // 330-345: hover
  // 345-355: click
  const cursorX = interpolate(frame, [0, 80, 200, 295, 355], [800, 800, 700, 360, 360], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorY = interpolate(frame, [0, 80, 200, 295, 355], [400, 200, 320, 198, 198], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const isClicking = frame >= 348 && frame <= 358;
  const isPointer = frame >= 280;
  const cursorOpacity = interpolate(frame, [65, 80, 335, 360], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const fadeOut = interpolate(frame, [345, 360], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const readinessGaugeProgress = Math.min(1, interpolate(frame, [135, 220], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  const orbScale = 1 + Math.sin(frame * 0.018) * 0.04;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeIn * fadeOut }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: 900, height: 900,
        borderRadius: '50%',
        top: '-15%', left: '20%',
        background: 'radial-gradient(circle, rgba(124,111,236,0.07) 0%, transparent 60%)',
        transform: `scale(${orbScale})`,
      }} />

      {/* Browser */}
      <div style={{
        position: 'absolute',
        top: 60, left: 110,
        width: 1700, height: 940,
        transform: `scale(${browserScale})`,
        transformOrigin: 'top center',
        opacity: browserOpacity,
      }}>
        <BrowserFrame url="app.trylapse.dev/acme-corp/dashboard" style={{ height: '100%' }}>
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <Sidebar progress={sidebarP} />

            {/* Main content */}
            <div style={{ flex: 1, overflowY: 'auto', background: C.bg }}>
              {/* Page header */}
              <div style={{
                padding: '28px 32px 20px',
                borderBottom: `1px solid ${C.border}`,
                opacity: headerP,
                transform: `translateY(${interpolate(headerP, [0, 1], [-10, 0])}px)`,
              }}>
                <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Command center
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h1 style={{ fontFamily: C.sans, fontSize: 22, fontWeight: 700, color: C.fg, letterSpacing: '-0.02em', marginBottom: 4 }}>
                      Pre-launch readiness, observed.
                    </h1>
                    <p style={{ fontFamily: C.sans, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                      Live rollup of every persona × journey rehearsal against staging. Evidence-bound, no auto-fix.
                    </p>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 24 }}>
                    <Chip tone="ready">
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.ready, display: 'inline-block' }} />
                      live
                    </Chip>
                    <button style={{
                      fontFamily: C.sans, fontSize: 12, fontWeight: 600,
                      padding: '7px 16px', borderRadius: 8,
                      background: C.primary, color: 'white', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: `0 2px 12px rgba(124,111,236,0.35)`,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      Run rehearsal
                    </button>
                    <button style={{
                      fontFamily: C.sans, fontSize: 12,
                      padding: '7px 14px', borderRadius: 8,
                      background: 'transparent', color: C.muted,
                      border: `1px solid ${C.border}`, cursor: 'pointer',
                    }}>
                      All runs →
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Situation report */}
                <SituationReport progress={situationP} />

                {/* Stats row: gauge + latest run + trend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.5fr 1fr', gap: 12 }}>
                  {/* Gauge */}
                  <Panel style={{
                    padding: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: gaugeP,
                    transform: `scale(${interpolate(gaugeP, [0, 1], [0.9, 1])})`,
                  }}>
                    <ReadinessGauge value={78} progress={readinessGaugeProgress} />
                  </Panel>

                  {/* Latest run details */}
                  <Panel style={{ padding: '20px', opacity: gaugeP }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted }}>Latest run</div>
                        <div style={{ fontFamily: C.mono, fontSize: 12, color: C.primary, marginTop: 3 }}>Jun 15 · 2:41 PM</div>
                      </div>
                      <Chip tone="info">staging</Chip>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      {[
                        { label: 'Blockers', value: '3', color: C.danger },
                        { label: 'Highlights', value: '12', color: C.ready },
                        { label: 'Duration', value: '8m 24s', color: C.fg },
                      ].map((s) => (
                        <div key={s.label}>
                          <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.label}</div>
                          <div style={{ fontFamily: C.sans, fontSize: 22, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 14, paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: C.sans, fontSize: 11, color: C.muted }}>48 pages crawled · 2 min ago</span>
                      <span style={{ fontFamily: C.sans, fontSize: 11, color: C.primary }}>Open run →</span>
                    </div>
                  </Panel>

                  {/* Trend sparkline */}
                  <Panel style={{ padding: '20px', display: 'flex', flexDirection: 'column', opacity: gaugeP }}>
                    <div style={{ fontFamily: C.sans, fontSize: 11, color: C.muted, marginBottom: 12 }}>6-run trend</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Sparkline values={[82, 85, 81, 83, 80, 78]} color={C.warn} height={52} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.muted }}>82</span>
                      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.warn }}>over 6 runs</span>
                      <span style={{ fontFamily: C.mono, fontSize: 10, color: C.warn }}>78</span>
                    </div>
                  </Panel>
                </div>

                {/* 4-stat quick grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Time to first scorecard', value: '8m 24s', hint: '3 runs · goal < 15m', tone: 'ready', delay: 150 },
                    { label: 'Flake rate (7d)', value: '3.2%', hint: '+0.8% vs prior run', tone: 'warn', delay: 163 },
                    { label: 'Recurring blockers', value: '2', hint: '2 issues across runs', tone: 'warn', delay: 176 },
                    { label: 'Agent cost / run', value: '$0.034', hint: '4 agents active', tone: undefined, delay: 189 },
                  ].map((s) => (
                    <StatCard key={s.label} {...s} frame={frame} fps={fps} />
                  ))}
                </div>

                {/* Recent runs */}
                <RecentRuns progress={runsP} />
              </div>
            </div>
          </div>

          {/* Animated cursor */}
          <Cursor x={cursorX} y={cursorY} isClicking={isClicking} isPointer={isPointer} opacity={cursorOpacity} />
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};
