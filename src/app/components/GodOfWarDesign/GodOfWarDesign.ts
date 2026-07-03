import { Component, computed, inject } from '@angular/core';
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
}

interface MinuteMark {
  index: number;
  angle: number;
}

/* ─── Celestial arc geometry ─── */
const ARC_CX = 600;
const ARC_CY = 360;
const ARC_R = 280;

/* ─── Altar ring geometry ─── */
const ALTAR_CX = 600;
const ALTAR_CY = 490;
const ALTAR_R = 72;
const ALTAR_R2 = 58;

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
  readonly ALTAR_CX = ALTAR_CX;
  readonly ALTAR_CY = ALTAR_CY;
  readonly ALTAR_R = ALTAR_R;
  readonly ALTAR_R2 = ALTAR_R2;

  /* ─── Time derivates ─── */
  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);
  readonly minute = this.time.minutes$;
  readonly second = this.time.seconds$;

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

  readonly loreText = computed(() => {
    const p = this.worldPhase();
    switch (p) {
      case 'dawn': return 'The wolves stir as the sky awakens…';
      case 'day': return 'Sköll hunts the sun across the heavens.';
      case 'dusk': return 'Hati emerges as the light fades…';
      case 'night': return 'The wolves chase through the frozen dark.';
    }
  });

  /* ─── Celestial arc ─── */
  readonly arcMarks: ArcMark[] = Array.from({ length: 24 }, (_, i) => {
    const a = -180 + (i / 24) * 180;
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    return {
      index: i,
      angle: a,
      x: ARC_CX + ARC_R * c,
      y: ARC_CY + ARC_R * s,
      isMajor: i % 3 === 0,
      itx: ARC_CX + (ARC_R - 7) * c,
      ity: ARC_CY + (ARC_R - 7) * s,
      otx: ARC_CX + (ARC_R + 7) * c,
      oty: ARC_CY + (ARC_R + 7) * s,
    };
  });

  /* ─── Sun ─── */
  readonly sunAngle = computed(() => -180 + (((this.cycleHour() - 6 + 24) % 24) / 12) * 180);
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
  readonly moonAngle = computed(() => -180 + (((this.cycleHour() - 18 + 24) % 24) / 12) * 180);
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

  /* ─── Sköll (chases the sun) ─── */
  readonly skollPos = computed(() => {
    const a = this.sunAngle() + 18;
    const r = (a * Math.PI) / 180;
    return { x: ARC_CX + ARC_R * Math.cos(r), y: ARC_CY + ARC_R * Math.sin(r) };
  });
  readonly skollOpacity = computed(() => Math.max(0.12, this.sunOpacity()));

  /* ─── Hati (chases the moon) ─── */
  readonly hatiPos = computed(() => {
    const a = this.moonAngle() + 18;
    const r = (a * Math.PI) / 180;
    return { x: ARC_CX + ARC_R * Math.cos(r), y: ARC_CY + ARC_R * Math.sin(r) };
  });
  readonly hatiOpacity = computed(() => Math.max(0.12, this.moonOpacity()));

  /* ─── Altar minute ring ─── */
  readonly minuteMarks: MinuteMark[] = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    angle: (i / 60) * 360,
  }));

  readonly minuteProgress = computed(() => this.minute() / 60);

  /* ─── Slider ─── */
  readonly sliderValue = computed(() => this.cycleHour() * 60 + this.minute());

  onSliderChange(m: number): void {
    this.time.setHora(m / 60);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
