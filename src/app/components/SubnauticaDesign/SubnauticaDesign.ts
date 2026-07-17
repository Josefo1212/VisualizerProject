import { Component, computed, inject, signal } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { formatTime } from '../../helpers/format';

const DAYS_SPANISH = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const MONTHS_SPANISH = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
const TASKS = ['Metal', 'Lithium', 'Titanium', 'Copper', 'Quartz', 'Gold'];

@Component({
  selector: 'app-subnautica-design',
  standalone: true,
  templateUrl: './SubnauticaDesign.html',
  styleUrls: ['./SubnauticaDesign.css']
})
export class SubnauticaDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  readonly sliderValue = signal<number>(0);
  readonly isDragging = signal(false);

  constructor() {
    this.session.addLog('SUBNAUTICA WORLD INITIALIZED', 'success');
    this.sliderValue.set(this.time.currentHour$());
  }

  readonly currentTaskName = computed(() => {
    const idx = this.time.hours$() % TASKS.length;
    return TASKS[idx];
  });

  readonly clockDisplay = computed(() => {
    return formatTime(this.time.hours$(), this.time.minutes$(), this.time.seconds$());
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    const dayName = DAYS_SPANISH[now.getDay()];
    const dayNum = now.getDate();
    const month = MONTHS_SPANISH[now.getMonth()];
    return `${dayName}, ${dayNum} ${month}`.toUpperCase();
  });

  readonly oxygenPercent = computed(() => Math.round((1 - this.time.minutes$() / 60) * 100));
  readonly isCritical = computed(() => this.time.minutes$() > 50);
  readonly isPressureCritical = computed(() => this.depthDisplay() > 600);

  readonly calculatedBar = computed(() => Math.round(this.depthDisplay() / 10) + 1);

  readonly depthDisplay = computed(() => {
    const mins = this.time.hours$() * 60 + this.time.minutes$();
    return Math.round((mins / 1439) * 1000);
  });

  readonly integrityPercent = computed(() => {
    const integrity = 100 - Math.round(this.depthDisplay() / 10);
    return Math.max(0, integrity);
  });

  readonly conicGradient = computed(() => {
    const deg = (this.oxygenPercent() / 100) * 360;
    const safe = Math.max(0, deg - 2);
    if (this.isCritical()) {
      return `conic-gradient(
        #ff003c ${safe}deg,
        #ff6070 ${deg}deg,
        rgba(255,0,60,0.05) ${deg}deg
      )`;
    }
    return `conic-gradient(
      rgba(0,240,255,0.02) 0deg,
      #00f0ff ${Math.max(0, deg * 0.3)}deg,
      #00c8d8 ${Math.max(0, deg * 0.65)}deg,
      #00f0ff ${safe}deg,
      rgba(0,240,255,0.05) ${deg}deg
    )`;
  });

  readonly totalMinutes = computed(() => this.time.hours$() * 60 + this.time.minutes$());
  readonly sliderPercent = computed(() => (this.sliderValue() / 24) * 100);

  readonly arcPath = 'M -5,8 Q 50,-4 105,8';

  private bezierPoint(t: number): { x: number; y: number } {
    const t1 = 1 - t;
    return {
      x: t1 * t1 * -5 + 2 * t1 * t * 50 + t * t * 105,
      y: t1 * t1 * 8 + 2 * t1 * t * -4 + t * t * 8,
    };
  }

  readonly arcThumbPos = computed(() => {
    const t = Math.max(0, Math.min(1, this.sliderValue() / 24));
    return this.bezierPoint(t);
  });

  readonly arcTicks = computed(() => {
    const pts = [0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1439];
    const labels = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '23:59'];
    return pts.map((mins, i) => {
      const t = mins / 1439;
      const p = this.bezierPoint(t);
      const dy = 2 * (1 - t) * (-12) + 2 * t * 12;
      const len = Math.sqrt(12100 + dy * dy) || 1;
      const nx = -dy / len;
      const ny = 110 / len;
      return {
        x1: p.x, y1: p.y,
        x2: p.x + nx * 4, y2: p.y + ny * 4,
        lx: p.x + nx * 11, ly: p.y + ny * 11 + 1.5,
        label: labels[i],
      };
    });
  });

  private svgElement?: SVGSVGElement;

  private arcYatT(t: number): number {
    return 8 - 24 * t + 24 * t * t;
  }

  private setFromPointer(clientX: number, clientY: number, checkProximity = false): boolean {
    if (!this.svgElement) return false;
    const rect = this.svgElement.getBoundingClientRect();
    const vb = this.svgElement.viewBox.baseVal;
    const sx = vb.width / rect.width;
    const sy = vb.height / rect.height;
    const cx = (clientX - rect.left) * sx;
    const cy = (clientY - rect.top) * sy;
    const t = Math.max(0, Math.min(1, (cx + 5) / 110));
    if (checkProximity) {
      const curveY = this.arcYatT(t);
      if (Math.abs(cy - curveY) > 12) return false;
    }
    const hours = t * 24;
    this.sliderValue.set(hours);
    this.time.setHora(hours);
    return true;
  }

  onPointerDown(event: PointerEvent): void {
    const svg = event.currentTarget as SVGSVGElement;
    this.svgElement = svg;
    if (!this.setFromPointer(event.clientX, event.clientY, true)) return;
    svg.setPointerCapture(event.pointerId);
    this.isDragging.set(true);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;
    this.setFromPointer(event.clientX, event.clientY, false);
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);
    const svg = event.currentTarget as SVGSVGElement;
    svg.releasePointerCapture(event.pointerId);
  }

  onResetTime(): void {
    this.sliderValue.set(this.time.currentHour$());
    this.time.resetToRealTime();
  }
}