export interface DiaInfo {
  nombre: string;
  estado: 'pasado' | 'hoy' | 'futuro';
}

export interface Tarea {
  id: number;
  nombre: string;
  hora: string;
  horaIndex: number;
  completada: boolean;
}

export const NOMBRES_DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'] as const;
