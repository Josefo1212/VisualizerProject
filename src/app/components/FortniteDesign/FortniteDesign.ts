import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';

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
export class FortniteDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  constructor() {
    this.session.addLog('FORTNITE WORLD INITIALIZED');
  }

  readonly sliderValue = computed(() => {
    return this.time.currentHour$() + this.time.minutes$() / 60;
  });
  readonly isDragging = signal(false);

  readonly matchProgress = computed(() => (this.sliderValue() / 24) * 100);

  readonly isCritical = computed(() => this.sliderValue() >= 24);

  readonly shieldPercent = computed(() => {
    const h = this.time.hours$();
    return Math.max(0, Math.min(100, 100 - Math.abs(h % 24) * 4));
  });

  readonly healthPercent = computed(() => {
    const m = this.time.minutes$();
    return Math.max(0, Math.min(100, 100 - m));
  });

  readonly stormRadius = computed(() => {
    return 150 * (1 - this.matchProgress() / 100);
  });

  readonly realTime = computed(() => {
    const h = this.time.hours$() % 24;
    const m = this.time.minutes$();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  readonly stormStatusText = computed(() => {
    const pct = this.matchProgress();
    if (pct <= 40) return 'ESTADO: BUSCANDO ZONA';
    if (pct <= 85) return 'ALERTA: TORMENTA EN MOVIMIENTO';
    return 'PELIGRO: COLAPSO TOTAL';
  });

  readonly stormStatusClass = computed(() => {
    const pct = this.matchProgress();
    if (pct <= 40) return 'search';
    if (pct <= 85) return 'alert';
    return 'danger';
  });

  readonly ringOffset = computed(() => {
    const circumference = 2 * Math.PI * 15;
    return circumference * (1 - this.matchProgress() / 100);
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

  onSliderChange(v: any): void {
    const val = typeof v === 'string' ? parseFloat(v) : v;
    this.time.setHora(val);
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
