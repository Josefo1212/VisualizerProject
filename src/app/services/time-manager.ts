import { Injectable, signal, Signal } from '@angular/core';

const getCurrentHour = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

@Injectable({
  providedIn: 'root',
})
export class TimeManagerService {
  private readonly _horaActual = signal<number>(getCurrentHour());
  private readonly _modoManual = signal<boolean>(false);

  readonly horaActual: Signal<number> = this._horaActual.asReadonly();
  readonly modoManual: Signal<boolean> = this._modoManual.asReadonly();

  private intervalId: ReturnType<typeof setInterval>;

  constructor() {
    this.intervalId = setInterval(() => {
      if (!this._modoManual()) {
        this._horaActual.set(getCurrentHour());
      }
    }, 1000);
  }

  setHora(h: number): void {
    this._modoManual.set(true);
    this._horaActual.set(Math.max(0, Math.min(24, h)));
  }

  resetToRealTime(): void {
    this._modoManual.set(false);
    this._horaActual.set(getCurrentHour());
  }
}
