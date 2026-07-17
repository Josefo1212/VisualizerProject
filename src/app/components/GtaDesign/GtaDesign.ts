import { Component, inject, computed, Signal } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SliderComponent } from '../Slider/Slider';
import { SessionService } from '../../services/session';
import { SkyPt, SKY_PTS } from '../../interfaces/gta';
import { lerp, lerpRgb, findSegment } from '../../helpers/math';
import { padTime, formatHourMin } from '../../helpers/format';

@Component({
  selector: 'app-gta-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './GtaDesign.html',
  styleUrl: './GtaDesign.css',
})
export class GtaDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  constructor() {
    this.session.addLog('GTA WORLD INITIALIZED', 'success');
  }

  readonly currentHour: Signal<number> = this.time.currentHour$;

  readonly cycleHour: Signal<number> = computed(() => ((this.currentHour() % 24) + 24) % 24);

  readonly angle: Signal<number> = computed((): number => {
    const h = this.cycleHour();
    return ((h - 6) / 24) * 2 * Math.PI + Math.PI;
  });

  readonly sunX: Signal<number> = computed((): number => 50 + 45 * Math.cos(this.angle()));
  readonly sunY: Signal<number> = computed((): number => 75 + 60 * Math.sin(this.angle()));

  readonly moonX: Signal<number> = computed((): number => 50 + 45 * Math.cos(this.angle() + Math.PI));
  readonly moonY: Signal<number> = computed((): number => 75 + 60 * Math.sin(this.angle() + Math.PI));

  readonly sunOpacity: Signal<number> = computed((): number => {
    const y = this.sunY();
    if (y < 70) return 1;
    if (y >= 100) return 0;
    return 1 - (y - 70) / 30;
  });

  readonly moonOpacity: Signal<number> = computed((): number => {
    const y = this.moonY();
    if (y < 70) return 1;
    if (y >= 100) return 0;
    return 1 - (y - 70) / 30;
  });

  readonly skyGradient: Signal<string> = computed((): string => {
    const h = this.cycleHour();
    const [a, b, t] = findSegment(SKY_PTS, h);
    const top = lerpRgb(a.top, b.top, t);
    const mid = lerpRgb(a.mid, b.mid, t);
    const bot = lerpRgb(a.bot, b.bot, t);
    return `linear-gradient(180deg, rgb(${top.r},${top.g},${top.b}) 0%, rgb(${mid.r},${mid.g},${mid.b}) 35%, rgb(${bot.r},${bot.g},${bot.b}) 100%)`;
  });

  readonly sunScale: Signal<number> = computed((): number => {
    const y = this.sunY();
    if (y < 50) return 1;
    if (y >= 90) return 1.5;
    return 1 + 0.5 * ((y - 50) / 40);
  });

  /* ── Crossfade opacities for day / sunset / night images ── */

  readonly img1Opacity: Signal<number> = computed((): number => {
    const h = this.cycleHour();
    if (h < 5) return 0;
    if (h < 6) return h - 5;
    if (h < 17) return 1;
    if (h < 18) return 18 - h;
    return 0;
  });

  readonly img2Opacity: Signal<number> = computed((): number => {
    const h = this.cycleHour();
    if (h < 17) return 0;
    if (h < 18) return h - 17;
    if (h < 19) return 19 - h;
    return 0;
  });

  readonly img3Opacity: Signal<number> = computed((): number => {
    const h = this.cycleHour();
    if (h < 5) return 1;
    if (h < 6) return 6 - h;
    if (h < 18) return 0;
    if (h < 19) return h - 18;
    return 1;
  });

  readonly isDaytime: Signal<boolean> = computed((): boolean => {
    const h = this.cycleHour();
    return h >= 6 && h < 18;
  });

  readonly hourDisplay: Signal<string> = computed((): string => {
    const total = this.currentHour();
    return `${padTime(Math.floor(total))}:${padTime(Math.floor((total - Math.floor(total)) * 60))}`;
  });

  readonly formatSliderHour = (v: number): string => formatHourMin(v);

  onSliderChange(h: number): void {
    this.time.setHora(h);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
