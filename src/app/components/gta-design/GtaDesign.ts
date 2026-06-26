import { Component, inject, computed, Signal } from '@angular/core';
import { TimeManagerService } from '../../services/time-manager';
import { SliderComponent } from '../slider/Slider';

interface Rgb { r: number; g: number; b: number; }
interface SkyPt { h: number; top: Rgb; mid: Rgb; bot: Rgb; }
interface FilterPt { h: number; bright: number; sepia: number; sat: number; cont: number; }

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpRgb = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: lerp(a.r, b.r, t),
  g: lerp(a.g, b.g, t),
  b: lerp(a.b, b.b, t),
});

const findSegment = <T extends { h: number }>(pts: T[], h: number): [T, T, number] => {
  if (h <= pts[0].h) return [pts[0], pts[1], 0];
  if (h >= pts[pts.length - 1].h) return [pts[pts.length - 2], pts[pts.length - 1], 1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (h >= pts[i].h && h < pts[i + 1].h) {
      const t = (h - pts[i].h) / (pts[i + 1].h - pts[i].h);
      return [pts[i], pts[i + 1], t];
    }
  }
  return [pts[0], pts[1], 0];
};

const SKY_PTS: SkyPt[] = [
  { h: 0,  top: { r: 7, g: 7, b: 20 },   mid: { r: 13, g: 13, b: 43 },  bot: { r: 10, g: 10, b: 26 } },
  { h: 5,  top: { r: 15, g: 10, b: 35 },  mid: { r: 35, g: 20, b: 70 },  bot: { r: 22, g: 15, b: 52 } },
  { h: 6,  top: { r: 255, g: 154, b: 158 }, mid: { r: 250, g: 208, b: 196 }, bot: { r: 161, g: 196, b: 253 } },
  { h: 7,  top: { r: 200, g: 170, b: 220 }, mid: { r: 180, g: 200, b: 240 }, bot: { r: 100, g: 180, b: 240 } },
  { h: 9,  top: { r: 100, g: 180, b: 255 }, mid: { r: 79, g: 172, b: 254 },  bot: { r: 0, g: 242, b: 254 } },
  { h: 12, top: { r: 30, g: 144, b: 255 }, mid: { r: 79, g: 172, b: 254 },  bot: { r: 0, g: 242, b: 254 } },
  { h: 15, top: { r: 79, g: 172, b: 254 }, mid: { r: 135, g: 206, b: 235 }, bot: { r: 200, g: 180, b: 100 } },
  { h: 17, top: { r: 255, g: 144, b: 104 }, mid: { r: 240, g: 152, b: 25 },  bot: { r: 255, g: 211, b: 165 } },
  { h: 18, top: { r: 255, g: 75, b: 31 },  mid: { r: 255, g: 100, b: 60 },   bot: { r: 199, g: 125, b: 94 } },
  { h: 19, top: { r: 140, g: 50, b: 40 },  mid: { r: 74, g: 14, b: 78 },    bot: { r: 26, g: 26, b: 62 } },
  { h: 20, top: { r: 7, g: 7, b: 20 },    mid: { r: 13, g: 13, b: 43 },    bot: { r: 10, g: 10, b: 26 } },
];

const FILTER_PTS: FilterPt[] = [
  { h: 0,  bright: 0.25, sepia: 0,    sat: 0.15, cont: 1.3 },
  { h: 5,  bright: 0.5,  sepia: 0.1,  sat: 0.6,  cont: 1.2 },
  { h: 6,  bright: 0.85, sepia: 0.25, sat: 1.1,  cont: 1.05 },
  { h: 8,  bright: 0.95, sepia: 0.1,  sat: 1.05, cont: 1 },
  { h: 12, bright: 1,    sepia: 0,    sat: 1,    cont: 1 },
  { h: 16, bright: 1,    sepia: 0.2,  sat: 1.2,  cont: 1.05 },
  { h: 17, bright: 1.05, sepia: 0.5,  sat: 1.6,  cont: 1.15 },
  { h: 18, bright: 0.9,  sepia: 0.6,  sat: 1.8,  cont: 1.2 },
  { h: 19, bright: 0.5,  sepia: 0.15, sat: 0.5,  cont: 1.35 },
  { h: 20, bright: 0.25, sepia: 0,    sat: 0.15, cont: 1.3 },
];

