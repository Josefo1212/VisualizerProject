import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';
import { seededMod, cycleHour, dayProgress } from '../../helpers/math';
import { formatTime } from '../../helpers/format';
import { worldPhase } from '../../helpers/world';

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
}

interface RuneMark {
  index: number;
  itx: number; ity: number;
  otx: number; oty: number;
  rtx: number; rty: number;
  rune: string;
  isMajor: boolean;
}

interface TrailParticle {
  angle: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
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

/* ─── Arc geometry ─── */
const ARC_CX = 600;
const ARC_CY = 340;
const ARC_R = 270;

/* ─── Clock geometry (same center as arc, drawn on top) ─── */
const CLOCK_CX = 600;
const CLOCK_CY = 440;
const CLOCK_R_HOURS = 220;
const CLOCK_R_MINS = 188;
const CLOCK_R_SECS = 162;

const RUNES_24 = [
  'ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ',
  'ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛋ',
  'ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛝ','ᛞ','ᛟ',
];

@Component({
  selector: 'app-god-of-war-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './GodOfWarDesign.html',
  styleUrl: './GodOfWarDesign.css',
})
export class GodOfWarDesignComponent {
  readonly time = inject(TimeEngineService);
  readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(SessionService);

  readonly CLOCK_CX = CLOCK_CX;
  readonly CLOCK_CY = CLOCK_CY;
  readonly CLOCK_R_HOURS = CLOCK_R_HOURS;
  readonly CLOCK_R_MINS = CLOCK_R_MINS;
  readonly CLOCK_R_SECS = CLOCK_R_SECS;

  /* ─── Time ─── */
  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);
  readonly minute = this.time.minutes$;
  readonly second = this.time.seconds$;

  readonly fractionalHour = computed(() =>
    this.cycleHour() + this.minute() / 60 + this.second() / 3600
  );

  readonly timeDisplay = computed(() => {
    return formatTime(this.cycleHour(), this.minute(), this.second());
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
    switch (this.worldPhase()) {
      case 'dawn': return 'Dawn';
      case 'day': return 'Day';
      case 'dusk': return 'Dusk';
      case 'night': return 'Night';
    }
  });

  readonly activeHunter = computed(() => {
    const p = this.worldPhase();
    return p === 'day' || p === 'dawn' ? 'Sköll' : 'Hati';
  });

  readonly activeAstro = computed(() => {
    const p = this.worldPhase();
    return p === 'day' || p === 'dawn' ? 'Sun' : 'Moon';
  });

  /* ─── Arc marks (24 positions on 180° semicircle) ─── */
  readonly arcMarks: ArcMark[] = Array.from({ length: 24 }, (_, i) => {
    const a = -180 + (i / 24) * 180;
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const isMajor = i % 3 === 0;
    return {
      index: i,
      angle: a,
      x: ARC_CX + ARC_R * c,
      y: ARC_CY + ARC_R * s,
      isMajor,
      itx: ARC_CX + (ARC_R - 6) * c,
      ity: ARC_CY + (ARC_R - 6) * s,
      otx: ARC_CX + (ARC_R + (isMajor ? 14 : 8)) * c,
      oty: ARC_CY + (ARC_R + (isMajor ? 14 : 8)) * s,
    };
  });

  /* ─── Clock hour marks (24 full circle) ─── */
  readonly clockMarks: RuneMark[] = Array.from({ length: 24 }, (_, i) => {
    const a = i * 15 - 90;
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    const isMajor = i % 3 === 0;
    return {
      index: i,
      itx: CLOCK_CX + (CLOCK_R_HOURS - 8) * c,
      ity: CLOCK_CY + (CLOCK_R_HOURS - 8) * s,
      otx: CLOCK_CX + (CLOCK_R_HOURS + 4) * c,
      oty: CLOCK_CY + (CLOCK_R_HOURS + 4) * s,
      rtx: CLOCK_CX + (CLOCK_R_HOURS + 16) * c,
      rty: CLOCK_CY + (CLOCK_R_HOURS + 16) * s,
      rune: RUNES_24[i],
      isMajor,
    };
  });

  /* ─── Minute marks (60) ─── */
  readonly minuteMarks: { index: number; itx: number; ity: number; otx: number; oty: number }[] =
    Array.from({ length: 60 }, (_, i) => {
      const a = i * 6 - 90;
      const r = (a * Math.PI) / 180;
      const c = Math.cos(r), s = Math.sin(r);
      return {
        index: i,
        itx: CLOCK_CX + (CLOCK_R_MINS - 4) * c,
        ity: CLOCK_CY + (CLOCK_R_MINS - 4) * s,
        otx: CLOCK_CX + (CLOCK_R_MINS + 3) * c,
        oty: CLOCK_CY + (CLOCK_R_MINS + 3) * s,
      };
    });

