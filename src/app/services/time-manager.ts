import { Injectable, signal } from '@angular/core';

const getCurrentHour = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

@Injectable({
  providedIn: 'root',
})
export class TimeManagerService {
  readonly horaActual = signal<number>(getCurrentHour());
  private intervalId: ReturnType<typeof setInterval>;

  constructor() {
    this.intervalId = setInterval(() => {
      this.horaActual.set(getCurrentHour());
    }, 1000);
  }

  setHora(h: number): void {
    this.horaActual.set(Math.max(0, Math.min(24, h)));
  }
}
