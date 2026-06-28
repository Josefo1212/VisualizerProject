import { Injectable, signal, computed, Signal } from '@angular/core';
import { BaseTimeEngine } from './baseTimeEngine';
import { DiaInfo, NOMBRES_DIAS } from '../interfaces/amongUs';

@Injectable({ providedIn: 'root' })
export class AmongUsTimeEngineService extends BaseTimeEngine {
  private readonly _diaSemana = signal(0);
  private previousHour = -1;

  readonly diaSemana$: Signal<number> = this._diaSemana.asReadonly();

  readonly diasInfo: Signal<DiaInfo[]> = computed(() => {
    const today = this._diaSemana();
    return NOMBRES_DIAS.map((nombre, i) => ({
      nombre,
      estado: i < today ? 'pasado' as const : i === today ? 'hoy' as const : 'futuro' as const
    }));
  });

  protected override onTick(): void {
    const h = this.horas$();
    if (this.previousHour === 23 && h === 0) {
      this._diaSemana.update(d => (d + 1) % 7);
    }
    this.previousHour = h;
  }
}
