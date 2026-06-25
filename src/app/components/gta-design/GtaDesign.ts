import { Component, inject, computed } from '@angular/core';
import { TimeManagerService } from '../../services/time-manager';

type Franja = 'madrugada' | 'mañana' | 'mediodia' | 'atardecer' | 'noche';

@Component({
  selector: 'app-gta-design',
  standalone: true,
  templateUrl: './GtaDesign.html',
  styleUrl: './GtaDesign.css',
})
export class GtaDesignComponent {
  private readonly time = inject(TimeManagerService);
  readonly horaActual = this.time.horaActual;

  readonly angulo = computed(() => {
    const h = this.horaActual();
    return ((h - 6) / 24) * 2 * Math.PI + Math.PI;
  });

  readonly solX = computed(() => 50 + 45 * Math.cos(this.angulo()));
  readonly solY = computed(() => 75 + 60 * Math.sin(this.angulo()));

  readonly lunaAngulo = computed(() => this.angulo() + Math.PI);
  readonly lunaX = computed(() => 50 + 45 * Math.cos(this.lunaAngulo()));
  readonly lunaY = computed(() => 75 + 60 * Math.sin(this.lunaAngulo()));

  readonly esDeDia = computed(() => {
    const h = this.horaActual();
    return h >= 6 && h < 18;
  });

  readonly esDeNoche = computed(() => !this.esDeDia());

  readonly franja = computed<Franja>(() => {
    const h = this.horaActual();
    if (h >= 6 && h < 8) return 'mañana';
    if (h >= 8 && h < 16) return 'mediodia';
    if (h >= 16 && h < 19) return 'atardecer';
    if (h >= 19 && h < 21) return 'noche';
    return 'madrugada';
  });

  readonly claseCielo = computed(() => {
    const f = this.franja();
    if (f === 'mañana') return 'sky-morning';
    if (f === 'mediodia') return 'sky-midday';
    if (f === 'atardecer') return 'sky-sunset';
    return 'sky-night';
  });

  readonly filtrosCiudad = computed(() => {
    const f = this.franja();
    switch (f) {
      case 'mañana':
        return 'brightness(0.9) sepia(0.25) saturate(1.15) contrast(1.05)';
      case 'mediodia':
        return 'brightness(1) sepia(0) saturate(1) contrast(1)';
      case 'atardecer':
        return 'brightness(1.05) sepia(0.65) saturate(1.9) contrast(1.15)';
      case 'noche':
        return 'brightness(0.35) sepia(0.05) saturate(0.25) contrast(1.4)';
      default:
        return 'brightness(0.25) sepia(0) saturate(0.15) contrast(1.3)';
    }
  });

  readonly horaDisplay = computed(() => {
    const h = Math.floor(this.horaActual());
    return h.toString().padStart(2, '0');
  });

  readonly solVisible = computed(() => {
    const y = this.solY();
    return y < 100;
  });

  readonly lunaVisible = computed(() => {
    const y = this.lunaY();
    return y < 100;
  });
}
