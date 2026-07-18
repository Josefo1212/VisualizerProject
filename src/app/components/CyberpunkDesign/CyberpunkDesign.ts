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

  private _pulseInterval!: ReturnType<typeof setInterval>;
  private _neuralInterval!: ReturnType<typeof setInterval>;
  private _breachInterval!: ReturnType<typeof setInterval>;
  private _implantInterval!: ReturnType<typeof setInterval>;
  private _slowInterval!: ReturnType<typeof setInterval>;


  /* ─── CHRONO CORE ─── */
  readonly clock = computed(() => {
    const h = this.cycleHour();
    const m = this.dragMinutes$();
    const s = this.dragSeconds$();
    if (isNaN(h) || isNaN(m) || isNaN(s)) return '--:--:--';
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly cycleHour = computed(() => ((this.dragHours$() % 24) + 24) % 24);

  readonly utcOffset = computed(() => {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset) / 60);
    const mins = Math.abs(offset) % 60;
    return `UTC ${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  });

  readonly latency = computed(() => 1 + Math.floor(Math.abs(this.dragSeconds$() * 0.3 + this.dragMinutes$() * 0.1) % 8));

  readonly clockDrift = computed(() => {
    const drift = Math.sin(this.dragHours$() * 0.01) * 0.003;
    return `${drift >= 0 ? '+' : ''}${drift.toFixed(3)}s`;
  });

  readonly uptime = computed(() => {
    const h = Math.abs(this.dragHours$());
    const decline = h * 0.008;
    return Math.max(90, +(100 - decline).toFixed(2));
  });

  /* ─── VITAL STATS (existing) ─── */
  readonly hpPercent = computed(() => {
    const damage = Math.floor(Math.abs(this.dragHours$()) * 0.6 + this.dragMinutes$() * 0.04);
    return Math.max(0, 100 - damage);
  });

  readonly ramUsed = computed(() => {
    return Math.min(10, Math.max(1, Math.floor(Math.abs(this.dragHours$()) + this.dragMinutes$() / 10) % 11 + 1));
  });

  /* ─── TECH DATA MODULES ─── */
  readonly cpuLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.dragHours$() * 1.2 + this.dragMinutes$() * 0.3) % 100)));
  readonly gpuLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.dragHours$() * 1.5 + this.dragMinutes$() * 0.5) % 100)));
  readonly fps = computed(() => Math.floor(55 + Math.sin(this.dragHours$() * 0.3) * 10));
  readonly packets = computed(() => Math.floor(1200 + Math.sin(this.dragHours$() * 0.1) * 300));
  readonly signalStrength = computed(() => Math.min(100, Math.floor(85 + Math.sin(this.dragHours$() * 0.15) * 15)));
  readonly threads = computed(() => Math.floor(8 + Math.sin(this.dragHours$() * 0.2) * 4));
  readonly memoryUsed = computed(() => Math.min(100, Math.floor(Math.abs(this.dragHours$() * 0.8 + this.dragMinutes$() * 0.1) % 100)));
  readonly cacheLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.dragHours$() * 0.5 + this.dragMinutes$() * 0.3) % 100)));
  readonly networkLoad = computed(() => Math.min(100, Math.floor(Math.abs(this.dragHours$() * 1.1 + this.dragMinutes$() * 0.2) % 100)));

  /* ─── IMPLANT MONITOR ─── */
  readonly implants = signal([
    { name: 'KIROSHI OPTICS', bar: 100, status: 'ONLINE' },
    { name: 'SANDEVISTAN', bar: 76, status: 'READY' },
    { name: 'BIOMONITOR', bar: 100, status: 'ACTIVE' },
    { name: 'NEURAL LINK', bar: 91, status: 'SYNC 98%' },
    { name: 'RELIC OS', bar: 100, status: 'STABLE' },
    { name: 'SYNAPTIC ACCEL', bar: 65, status: 'STANDBY' },
    { name: 'SUBDERMAL ARMOR', bar: 100, status: 'ACTIVE' },
    { name: 'REFLEX BOOSTER', bar: 42, status: 'CHARGING' },
  ]);

  readonly systemStatus = computed(() => {
    if (this.hpPercent() <= 0) return 'SYSTEM FAILURE';
    if (this.hpPercent() < 25) return 'CRITICAL DAMAGE';
    if (this.hpPercent() < 50) return 'SYSTEM WARNING';
    return 'OPERATIONAL';
  });

  /* ─── CIRCULAR INDICATORS ─── */
  readonly neuralSync = computed(() => Math.min(100, Math.floor(70 + Math.sin(this.dragHours$() * 0.05 + this.dragMinutes$() * 0.01) * 30)));
  readonly opticalFocus = computed(() => Math.min(100, Math.floor(85 + Math.sin(this.dragHours$() * 0.08 + this.dragSeconds$() * 0.02) * 15)));
  readonly clockSyncPct = computed(() => Math.min(100, Math.floor(95 + Math.sin(this.dragHours$() * 0.03 + this.dragMinutes$() * 0.005) * 5)));
  readonly networkStatusPct = computed(() => Math.min(100, Math.floor(80 + Math.sin(this.dragHours$() * 0.1 + this.dragMinutes$() * 0.02) * 20)));
  readonly cpuCyclePct = computed(() => Math.min(100, Math.floor(Math.abs(this.dragHours$() * 1.5 + this.dragMinutes$() * 0.2) % 100)));

  /* ─── BIOMETRIC STATUS ─── */
  readonly heartRate = computed(() => 62 + Math.floor(Math.abs(this.dragHours$() * 0.3 + this.dragMinutes$() * 0.1 + this.dragSeconds$() * 0.02) % 38));
  readonly oxygenLevel = computed(() => Math.max(90, 100 - Math.floor(Math.abs(this.dragHours$() * 0.1 + this.dragMinutes$() * 0.02) % 10)));
  readonly bodyTemp = computed(() => 36.0 + (Math.abs(this.dragHours$() * 0.05 + this.dragMinutes$() * 0.01) % 10) * 0.2);
  readonly bloodPressureSystolic = computed(() => 110 + Math.floor(Math.abs(this.dragHours$() * 0.2 + this.dragMinutes$() * 0.05) % 30));
  readonly bloodPressureDiastolic = computed(() => 70 + Math.floor(Math.abs(this.dragHours$() * 0.1 + this.dragMinutes$() * 0.03) % 20));
  readonly stressLevel = computed(() => Math.floor(Math.abs(this.dragHours$() * 0.5 + this.dragMinutes$() * 0.05 + this.dragSeconds$() * 0.01) % 100));
  readonly neuralActivity = computed(() => Math.floor(Math.abs(this.dragHours$() * 1.2 + this.dragMinutes$() * 0.2 + this.dragSeconds$() * 0.05) % 100));

  readonly bpDisplay = computed(() => `${this.bloodPressureSystolic()}/${this.bloodPressureDiastolic()}`);

  /* ─── EVENT LOG ─── */
  readonly logLines = signal<string[]>([]);
  readonly MAX_LOG_LINES = 20;
  readonly eventGlitchLine = signal(-1);

  private readonly eventPool = [
    'LINK ESTABLISHED', 'NETWATCH VERIFIED', 'KIROSHI ONLINE',
    'NETWORK VERIFIED', 'ENCRYPTION UPDATED', 'ICE SCAN COMPLETE',
    'DATA STREAM OPEN', 'PORT 04 OPEN', 'CACHE SYNCHRONIZED',
    'QUICKHACK READY', 'ACCESS TOKEN REFRESHED', 'PACKET ROUTE OPTIMIZED',
    'BLACKWALL CHECK PASSED', 'ROUTE UPDATED', 'TRAFFIC NORMALIZED',
    'SIGNAL VERIFIED', 'NEURAL INTERFACE CALIBRATED', 'DAEMON SPAWNED ON PORT 7',
    'CYBERWARE LINK ESTABLISHED', 'FIREWALL BYPASS DETECTED', 'DNS CACHE PURGED',
    'ICE PROTOCOL NEGOTIATED', 'ENCRYPTION KEY ROTATED', 'TCP HANDSHAKE COMPLETE',
    'BANDWIDTH ALLOCATED', 'VIRTUAL CHANNEL OPENED', 'KERNEL MODULE LOADED',
    'BIOMETRIC VERIFICATION PASSED', 'MEMORY SEGMENT RELOCATED', 'STACK FRAME VALIDATED',
    'HEAP ALLOCATION CONFIRMED', 'NETWORK INTERFACE ACTIVE', 'PROXY CHAIN ESTABLISHED',
    'QUANTUM KEY DISTRIBUTED', 'OPTICAL SIGNAL BOOSTED', 'RELIC INTEGRITY CHECK PASSED',
    'NEURAL LINK SYNCHRONIZED', 'SUBDERMAL GRID CALIBRATED', 'REFLEX BOOSTER STANDBY',
    'SYNAPSE ACCELERATOR READY', 'SMART LINK CONNECTED', 'COMBAT MODE AVAILABLE',
  ];

  private generateLogEntry(): string {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const ss = now.getSeconds().toString().padStart(2, '0');
    const msg = this.eventPool[Math.floor(Math.random() * this.eventPool.length)];
    return `${hh}:${mm}:${ss} ${msg}`;
  }

  /* ─── BREACH PROTOCOL TERMINAL ─── */
  readonly breachProvider = signal('NETWATCH');
  readonly breachNode = signal('NX-07');
  readonly breachAccess = signal('AUTHORIZED');
  readonly breachEncryption = signal('AES-256');

  readonly ping = signal(8);
  readonly breachLatency = signal(18);
  readonly signalPct = signal(97);

  readonly iceActive = signal(false);
  readonly breachReady = signal(false);
  readonly traceLevel = signal(0);
  readonly traceGlitch = signal(false);
  readonly blackwallStatus = signal('STANDBY');

  readonly ramPct = signal(72);
  readonly ports = signal(6);
  readonly daemonStatus = signal('IDLE');

  readonly statusMsg = signal('HANDSHAKE COMPLETE');
  readonly statusBlink = signal(true);

  readonly breachGlitchWord = signal('');
  readonly breachGlitchActive = signal(false);

  private readonly providers = ['NETWATCH', 'MILLITECH', 'ARASAKA', 'KANG TAO', 'ZETATECH'];
  private readonly nodes = ['NX-07', 'BS-42', 'AL-19', 'DK-31', 'TR-88', 'VX-02'];
  private readonly statuses = ['ENCRYPTING...', 'HANDSHAKE COMPLETE', 'SCANNING ICE', 'DECRYPTING PROTOCOL', 'ESTABLISHING LINK', 'PACKET LOSS WARNING'];
  private readonly daemons = ['IDLE', 'PARSING', 'COMPILING', 'MONITORING', 'ACTIVE'];

  /* ─── SLIDER ─── */
  readonly sliderValue = signal<number>(0);
  readonly isDragging = signal(false);

  readonly mappedHours = computed(() => {
    if (this.isDragging()) return this.sliderValue();
    return this.time.currentHour$();
  });

  readonly hoursDisplay = computed(() => {
    const h = this.isDragging() ? this.sliderValue() : this.time.currentHour$();
    return `${h >= 0 ? '+' : ''}${h.toFixed(1)}h`;
  });

  /* ─── DRAG-AWARE TIME (switches between slider preview & real engine) ─── */
  readonly dragHours$ = computed(() => {
    if (!this.isDragging()) return this.time.hours$();
    return Math.trunc(this.sliderValue());
  });

  readonly dragMinutes$ = computed(() => {
    if (!this.isDragging()) return this.time.minutes$();
    const v = this.sliderValue();
    const frac = v - Math.trunc(v);
    return Math.floor(((frac * 60) % 60 + 60) % 60);
  });

  readonly dragSeconds$ = computed(() => {
    if (!this.isDragging()) return this.time.seconds$();
    const v = this.sliderValue();
    const totalMin = v * 60;
    return Math.floor(((totalMin - Math.floor(totalMin)) * 60 + 60) % 60);
  });

  readonly sliderTicks = [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240];

  readonly scanColor = computed(() => {
    const h = Math.max(0, this.dragHours$());
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

  /* ─── PULSE ─── */
  readonly secondPulse = signal(false);
  readonly minutePulse = signal(false);

  private syncFromTime(): void {
    this.sliderValue.set(this.time.currentHour$());
  }

  constructor() {
    this.session.addLog('CYBERPUNK WORLD INITIALIZED', 'success');
    this.syncFromTime();
    setTimeout(() => this.startTimers(), 0);
  }

  private startTimers(): void {
    /* ─── SINGLE HEARTBEAT (250ms base) ─── */
    let tick = 0;

    this._pulseInterval = setInterval(() => {
      tick++;

      /* every tick (250ms) — seconds/minutes pulse */
      const s = this.dragSeconds$();
      if (s !== this._lastSecond) {
        this._lastSecond = s;
        this.secondPulse.set(true);
        setTimeout(() => this.secondPulse.set(false), 200);
      }
      const m = this.dragMinutes$();
      if (m !== this._lastMinute) {
        this._lastMinute = m;
        this.minutePulse.set(true);
        setTimeout(() => this.minutePulse.set(false), 600);
      }
    }, 250);

    /* every 500ms — neural + implant + breach */
    this._neuralInterval = setInterval(() => {
      this.neuralPulsePhase.update(p => (p + 1) % 360);

      this.implants.update(list =>
        list.map(imp => {
          const drift = (Math.random() - 0.5) * 1.6;
          const bar = Math.max(0, Math.min(100, imp.bar + drift));
          return { ...imp, bar: parseFloat(bar.toFixed(1)) };
        })
      );

      this.ping.set(5 + Math.floor(Math.random() * 8));
      this.breachLatency.update(l => {
        const drift = (Math.random() - 0.5) * 4;
        return Math.max(10, Math.min(30, l + drift));
      });
      this.signalPct.set(94 + Math.floor(Math.random() * 7));
      this.ramPct.set(65 + Math.floor(Math.random() * 28));
      this.traceLevel.update(t => {
        const inc = 0.5 + Math.random();
        const next = t + inc;
        if (next >= 100) {
          this.traceGlitch.set(true);
          setTimeout(() => this.traceGlitch.set(false), 120);
          return 0;
        }
        return next;
      });
      this.iceActive.set(Math.random() < 0.3);
      this.breachReady.set(Math.random() < 0.2);
      this.blackwallStatus.set(Math.random() < 0.1 ? 'ACTIVE' : 'STANDBY');
      this.statusBlink.set(!this.statusBlink());

      const tick48 = tick % 48;
      if (tick48 === 0) {
        this.breachProvider.set(this.providers[Math.floor(Math.random() * this.providers.length)]);
        this.breachNode.set(this.nodes[Math.floor(Math.random() * this.nodes.length)]);
        this.breachAccess.set(Math.random() < 0.9 ? 'AUTHORIZED' : 'RESTRICTED');
        this.breachEncryption.set(Math.random() < 0.7 ? 'AES-256' : 'QUANTUM-X');
      }
      if (tick48 % 24 === 0) {
        this.ports.set(3 + Math.floor(Math.random() * 9));
      }
      if (tick48 % 8 === 0) {
        this.statusMsg.set(this.statuses[Math.floor(Math.random() * this.statuses.length)]);
        this.daemonStatus.set(this.daemons[Math.floor(Math.random() * this.daemons.length)]);
      }
    }, 500);

    /* every 2s — slow events (logs, glitch, scan, event glitch) */
    this._slowInterval = setInterval(() => {
      this.logLines.update(lines => {
        const next = [...lines, this.generateLogEntry()];
        return next.length > this.MAX_LOG_LINES ? next.slice(-this.MAX_LOG_LINES) : next;
      });

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

      this.scanLinePos.set(Math.random() * 100);
      this.scanLineVisible.set(true);
      setTimeout(() => this.scanLineVisible.set(false), 2000);

      const len = this.logLines().length;
      if (len > 0 && Math.random() < 0.2) {
        const idx = Math.floor(Math.random() * len);
        this.eventGlitchLine.set(idx);
        setTimeout(() => this.eventGlitchLine.set(-1), 80 + Math.random() * 60);
      }

      if (Math.random() < 0.15) {
        const words = ['ERR', 'SYS', 'OVR', 'NUL', 'COR', '0x7F'];
        this.breachGlitchWord.set(words[Math.floor(Math.random() * words.length)]);
        this.breachGlitchActive.set(true);
        setTimeout(() => {
          this.breachGlitchActive.set(false);
          this.breachGlitchWord.set('');
        }, 70 + Math.random() * 30);
      }
    }, 2000);
  }

  private _lastSecond = -1;
  private _lastMinute = -1;

  ngOnDestroy(): void {
    clearInterval(this._neuralInterval);
    clearInterval(this._pulseInterval);
    clearInterval(this._breachInterval);
    clearInterval(this._implantInterval);
    clearInterval(this._slowInterval);
  }

  onSliderChange(v: number): void {
    this.isDragging.set(true);
    this.sliderValue.set(v);
  }

  onDragStart(): void {
    this.isDragging.set(true);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
    this.time.setHora(this.sliderValue());
  }

  onResetTime(): void {
    this.time.resetToRealTime();
    this.syncFromTime();
  }

  /* ─── SVG ARC HELPER ─── */
  readonly describeArc = describeArc;

}
