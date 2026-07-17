import { Component, computed, inject, signal, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';
import { describeArc } from '../../helpers/svg';

@Component({
  selector: 'app-cyberpunk-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './CyberpunkDesign.html',
  styleUrl: './CyberpunkDesign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CyberpunkDesignComponent implements OnDestroy {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  private readonly _now = signal<Date>(new Date());
  private readonly _clockInterval: ReturnType<typeof setInterval>;
  private readonly _eventInterval: ReturnType<typeof setInterval>;
  private readonly _glitchInterval: ReturnType<typeof setInterval>;
  private readonly _scanInterval: ReturnType<typeof setInterval>;

  /* ─── CHRONO CORE ─── */
  readonly clockMs = computed(() => {
    const h = this.cycleHour();
    const m = this.time.minutes$();
    const s = this.time.seconds$();
    const ms = this._now().getMilliseconds().toString().padStart(3, '0');
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  });

  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);

  readonly utcOffset = computed(() => {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60);
    const mins = Math.abs(offset) % 60;
    return `UTC ${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  });

  readonly latency = computed(() => 1 + Math.floor(Math.abs(this.time.seconds$() * 0.3 + this.time.minutes$() * 0.1) % 8));

  readonly clockDrift = computed(() => {
    const drift = Math.sin(this.time.hours$() * 0.01) * 0.003;
    return `${drift >= 0 ? '+' : ''}${drift.toFixed(3)}s`;
  });

  readonly uptime = computed(() => {
    const h = Math.abs(this.time.hours$());
    const decline = h * 0.008;
    return Math.max(90, +(100 - decline).toFixed(2));
  });

  /* ─── VITAL STATS (existing) ─── */
  readonly hpPercent = computed(() => {
    const damage = Math.floor(Math.abs(this.time.hours$()) * 0.6 + this.time.minutes$() * 0.04);
    return Math.max(0, 100 - damage);
  });

  readonly ramUsed = computed(() => {
    return Math.min(10, Math.max(1, Math.floor(Math.abs(this.time.hours$()) + this.time.minutes$() / 10) % 11 + 1));
  });

  /* ─── TECH DATA MODULES ─── */
  readonly cpuLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.time.hours$() * 1.2 + this.time.minutes$() * 0.3) % 100)));
  readonly gpuLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.time.hours$() * 1.5 + this.time.minutes$() * 0.5) % 100)));
  readonly fps = computed(() => Math.floor(55 + Math.sin(this.time.hours$() * 0.3) * 10));
  readonly packets = computed(() => Math.floor(1200 + Math.sin(this.time.hours$() * 0.1) * 300));
  readonly signalStrength = computed(() => Math.min(100, Math.floor(85 + Math.sin(this.time.hours$() * 0.15) * 15)));
  readonly threads = computed(() => Math.floor(8 + Math.sin(this.time.hours$() * 0.2) * 4));
  readonly memoryUsed = computed(() => Math.min(100, Math.floor(Math.abs(this.time.hours$() * 0.8 + this.time.minutes$() * 0.1) % 100)));
  readonly cacheLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.time.hours$() * 0.5 + this.time.minutes$() * 0.3) % 100)));
  readonly networkLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.time.hours$() * 1.1 + this.time.minutes$() * 0.2) % 100)));

  /* ─── CYBERWARE ─── */
  readonly cyberwareList = [
    { category: 'KIROSHI OPTICS', name: 'MK.5', status: 'ACTIVE', indicator: true, desc: 'Optical calibration complete' },
    { category: 'SYNAPTIC ACCELERATOR', name: 'TK-47', status: 'ONLINE', indicator: true, desc: 'Neural boost engaged' },
    { category: 'SMART LINK', name: 'Targeting Interface', status: 'CONNECTED', indicator: true, desc: 'Weapon sync established' },
    { category: 'MANTIS BLADES', name: 'Thermal Edge', status: 'READY', indicator: true, desc: 'Combat mode available' },
    { category: 'SUBDERMAL ARMOR', name: 'Militech Mesh', status: 'ACTIVE', indicator: true, desc: 'Impact resistance active' },
    { category: 'REFLEX BOOSTER', name: 'Nervous System', status: 'STANDBY', indicator: false, desc: 'Awaiting combat stimulus' },
  ];

  readonly activeCyberIdx = computed(() => Math.abs(this.time.hours$()) % this.cyberwareList.length);

  readonly systemStatus = computed(() => {
    if (this.hpPercent() <= 0) return 'SYSTEM FAILURE';
    if (this.hpPercent() < 25) return 'CRITICAL DAMAGE';
    if (this.hpPercent() < 50) return 'SYSTEM WARNING';
    return 'OPERATIONAL';
  });

  /* ─── CIRCULAR INDICATORS ─── */
  readonly neuralSync = computed(() => Math.min(100, Math.floor(70 + Math.sin(this.time.hours$() * 0.05 + this.time.minutes$() * 0.01) * 30)));
  readonly opticalFocus = computed(() => Math.min(100, Math.floor(85 + Math.sin(this.time.hours$() * 0.08 + this.time.seconds$() * 0.02) * 15)));
  readonly clockSyncPct = computed(() => Math.min(100, Math.floor(95 + Math.sin(this.time.hours$() * 0.03 + this.time.minutes$() * 0.005) * 5)));
  readonly networkStatusPct = computed(() => Math.min(100, Math.floor(80 + Math.sin(this.time.hours$() * 0.1 + this.time.minutes$() * 0.02) * 20)));
  readonly cpuCyclePct = computed(() => Math.min(100, Math.floor(Math.abs(this.time.hours$() * 1.5 + this.time.minutes$() * 0.2) % 100)));

  /* ─── BIOMETRIC STATUS ─── */
  readonly heartRate = computed(() => 62 + Math.floor(Math.abs(this.time.hours$() * 0.3 + this.time.minutes$() * 0.1 + this.time.seconds$() * 0.02) % 38));
  readonly oxygenLevel = computed(() => Math.max(90, 100 - Math.floor(Math.abs(this.time.hours$() * 0.1 + this.time.minutes$() * 0.02) % 10)));
  readonly bodyTemp = computed(() => 36.0 + (Math.abs(this.time.hours$() * 0.05 + this.time.minutes$() * 0.01) % 10) * 0.2);
  readonly bloodPressureSystolic = computed(() => 110 + Math.floor(Math.abs(this.time.hours$() * 0.2 + this.time.minutes$() * 0.05) % 30));
  readonly bloodPressureDiastolic = computed(() => 70 + Math.floor(Math.abs(this.time.hours$() * 0.1 + this.time.minutes$() * 0.03) % 20));
  readonly stressLevel = computed(() => Math.floor(Math.abs(this.time.hours$() * 0.5 + this.time.minutes$() * 0.05 + this.time.seconds$() * 0.01) % 100));
  readonly neuralActivity = computed(() => Math.floor(Math.abs(this.time.hours$() * 1.2 + this.time.minutes$() * 0.2 + this.time.seconds$() * 0.05) % 100));

  readonly bpDisplay = computed(() => `${this.bloodPressureSystolic()}/${this.bloodPressureDiastolic()}`);

  /* ─── EVENT LOG ─── */
  readonly eventLogEntries = [
    { msg: 'Optical calibration complete', priority: 'success', icon: 'optic' },
    { msg: 'Neural synchronization successful', priority: 'success', icon: 'neural' },
    { msg: 'Kiroshi firmware verified', priority: 'info', icon: 'shield' },
    { msg: 'GPS satellite linked', priority: 'info', icon: 'satellite' },
    { msg: 'Network uplink established', priority: 'success', icon: 'wifi' },
    { msg: 'Memory cache optimized', priority: 'info', icon: 'memory' },
    { msg: 'Retinal scan complete', priority: 'success', icon: 'scan' },
    { msg: 'Time synchronization successful', priority: 'success', icon: 'clock' },
    { msg: 'Biometric analysis updated', priority: 'info', icon: 'heart' },
    { msg: 'Internal diagnostics running', priority: 'warning', icon: 'cpu' },
  ];

  readonly eventIndex = signal(0);
  readonly showAllEvents = signal(false);
  readonly visibleLogEntries = computed(() => {
    if (this.showAllEvents()) return this.eventLogEntries;
    const idx = this.eventIndex();
    return this.eventLogEntries.slice(0, idx + 1);
  });

  readonly eventProgress = computed(() => {
    return (this.eventIndex() / (this.eventLogEntries.length - 1)) * 100;
  });

  /* ─── SLIDER ─── */
  readonly hoursDisplay = computed(() => {
    const h = this.time.hours$();
    return `${h >= 0 ? '+' : ''}${h.toFixed(1)}h`;
  });

  readonly sliderTicks = [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240];

  readonly sliderValue = signal<number>(0);

  readonly scanColor = computed(() => {
    const h = Math.max(0, this.time.hours$());
    const t = Math.min(1, h / 240);
    const hue = 330 - t * 190;
    return `hsl(${hue}, 100%, 50%)`;
  });

  /* ─── NEURAL MAP NODES ─── */
  readonly neuralNodes = [
    { x: 8, y: 8, r: 1.2 }, { x: 22, y: 4, r: 1.8 }, { x: 38, y: 6, r: 1.4 }, { x: 55, y: 3, r: 1.6 }, { x: 70, y: 7, r: 1.3 },
    { x: 85, y: 4, r: 1.7 }, { x: 94, y: 10, r: 1.0 }, { x: 4, y: 25, r: 1.5 }, { x: 16, y: 22, r: 1.0 }, { x: 30, y: 20, r: 1.8 },
    { x: 48, y: 18, r: 1.6 }, { x: 62, y: 22, r: 1.2 }, { x: 78, y: 20, r: 1.5 }, { x: 92, y: 26, r: 1.8 }, { x: 6, y: 42, r: 1.3 },
    { x: 20, y: 40, r: 1.6 }, { x: 38, y: 38, r: 1.0 }, { x: 55, y: 36, r: 1.7 }, { x: 72, y: 40, r: 1.4 }, { x: 88, y: 44, r: 1.2 },
    { x: 10, y: 58, r: 1.5 }, { x: 28, y: 55, r: 1.8 }, { x: 45, y: 54, r: 1.3 }, { x: 62, y: 56, r: 1.6 }, { x: 82, y: 58, r: 1.0 },
    { x: 8, y: 72, r: 1.4 }, { x: 24, y: 70, r: 1.2 }, { x: 42, y: 68, r: 1.7 }, { x: 60, y: 72, r: 1.5 }, { x: 78, y: 70, r: 1.8 },
    { x: 92, y: 76, r: 1.1 }, { x: 15, y: 86, r: 1.6 }, { x: 35, y: 84, r: 1.3 }, { x: 55, y: 82, r: 1.5 }, { x: 75, y: 86, r: 1.4 },
    { x: 50, y: 46, r: 2.0 },
  ];

  readonly neuralConnections = [
    [0,1],[0,7],[1,2],[1,8],[2,3],[2,9],[3,4],[3,10],[4,5],[4,11],[5,6],[5,12],[6,13],
    [7,8],[7,14],[8,9],[8,15],[9,10],[9,16],[10,11],[10,17],[11,12],[11,18],[12,13],[12,19],[13,20],
    [14,15],[14,21],[15,16],[15,22],[16,17],[16,23],[17,18],[17,24],[18,19],[18,25],[19,20],[19,26],
    [21,22],[21,27],[22,23],[22,28],[23,24],[23,29],[24,25],[24,30],[25,26],[25,31],[26,32],
    [27,28],[27,33],[28,29],[28,34],[29,30],[29,35],[30,31],[30,36],[31,32],[31,36],[32,36],
    [3,11],[4,12],[8,16],[9,17],[10,18],[15,22],[16,23],[17,24],[22,28],[23,29],[24,30],
    [0,8],[1,9],[2,10],[7,15],[14,22],[21,28],
  ];

  readonly neuralNodesFloating = [
    { x: 30, y: 12, vx: 0.3, vy: 0.2 }, { x: 70, y: 15, vx: -0.2, vy: 0.3 },
    { x: 15, y: 50, vx: 0.4, vy: -0.1 }, { x: 85, y: 50, vx: -0.3, vy: 0.2 },
    { x: 35, y: 78, vx: 0.2, vy: -0.3 }, { x: 65, y: 82, vx: -0.4, vy: -0.2 },
    { x: 50, y: 30, vx: 0.1, vy: 0.4 }, { x: 50, y: 68, vx: -0.1, vy: -0.4 },
  ];

  readonly neuralLabels = [
    { x: 18, y: 15, text: 'SCAN-01' }, { x: 72, y: 12, text: 'NODE-07' },
    { x: 12, y: 50, text: 'SYNC' }, { x: 78, y: 50, text: 'LINK' },
    { x: 25, y: 82, text: 'v2.1' }, { x: 65, y: 88, text: 'CAL' },
  ];

  /* ─── GLITCH SYSTEM ─── */
  readonly glitchActive = signal(false);
  readonly glitchIntensity = signal(0);
  readonly microGlitchType = signal<'none' | 'line' | 'vibrate' | 'flicker'>('none');

  /* ─── SCAN LINE ─── */
  readonly scanLinePos = signal(0);
  readonly scanLineVisible = signal(false);

  /* ─── NEURAL MAP PULSE ─── */
  readonly neuralPulsePhase = signal(0);

  /* ─── CHRONO PULSE ─── */
  readonly chronoPhase = signal(0);
  readonly secondPulse = signal(false);
  readonly minutePulse = signal(false);

  private syncFromTime(): void {
    this.sliderValue.set(this.time.hours$());
  }

  constructor() {
    this.session.addLog('CYBERPUNK WORLD INITIALIZED', 'success');
    this.syncFromTime();

    let lastS = -1;
    let lastM = -1;

    this._clockInterval = setInterval(() => {
      this._now.set(new Date());
      this.neuralPulsePhase.update(p => (p + 1) % 360);
      this.chronoPhase.update(p => (p + 1) % 360);

      const s = this.time.seconds$();
      const m = this.time.minutes$();
      if (s !== lastS) {
        lastS = s;
        this.secondPulse.set(true);
        setTimeout(() => this.secondPulse.set(false), 200);
      }
      if (m !== lastM) {
        lastM = m;
        this.minutePulse.set(true);
        setTimeout(() => this.minutePulse.set(false), 600);
      }

    }, 50);

    this._eventInterval = setInterval(() => {
      this.eventIndex.update(i => Math.min(i + 1, this.eventLogEntries.length - 1));
      if (this.eventIndex() >= this.eventLogEntries.length - 1) {
        this.showAllEvents.set(true);
      }
    }, 1800);

    this._glitchInterval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.06) {
        this.microGlitchType.set('line');
        this.glitchActive.set(true);
        this.glitchIntensity.set(0.1 + Math.random() * 0.2);
        setTimeout(() => {
          this.glitchActive.set(false);
          this.glitchIntensity.set(0);
          this.microGlitchType.set('none');
        }, 80 + Math.random() * 60);
      } else if (roll < 0.1) {
        this.microGlitchType.set('vibrate');
        setTimeout(() => this.microGlitchType.set('none'), 150);
      } else if (roll < 0.13) {
        this.microGlitchType.set('flicker');
        setTimeout(() => this.microGlitchType.set('none'), 200);
      }
    }, 4000);

    this._scanInterval = setInterval(() => {
      this.scanLinePos.set(Math.random() * 100);
      this.scanLineVisible.set(true);
      setTimeout(() => this.scanLineVisible.set(false), 2000);
    }, 10000 + Math.random() * 4000);
  }

  ngOnDestroy(): void {
    clearInterval(this._clockInterval);
    clearInterval(this._eventInterval);
    clearInterval(this._glitchInterval);
    clearInterval(this._scanInterval);
  }

  onSliderChange(v: number): void {
    this.sliderValue.set(v);
    this.time.setHora(v);
  }

  onDragStart(): void {
  }

  onDragEnd(): void {
  }

  onResetTime(): void {
    this.time.resetToRealTime();
    this.syncFromTime();
  }

  /* ─── SVG ARC HELPER ─── */
  readonly describeArc = describeArc;

  /* ─── EVENT LOG TIMESTAMP ─── */
  eventTs(index: number): string {
    const totalS = (index + 1) * 2;
    const m = Math.floor(totalS / 60);
    const s = totalS % 60;
    const h = Math.floor(m / 60);
    return `${h.toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  /* ─── EVENT PRIORITY ICON ─── */
  eventIcon(priority: string): string {
    switch (priority) {
      case 'success': return '◆';
      case 'warning': return '▲';
      case 'info': return '◈';
      default: return '●';
    }
  }
}
