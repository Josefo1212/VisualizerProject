import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';

interface OrbitMark {
  index: number;
  angle: number;
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

@Component({
  selector: 'app-no-mans-sky-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './NoMansSkyDesign.html',
  styleUrl: './NoMansSkyDesign.css',
})
export class NoMansSkyDesignComponent {
  readonly time = inject(TimeEngineService);

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

  /* ─── ORBITAL HOUR RING (24 marks) ─── */
  readonly hourMarks: OrbitMark[] = Array.from({ length: 24 }, (_, i) => ({
    index: i,
    angle: (i / 24) * 360,
  }));

  /* ─── PULSE SECOND RING (60 dots) ─── */
  readonly pulseDots: PulseDot[] = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    angle: (i / 60) * 360,
  }));

  /* ─── STAR NODE POSITION ─── */
  readonly starAngle = computed(() => (this.cycleHour() / 24) * 360);

  /* ─── MINUTE ENERGY CHARGE ─── */
  readonly minuteAngle = computed(() => (this.minute() / 60) * 360);
  readonly minuteIntensity = computed(() => Math.max(0.2, this.minute() / 59));

  /* ─── MINUTE ARC PATH ─── */
  readonly minuteArcPath = computed(() => {
    const a = this.minuteAngle();
    const rad = (a * Math.PI) / 180;
    const endX = 300 + 120 * Math.sin(rad);
    const endY = 300 - 120 * Math.cos(rad);
    const large = a > 180 ? 1 : 0;
    return `M 300 180 A 120 120 0 ${large} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  });

  /* ─── SIGNAL PARTICLES (ambient) ─── */
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
