import { Component, input, inject, signal, computed, DestroyRef } from '@angular/core';
import { SessionService } from '../../services/session';

@Component({
  selector: 'app-panel-telemetria',
  standalone: true,
  templateUrl: './PanelTelemetria.html',
  styleUrl: './PanelTelemetria.css',
})
export class PanelTelemetriaComponent {
  private readonly session = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sessionActive = input(false);
  readonly elapsedSeconds = input(0);

  readonly logEntries = this.session.logEntries;

  readonly uptime = computed(() => {
    const total = this.elapsedSeconds();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly signalLoad = signal(72);
  readonly renderLoad = signal(88);
  readonly engineLoad = signal(54);

  private drift(value: number, base: number, range: number, step: number): number {
    const next = value + (Math.random() - 0.5) * 2 * step;
    if (Math.abs(next - base) > range / 2) {
      return value + (base > value ? step : -step);
    }
    return next;
  }

  constructor() {
    const id = setInterval(() => {
      this.signalLoad.update(v => Math.round(this.drift(v, 77, 30, 1.5)));
      this.renderLoad.update(v => Math.round(this.drift(v, 85, 18, 1.2)));
      this.engineLoad.update(v => Math.round(this.drift(v, 55, 30, 1.8)));
    }, 280);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
