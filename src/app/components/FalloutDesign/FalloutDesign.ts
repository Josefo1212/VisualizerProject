import { Component, computed, inject } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { SliderComponent } from '../Slider/Slider';

const CYCLE = (n: number) => ((n % 24) + 24) % 24;

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
  imports: [SliderComponent],
  templateUrl: './FalloutDesign.html',
  styleUrls: ['./FalloutDesign.css']
})
export class FalloutDesignComponent {
  readonly time = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  constructor() {
    this.session.addLog('FALLOUT WORLD INITIALIZED', 'success');
  }

  readonly clockDisplay = computed(() => {
    const h = CYCLE(this.time.hours$()).toString().padStart(2, '0');
    const m = this.time.minutes$().toString().padStart(2, '0');
    const s = this.time.seconds$().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  readonly timeLapsed = computed(() => {
    const totalMin = Math.abs(this.time.hours$() * 60 + this.time.minutes$());
    const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const m = (totalMin % 60).toString().padStart(2, '0');
    const s = this.time.seconds$().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  readonly powerPercent = computed(() => {
    const drain = Math.floor(Math.abs(this.time.hours$()) * 0.15);
    return Math.max(10, 100 - drain);
  });

  readonly hpPercent = computed(() => {
    const damage = Math.floor(Math.abs(this.time.hours$()) * 0.8 + this.time.minutes$() * 0.05);
    return Math.max(0, 100 - damage);
  });

  readonly rawRad = computed(() => Math.abs(this.time.minutes$() + this.time.hours$() * 2));

  readonly radPercent = computed(() => Math.min(100, this.rawRad()));

  readonly radCount = computed(() => Math.round(this.rawRad() / 16.67).toString().padStart(3, '0'));

  readonly currentLocation = computed(() => {
    const ch = CYCLE(this.time.hours$());
    const idx = (ch + Math.floor(this.time.minutes$() / 30)) % LOCATIONS.length;
    return LOCATIONS[idx];
  });

  readonly coreTemp = computed(() => {
    const ch = CYCLE(this.time.hours$());
    const base = 22.0 + (ch % 8) * 0.6;
    return base.toFixed(1);
  });

  readonly satLink = computed(() => {
    const ch = CYCLE(this.time.hours$());
    return ch >= 6 && ch < 22 ? 'CONECTADO' : 'SIN SEÑAL';
  });

  readonly systemStatus = computed(() => {
    if (this.hpPercent() <= 0) return '☠ FALLECIDO — SIGUE ADELANTE, VALIENTE';
    if (this.hpPercent() < 30) return '⚠ INTEGRIDAD CRÍTICA';
    if (this.time.minutes$() > 50) return '⚠ ADVERTENCIA: RADIACIÓN ELEVADA';
    return 'NOMINAL';
  });

  readonly activeQuest = computed(() => {
    const idx = Math.abs(this.time.hours$()) % QUESTS.length;
    return QUESTS[idx];
  });

  readonly totalMinutes = computed(() => this.time.hours$() * 60 + this.time.minutes$());

  readonly apDisplay = computed(() => {
    const totalH = Math.abs(this.time.hours$());
    return `${Math.floor(totalH)}h`;  });

  readonly hpDisplay = computed(() => `${this.hpPercent()}/100`);

  readonly isCritical = computed(() => this.hpPercent() < 30 || this.radPercent() > 120);

  readonly isRadCritical = computed(() => this.rawRad() > 120);

  onApChange(value: number): void {
    this.time.setHora(value);
  }

  onResetTime(): void {
    this.time.resetToRealTime();
  }
}
