import { Component, computed, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GtaTimeEngineService } from '../../services/gtaTimeEngine';

@Component({
  selector: 'app-cyberpunk-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './CyberpunkDesign.html',
  styleUrl: './CyberpunkDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CyberpunkDesignComponent implements OnDestroy {
  readonly time = inject(GtaTimeEngineService);

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

  readonly hpPercent = computed(() => {
    const damage = Math.floor((this.time.hours$() * 0.6 + this.time.minutes$() * 0.04) % 25);
    return Math.max(5, 100 - damage);
  });

  readonly ramUsed = computed(() => {
    return Math.min(10, Math.max(1, Math.floor((this.time.hours$() + this.time.minutes$() / 10) % 11)));
  });

  readonly ramPercent = computed(() => (this.ramUsed() / 10) * 100);

  readonly bodyParts = computed(() => {
    const h = this.time.hours$();
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

  readonly activeCyberIdx = computed(() => this.time.hours$() % this.cyberwareList.length);

  readonly logEntries = computed(() => {
    const base = [
      '> CONNECTING TO NET...',
      '> SECURE PROTOCOL: OK',
      '> NO THREATS DETECTED',
    ];
    const h = this.time.hours$();
    if (h < 6) {
      return [...base, '> WARNING: LOW SIGNAL IN SECTOR', '> SWITCHING TO BACKUP RELAY'];
    } else if (h < 12) {
      return [...base, '> NETWATCH PROTOCOL: STABLE', '> ENCRYPTION: AES-256'];
    } else if (h < 18) {
      return [...base, '> TRAFFIC ANALYSIS: NOMINAL', '> PACKET LOSS: 0.02%'];
    }
    return [...base, '> DANGER: ICE DETECTED IN NET', '> DEPLOYING COUNTERMEASURES'];
  });

  readonly systemStatus = computed(() => {
    if (this.hpPercent() < 25) return '⚠ CRITICAL DAMAGE';
    if (this.hpPercent() < 50) return '⚠ SYSTEM WARNING';
    return 'OPERATIONAL';
  });

  private readonly _syncFreq = signal<number>(64);

  get syncFreq(): number {
    return this._syncFreq();
  }

  set syncFreq(v: number) {
    this._syncFreq.set(v);
  }

  readonly sliderTicks = Array.from({ length: 11 }, (_, i) => i * 10);

  constructor() {
    this._clockInterval = setInterval(() => this._now.set(new Date()), 50);
  }

  ngOnDestroy(): void {
    clearInterval(this._clockInterval);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
