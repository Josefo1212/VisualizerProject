import { Component, computed, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';

interface TimelineNode {
  id: number;
  label: string;
  sub: string;
  pos: number;
  isGlitch: boolean;
}

interface NodeState extends TimelineNode {
  active: boolean;
  glitching: boolean;
}

@Component({
  selector: 'app-assassins-creed-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './AssassinsCreedDesign.html',
  styleUrl: './AssassinsCreedDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssassinsCreedDesignComponent implements OnDestroy {
  readonly time = inject(TimeEngineService);

  /* ─── High-precision clock ─── */
  private readonly _now = signal<Date>(new Date());
  private readonly _clockInterval: ReturnType<typeof setInterval>;

  readonly clockDisplay = computed(() => {
    const raw = this.time.currentHour$();
    const cyclic = ((raw % 24) + 24) % 24;
    const h = Math.floor(cyclic);
    const m = Math.floor((cyclic - h) * 60);
    const s = Math.floor(((cyclic - h) * 60 - m) * 60);
    const ms = this._now().getMilliseconds().toString().padStart(3, '0');
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
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
    const raw = this.time.currentHour$();
    return (((raw % 24) + 24) % 24) / 24;
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
  readonly syncProgress = signal(0);
  readonly isDragging = signal(false);
  private readonly _syncInterval: ReturnType<typeof setInterval>;

  readonly syncIndex = computed(() => (70 + this.syncProgress() * 0.28).toFixed(1));

  readonly mappedHours = computed(() => (this.syncProgress() / 100) * 240);

  constructor() {
    this._clockInterval = setInterval(() => this._now.set(new Date()), 50);
    this._syncInterval = setInterval(() => {
      this.syncProgress.update(v => {
        const next = Math.min(100, v + 1);
        this.time.setHora((next / 100) * 240);
        return next;
      });
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this._clockInterval);
    clearInterval(this._syncInterval);
  }

  onSliderChange(v: number): void {
    this.syncProgress.set(v);
    this.time.setHora((v / 100) * 240);
  }

  onDragStart(): void {
    this.isDragging.set(true);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
    this.syncProgress.set(0);
  }
}
