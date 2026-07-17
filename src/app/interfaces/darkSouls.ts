export interface ArcHour {
  index: number;
  angleDeg: number;
  x: number;
  y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  nx: number;
  ny: number;
  roman: string;
  isMajor: boolean;
}

export interface AshParticle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  opacity: number;
}

export interface EmberMark {
  index: number;
  angle: number;
}
