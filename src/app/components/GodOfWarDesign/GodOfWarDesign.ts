import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';

interface ArcMark {
  index: number;
  angle: number;
  x: number;
  y: number;
  isMajor: boolean;
  itx: number;
  ity: number;
  otx: number;
  oty: number;
  eox: number;
  eoy: number;
}

interface RuneMark {
  index: number;
  angle: number;
}

interface Particle {
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

/* ─── Arc geometry ─── */
const ARC_CX = 600;
const ARC_CY = 360;
const ARC_R = 280;
const ARC_R_INNER = 272;
const ARC_R_OUTER = 288;

/* ─── Altar geometry ─── */
const ALTAR_CX = 600;
const ALTAR_CY = 490;
const ALTAR_R_SEC = 72;
const ALTAR_R_STARS = 58;

@Component({
  selector: 'app-god-of-war-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './GodOfWarDesign.html',
  styleUrl: './GodOfWarDesign.css',
})
export class GodOfWarDesignComponent {
  readonly time = inject(TimeEngineService);

  readonly ARC_CX = ARC_CX;
  readonly ARC_CY = ARC_CY;
  readonly ARC_R = ARC_R;
  readonly ARC_R_INNER = ARC_R_INNER;
  readonly ARC_R_OUTER = ARC_R_OUTER;
  readonly ALTAR_R_SEC = ALTAR_R_SEC;
  readonly ALTAR_R_STARS = ALTAR_R_STARS;

  /* ─── Time ─── */
  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);
  readonly minute = this.time.minutes$;
  readonly second = this.time.seconds$;

  readonly fractionalHour = computed(() =>
    this.cycleHour() + this.minute() / 60 + this.second() / 3600
  );

  readonly timeDisplay = computed(() => {
    const h = this.cycleHour();
    const m = this.minute();
    const s = this.second();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  });

