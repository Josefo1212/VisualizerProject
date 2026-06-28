
import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';

const getCurrentHour = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

@Injectable()
export abstract class BaseTimeEngine {
  private readonly _currentHour: WritableSignal<number> = signal<number>(getCurrentHour());
  private readonly _manualMode: WritableSignal<boolean> = signal<boolean>(false);
  private intervalId: ReturnType<typeof setInterval>;

  readonly currentHour$: Signal<number> = this._currentHour.asReadonly();
  readonly manualMode$: Signal<boolean> = this._manualMode.asReadonly();

  readonly hours$: Signal<number> = computed(() => Math.floor(this._currentHour()));
  readonly minutes$: Signal<number> = computed(() => Math.floor((this._currentHour() % 1) * 60));
  readonly seconds$: Signal<number> = computed(() => {
    const totalMin = this._currentHour() * 60;
    return Math.floor((totalMin - Math.floor(totalMin)) * 60);
  });

  constructor() {
    this.intervalId = setInterval(() => {
      if (!this._manualMode()) {
        this._currentHour.set(getCurrentHour());
      }
      this.onTick();
    }, 1000);
  }

  setHora(h: number): void {
    this._manualMode.set(true);
    this._currentHour.set(Math.max(0, Math.min(24, h)));
  }

  resetToRealTime(): void {
    this._manualMode.set(false);
    this._currentHour.set(getCurrentHour());
  }

  protected onTick(): void {
    // Hook for subclasses
  }
}
