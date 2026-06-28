import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';

const getCurrentHour = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

@Injectable()
export abstract class BaseTimeEngine {
  private readonly _horaActual: WritableSignal<number> = signal<number>(getCurrentHour());
  private readonly _modoManual: WritableSignal<boolean> = signal<boolean>(false);
  private intervalId: ReturnType<typeof setInterval>;

  readonly horaActual$: Signal<number> = this._horaActual.asReadonly();
  readonly modoManual$: Signal<boolean> = this._modoManual.asReadonly();

  readonly horas$: Signal<number> = computed(() => Math.floor(this._horaActual()));
  readonly minutos$: Signal<number> = computed(() => Math.floor((this._horaActual() % 1) * 60));
  readonly segundos$: Signal<number> = computed(() => {
    const totalMin = this._horaActual() * 60;
    return Math.floor((totalMin - Math.floor(totalMin)) * 60);
  });

  constructor() {
    this.intervalId = setInterval(() => {
      if (!this._modoManual()) {
        this._horaActual.set(getCurrentHour());
      }
      this.onTick();
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

  protected onTick(): void {
    // Hook for subclasses
  }
}