  /* ─── Second marks (60) ─── */
  readonly secondMarks: { index: number; itx: number; ity: number; otx: number; oty: number }[] =
    Array.from({ length: 60 }, (_, i) => {
      const a = i * 6 - 90;
      const r = (a * Math.PI) / 180;
      const c = Math.cos(r), s = Math.sin(r);
      return {
        index: i,
        itx: CLOCK_CX + (CLOCK_R_SECS - 3) * c,
        ity: CLOCK_CY + (CLOCK_R_SECS - 3) * s,
        otx: CLOCK_CX + (CLOCK_R_SECS + 2) * c,
        oty: CLOCK_CY + (CLOCK_R_SECS + 2) * s,
      };
    });

  /* ─── Hour hand ─── */
  readonly clockHourAngle = computed(() => this.cycleHour() * 15 + this.minute() * 0.25 - 90);
  readonly clockHourRad = computed(() => (this.clockHourAngle() * Math.PI) / 180);
  readonly clockHandX = computed(() => CLOCK_CX + (CLOCK_R_HOURS - 22) * Math.cos(this.clockHourRad()));
  readonly clockHandY = computed(() => CLOCK_CY + (CLOCK_R_HOURS - 22) * Math.sin(this.clockHourRad()));

  /* ─── Sun ─── */
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

  /* ─── Moon ─── */
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

  /* ─── Wolves (behind astro — subtract trail for left-to-right arc) ─── */
  readonly wolfTrailDeg = computed(() => 10 + 16 * (1 - this.minute() / 59));

  readonly skollAngle = computed(() => this.sunAngle() - this.wolfTrailDeg());
  readonly skollRad = computed(() => (this.skollAngle() * Math.PI) / 180);
  readonly skollPos = computed(() => ({
    x: ARC_CX + ARC_R * Math.cos(this.skollRad()),
    y: ARC_CY + ARC_R * Math.sin(this.skollRad()),
  }));
  readonly skollOpacity = computed(() => Math.max(this.sunOpacity() * 0.85, 0.06));

  readonly hatiAngle = computed(() => this.moonAngle() - this.wolfTrailDeg());
  readonly hatiRad = computed(() => (this.hatiAngle() * Math.PI) / 180);
  readonly hatiPos = computed(() => ({
    x: ARC_CX + ARC_R * Math.cos(this.hatiRad()),
    y: ARC_CY + ARC_R * Math.sin(this.hatiRad()),
  }));
  readonly hatiOpacity = computed(() => Math.max(this.moonOpacity() * 0.85, 0.06));

  /* ─── Wolf trail particles ─── */
  readonly skollTrail = computed(() => {
    const trail: TrailParticle[] = [];
    const base = this.skollAngle();
    for (let i = 0; i < 6; i++) {
      const a = base - (i + 1) * 4;
      const r = (a * Math.PI) / 180;
      trail.push({
        angle: a,
        x: ARC_CX + ARC_R * Math.cos(r),
        y: ARC_CY + ARC_R * Math.sin(r),
        size: 2.5 + (5 - i) * 0.8,
        opacity: 0.07 - i * 0.01,
      });
    }
    return trail;
  });

  readonly hatiTrail = computed(() => {
    const trail: TrailParticle[] = [];
    const base = this.hatiAngle();
    for (let i = 0; i < 6; i++) {
      const a = base - (i + 1) * 4;
      const r = (a * Math.PI) / 180;
      trail.push({
        angle: a,
        x: ARC_CX + ARC_R * Math.cos(r),
        y: ARC_CY + ARC_R * Math.sin(r),
        size: 1.8 + (5 - i) * 0.6,
        opacity: 0.05 - i * 0.007,
      });
    }
    return trail;
  });

  /* ─── Sprite frame cycling ─── */
  readonly skollFrame = signal(0);
  readonly hatiFrame = signal(0);

  /* ─── Lore system ─── */
  readonly allLore = [
    'Sköll never stops his hunt.',
    'Hati waits beyond the horizon.',
    'The fate of the sun cannot be escaped.',
    'Every cycle brings Ragnarök closer.',
    'The wolves chase the eternal light.',
    'When Sköll catches the sun, the world ends.',
    'Hati shall devour the moon when Ragnarök comes.',
    'The children of Fenrir shape the day and night.',
    'Midgard rests between light and shadow.',
    'The All-Father set the wolves upon their path.',
    'Time flows like the rivers of Niflheim.',
    'The runes remember all that has passed.',
    'The Norns weave the threads of fate.',
    'Yggdrasil watches over every cycle.',
    'A new dawn breaks over the frozen peaks.',
    'The giants stir beneath the mountains.',
  ];

  readonly currentLoreIndex = signal(0);
  readonly currentLore = computed(() => this.allLore[this.currentLoreIndex()]);

