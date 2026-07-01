import { Component, computed, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';

@Component({
  selector: 'app-cyberpunk-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './CyberpunkDesign.html',
  styleUrl: './CyberpunkDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CyberpunkDesignComponent implements OnDestroy {
  readonly time = inject(TimeEngineService);

  private readonly _now = signal<Date>(new Date());
  private readonly _clockInterval: ReturnType<typeof setInterval>;

  readonly clockMs = computed(() => {
    const d = this._now();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const s = d.getSeconds().toString().padStart(2, '0');
    const ms = d.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  });

  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);

  readonly hpPercent = computed(() => {
    const damage = Math.floor(Math.abs(this.time.hours$()) * 0.6 + this.time.minutes$() * 0.04);
    return Math.max(0, 100 - damage);
  });

  readonly ramUsed = computed(() => {
    return Math.min(10, Math.max(1, Math.floor(Math.abs(this.time.hours$()) + this.time.minutes$() / 10) % 11 + 1));
  });

  readonly ramPercent = computed(() => (this.ramUsed() / 10) * 100);

  readonly bodyParts = computed(() => {
    const h = this.cycleHour();
    return {
      head: h % 3 === 0 ? 'critical' : h % 3 === 1 ? 'warning' : 'stable',
      chest: (h + 1) % 3 === 0 ? 'critical' : (h + 1) % 3 === 1 ? 'warning' : 'stable',
      lArm: (h + 2) % 3 === 0 ? 'critical' : (h + 2) % 3 === 1 ? 'warning' : 'stable',
      rArm: (h + 3) % 3 === 0 ? 'critical' : (h + 3) % 3 === 1 ? 'warning' : 'stable',
      lLeg: (h + 4) % 3 === 0 ? 'critical' : (h + 4) % 3 === 1 ? 'warning' : 'stable',
      rLeg: (h + 5) % 3 === 0 ? 'critical' : (h + 5) % 3 === 1 ? 'warning' : 'stable',
    };
  });

  readonly cyberwareList = [
    { category: 'OPERATING SYSTEM', name: 'Netwatch Netdriver Mk.5', status: 'OPERATIONAL' },
    { category: 'OCULAR IMPLANTS', name: 'Kiroshi Optics Mk.3', status: 'CALIBRATED' },
    { category: 'NERVOUS SYSTEM', name: 'Reflex Booster', status: 'STANDBY' },
    { category: 'INTEGUMENTARY', name: 'Subdermal Armor', status: 'ACTIVE' },
    { category: 'WEAPON SYSTEM', name: 'Mantis Blades', status: 'PARKED' },
  ];

  readonly activeCyberIdx = computed(() => Math.abs(this.time.hours$()) % this.cyberwareList.length);

  readonly systemStatus = computed(() => {
    if (this.hpPercent() <= 0) return '☠ SYSTEM FAILURE';
    if (this.hpPercent() < 25) return '⚠ CRITICAL DAMAGE';
    if (this.hpPercent() < 50) return '⚠ SYSTEM WARNING';
    return 'OPERATIONAL';
  });

  readonly netLogs = computed(() => {
    const h = this.cycleHour();
    const base = [
      '> CONNECTING TO NET...',
      '> SECURE PROTOCOL: OK',
      '> NO THREATS DETECTED',
    ];
    if (h < 6) {
      return [...base, '> WARNING: LOW SIGNAL IN SECTOR', '> SWITCHING TO BACKUP RELAY'];
    } else if (h < 12) {
      return [...base, '> NETWATCH PROTOCOL: STABLE', '> ENCRYPTION: AES-256'];
    } else if (h < 18) {
      return [...base, '> TRAFFIC ANALYSIS: NOMINAL', '> PACKET LOSS: 0.02%'];
    }
    return [...base, '> DANGER: ICE DETECTED IN NET', '> DEPLOYING COUNTERMEASURES'];
  });

  readonly hoursDisplay = computed(() => {
    const h = this.time.hours$();
    return `${h >= 0 ? '+' : ''}${h.toFixed(1)}h`;
  });

  readonly sliderTicks = [-72, -48, -24, 0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240];

  readonly sliderValue = signal<number>(0);

  private syncFromTime(): void {
    this.sliderValue.set(this.time.hours$());
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
    this.time.setHora(v);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
    this.syncFromTime();
  }
}
