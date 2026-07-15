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

  readonly cpuLoad = signal(12);
  readonly ramLoad = signal(38);
  readonly gpuLoad = signal(22);

  private rafId: number | null = null;
  private lastFrameTime = 0;
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

  private onFrame = (timestamp: number) => {
    if (this.lastFrameTime > 0) {
      const delta = timestamp - this.lastFrameTime;
      const cpuRaw = Math.min(100, Math.max(0, ((delta - 12) / 88) * 100));
      const gpuRaw = Math.min(100, Math.max(0, ((delta - 10) / 90) * 100));
      this.cpuSmooth = this.cpuSmooth * 0.85 + cpuRaw * 0.15;
      this.gpuSmooth = this.gpuSmooth * 0.85 + gpuRaw * 0.15;

      const ram = this.readRam();
      if (ram >= 0) this.ramLoad.set(ram);
      this.cpuLoad.set(Math.min(100, Math.max(1, Math.round(this.cpuSmooth))));
      this.gpuLoad.set(Math.min(100, Math.max(1, Math.round(this.gpuSmooth))));
    }
    this.lastFrameTime = timestamp;
    this.rafId = requestAnimationFrame(this.onFrame);
  };

  constructor() {
    const ram = this.readRam();
    if (ram >= 0) this.ramLoad.set(ram);
    this.rafId = requestAnimationFrame(this.onFrame);
    this.destroyRef.onDestroy(() => {
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    });
  }
}