  constructor() {
    this.session.addLog('GOD OF WAR WORLD INITIALIZED', 'success');
    const frameId = setInterval(() => {
      this.skollFrame.update(f => (f + 1) % 16);
      this.hatiFrame.update(f => (f + 1) % 16);
    }, 80);
    this.destroyRef.onDestroy(() => clearInterval(frameId));

    const loreId = setInterval(() => {
      this.currentLoreIndex.update(i => (i + 1) % this.allLore.length);
    }, 8000);
    this.destroyRef.onDestroy(() => clearInterval(loreId));
  }

  /* ─── Wolf tangent rotation ─── */
  readonly skollRotation = computed(() => this.skollAngle() + 90);
  readonly hatiRotation = computed(() => this.hatiAngle() + 90);

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

  /* ─── Trail particle style helpers ─── */
  trailStyle(t: TrailParticle, cx: number, cy: number): Record<string, string> {
    return {
      left: `${(t.x / 1200) * 100}%`,
      top: `${(t.y / 600) * 100}%`,
      width: `${t.size}px`,
      height: `${t.size}px`,
      opacity: String(t.opacity),
    };
  }

  /* ─── Day/night arc paths ─── */
  readonly dayArcPath = computed(() => {
    const h = this.cycleHour();
    if (h < 6 || h > 18) return '';
    const p = this.sunPos();
    return `M ${ARC_CX - ARC_R} ${ARC_CY} A ${ARC_R} ${ARC_R} 0 0 0 ${p.x} ${p.y}`;
  });

  readonly dayArcColor = computed(() => {
    switch (this.worldPhase()) {
      case 'dawn': return 'rgba(220,180,120,0.18)';
      case 'dusk': return 'rgba(200,140,80,0.14)';
      default: return 'rgba(200,180,140,0.10)';
    }
  });

  readonly nightArcPath = computed(() => {
    const h = this.cycleHour();
    if (h >= 18 || h < 6) {
      const p = this.moonPos();
      return `M ${ARC_CX - ARC_R} ${ARC_CY} A ${ARC_R} ${ARC_R} 0 0 0 ${p.x} ${p.y}`;
    }
    return '';
  });
  readonly nightArcColor = 'rgba(160,180,220,0.08)';

  /* ─── Clock dynamic glow ─── */
  readonly clockGlow = computed(() => {
    const h = this.cycleHour();
    const isDay = h >= 6 && h < 18;
    return {
      color: isDay ? 'rgba(255,200,120,0.05)' : 'rgba(140,180,240,0.05)',
      active: isDay ? 'rgba(255,200,120,0.08)' : 'rgba(140,180,240,0.08)',
    };
  });

  readonly clockRuneColor = computed(() => {
    const h = this.cycleHour();
    if (h >= 6 && h < 18) return 'rgba(255,200,120,0.25)';
    return 'rgba(160,190,240,0.25)';
  });

  /* ─── Runic Time Analysis ─── */
  readonly hoursRemainingFormatted = computed(() => {
    const h = this.cycleHour();
    const target = h < 18 ? 18 : 30;
    const totalMin = (target - h) * 60 + (59 - this.minute());
    const rh = Math.floor(totalMin / 60);
    const rm = Math.round(totalMin % 60);
    return `${rh}h ${rm.toString().padStart(2, '0')}m`;
  });

  readonly sunPositionPercent = computed(() => {
    const h = this.cycleHour();
    if (h < 6) return 0;
    if (h > 18) return 100;
    return ((h - 6) / 12) * 100;
  });

  readonly wolfAngularSeparation = computed(() => this.wolfTrailDeg().toFixed(1));

  readonly nextTransition = computed(() => {
    const h = this.cycleHour();
    if (h >= 5 && h < 6) return { label: 'Sunrise', type: 'dawn' };
    if (h >= 6 && h < 7) return { label: 'Morning', type: 'day' };
    if (h >= 7 && h < 12) return { label: 'Noon', type: 'day' };
    if (h >= 12 && h < 17) return { label: 'Afternoon', type: 'day' };
    if (h >= 17 && h < 18) return { label: 'Golden Hour', type: 'dusk' };
    if (h >= 18 && h < 19) return { label: 'Sunset', type: 'dusk' };
    if (h >= 19 && h < 20) return { label: 'Twilight', type: 'night' };
    if (h >= 20 && h < 22) return { label: 'Nightfall', type: 'night' };
    return { label: 'Dawn', type: 'dawn' };
  });

  readonly realmTimeFlow = computed(() => {
    const m = this.minute();
    if (m >= 55 || m < 5) return 'Accelerating';
    if (m >= 45) return 'Flowing';
    if (m >= 30) return 'Steady';
    return 'Stable';
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
  readonly sliderValue = computed(() => this.cycleHour() + this.minute() / 60);

  onSliderChange(h: number): void {
    this.time.setHora(h);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
