import { Component, computed, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';
import { cycleHour } from '../../helpers/math';
import { padTime } from '../../helpers/format';
import { TimelineNode, NodeState, SyncSegment } from '../../interfaces/assassinsCreed';

@Component({
  selector: 'app-assassins-creed-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './AssassinsCreedDesign.html',
  styleUrl: './AssassinsCreedDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssassinsCreedDesignComponent implements OnDestroy {

  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  /* ─── Clock ─── */
  readonly clockDisplay = computed(() => {
    const h = cycleHour(this.time.hours$());
    const m = this.time.minutes$();
    const s = this.time.seconds$();
    return `${padTime(h)}:${padTime(m)}:${padTime(s)}`;
  });

  /* ─── Glitch trigger (random every 6-10s) ─── */
  readonly glitchActive = signal(false);
  private glitchTimer: ReturnType<typeof setTimeout> | null = null;

  /* ─── Jitter signal (micro-fluctuation every 2-3s) ─── */
  readonly jitter = signal(0);
  private jitterTimer: ReturnType<typeof setTimeout> | null = null;

  /* ─── Subject status cycle ─── */
  readonly subjectStatus = signal('STABLE');
  private statusTimer: ReturnType<typeof setTimeout> | null = null;

  /* ─── Animus data labels ─── */
  readonly dnaMemory = computed(() => {
    const h = cycleHour(this.time.hours$());
    if (h < 6) return 'MEMORY I';
    if (h < 12) return 'MEMORY II';
    if (h < 18) return 'MEMORY III';
    return 'MEMORY IV';
  });

  readonly subjectInfo = 'EZIO AUDITORE DA FIRENZE';

  readonly sequenceInfo = computed(() => {
    const h = cycleHour(this.time.hours$());
    const seq = Math.floor((h / 24) * 14) + 1;
    const cyc = Math.floor((this.time.minutes$() / 60) * 4) + 1;
    return `SEQ ${padTime(seq)} / CYC ${cyc}`;
  });

  /* ─── Genetic timeline (fractional hours for smooth movement) ─── */
  readonly timelineNodes: TimelineNode[] = [
    { id: 0, label: 'MEMORY I', sub: 'Florence 1476', pos: 0, isGlitch: false },
    { id: 1, label: 'MEMORY II', sub: 'Monteriggioni', pos: 0.16, isGlitch: false },
    { id: 2, label: 'MEMORY III', sub: 'Venice 1486', pos: 0.32, isGlitch: false },
    { id: 3, label: 'MEMORY IV', sub: 'Forlì 1488', pos: 0.48, isGlitch: true },
    { id: 4, label: 'MEMORY V', sub: 'Rome 1500', pos: 0.64, isGlitch: false },
    { id: 5, label: 'MEMORY VI', sub: 'Masyaf 1510', pos: 0.80, isGlitch: false },
    { id: 6, label: 'MEMORY VII', sub: 'Galata 1511', pos: 1, isGlitch: false },
  ];

  readonly timeProgress = computed(() => {
    const h = cycleHour(this.time.hours$());
    const m = this.time.minutes$() / 60;
    return (h + m) / 24;
  });

  readonly nodeStates = computed<NodeState[]>(() => {
    const t = this.timeProgress();
    return this.timelineNodes.map((node) => ({
      ...node,
      active: t >= node.pos,
      glitching: node.isGlitch && t >= node.pos,
    }));
  });

  /* ─── Sync slider ─── */
  readonly sliderValue = signal<number>(
    Math.max(0, Math.min(24, this.time.hours$() + this.time.minutes$() / 60))
  );
  readonly isDragging = signal(false);

  readonly mappedHours = computed(() => {
    if (this.isDragging()) return this.sliderValue();
    return cycleHour(this.time.hours$()) + this.time.minutes$() / 60;
  });

  readonly syncDisplay = computed(() => {
    const v = this.mappedHours();
    const base = (v / 24) * 100;
    return Math.min(100, Math.max(0, base + this.jitter())).toFixed(1);
  });

  readonly isLowSync = computed(() => {
    return parseFloat(this.syncDisplay()) < 50;
  });

  readonly stabilityValue = computed(() => {
    const v = this.mappedHours();
    const base = (v / 24) * 100;
    const s = this.time.seconds$();
    const ripple = Math.sin(s * 0.15) * 2;
    const j = this.jitter() * 0.5;
    const g = this.glitchActive() ? -18 : 0;
    return Math.min(100, Math.max(0, base + ripple + j + g)).toFixed(1);
  });

  readonly dnaIntegrityDisplay = computed(() => {
    const h = cycleHour(this.time.hours$());
    const t = h / 24;
    const base = 85 + t * 12;
    const ripple = Math.sin(this.time.seconds$() * 0.2) * 1.2;
    const j = this.jitter() * 0.3;
    return Math.min(100, Math.max(0, base + ripple + j)).toFixed(1);
  });

  readonly reconstructionCells = computed(() => {
    const h = cycleHour(this.time.hours$());
    const t = h / 24;
    const raw = 70 + t * 25;
    const j = this.jitter() * 0.5;
    const val = Math.min(100, Math.max(0, raw + j));
    const total = 16;
    const activeCount = Math.round((val / 100) * total);
    return Array.from({ length: total }, (_, i) => ({
      active: i < activeCount,
      index: i,
    }));
  });

  readonly reconstructionValue = computed(() => {
    const h = cycleHour(this.time.hours$());
    const t = h / 24;
    const raw = 70 + t * 25;
    const j = this.jitter() * 0.5;
    return Math.min(100, Math.max(0, raw + j)).toFixed(1);
  });

  readonly statusClass = computed(() => {
    const s = this.subjectStatus();
    if (s === 'STABLE') return 'stable';
    if (s === 'ANOMALY DETECTED') return 'anomaly';
    return 'transitioning';
  });

  readonly syncSegments = computed<SyncSegment[]>(() => {
    const rawIndex = 70 + (this.sliderValue() / 24) * 28;
    const total = 10;
    const activeCount = Math.round((rawIndex / 100) * total);
    const dragging = this.isDragging();
    return Array.from({ length: total }, (_, i) => ({
      active: i < activeCount,
      glitch: dragging && i >= activeCount,
    }));
  });

  readonly memoryStabilitySegments = computed(() => {
    const rawIndex = 60 + (this.sliderValue() / 24) * 35;
    const total = 8;
    const activeCount = Math.round((rawIndex / 100) * total);
    return Array.from({ length: total }, (_, i) => ({
      active: i < activeCount,
    }));
  });

  constructor() {
    this.session.addLog('ANIMUS 2.0 SYSTEM INITIALIZED', 'success');
    this.startTimers();
  }

  ngOnDestroy(): void {
    this.stopAllTimers();
  }

  /* ─── Timers ─── */
  private startTimers(): void {
    this.startGlitchTimer();
    this.startJitterTimer();
    this.startStatusCycle();
  }

  private stopAllTimers(): void {
    if (this.glitchTimer !== null) {
      clearTimeout(this.glitchTimer);
      this.glitchTimer = null;
    }
    if (this.jitterTimer !== null) {
      clearTimeout(this.jitterTimer);
      this.jitterTimer = null;
    }
    if (this.statusTimer !== null) {
      clearTimeout(this.statusTimer);
      this.statusTimer = null;
    }
  }

  private startGlitchTimer(): void {
    const schedule = (): void => {
      const delay = 6000 + Math.random() * 4000;
      this.glitchTimer = setTimeout(() => {
        this.glitchActive.set(true);
        this.subjectStatus.set('ANOMALY DETECTED');
        setTimeout(() => {
          this.glitchActive.set(false);
          this.subjectStatus.set('STABLE');
        }, 600 + Math.random() * 400);
        schedule();
      }, delay);
    };
    schedule();
  }

  private startJitterTimer(): void {
    const schedule = (): void => {
      const delay = 2000 + Math.random() * 1000;
      this.jitterTimer = setTimeout(() => {
        this.jitter.set((Math.random() - 0.5) * 2.4);
        schedule();
      }, delay);
    };
    schedule();
  }

  private startStatusCycle(): void {
    const states: string[] = ['STABLE', 'CALIBRATING', 'MONITORING', 'STABLE', 'STABLE'];
    const delays: number[] = [5000, 2000, 3500, 6000, 4000];
    let i = 0;
    const schedule = (): void => {
      this.statusTimer = setTimeout(() => {
        i = (i + 1) % states.length;
        this.subjectStatus.set(states[i]);
        schedule();
      }, delays[i % delays.length]);
    };
    schedule();
  }

  /* ─── Handlers ─── */
  onSliderChange(v: number): void {
    this.sliderValue.set(v);
    this.time.setHora(v);
  }

  onDragStart(): void {
    this.isDragging.set(true);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
