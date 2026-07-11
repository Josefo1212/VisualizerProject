import { Component, input, inject, signal, computed, effect, DestroyRef } from '@angular/core';

interface LogEntry {
  time: string;
  msg: string;
}

@Component({
  selector: 'app-panel-telemetria',
  standalone: true,
  templateUrl: './PanelTelemetria.html',
  styleUrl: './PanelTelemetria.css',
})
export class PanelTelemetriaComponent {
  readonly sessionActive = input(false);
  readonly elapsedSeconds = input(0);

  private readonly destroyRef = inject(DestroyRef);

  readonly logEntries = signal<LogEntry[]>([
    { time: this.now(), msg: 'SYSTEM BOOT SEQUENCE INITIATED' },
    { time: this.now(), msg: 'KERNEL LOADED' },
    { time: this.now(), msg: 'SIGNAL PROCESSOR ACTIVE' },
    { time: this.now(), msg: 'RENDER ENGINE READY' },
    { time: this.now(), msg: 'WORLDS SYNCHRONIZED' },
  ]);

  readonly uptime = computed(() => {
    const total = this.elapsedSeconds();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  /* simulated monitor values */
  readonly signalLoad = signal(72);
  readonly renderLoad = signal(88);
  readonly engineLoad = signal(54);

  private wasActive = false;

  constructor() {
    effect(() => {
      const active = this.sessionActive();
      if (active && !this.wasActive) {
        this.wasActive = true;
        setTimeout(() => {
          this.addEntry('SESSION STARTED');
          this.addEntry('TIME ENGINE LOCKED');
          this.addEntry('WORLD GRID ENABLED');
        }, 600);
      } else if (!active) {
        this.wasActive = false;
      }
    });

    /* drift monitor values every 3s */
    const monInt = setInterval(() => {
      this.signalLoad.set(60 + Math.floor(Math.random() * 35));
      this.renderLoad.set(75 + Math.floor(Math.random() * 20));
      this.engineLoad.set(40 + Math.floor(Math.random() * 40));
    }, 3000);
    this.destroyRef.onDestroy(() => clearInterval(monInt));

    /* occasional telemetry log entry */
    const logInt = setInterval(() => {
      if (this.sessionActive()) {
        const msgs = [
          'HEARTBEAT OK',
          'SIGNAL STEADY',
          'RENDER FRAME DROPPED 0',
          'ENGINE TEMP NOMINAL',
          'WORLD SYNC CONFIRMED',
        ];
        this.addEntry(msgs[Math.floor(Math.random() * msgs.length)]);
      }
    }, 12000);
    this.destroyRef.onDestroy(() => clearInterval(logInt));
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  addEntry(msg: string): void {
    this.logEntries.update(entries => {
      const next = [...entries, { time: this.now(), msg }];
      return next.length > 50 ? next.slice(-50) : next;
    });
  }
}
