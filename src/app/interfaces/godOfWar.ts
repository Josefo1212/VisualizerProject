export interface ArcMark {
  index: number;
  angle: number;
  x: number;
  y: number;
  isMajor: boolean;
  itx: number;
  ity: number;
  otx: number;
  oty: number;
}

export interface RuneMark {
  index: number;
  itx: number; ity: number;
  otx: number; oty: number;
  rtx: number; rty: number;
  rune: string;
  isMajor: boolean;
}

export interface TrailParticle {
  angle: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}
