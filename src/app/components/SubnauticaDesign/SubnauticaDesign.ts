import { Component, computed, inject } from '@angular/core';
import { GtaTimeEngineService } from '../../services/gtaTimeEngine'; // Ajusta la ruta si es necesario

const DAYS_SPANISH = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const MONTHS_SPANISH = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
const TASKS = ['Metal', 'Lithium', 'Titanium', 'Copper', 'Quartz', 'Gold'];

@Component({
  selector: 'app-subnautica-design',
  standalone: true,
  templateUrl: './SubnauticaDesign.html',
  styleUrls: ['./SubnauticaDesign.css']
})
export class SubnauticaDesignComponent {
  readonly time = inject(GtaTimeEngineService);

  readonly currentSecond = this.time.seconds$;

  readonly currentTaskName = computed(() => {
    const idx = this.time.hours$() % TASKS.length;
    return TASKS[idx];
  });

  readonly clockDisplay = computed(() => {
    const h = this.time.hours$().toString().padStart(2, '0');
    const m = this.time.minutes$().toString().padStart(2, '0');
    const s = this.time.seconds$().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    const dayName = DAYS_SPANISH[now.getDay()];
    const dayNum = now.getDate();
    const month = MONTHS_SPANISH[now.getMonth()];
    return `${dayName}, ${dayNum} ${month}`.toUpperCase();
  });

  readonly oxygenPercent = computed(() => Math.round((1 - this.time.minutes$() / 60) * 100));
  readonly isCritical = computed(() => this.time.minutes$() > 50);
  readonly isPressureCritical = computed(() => this.depthDisplay() > 600);

  readonly calculatedBar = computed(() => Math.round(this.depthDisplay() / 10) + 1);
  
  readonly depthDisplay = computed(() => {
    const mins = this.time.hours$() * 60 + this.time.minutes$();
    return Math.round((mins / 1439) * 1000); // 1000m max depth
  });

  readonly integrityPercent = computed(() => {
    const integrity = 100 - Math.round(this.depthDisplay() / 10);
    return Math.max(0, integrity);
  });

  readonly conicGradient = computed(() => {
    const deg = (this.oxygenPercent() / 100) * 360;
    const safe = Math.max(0, deg - 2);
    if (this.isCritical()) {
      return `conic-gradient(
        #ff003c ${safe}deg,
        #ff6070 ${deg}deg,
        rgba(255,0,60,0.05) ${deg}deg
      )`;
    }
    return `conic-gradient(
      rgba(0,240,255,0.02) 0deg,
      #00f0ff ${Math.max(0, deg * 0.3)}deg,
      #00c8d8 ${Math.max(0, deg * 0.65)}deg,
      #00f0ff ${safe}deg,
      rgba(0,240,255,0.05) ${deg}deg
    )`;
  });

  readonly totalMinutes = computed(() => this.time.hours$() * 60 + this.time.minutes$());
  readonly sliderPercent = computed(() => (this.totalMinutes() / 1439) * 100);

  onTimeChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.time.setHora(Number(value) / 60);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}