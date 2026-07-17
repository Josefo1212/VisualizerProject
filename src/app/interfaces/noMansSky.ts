export interface OrbitMark {
  index: number;
  angle: number;
  roman: string;
  isMajor: boolean;
  nx: number;
  ny: number;
}

export interface PulseDot {
  index: number;
  angle: number;
}

export interface SignalParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}
