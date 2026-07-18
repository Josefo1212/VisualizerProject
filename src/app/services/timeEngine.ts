import { Injectable, signal, computed, DestroyRef, inject } from '@angular/core';

const getCurrentHour = (): number => {
  const now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
};

const TICK_MS = 50;
const STEP = TICK_MS / 3600000;

@Injectable({ providedIn: 'root' })
export class TimeEngineService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _currentHour = signal<number>(getCurrentHour());
  private readonly _manualMode = signal<boolean>(false);
  private readonly _multiplier = signal<number>(1);

  private tickId!: ReturnType<typeof setInterval>;

  readonly currentHour$ = this._currentHour.asReadonly();
  readonly manualMode$ = this._manualMode.asReadonly();
  readonly multiplier$ = this._multiplier.asReadonly();

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
    this.tickId = setInterval(() => {
      const m = this._multiplier();
      if (m > 1) {
        const h = this._currentHour();
        this._currentHour.set(h + m * STEP);
        if (!this._manualMode()) this._manualMode.set(true);
      } else if (!this._manualMode()) {
        this._currentHour.set(getCurrentHour());
      }
    }, TICK_MS);
    this.destroyRef.onDestroy(() => clearInterval(this.tickId));
  }

  setMultiplier(n: number): void {
    this._multiplier.set(n);
    if (n > 1) {
      this._manualMode.set(true);
    } else {
      this._manualMode.set(false);
      this._currentHour.set(getCurrentHour());
    }
  }

  cycleMultiplier(): void {
    const next: Record<number, number> = { 1: 2, 2: 5, 5: 10, 10: 50, 50: 100, 100: 500, 500: 1000, 1000: 1 };
    this.setMultiplier(next[this._multiplier()]);
  }

  setHora(h: number): void {
    this._multiplier.set(1);
    this._manualMode.set(true);
    this._currentHour.set(h);
  }

  resetToRealTime(): void {
    this._multiplier.set(1);
    this._manualMode.set(false);
    this._currentHour.set(getCurrentHour());
  }
}
