import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
export class AssassinsCreedDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  readonly clockDisplay = computed(() => {
    const h = cycleHour(this.time.hours$());
    const m = this.time.minutes$();
    const s = this.time.seconds$();
    return `${padTime(h)}:${padTime(m)}:${padTime(s)}`;
  });

  /* ─── Genetic timeline ─── */
  readonly timelineNodes: TimelineNode[] = [
    { id: 0, label: 'Memory 01', sub: 'Florence 1476', pos: 0, isGlitch: false },
    { id: 1, label: 'S. Maria', sub: 'Novella', pos: 0.17, isGlitch: false },
    { id: 2, label: 'S. Croce', sub: 'District', pos: 0.33, isGlitch: false },
    { id: 3, label: 'HORA', sub: 'ACTUAL', pos: 0.50, isGlitch: false },
    { id: 4, label: 'Glitch', sub: 'Desinc', pos: 0.67, isGlitch: true },
    { id: 5, label: 'Canal', sub: 'District', pos: 0.83, isGlitch: false },
    { id: 6, label: 'Memory 02', sub: 'Venezia 1486', pos: 1, isGlitch: false },
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

  readonly mappedHours = computed(() => this.sliderValue());

  constructor() {
    this.session.addLog('ASSASSINS CREED WORLD INITIALIZED', 'success');
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
