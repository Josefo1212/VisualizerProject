export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

export const lerpRgb = (
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): { r: number; g: number; b: number } => ({
  r: lerp(a.r, b.r, t),
  g: lerp(a.g, b.g, t),
  b: lerp(a.b, b.b, t),
});

export const findSegment = <T extends { h: number }>(pts: T[], h: number): [T, T, number] => {
  if (h <= pts[0].h) return [pts[0], pts[1], 0];
  if (h >= pts[pts.length - 1].h) return [pts[pts.length - 2], pts[pts.length - 1], 1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (h >= pts[i].h && h < pts[i + 1].h) {
      const t = (h - pts[i].h) / (pts[i + 1].h - pts[i].h);
      return [pts[i], pts[i + 1], t];
    }
  }
  return [pts[0], pts[1], 0];
};

export const seededMod = (i: number, base: number, offset: number, multiplier = 2.3): number =>
  ((i * offset * multiplier) % base + base) % base;

export const cycleHour = (hours: number): number =>
  ((hours % 24) + 24) % 24;

export const dayProgress = (hours: number): string =>
  ((cycleHour(hours) / 24) * 100).toFixed(2);
