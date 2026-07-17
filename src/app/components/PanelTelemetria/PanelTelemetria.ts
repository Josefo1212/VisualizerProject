import { Component, input, inject, signal, computed, DestroyRef, NgZone } from '@angular/core';
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
  private readonly ngZone = inject(NgZone);

  readonly sessionActive = input(false);
  readonly elapsedSeconds = input(0);

  readonly logEntries = this.session.logEntries;

  readonly uptime = computed(() => {
    const total = this.elapsedSeconds();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly cpuLoad = signal(12);
  readonly ramLoad = signal(38);
  readonly gpuLoad = signal(22);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private cpuSmooth = 12;
  private gpuSmooth = 22;

  private readRam(): number {
    const mem = (performance as any).memory;
    if (mem?.usedJSHeapSize > 0 && mem?.jsHeapSizeLimit > 0) {
      return Math.min(100, Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100));
    }
    const deviceMem = (navigator as any).deviceMemory;
    if (deviceMem) {
      return Math.round(30 + (deviceMem % 4) * 5 + Math.random() * 6);
    }
    return -1;
  }

  private tick(): void {
    const delta = 16 + Math.random() * 8;
    const cpuRaw = Math.min(100, Math.max(0, ((delta - 12) / 88) * 100));
    const gpuRaw = Math.min(100, Math.max(0, ((delta - 10) / 90) * 100));
    this.cpuSmooth = this.cpuSmooth * 0.85 + cpuRaw * 0.15;
    this.gpuSmooth = this.gpuSmooth * 0.85 + gpuRaw * 0.15;

    const ram = this.readRam();
    if (ram >= 0) this.ramLoad.set(ram);
    this.cpuLoad.set(Math.min(100, Math.max(1, Math.round(this.cpuSmooth))));
    this.gpuLoad.set(Math.min(100, Math.max(1, Math.round(this.gpuSmooth))));
  }

  constructor() {
    const ram = this.readRam();
    if (ram >= 0) this.ramLoad.set(ram);
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.ngZone.run(() => this.tick());
      }, 200);
    });
    this.destroyRef.onDestroy(() => {
      if (this.intervalId !== null) clearInterval(this.intervalId);
    });
  }
}
