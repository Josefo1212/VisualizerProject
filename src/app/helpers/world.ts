export type WorldPhase = 'dawn' | 'day' | 'dusk' | 'night';

export const ROMAN: Record<number, string> = {
  0: 'XII', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI',
};

export const worldPhase = (hours: number): WorldPhase => {
  if (hours >= 5 && hours < 7) return 'dawn';
  if (hours >= 7 && hours < 18) return 'day';
  if (hours >= 18 && hours < 20) return 'dusk';
  return 'night';
};

export const worldPhaseLabel = (phase: WorldPhase): string => {
  switch (phase) {
    case 'dawn': return 'Dawn';
    case 'day': return 'Day';
    case 'dusk': return 'Evening';
    case 'night': return 'Night';
  }
};
