import { Injectable, signal, computed } from '@angular/core';

const getCurrentHour = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

@Injectable({ providedIn: 'root' })
export class TimeEngineService {
  private readonly _currentHour = signal<number>(getCurrentHour());
  private readonly _manualMode = signal<boolean>(false);
  private intervalId: ReturnType<typeof setInterval>;

  readonly currentHour$ = this._currentHour.asReadonly();
  readonly manualMode$ = this._manualMode.asReadonly();

  readonly hours$ = computed(() => Math.trunc(this._currentHour()));
  readonly minutes$ = computed(() => {
    const h = this._currentHour();
    const raw = (h - Math.trunc(h)) * 60;
    return Math.floor(((raw % 60) + 60) % 60);
  });
  readonly seconds$ = computed(() => {
    const totalMin = this._currentHour() * 60;
    return Math.floor(((totalMin - Math.floor(totalMin)) * 60 + 60) % 60);
  });

  constructor() {
    this.intervalId = setInterval(() => {
      if (!this._manualMode()) {
        this._currentHour.set(getCurrentHour());
      }
    }, 1000);
  }

  setHora(h: number): void {
    this._manualMode.set(true);
    this._currentHour.set(h);
  }

  resetToRealTime(): void {
    this._manualMode.set(false);
    this._currentHour.set(getCurrentHour());
  }
}
