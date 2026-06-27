import { Component, computed, signal, OnInit, OnDestroy } from '@angular/core';

interface Tarea {
  id: number;
  nombre: string;
  hora: string;
  horaIndex: number;
  completada: boolean;
}

interface DiaSemana {
  nombre: string;
  estado: 'pasado' | 'hoy' | 'futuro';
}

@Component({
  selector: 'app-among-us-design',
  standalone: true,
  templateUrl: './AmongUsDesign.html',
  styleUrl: './AmongUsDesign.css',
})
export class AmongUsDesignComponent implements OnInit, OnDestroy {
  readonly tiempoTotal = signal<number>(540); // minutos desde 00:00 (540 = 09:00)
  readonly sabotajeSegundos = signal<number>(60);
  readonly vivos = signal<number>(10);

  readonly horaActual = computed(() => Math.floor(this.tiempoTotal() / 60));
  readonly minutoActual = computed(() => this.tiempoTotal() % 60);
  readonly minutoPorcentaje = computed(() => (this.minutoActual() / 60) * 100);
  readonly tiempoPorcentaje = computed(() => (this.tiempoTotal() / 1439) * 100);

  readonly sabotajePorcentaje = computed(() => (this.sabotajeSegundos() / 60) * 100);
  readonly sabotajeCritico = computed(() => this.sabotajeSegundos() <= 10);

  readonly tareas: Tarea[] = [
    { id: 1, nombre: 'Swipe Card', hora: '07:00', horaIndex: 7, completada: true },
    { id: 2, nombre: 'Calibrate Distributor', hora: '08:00', horaIndex: 8, completada: true },
    { id: 3, nombre: 'Clean Vent', hora: '09:00', horaIndex: 9, completada: true },
    { id: 4, nombre: 'Fix Wiring', hora: '10:00', horaIndex: 10, completada: true },
    { id: 5, nombre: 'Upload Data', hora: '11:00', horaIndex: 11, completada: true },
    { id: 6, nombre: 'Swipe Card', hora: '12:00', horaIndex: 12, completada: true },
    { id: 7, nombre: 'Prime Shields', hora: '13:00', horaIndex: 13, completada: true },
    { id: 8, nombre: 'Chart Course', hora: '14:00', horaIndex: 14, completada: true },
    { id: 9, nombre: 'Stabilize Steering', hora: '15:00', horaIndex: 15, completada: false },
    { id: 10, nombre: 'Clean Vent', hora: '16:00', horaIndex: 16, completada: false },
    { id: 11, nombre: 'Calibrate Distributor', hora: '17:00', horaIndex: 17, completada: false },
    { id: 12, nombre: 'Fix Wiring', hora: '18:00', horaIndex: 18, completada: false },
    { id: 13, nombre: 'Swipe Card', hora: '19:00', horaIndex: 19, completada: false },
    { id: 14, nombre: 'Upload Data', hora: '20:00', horaIndex: 20, completada: false },
    { id: 15, nombre: 'Prime Shields', hora: '21:00', horaIndex: 21, completada: false },
    { id: 16, nombre: 'Chart Course', hora: '22:00', horaIndex: 22, completada: false },
    { id: 17, nombre: 'Stabilize Steering', hora: '23:00', horaIndex: 23, completada: false },
    { id: 18, nombre: 'Clean Vent', hora: '00:00', horaIndex: 0, completada: false },
    { id: 19, nombre: 'Fix Wiring', hora: '01:00', horaIndex: 1, completada: false },
    { id: 20, nombre: 'Swipe Card', hora: '02:00', horaIndex: 2, completada: false },
    { id: 21, nombre: 'Calibrate Distributor', hora: '03:00', horaIndex: 3, completada: false },
    { id: 22, nombre: 'Upload Data', hora: '04:00', horaIndex: 4, completada: false },
    { id: 23, nombre: 'Prime Shields', hora: '05:00', horaIndex: 5, completada: false },
    { id: 24, nombre: 'Chart Course', hora: '06:00', horaIndex: 6, completada: false },
  ];

  readonly tareaActual = computed(() => {
    const h = this.horaActual();
    return this.tareas.find(t => t.horaIndex === h) ?? this.tareas[0];
  });

  readonly tareaAnterior = computed(() => {
    const idx = this.tareas.indexOf(this.tareaActual());
    if (idx <= 0) return this.tareas[this.tareas.length - 1];
    return this.tareas[idx - 1];
  });

  readonly tareaSiguiente = computed(() => {
    const idx = this.tareas.indexOf(this.tareaActual());
    if (idx >= this.tareas.length - 1) return this.tareas[0];
    return this.tareas[idx + 1];
  });

  readonly completadas = computed(() => {
    const h = this.horaActual();
    if (h === 0) return this.tareas.filter(t => t.horaIndex >= 7 || t.horaIndex < 0);
    return this.tareas.filter(t => t.horaIndex < h && t.horaIndex >= 7);
  });

  readonly completadasCount = computed(() => this.completadas().length);

  readonly tiempoDisplay = computed(() => {
    const h = this.horaActual().toString().padStart(2, '0');
    const m = this.minutoActual().toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  readonly diasSemana: DiaSemana[] = [
    { nombre: 'LUN', estado: 'pasado' },
    { nombre: 'MAR', estado: 'pasado' },
    { nombre: 'MIÉ', estado: 'pasado' },
    { nombre: 'JUE', estado: 'hoy' },
    { nombre: 'VIE', estado: 'futuro' },
    { nombre: 'SÁB', estado: 'futuro' },
    { nombre: 'DOM', estado: 'futuro' },
  ];

  readonly frameIndices = [0, 1, 2, 3, 4, 5, 6, 7];
frameIndices: any;
  readonly currentFrameIndex = signal(0);

  private sabotajeInterval?: ReturnType<typeof setInterval>;
  private frameInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.iniciarSabotaje();
  }

  ngOnInit(): void {
    this.frameInterval = setInterval(() => {
      this.currentFrameIndex.update(i => (i + 1) % 8);
    }, 80);
  }

  ngOnDestroy(): void {
    clearInterval(this.frameInterval);
    clearInterval(this.sabotajeInterval);
  }

  private iniciarSabotaje(): void {
    this.sabotajeInterval = setInterval(() => {
      this.sabotajeSegundos.update(s => {
        if (s <= 0) {
          this.vivos.update(v => Math.max(0, v - 1));
          return 60;
        }
        return s - 1;
      });
    }, 1000);
  }

  onTiempoChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.tiempoTotal.set(Number(value));
  }
}