@Component({
  selector: 'app-gta-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './GtaDesign.html',
  styleUrl: './GtaDesign.css',
})
export class GtaDesignComponent {
  readonly time = inject(TimeManagerService);

  readonly horaActual: Signal<number> = this.time.horaActual;

  readonly angulo: Signal<number> = computed((): number => {
    const h = this.horaActual();
    return ((h - 6) / 24) * 2 * Math.PI + Math.PI;
  });

  readonly solX: Signal<number> = computed((): number => 50 + 45 * Math.cos(this.angulo()));
  readonly solY: Signal<number> = computed((): number => 75 + 60 * Math.sin(this.angulo()));

  readonly lunaX: Signal<number> = computed((): number => 50 + 45 * Math.cos(this.angulo() + Math.PI));
  readonly lunaY: Signal<number> = computed((): number => 75 + 60 * Math.sin(this.angulo() + Math.PI));

  readonly solOpacity: Signal<number> = computed((): number => {
    const y = this.solY();
    if (y < 70) return 1;
    if (y >= 100) return 0;
    return 1 - (y - 70) / 30;
  });

  readonly lunaOpacity: Signal<number> = computed((): number => {
    const y = this.lunaY();
    if (y < 70) return 1;
    if (y >= 100) return 0;
    return 1 - (y - 70) / 30;
  });

  readonly skyGradient: Signal<string> = computed((): string => {
    const h = this.horaActual();
    const [a, b, t] = findSegment(SKY_PTS, h);
    const top = lerpRgb(a.top, b.top, t);
    const mid = lerpRgb(a.mid, b.mid, t);
    const bot = lerpRgb(a.bot, b.bot, t);
    return `linear-gradient(180deg, rgb(${top.r},${top.g},${top.b}) 0%, rgb(${mid.r},${mid.g},${mid.b}) 35%, rgb(${bot.r},${bot.g},${bot.b}) 100%)`;
  });

  readonly skyFilter: Signal<string> = computed((): string => {
    const h = this.horaActual();
    const [a, b, t] = findSegment(FILTER_PTS, h);
    const bright = lerp(a.bright, b.bright, t);
    const sepia = lerp(a.sepia, b.sepia, t);
    const sat = lerp(a.sat, b.sat, t);
    const cont = lerp(a.cont, b.cont, t);
    return `brightness(${bright}) sepia(${sepia}) saturate(${sat}) contrast(${cont})`;
  });

  readonly solScale: Signal<number> = computed((): number => {
    const y = this.solY();
    if (y < 50) return 1;
    if (y >= 90) return 1.5;
    return 1 + 0.5 * ((y - 50) / 40);
  });

  readonly luzOpacity: Signal<number> = computed((): number => {
    const h = this.horaActual();
    if (h < 17) return 0;
    if (h < 18) return (h - 17) * 0.4;
    if (h < 20) return 0.4 + (h - 18) * 0.225;
    return 0.85;
  });

  readonly esDeDia: Signal<boolean> = computed((): boolean => {
    const h = this.horaActual();
    return h >= 6 && h < 18;
  });

  readonly horaDisplay: Signal<string> = computed((): string => {
    const total = this.horaActual();
    const h = Math.floor(total);
    const m = Math.floor((total - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  readonly formatSliderHour = (v: number): string => {
    const h = Math.floor(v);
    const m = Math.floor((v - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  onSliderChange(h: number): void {
    this.time.setHora(h);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
