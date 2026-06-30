import { Component, computed, inject } from '@angular/core';
import { GtaTimeEngineService } from '../../services/gtaTimeEngine';

const LOCATIONS = [
  'CONCORD', 'DIAMOND CITY', 'GOODNEIGHBOR', 'SANCTUARY HILLS',
  'THE CASTLE', 'BUNKER HILL', 'MEGATON', 'RIVET CITY',
  'THE STRIP', 'FREESIDE'
];

const QUESTS = [
  {
    title: 'RECONCILIACIÓN DE DATOS EN EL YERMO',
    tasks: [
      { text: 'Obtener núcleos de fusión en la planta principal', done: true },
      { text: 'Regresar con el registrador de tiempo real al refugio', done: false },
    ]
  },
  {
    title: 'MANTENIMIENTO DEL REFUGIO',
    tasks: [
      { text: 'Revisar generador principal', done: true },
      { text: 'Calibrar sensores de radiación', done: true },
      { text: 'Reparar filtro de agua', done: false },
    ]
  },
  {
    title: 'SEÑALES DEL YERMO',
    tasks: [
      { text: 'Investigar torre de radio', done: false },
      { text: 'Establecer enlace con la Hermandad', done: false },
    ]
  },
  {
    title: 'EXPLORACIÓN DE SUPERFICIE',
    tasks: [
      { text: 'Mapear ruinas del centro', done: true },
      { text: 'Recuperar datos de satélite caído', done: false },
    ]
  },
];

@Component({
  selector: 'app-fallout-design',
  standalone: true,
  templateUrl: './FalloutDesign.html',
  styleUrls: ['./FalloutDesign.css']
})
export class FalloutDesignComponent {
  readonly time = inject(GtaTimeEngineService);

  readonly clockDisplay = computed(() => {
    const h = this.time.hours$().toString().padStart(2, '0');
    const m = this.time.minutes$().toString().padStart(2, '0');
    const s = this.time.seconds$().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  readonly timeLapsed = computed(() => {
    const totalMin = this.time.hours$() * 60 + this.time.minutes$();
    const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const m = (totalMin % 60).toString().padStart(2, '0');
    const s = this.time.seconds$().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  readonly powerPercent = computed(() => {
    const drain = Math.floor(this.time.hours$() * 0.15);
    return Math.max(50, 100 - drain);
  });

  readonly hpPercent = computed(() => {
    const base = 100;
    const damage = Math.floor((this.time.hours$() * 0.8 + this.time.minutes$() * 0.05) % 30);
    return base - damage;
  });

  readonly radPercent = computed(() => {
    const rads = (this.time.minutes$() + this.time.hours$() * 2) % 200;
    return Math.min(200, rads);
  });

  readonly radCount = computed(() => Math.round(this.radPercent() / 16.67).toString().padStart(3, '0'));

  readonly currentLocation = computed(() => {
    const idx = (this.time.hours$() + Math.floor(this.time.minutes$() / 30)) % LOCATIONS.length;
    return LOCATIONS[idx];
  });

  readonly coreTemp = computed(() => {
    const base = 22.0 + (this.time.hours$() % 8) * 0.6;
    return base.toFixed(1);
  });

  readonly satLink = computed(() => {
    return this.time.hours$() >= 6 && this.time.hours$() < 22 ? 'CONECTADO' : 'SIN SEÑAL';
  });

  readonly systemStatus = computed(() => {
    if (this.time.minutes$() > 50) return '⚠ ADVERTENCIA: RADIACIÓN ELEVADA';
    if (this.hpPercent() < 40) return '⚠ INTEGRIDAD CRÍTICA';
    return 'NOMINAL';
  });

  readonly activeQuest = computed(() => {
    const idx = this.time.hours$() % QUESTS.length;
    return QUESTS[idx];
  });

  readonly totalMinutes = computed(() => this.time.hours$() * 60 + this.time.minutes$());
  readonly sliderPercent = computed(() => (this.totalMinutes() / 1439) * 100);

  readonly apDisplay = computed(() => Math.round(100 - this.sliderPercent()));

  readonly isCritical = computed(() => this.hpPercent() < 30 || this.radPercent() > 120);

  onApChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.time.setHora(Number(value) / 60);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
