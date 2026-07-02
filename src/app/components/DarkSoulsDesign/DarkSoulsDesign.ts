import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeEngineService } from '../../services/timeEngine';

interface RingMark {
  index: number;
  angle: number;
}

@Component({
  selector: 'app-dark-souls-design',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './DarkSoulsDesign.html',
  styleUrl: './DarkSoulsDesign.css',
})
export class DarkSoulsDesignComponent {
  readonly time = inject(TimeEngineService);

  readonly sliderValue = computed(() => {
    const h = this.time.hours$();
    return Math.max(0, Math.min(240, h));
  });

  readonly cycleHour = computed(() => ((this.time.hours$() % 24) + 24) % 24);
  readonly minute = this.time.minutes$;
  readonly second = this.time.seconds$;

  readonly hourMarks: RingMark[] = Array.from({ length: 24 }, (_, i) => ({
    index: i,
    angle: (i / 24) * 360,
  }));

  readonly emberMarks: RingMark[] = Array.from({ length: 60 }, (_, i) => ({
    index: i,
    angle: (i / 60) * 360,
  }));

  readonly flameIntensity = computed(() => {
    const m = this.minute();
    return Math.max(0.2, m / 59);
  });

  readonly flameScale = computed(() => 0.6 + this.flameIntensity() * 0.8);

  readonly worldPhase = computed(() => {
    const h = this.cycleHour();
    if (h >= 5 && h < 7) return 'dawn';
    if (h >= 7 && h < 18) return 'day';
    if (h >= 18 && h < 20) return 'dusk';
    return 'night';
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

  readonly statusText = computed(() => {
    const p = this.worldPhase();
    switch (p) {
      case 'dawn': return 'The First Flame Flickers';
      case 'day': return 'The Age of Fire';
      case 'dusk': return 'The Fire Fades';
      case 'night': return 'The Age of Dark';
    }
  });

  onSliderChange(h: number): void {
    this.time.setHora(h);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
