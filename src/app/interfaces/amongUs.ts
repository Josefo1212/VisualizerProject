export interface DayInfo {
  name: string;
  status: 'past' | 'today' | 'future';
}

export interface Task {
  id: number;
  name: string;
  hour: string;
  hourIndex: number;
  completed: boolean;
}

export const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
