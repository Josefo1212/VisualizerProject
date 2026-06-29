import { Component, computed, inject } from '@angular/core';
import { GtaTimeEngineService } from '../../services/gtaTimeEngine';

const DAYS_SPANISH = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const MONTHS_SPANISH = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

const BEACON_COLORS = [
  '#00f0ff',
  '#00ff88',
  '#f4ca16',
  '#ff6600',
  '#ff003c',
  '#aa44ff',
  '#ff88cc',
];

const TASKS = [
  'CALIBRAR ESCÁNER',
  'REVISAR CASCOS',
  'REPARAR TUBERÍAS',
  'CARGAR BATERÍAS',
  'ANALIZAR MUESTRAS',
  'ACTUALIZAR MAPAS',
  'MANTENER REACTOR',
];

@Component({
  selector: 'app-subnautica-design',
  standalone: true,
  templateUrl: './SubnauticaDesign.html',
  styleUrl: './SubnauticaDesign.css',
})
export class SubnauticaDesignComponent {
  readonly time = inject(GtaTimeEngineService);

  readonly barList = Array.from({ length: 60 }, (_, i) => i);

  readonly daysList = DAYS_SPANISH.map((name, i) => ({
    name,
    color: BEACON_COLORS[i],
  }));

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
  readonly depthDisplay = computed(() => {
    const mins = this.time.hours$() * 60 + this.time.minutes$();
    return Math.round((mins / 1439) * 1000);
  });

  readonly barLit = (idx: number): boolean => this.time.seconds$() <= 59 - idx;

  readonly conicGradient = computed(() => {
    const deg = (this.oxygenPercent() / 100) * 360;
    if (this.isCritical()) {
      return `conic-gradient(#ff003c ${deg}deg, rgba(255,0,60,0.1) ${deg}deg)`;
    }
    return `conic-gradient(#00f0ff ${deg}deg, rgba(0,240,255,0.1) ${deg}deg)`;
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
