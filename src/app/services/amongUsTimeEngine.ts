import { Injectable, signal, computed, Signal } from '@angular/core';
import { BaseTimeEngine } from './baseTimeEngine';
import { DayInfo, DAY_NAMES } from '../interfaces/amongUs';

@Injectable({ providedIn: 'root' })
export class AmongUsTimeEngineService extends BaseTimeEngine {
  private readonly _currentDayIndex = signal(0);
  private previousHour = -1;

  readonly currentDayIndex$: Signal<number> = this._currentDayIndex.asReadonly();

  readonly daysInfo: Signal<DayInfo[]> = computed(() => {
    const today = this._currentDayIndex();
    return DAY_NAMES.map((name, i) => ({
      name,
      status: i < today ? 'past' as const : i === today ? 'today' as const : 'future' as const
    }));
  });

  protected override onTick(): void {
    const h = this.hours$();
    if (this.previousHour === 23 && h === 0) {
      this._currentDayIndex.update(d => (d + 1) % 7);
    }
    this.previousHour = h;
  }
}
