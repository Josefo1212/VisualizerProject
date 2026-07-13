import { Component, computed, inject } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';

interface ArcHour {
  index: number;
  angleDeg: number;
  x: number;
  y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  nx: number;
  ny: number;
  roman: string;
  isMajor: boolean;
}

interface AshParticle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  opacity: number;
}

interface EmberMark {
  index: number;
  angle: number;
}

const ROMAN: Record<number, string> = {
  0: 'XII', 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI',
};

function seededMod(i: number, base: number, offset: number): number {
  return ((i * offset * 1.7) % base + base) % base;
}

@Component({
  selector: 'app-dark-souls-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './DarkSoulsDesign.html',
  styleUrl: './DarkSoulsDesign.css',
})
export class DarkSoulsDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  constructor() {
    this.session.addLog('DARK SOULS WORLD INITIALIZED');
  }

  readonly sliderValue = computed(() => {
    const h = this.time.hours$();
    return Math.max(0, Math.min(240, h));
  });

  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);
  readonly minute = this.time.minutes$;
  readonly second = this.time.seconds$;

  readonly flameIntensity = computed(() => {
    const h = this.cycleHour();
    return Math.pow(Math.min(h, 24) / 24, 1.8);
  });

  readonly flameScale = computed(() => 0.35 + this.flameIntensity() * 0.55);

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

  readonly phaseIcon = computed(() => {
    const p = this.worldPhase();
    switch (p) {
      case 'dawn': return '🌅';
      case 'day': return '☀️';
      case 'dusk': return '🌆';
      case 'night': return '🌙';
    }
  });

  readonly dayProgress = computed(() => {
    const h = this.cycleHour();
    return ((h / 24) * 100).toFixed(2);
  });

  readonly hourDesc = computed(() => {
    const h = this.cycleHour();
    const p = this.worldPhase();
    if (p === 'dawn') return 'The First Flame Flickers';
    if (p === 'day') return 'Age of Fire';
    if (p === 'dusk') return 'The Fire Fades';
    return 'Age of Dark';
  });

  readonly minuteDesc = computed(() => {
    const m = this.minute();
    if (m < 20) return 'Dormant Flame';
    if (m < 40) return 'Kindling';
    if (m < 55) return 'Bonfire Lit';
    return 'Inferno';
  });

  readonly secondDesc = computed(() => {
    const s = this.second();
    if (s < 20) return 'Low Ember';
    if (s < 40) return 'Ember Glow';
    if (s < 55) return 'Ember Dance';
    return 'Ember Storm';
  });

  readonly timeDisplay = computed(() => {
    const h = this.cycleHour();
    const m = this.minute();
    const s = this.second();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    return `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
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

  /* ─── ARC HOURS (180° semi-circle at top) ─── */
  private readonly ARC_CX = 300;
  private readonly ARC_CY = 290;
  private readonly ARC_R = 230;

  readonly arcHours = computed<ArcHour[]>(() => {
    const { ARC_CX: cx, ARC_CY: cy, ARC_R: r } = this;
    return Array.from({ length: 24 }, (_, i) => {
      const angleDeg = -180 + i * 7.5;
      const rad = (angleDeg * Math.PI) / 180;
      const isMajor = i % 3 === 0;
      const innerR = isMajor ? r - 16 : r - 8;
      const outerR = isMajor ? r + 18 : r + 10;
      return {
        index: i,
        angleDeg,
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
        x1: cx + innerR * Math.cos(rad),
        y1: cy + innerR * Math.sin(rad),
        x2: cx + outerR * Math.cos(rad),
        y2: cy + outerR * Math.sin(rad),
        nx: cx + (r + 26) * Math.cos(rad),
        ny: cy + (r + 26) * Math.sin(rad),
        roman: ROMAN[i % 12],
        isMajor,
      };
    });
  });

  readonly solarAngle = computed(() => -180 + this.cycleHour() * 7.5);

  readonly solarPos = computed(() => {
    const rad = (this.solarAngle() * Math.PI) / 180;
    return {
      x: this.ARC_CX + this.ARC_R * Math.cos(rad),
      y: this.ARC_CY + this.ARC_R * Math.sin(rad),
    };
  });

  /* ─── EMBER RING (seconds) ─── */
  readonly emberMarks: EmberMark[] = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    angle: (i / 60) * 360,
  }));

  /* ─── ASH PARTICLES (ambient scene) ─── */
  readonly ashParticles: AshParticle[] = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: seededMod(i, 100, 3),
    top: 20 + seededMod(i, 60, 7),
    delay: seededMod(i, 15, 2),
    duration: 8 + (i % 6) * 2,
    size: 1.5 + (i % 3),
    drift: -30 + (i % 7) * 10,
    opacity: 0.08 + (i % 5) * 0.04,
  }));

  /* ─── SOLAR RAY ANGLES ─── */
  readonly rayAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  /* ─── METHODS ─── */
  onSliderChange(h: number): void {
    this.time.setHora(h);
    this.session.addLog(`TIME SET TO ${Math.round(h).toString().padStart(2, '0')}:00`);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
    this.session.addLog('TIME RESET TO REAL TIME');
  }
}
