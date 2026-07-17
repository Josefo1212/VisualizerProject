export const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string => {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
};

export const polygonPoints = (pts: { x: number; y: number }[]): string =>
  pts.map(p => `${p.x},${p.y}`).join(' ');
