import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';

interface MatchLogEntry {
  killer: string;
  victim: string;
  icon: string;
}

@Component({
  selector: 'app-fortnite-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './FortniteDesign.html',
  styleUrl: './FortniteDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FortniteDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  readonly sliderValue = signal<number>(0);
  readonly isDragging = signal(false);

  constructor() {
    this.session.addLog('FORTNITE WORLD INITIALIZED', 'success');
    this.sliderValue.set(this.time.currentHour$());
  }

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
    const maxR = 250;
    return maxR * (1 - this.matchProgress() / 100);
  });

  readonly safeZoneRadius = computed(() => {
    const maxR = 250;
    const t = this.matchProgress() / 100;
    return maxR * (1 - t) * (1 - t * 0.45);
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

  readonly stormActive = computed(() => this.matchProgress() > 5 && this.matchProgress() < 100);

  readonly currentRadiusKm = computed(() => {
    const r = this.stormRadius();
    return (r / 250 * 5.2).toFixed(1);
  });

  readonly nextRadius = computed(() => {
    const pct = this.matchProgress();
    const next = 250 * (1 - Math.min(100, pct + 12) / 100);
    return (Math.max(0, next) / 250 * 5.2).toFixed(1);
  });

  readonly closingSpeed = computed(() => {
    const pct = this.matchProgress();
    if (pct < 15) return '0.8';
    if (pct < 35) return '1.2';
    if (pct < 55) return '2.1';
    if (pct < 75) return '3.5';
    if (pct < 100) return '5.8';
    return '0.0';
  });

  readonly stormDamage = computed(() => {
    const pct = this.matchProgress();
    if (pct < 15) return '1';
    if (pct < 35) return '3';
    if (pct < 55) return '5';
    if (pct < 75) return '8';
    if (pct < 100) return '12';
    return '0';
  });

  readonly dangerLevel = computed(() => {
    const pct = this.matchProgress();
    if (pct < 15) return 'LOW';
    if (pct < 35) return 'MODERATE';
    if (pct < 55) return 'ELEVATED';
    if (pct < 75) return 'HIGH';
    if (pct < 100) return 'CRITICAL';
    return 'COLLAPSED';
  });

  readonly safeZoneEta = computed(() => {
    const pct = this.matchProgress();
    if (pct >= 100) return '--:--';
    const remaining = 100 - pct;
    const totalSec = Math.round(remaining * 2.4);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

  readonly matchTime = computed(() => {
    const h = this.time.hours$();
    const m = this.time.minutes$();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
  });

  readonly nextClosing = computed(() => {
    const pct = this.matchProgress();
    if (pct >= 100) return '--:--';
    const remaining = 100 - pct;
    const totalSec = Math.round(remaining * 1.8);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    this.sliderValue.set(val);
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
    this.sliderValue.set(this.time.currentHour$());
  }
}
