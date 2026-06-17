import React from 'react';

interface TryLapseLogoProps {
  size?: number;
  color?: string;
}

/**
 * TryLapse maze logo — concentric arc labyrinth with center dot.
 * Reconstructed from the brand mark.
 */
export const TryLapseLogo: React.FC<TryLapseLogoProps> = ({
  size = 100,
  color = '#263347',
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const sw = size * 0.073; // stroke-width relative to size

  // Convert clock-style degrees (0° = 12 o'clock, clockwise) → SVG radians
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180);

  // Point on circle at clock-degrees
  const pt = (r: number, deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  // Clockwise arc path from startDeg to endDeg
  const arc = (r: number, startDeg: number, endDeg: number): string => {
    const s = pt(r, startDeg);
    const e = pt(r, endDeg);
    const span = ((endDeg - startDeg) + 360) % 360;
    const largeArc = span > 180 ? 1 : 0;
    return `M ${f(s.x)},${f(s.y)} A ${f(r)},${f(r)} 0 ${largeArc},1 ${f(e.x)},${f(e.y)}`;
  };

  // Radial wall line between two radii at a given angle
  const wall = (r1: number, r2: number, deg: number): string => {
    const s = pt(r1, deg);
    const e = pt(r2, deg);
    return `M ${f(s.x)},${f(s.y)} L ${f(e.x)},${f(e.y)}`;
  };

  const f = (n: number) => n.toFixed(2);
  const R = (frac: number) => frac * (size / 2);

  // ── Ring definitions ──────────────────────────────────────────────────────
  // r6 = outermost, r1 = innermost ring, dot = center
  // Gaps described as [gapStart, gapEnd] (clockwise degrees, 0=top)

  // OUTER RING (r6): classic maze entrance on right + small gap at top
  // Arc 1: 7° → 84°  (small top-right arc)
  // Arc 2: 113° → 353° (large main arc)
  const r6 = R(0.90);
  const r6arcs = [arc(r6, 7, 84), arc(r6, 113, 353)];

  // RING 5 (r5): gap at bottom-left and at upper-left
  // Arc 1: 36° → 193°  (top-right → bottom-left)
  // Arc 2: 240° → 356° (bottom-left → just before top)
  const r5 = R(0.76);
  const r5arcs = [arc(r5, 36, 193), arc(r5, 240, 356)];

  // RING 4 (r4): gap at right and at bottom-left (maze zigzag)
  // Arc 1: 113° → 187° (small right-to-bottom)
  // Arc 2: 227° → 107° (large wrap-around)
  const r4 = R(0.62);
  const r4arcs = [arc(r4, 113, 187), arc(r4, 227, 107)];

  // RING 3 (r3): 4-quadrant cross — each arc is ~72° with 18° gap at cardinal points
  // NE: 14° → 76°, SE: 104° → 166°, SW: 194° → 256°, NW: 284° → 346°
  const r3 = R(0.48);
  const r3arcs = [
    arc(r3, 14, 76),
    arc(r3, 104, 166),
    arc(r3, 194, 256),
    arc(r3, 284, 346),
  ];

  // RING 2 (r2): same 4-quadrant cross pattern
  const r2 = R(0.34);
  const r2arcs = [
    arc(r2, 14, 76),
    arc(r2, 104, 166),
    arc(r2, 194, 256),
    arc(r2, 284, 346),
  ];

  // RING 1 (r1): innermost ring, same cross pattern
  const r1 = R(0.20);
  const r1arcs = [
    arc(r1, 14, 76),
    arc(r1, 104, 166),
    arc(r1, 194, 256),
    arc(r1, 284, 346),
  ];

  // ── Radial walls ──────────────────────────────────────────────────────────
  // Inner cross: walls at cardinal points connecting r1 → r2 → r3
  const innerWalls = [0, 90, 180, 270].flatMap((deg) => [
    wall(r1, r2, deg),
    wall(r2, r3, deg),
  ]);

  // Outer maze walls: strategic walls between r3/r4 and r4/r5
  const outerWalls = [
    wall(r3, r4, 270),  // left wall (ring 3→4)
    wall(r4, r5, 0),    // top wall  (ring 4→5)
  ];

  const allPaths = [
    ...r6arcs,
    ...r5arcs,
    ...r4arcs,
    ...r3arcs,
    ...r2arcs,
    ...r1arcs,
    ...innerWalls,
    ...outerWalls,
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {allPaths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={R(0.09)} fill={color} />
    </svg>
  );
};
