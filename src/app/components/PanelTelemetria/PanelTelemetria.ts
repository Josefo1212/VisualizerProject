import { Component, input, inject, signal, computed } from '@angular/core';
import { SessionService } from '../../services/session';

@Component({
  selector: 'app-panel-telemetria',
  standalone: true,
  templateUrl: './PanelTelemetria.html',
  styleUrl: './PanelTelemetria.css',
})
export class PanelTelemetriaComponent {
  private readonly session = inject(SessionService);

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

  constructor() {
    setInterval(() => {
      this.signalLoad.set(60 + Math.floor(Math.random() * 35));
      this.renderLoad.set(75 + Math.floor(Math.random() * 20));
      this.engineLoad.set(40 + Math.floor(Math.random() * 40));
    }, 3000);
  }
}
