import { Injectable, computed, signal, inject, DestroyRef } from '@angular/core';

export interface LogEntry {
  time: string;
  msg: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private destroyRef = inject(DestroyRef);
  private timers: ReturnType<typeof setInterval>[] = [];

  /* ─── Global log ─── */
  readonly logEntries = signal<LogEntry[]>([]);

  addLog(msg: string): void {
    this.logEntries.update(entries => {
      const next = [...entries, { time: this.now(), msg }];
      return next.length > 50 ? next.slice(-50) : next;
    });
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  /* ─── Session state ─── */
  readonly sessionActive = signal(false);
  readonly sessionStartTime = signal<Date | null>(null);
  readonly elapsedSeconds = signal(0);

  /* ─── Init sequence ─── */
  readonly initVisible = signal(false);
  readonly initLine = signal(0);
  readonly initComplete = signal(false);

  readonly initLines = [
    'INITIALIZING SESSION...',
    'Allocating Resources...',
    'Unlocking Worlds...',
    'Synchronizing Clocks...',
    'Loading Time Engines...',
    'Connecting Universe Modules...',
    'System Ready',
    'Session Started',
  ];

  /* ─── World tracking ─── */
  readonly currentWorld = signal<string>('');
  readonly currentWorldStartTime = signal<Date | null>(null);
  readonly currentWorldElapsed = signal(0);
  readonly worldsVisited = signal<Set<string>>(new Set());
  readonly totalWorlds = 10;

  readonly worldsVisitedCount = computed(() => this.worldsVisited().size);
  readonly visualizersUsed = computed(() => this.worldsVisited().size);

  /* ─── Formatted time ─── */
  readonly startedAtStr = computed(() => {
    const d = this.sessionStartTime();
    if (!d) return '--:--:--';
    return d.toLocaleTimeString();
  });

  readonly formattedElapsed = computed(() => {
    const total = this.elapsedSeconds();
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly formattedWorldElapsed = computed(() => {
    const total = this.currentWorldElapsed();
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  /* ─── Real FPS tracking ─── */
  readonly fps = signal(0);
  private frameTimes: number[] = [];
  private rafId: number | null = null;

  constructor() {
    this.startFpsTracking();
    this.addLog('SYSTEM BOOT SEQUENCE INITIATED');
    this.addLog('KERNEL LOADED');
    this.addLog('SIGNAL PROCESSOR ACTIVE');
    this.addLog('RENDER ENGINE READY');
    this.addLog('WORLDS SYNCHRONIZED');
    this.destroyRef.onDestroy(() => {
      this.stopFpsTracking();
      this.clearAllTimers();
    });
  }

  private startFpsTracking(): void {
    if (typeof requestAnimationFrame === 'undefined') return;
    const tick = (timestamp: number) => {
      if (this.frameTimes.length >= 15) this.frameTimes.shift();
      this.frameTimes.push(timestamp);
      if (this.frameTimes.length > 1) {
        let sum = 0;
        for (let i = 1; i < this.frameTimes.length; i++) {
          sum += this.frameTimes[i] - this.frameTimes[i - 1];
        }
        const avgDelta = sum / (this.frameTimes.length - 1);
        this.fps.set(Math.round(1000 / avgDelta));
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopFpsTracking(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.frameTimes = [];
  }

  /* ─── Session lifecycle ─── */
  startSession(): void {
    this.sessionStartTime.set(new Date());
    this.elapsedSeconds.set(0);
    this.currentWorld.set('');
    this.currentWorldElapsed.set(0);
    this.worldsVisited.set(new Set());

    this.timers.push(setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
    }, 1000));

    this.sessionActive.set(true);
    this.initVisible.set(true);
    this.initLine.set(0);
    this.initComplete.set(false);

    this.addLog('SESSION STARTED');
    this.addLog('TIME ENGINE LOCKED');
    this.addLog('WORLD GRID ENABLED');
    this.runInitSequence();
  }

  private runInitSequence(): void {
    this.initLine.set(0);
    const intervalId = setInterval(() => {
      this.initLine.update(l => {
        const next = l + 1;
        if (next >= this.initLines.length) {
          clearInterval(intervalId);
          this.initComplete.set(true);
        }
        return Math.min(next, this.initLines.length - 1);
      });
    }, 220);
    this.timers.push(intervalId);
  }

  /* ─── World switching ─── */
  setCurrentWorld(worldId: string): void {
    this.currentWorld.set(worldId);
    this.currentWorldStartTime.set(new Date());
    this.currentWorldElapsed.set(0);

    if (worldId) {
      this.worldsVisited.update(set => {
        const s = new Set(set);
        s.add(worldId);
        return s;
      });
      const label = worldId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      this.addLog(`WORLD LOADED: ${label}`);
    }
  }

  /* ─── Cleanup ─── */
  private clearAllTimers(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
  }
}
