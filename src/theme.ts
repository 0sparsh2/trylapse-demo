export const C = {
  bg: '#080810',
  surface: '#0e0e1a',
  surface2: '#14142a',
  surfaceGlass: 'rgba(14,14,26,0.85)',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.13)',
  primary: '#7c6fec',
  primaryGlow: 'rgba(124,111,236,0.25)',
  ready: '#22c55e',
  readyGlow: 'rgba(34,197,94,0.2)',
  warn: '#eab308',
  warnGlow: 'rgba(234,179,8,0.2)',
  danger: '#ef4444',
  dangerGlow: 'rgba(239,68,68,0.2)',
  info: '#3b82f6',
  fg: '#f4f4f5',
  muted: 'rgba(244,244,245,0.45)',
  muted2: 'rgba(244,244,245,0.25)',
  mono: "'Fira Code', 'JetBrains Mono', 'Courier New', monospace",
  sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

export type Tone = 'ready' | 'warn' | 'danger' | 'info' | 'neutral';

export function toneColor(t: Tone): string {
  return { ready: C.ready, warn: C.warn, danger: C.danger, info: C.info, neutral: C.muted }[t];
}

export function toneGlow(t: Tone): string {
  return { ready: C.readyGlow, warn: C.warnGlow, danger: C.dangerGlow, info: 'rgba(59,130,246,0.2)', neutral: 'rgba(255,255,255,0.05)' }[t];
}
