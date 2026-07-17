export interface TimelineNode {
  id: number;
  label: string;
  sub: string;
  pos: number;
  isGlitch: boolean;
}

export interface NodeState extends TimelineNode {
  active: boolean;
  glitching: boolean;
}

export interface SyncSegment {
  active: boolean;
  glitch: boolean;
}
