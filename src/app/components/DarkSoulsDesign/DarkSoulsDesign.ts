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

  readonly flameScale = computed(() => 0.8 + this.flameIntensity() * 1.2);

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

  onSliderChange(h: number): void {
    this.time.setHora(h);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
