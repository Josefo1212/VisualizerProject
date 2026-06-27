import { Component, computed, signal } from '@angular/core';

interface Tarea {
  id: number;
  nombre: string;
  hora: string;
  completada: boolean;
}

@Component({
  selector: 'app-among-us-design',
  standalone: true,
  templateUrl: './AmongUsDesign.html',
  styleUrl: './AmongUsDesign.css',
})
export class AmongUsDesignComponent {
  readonly minutos = signal<number>(0);
  readonly sabotajeSegundos = signal<number>(60);

  readonly minutosPorcentaje = computed(() => (this.minutos() / 60) * 100);
  readonly sabotajePorcentaje = computed(() => (this.sabotajeSegundos() / 60) * 100);
  readonly sabotajeCritico = computed(() => this.sabotajeSegundos() <= 10);
  readonly vivos = signal<number>(10);

  readonly tareas: Tarea[] = [
    { id: 1, nombre: 'Swipe Card', hora: '07:00', completada: true },
    { id: 2, nombre: 'Calibrate Distributor', hora: '08:00', completada: true },
    { id: 3, nombre: 'Clean Vent', hora: '09:00', completada: true },
    { id: 4, nombre: 'Fix Wiring', hora: '10:00', completada: true },
    { id: 5, nombre: 'Upload Data', hora: '11:00', completada: true },
    { id: 6, nombre: 'Swipe Card', hora: '12:00', completada: true },
    { id: 7, nombre: 'Prime Shields', hora: '13:00', completada: true },
    { id: 8, nombre: 'Chart Course', hora: '14:00', completada: true },
    { id: 9, nombre: 'Stabilize Steering', hora: '15:00', completada: false },
    { id: 10, nombre: 'Clean Vent', hora: '16:00', completada: false },
    { id: 11, nombre: 'Calibrate Distributor', hora: '17:00', completada: false },
    { id: 12, nombre: 'Fix Wiring', hora: '18:00', completada: false },
    { id: 13, nombre: 'Swipe Card', hora: '19:00', completada: false },
    { id: 14, nombre: 'Upload Data', hora: '20:00', completada: false },
    { id: 15, nombre: 'Prime Shields', hora: '21:00', completada: false },
    { id: 16, nombre: 'Chart Course', hora: '22:00', completada: false },
    { id: 17, nombre: 'Stabilize Steering', hora: '23:00', completada: false },
    { id: 18, nombre: 'Clean Vent', hora: '00:00', completada: false },
    { id: 19, nombre: 'Fix Wiring', hora: '01:00', completada: false },
    { id: 20, nombre: 'Swipe Card', hora: '02:00', completada: false },
    { id: 21, nombre: 'Calibrate Distributor', hora: '03:00', completada: false },
    { id: 22, nombre: 'Upload Data', hora: '04:00', completada: false },
    { id: 23, nombre: 'Prime Shields', hora: '05:00', completada: false },
    { id: 24, nombre: 'Chart Course', hora: '06:00', completada: false },
  ];

  private sabotajeInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.iniciarSabotaje();
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

  onMinutosChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.minutos.set(Number(value));
  }
}
