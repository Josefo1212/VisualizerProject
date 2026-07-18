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

  readonly clockDisplay = computed(() => {
    const h = cycleHour(this.time.hours$());
    const m = this.time.minutes$();
    const s = this.time.seconds$();
    return `${padTime(h)}:${padTime(m)}:${padTime(s)}`;
  });

  /* ─── Glitch trigger (random every 6-10s) ─── */
  readonly glitchActive = signal(false);
  private glitchTimer: ReturnType<typeof setInterval> | null = null;

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

  readonly dnaIntegrity = computed(() => {
    const t = this.timeProgress();
    return 85 + Math.round(t * 12);
  });

  readonly reconstruction = computed(() => {
    const t = this.timeProgress();
    return 70 + Math.round(t * 25);
  });

  readonly subjectStatus = computed(() => {
    return 'STABLE';
  });

  /* ─── Genetic timeline ─── */
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
    return cycleHour(this.time.hours$()) / 24;
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

  readonly syncIndex = computed(() => {
    const v = this.sliderValue();
    return (70 + (v / 24) * 28).toFixed(1);
  });

  readonly isLowSync = computed(() => {
    return parseFloat(this.syncIndex()) < 50;
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

  readonly mappedHours = computed(() => this.sliderValue());

  constructor() {
    this.session.addLog('ANIMUS 2.0 SYSTEM INITIALIZED', 'success');
    this.startGlitchTimer();
  }

  ngOnDestroy(): void {
    this.stopGlitchTimer();
  }

  private startGlitchTimer(): void {
    const schedule = () => {
      const delay = 6000 + Math.random() * 4000;
      this.glitchTimer = setTimeout(() => {
        this.glitchActive.set(true);
        setTimeout(() => this.glitchActive.set(false), 150 + Math.random() * 200);
        schedule();
      }, delay);
    };
    schedule();
  }

  private stopGlitchTimer(): void {
    if (this.glitchTimer !== null) {
      clearTimeout(this.glitchTimer);
      this.glitchTimer = null;
    }
  }

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
    this.sliderValue.set(
      Math.max(0, Math.min(24, this.time.hours$() + this.time.minutes$() / 60))
    );
  }
}
