import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TimeManagerService {
  readonly horaActual = signal<number>(6);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  startRealTime(): void {
    this.stop();
    this.intervalId = setInterval(() => {
      this.horaActual.update(h => {
        const next = h + 1 / 60;
        return next >= 24 ? next - 24 : next;
      });
    }, 100);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setHora(h: number): void {
    this.horaActual.set(Math.max(0, Math.min(24, h)));
  }
}
