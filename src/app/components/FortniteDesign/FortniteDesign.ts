import { Component, computed, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';

interface MatchLogEntry {
  killer: string;
  victim: string;
  icon: string;
}

@Component({
  selector: 'app-fortnite-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './FortniteDesign.html',
  styleUrl: './FortniteDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FortniteDesignComponent implements OnDestroy {
  readonly time = inject(TimeEngineService);

  private readonly _now = signal<Date>(new Date());
  private readonly _clockInterval: ReturnType<typeof setInterval>;

  readonly sliderValue = signal<number>(0);
  readonly isDragging = signal(false);

  readonly matchProgress = computed(() => this.sliderValue());
  readonly isCritical = computed(() => this.matchProgress() >= 100);

  readonly shieldPercent = computed(() => {
    const h = this.time.hours$();
    return Math.max(0, Math.min(100, 100 - Math.abs(h) * 1.2));
  });

  readonly healthPercent = computed(() => {
    const m = this.time.minutes$();
    return Math.max(0, Math.min(100, 100 - m));
  });

  readonly stormRadius = computed(() => {
    const s = this.time.seconds$();
    return 25 + (1 - s / 59) * 70;
  });

  readonly stormCountdown = computed(() => {
    const pct = this.matchProgress();
    const totalMs = 20 * 60 * 1000;
    const remaining = Math.max(0, totalMs * (1 - pct / 100));
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const ms = this._now().getMilliseconds();
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  });

  readonly stormPhase = computed(() => {
    const pct = this.matchProgress();
    if (pct >= 100) return 'TORMENTA FINAL';
    if (pct >= 75) return 'FASE 05';
    if (pct >= 55) return 'FASE 04';
    if (pct >= 35) return 'FASE 03';
    if (pct >= 15) return 'FASE 02';
    return 'FASE 01';
  });

  readonly playersRemaining = computed(() => {
    const pct = this.matchProgress();
    return Math.max(1, Math.round(100 * (1 - pct / 100)));
  });

  readonly matchLogs = computed<MatchLogEntry[]>(() => {
    const pct = this.matchProgress();
    const logs: MatchLogEntry[] = [];
    if (pct > 8) logs.push({ killer: 'JOSEFO_URU', victim: 'Pro_Player', icon: '⚔️' });
    if (pct > 22) logs.push({ killer: 'TORMENTA', victim: 'Noob_Master', icon: '🌪️' });
    if (pct > 38) logs.push({ killer: 'Sniper_Elite', victim: 'JOSEFO_URU', icon: '🔫' });
    if (pct > 55) logs.push({ killer: 'Storm_Rider', victim: 'Last_Stand', icon: '💥' });
    if (pct > 72) logs.push({ killer: 'BATTLE_BUS', victim: 'Sniper_Elite', icon: '🚌' });
    if (pct > 88) logs.push({ killer: '🧟 ZOMBIE', victim: 'Storm_Rider', icon: '🩸' });
    return logs;
  });

  readonly busY = computed(() => {
    const pct = this.matchProgress();
    return Math.max(10, 180 - (pct / 100) * 170);
  });

  readonly matchStatus = computed(() => {
    if (this.isCritical()) return '☠ ALERTA: TORMENTA FINAL';
    const pct = this.matchProgress();
    if (pct < 15) return '🏁 PARTIDA INICIADA';
    if (pct < 35) return '📦 BOTINES ACTIVOS';
    if (pct < 55) return '⚔️ ENFRENTAMIENTOS';
    if (pct < 75) return '🌀 TORMENTA AVANZA';
    return '🔥 ZONA REDUCIDA';
  });

  private syncFromTime(): void {
    const h = this.time.hours$();
    const pct = Math.max(0, Math.min(100, (h / 240) * 100));
    this.sliderValue.set(pct);
  }

  constructor() {
    this.syncFromTime();
    this._clockInterval = setInterval(() => this._now.set(new Date()), 50);
  }

  ngOnDestroy(): void {
    clearInterval(this._clockInterval);
  }

  onSliderChange(v: number): void {
    this.sliderValue.set(v);
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
    this.syncFromTime();
  }
}
