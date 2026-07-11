import { Injectable, computed, signal, inject, DestroyRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private destroyRef = inject(DestroyRef);
  private timers: ReturnType<typeof setInterval>[] = [];

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

  /* ─── FPS simulation ─── */
  readonly fps = signal(60);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearAllTimers());
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
    }
  }

  /* ─── Cleanup ─── */
  private clearAllTimers(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
  }
}
