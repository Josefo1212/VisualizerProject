import { Component, computed, inject, signal } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';
import { seededMod, dayProgress } from '../../helpers/math';
import { formatTime } from '../../helpers/format';
import { ROMAN } from '../../helpers/world';
import { OrbitMark, PulseDot, SignalParticle } from '../../interfaces/noMansSky';

const CX = 300;
const CY = 300;
const MINUTE_R = 120;
const MINUTE_CIRC = 2 * Math.PI * MINUTE_R;
const HOUR_R = 215;
const NUMERAL_R = 245;

@Component({
  selector: 'app-no-mans-sky-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './NoMansSkyDesign.html',
  styleUrl: './NoMansSkyDesign.css',
})
export class NoMansSkyDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  constructor() {
    this.session.addLog('NO MANS SKY WORLD INITIALIZED', 'success');
    this.sliderValue.set(this.time.currentHour$());
  }

  readonly CX = CX;
  readonly CY = CY;
  readonly MINUTE_R = MINUTE_R;
  readonly MINUTE_CIRC = MINUTE_CIRC;
  readonly HOUR_R = HOUR_R;

  readonly sliderValue = signal<number>(0);
  readonly isDragging = signal(false);

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

  readonly cycleHour = computed(() => ((this.dragHours$() % 24) + 24) % 24);
  readonly minute = computed(() => this.dragMinutes$());
  readonly second = computed(() => this.dragSeconds$());

  readonly worldPhase = computed(() => {
    const h = this.cycleHour();
    if (h >= 5 && h < 7) return 'dawn';
    if (h >= 7 && h < 18) return 'day';
    if (h >= 18 && h < 20) return 'dusk';
    return 'night';
  });

  readonly worldPhaseLabel = computed(() => {
    const p = this.worldPhase();
    switch (p) {
      case 'dawn': return 'Dawn';
      case 'day': return 'Day';
      case 'dusk': return 'Evening';
      case 'night': return 'Night';
    }
  });

  readonly dayProgress = computed(() => {
    const h = this.cycleHour();
    return ((h / 24) * 100).toFixed(2);
  });

  readonly timeDisplay = computed(() => {
    return formatTime(this.cycleHour(), this.minute(), this.second());
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  });

  /* ─── ORBITAL HOUR RING ─── */
  readonly hourMarks: OrbitMark[] = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 360;
    const isMajor = i % 3 === 0;
    const angleRad = ((angle - 90) * Math.PI) / 180;
    return {
      index: i,
      angle,
      roman: ROMAN[i % 12],
      isMajor,
      nx: CX + NUMERAL_R * Math.cos(angleRad),
      ny: CY + NUMERAL_R * Math.sin(angleRad),
    };
  });

  /* ─── PULSE SECOND RING ─── */
  readonly pulseDots: PulseDot[] = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    angle: (i / 60) * 360,
  }));

  /* ─── STAR NODE ─── */
  readonly starAngle = computed(() => (this.cycleHour() / 24) * 360);

  /* ─── MINUTE ENERGY RING (stroke-dashoffset) ─── */
  readonly minuteProgress = computed(() => this.minute() / 60);

  readonly minuteDashOffset = computed(() =>
    MINUTE_CIRC * (1 - this.minuteProgress())
  );

  readonly minuteIntensity = computed(() => Math.max(0.2, this.minute() / 59));

  readonly minuteNodePos = computed(() => {
    const angleDeg = -90 + this.minuteProgress() * 360;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + MINUTE_R * Math.cos(rad),
      y: CY + MINUTE_R * Math.sin(rad),
    };
  });

  /* ─── HOUR MARKER (current hour position) ─── */
  readonly hourMarkerPos = computed(() => {
    const angleDeg = (this.cycleHour() / 24) * 360 - 90;
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + HOUR_R * Math.cos(rad),
      y: CY + HOUR_R * Math.sin(rad),
    };
  });

  /* ─── TECH MARKS for orbital scan ring ─── */
  readonly techMarks = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * 360,
  }));

  /* ─── LUMINOUS POINTS ─── */
  readonly luminousPoints = Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * 360 + (i * 17) % 30;
    const r = 125 + ((i * 23) % 95);
    const rad = (angle * Math.PI) / 180;
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
      delay: (i * 0.4) % 5,
      size: 0.6 + (i % 3) * 0.5,
    };
  });

  /* ─── SPACE PARTICLES ─── */
  readonly spaceParticles = Array.from({ length: 15 }, (_, i) => {
    const angle = (i / 15) * 360 + 20;
    const r = 115 + (i * 19) % 70;
    const rad = (angle * Math.PI) / 180;
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
      delay: (i * 0.8) % 6,
    };
  });

  /* ─── DUST PARTICLES (slow drift) ─── */
  readonly dustParticles = Array.from({ length: 35 }, (_, i) => {
    const angle = (i / 35) * 360 + (i * 11) % 40;
    const r = 100 + ((i * 13) % 140);
    const rad = (angle * Math.PI) / 180;
    return {
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
      delay: (i * 0.6) % 8,
      dur: 12 + (i % 5) * 4,
    };
  });

  /* ─── SATELLITES ─── */
  readonly satellites = [
    { angle: 30, r: 175, delay: 0 },
    { angle: 150, r: 195, delay: 2.5 },
    { angle: 280, r: 160, delay: 5 },
  ].map(s => ({
    ...s,
    x: CX + s.r * Math.sin(s.angle * Math.PI / 180),
    y: CY - s.r * Math.cos(s.angle * Math.PI / 180),
  }));

  /* ─── SIGNAL PARTICLES ─── */
  readonly signalParticles: SignalParticle[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 20 + seededMod(i, 60, 3),
    y: 20 + seededMod(i, 60, 7),
    delay: seededMod(i, 8, 2),
    duration: 10 + (i % 4) * 4,
    size: 1 + (i % 3),
    opacity: 0.06 + (i % 5) * 0.04,
  }));

  /* ─── METHODS ─── */
  onSliderChange(h: number): void {
    this.isDragging.set(true);
    this.sliderValue.set(h);
  }

  onDragStart(): void {
    this.isDragging.set(true);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
    this.time.setHora(this.sliderValue());
  }

  onResetTime(): void {
    this.sliderValue.set(this.time.currentHour$());
    this.time.resetToRealTime();
  }
}