  readonly dayProgress = computed(() => ((this.cycleHour() / 24) * 100).toFixed(2));

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
      case 'dusk': return 'Dusk';
      case 'night': return 'Night';
    }
  });

  readonly celestialHuntState = computed(() => {
    const p = this.worldPhase();
    if (p === 'dawn' || p === 'dusk') return 'TRANSITION';
    if (p === 'day') return 'ACTIVE';
    return 'DORMANT';
  });

  readonly activeHunter = computed(() => {
    const p = this.worldPhase();
    return p === 'day' || p === 'dawn' ? 'Sköll' : 'Hati';
  });

  readonly activeAstro = computed(() => {
    const p = this.worldPhase();
    return p === 'day' || p === 'dawn' ? 'Sun' : 'Moon';
  });

  readonly loreText = computed(() => {
    const p = this.worldPhase();
    switch (p) {
      case 'dawn': return 'Sköll stirs as dawn breaks over Midgard…';
      case 'day': return 'Sköll hunts the sun across the frozen heavens.';
      case 'dusk': return 'Hati emerges as the light fades beyond the peaks.';
      case 'night': return 'Hati shadows the moon through the endless dark.';
    }
  });

  /* ─── Celestial arc (24 marks) ─── */
  readonly arcMarks: ArcMark[] = Array.from({ length: 24 }, (_, i) => {
    const a = -180 + (i / 24) * 180;
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const isMajor = i % 3 === 0;
    const tickIn = 6;
    const tickOut = isMajor ? 14 : 8;
    return {
      index: i,
      angle: a,
      x: ARC_CX + ARC_R * c,
      y: ARC_CY + ARC_R * s,
      isMajor,
      itx: ARC_CX + (ARC_R - tickIn) * c,
      ity: ARC_CY + (ARC_R - tickIn) * s,
      otx: ARC_CX + (ARC_R + tickOut) * c,
      oty: ARC_CY + (ARC_R + tickOut) * s,
      eox: ARC_CX + (ARC_R + tickOut + 5) * c,
      eoy: ARC_CY + (ARC_R + tickOut + 5) * s,
    };
  });

  /* ─── Sun (day) ─── */
  readonly sunAngle = computed(() => -180 + (((this.fractionalHour() - 6 + 24) % 24) / 12) * 180);
  readonly sunRad = computed(() => (this.sunAngle() * Math.PI) / 180);
  readonly sunPos = computed(() => ({
    x: ARC_CX + ARC_R * Math.cos(this.sunRad()),
    y: ARC_CY + ARC_R * Math.sin(this.sunRad()),
  }));
  readonly sunOpacity = computed(() => {
    const h = this.cycleHour();
    if (h >= 6 && h < 18) return 1;
    if (h >= 5 && h < 6) return (h - 5) * 1.6;
    if (h >= 18 && h < 19) return 1 - (h - 18) * 1.6;
    return 0.04;
  });

  /* ─── Moon (night) ─── */
  readonly moonAngle = computed(() => -180 + (((this.fractionalHour() - 18 + 24) % 24) / 12) * 180);
  readonly moonRad = computed(() => (this.moonAngle() * Math.PI) / 180);
  readonly moonPos = computed(() => ({
    x: ARC_CX + ARC_R * Math.cos(this.moonRad()),
    y: ARC_CY + ARC_R * Math.sin(this.moonRad()),
  }));
  readonly moonOpacity = computed(() => {
    const h = this.cycleHour();
    if (h >= 18 || h < 6) return 1;
    if (h >= 17 && h < 18) return (h - 17) * 1.6;
    if (h >= 6 && h < 7) return 1 - (h - 6) * 1.6;
    return 0.04;
  });

  /* ─── Wolves (trail astro by minute distance) ─── */
  readonly wolfTrailDeg = computed(() => 26 * (1 - this.minute() / 59));

  readonly skollAngle = computed(() => this.sunAngle() + this.wolfTrailDeg());
  readonly skollRad = computed(() => (this.skollAngle() * Math.PI) / 180);
  readonly skollPos = computed(() => ({
    x: ARC_CX + ARC_R * Math.cos(this.skollRad()),
    y: ARC_CY + ARC_R * Math.sin(this.skollRad()),
  }));
  readonly skollOpacity = computed(() => Math.max(this.sunOpacity() * 0.85, 0.06));

  readonly hatiAngle = computed(() => this.moonAngle() + this.wolfTrailDeg());
  readonly hatiRad = computed(() => (this.hatiAngle() * Math.PI) / 180);
  readonly hatiPos = computed(() => ({
    x: ARC_CX + ARC_R * Math.cos(this.hatiRad()),
    y: ARC_CY + ARC_R * Math.sin(this.hatiRad()),
  }));
  readonly hatiOpacity = computed(() => Math.max(this.moonOpacity() * 0.85, 0.06));

  /* ─── Sprite frame cycling ─── */
  readonly skollFrame = signal(0);
  readonly hatiFrame = signal(0);

  readonly destroyRef = inject(DestroyRef);

  constructor() {
    const id = setInterval(() => {
      this.skollFrame.update(f => (f + 1) % 16);
      this.hatiFrame.update(f => (f + 1) % 16);
    }, 80);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  /* ─── Wolf tangent rotation ─── */
  readonly skollRotation = computed(() => this.skollAngle() + 90);
  readonly hatiRotation = computed(() => this.hatiAngle() + 90);

  /* ─── Wolf sprite positioning (percentage of scene) ─── */
  readonly skollSpriteStyle = computed(() => ({
    left: `${(this.skollPos().x / 1200) * 100}%`,
    top: `${(this.skollPos().y / 600) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${this.skollRotation()}deg)`,
    opacity: this.skollOpacity(),
  }));

  readonly hatiSpriteStyle = computed(() => ({
    left: `${(this.hatiPos().x / 1200) * 100}%`,
    top: `${(this.hatiPos().y / 600) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${this.hatiRotation()}deg)`,
    opacity: this.hatiOpacity(),
  }));

  /* ─── Day progress arc path (sunrise → current pos) ─── */
  readonly dayArcPath = computed(() => {
    const h = this.cycleHour();
    if (h < 6 || h > 18) return '';
    const p = this.sunPos();
    return `M ${ARC_CX - ARC_R} ${ARC_CY} A ${ARC_R} ${ARC_R} 0 0 0 ${p.x} ${p.y}`;
  });
  readonly dayArcColor = computed(() => {
    const p = this.worldPhase();
    if (p === 'dawn') return 'rgba(220,180,120,0.12)';
    if (p === 'dusk') return 'rgba(200,140,80,0.10)';
    return 'rgba(200,180,140,0.08)';
  });

  readonly nightArcPath = computed(() => {
    const h = this.cycleHour();
    if (h >= 18 || h < 6) {
      const p = this.moonPos();
      return `M ${ARC_CX - ARC_R} ${ARC_CY} A ${ARC_R} ${ARC_R} 0 0 0 ${p.x} ${p.y}`;
    }
    return '';
  });
  readonly nightArcColor = 'rgba(160,180,220,0.06)';

  /* ─── Altar second marks (60) ─── */
  readonly secondMarks: RuneMark[] = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    angle: (i / 60) * 360,
  }));

  readonly sweepPos = computed(() => {
    const sweepAng = (this.second() / 60) * 360 - 90;
    const sweepRad = (sweepAng * Math.PI) / 180;
    return { x: 100 + 60 * Math.cos(sweepRad), y: 100 + 60 * Math.sin(sweepRad) };
  });

  /* ─── Ambient particles ─── */
  readonly particles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 5 + seededMod(i, 90, 3),
    y: 5 + seededMod(i, 90, 7),
    delay: seededMod(i, 10, 2),
    duration: 12 + (i % 6) * 3,
    size: 1 + (i % 3),
    opacity: 0.02 + (i % 5) * 0.015,
  }));

  /* ─── Slider ─── */
  readonly sliderValue = computed(() => this.cycleHour() * 60 + this.minute());

  onSliderChange(m: number): void {
    this.time.setHora(m / 60);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
