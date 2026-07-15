import { Component, computed, inject } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';

interface OrbitMark {
  index: number;
  angle: number;
  roman: string;
  isMajor: boolean;
  nx: number;
  ny: number;
}

interface PulseDot {
  index: number;
  angle: number;
}

interface SignalParticle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

function seededMod(i: number, base: number, offset: number): number {
  return ((i * offset * 2.3) % base + base) % base;
}

const CX = 300;
const CY = 300;
const MINUTE_R = 120;
const MINUTE_CIRC = 2 * Math.PI * MINUTE_R;
const HOUR_R = 215;
const SECOND_R = 170;
const NUMERAL_R = 245;

const ROMAN: Record<number, string> = {
  0: 'XII', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI',
};

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
  }

  readonly CX = CX;
  readonly CY = CY;
  readonly MINUTE_R = MINUTE_R;
  readonly MINUTE_CIRC = MINUTE_CIRC;
  readonly HOUR_R = HOUR_R;

  readonly sliderValue = computed(() => {
    const h = this.time.hours$();
    return Math.max(0, Math.min(240, h));
  });

  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);
  readonly minute = this.time.minutes$;
  readonly second = this.time.seconds$;

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
    const h = this.cycleHour();
    const m = this.minute();
    const s = this.second();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  });

  readonly dayName = computed(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[new Date().getDay()];
  });

  readonly monthName = computed(() => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[new Date().getMonth()];
  });

  readonly dayOfMonth = computed(() => new Date().getDate());
  readonly yearNum = computed(() => new Date().getFullYear());

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

  /* ─── SIGNAL PARTICLES ─── */
  readonly signalParticles: SignalParticle[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 20 + seededMod(i, 60, 3),
    y: 20 + seededMod(i, 60, 7),
    delay: seededMod(i, 8, 2),
    duration: 6 + (i % 4) * 2,
    size: 1 + (i % 3),
    opacity: 0.06 + (i % 5) * 0.04,
  }));

  /* ─── METHODS ─── */
  onSliderChange(h: number): void {
    this.time.setHora(h);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
