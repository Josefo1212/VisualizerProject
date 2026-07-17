export const DAY_NAMES_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
export const MONTH_NAMES_SHORT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as const;

export const padTime = (n: number): string =>
  n.toString().padStart(2, '0');

export const formatTime = (h: number, m: number, s: number): string =>
  `${padTime(h)}:${padTime(m)}:${padTime(s)}`;

export const formatHourMin = (v: number): string => {
  const h = Math.floor(v);
  const m = Math.floor((v - h) * 60);
  return `${padTime(h)}:${padTime(m)}`;
};

export const dayName = (date = new Date()): string =>
  DAY_NAMES_SHORT[date.getDay()];

export const monthName = (date = new Date()): string =>
  MONTH_NAMES_SHORT[date.getMonth()];

export const dayOfMonth = (date = new Date()): number =>
  date.getDate();

export const yearNum = (date = new Date()): number =>
  date.getFullYear();
