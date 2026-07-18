import { Component, computed, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';
import { SessionService } from '../../services/session';
import { Task, DayInfo, DAY_NAMES } from '../../interfaces/amongUs';
import { SliderComponent } from '../Slider/Slider';
import { cycleHour } from '../../helpers/math';
import { padTime, dayName, monthName, dayOfMonth } from '../../helpers/format';

@Component({
  selector: 'app-among-us-design',
  standalone: true,
  imports: [SliderComponent],
  templateUrl: './AmongUsDesign.html',
  styleUrl: './AmongUsDesign.css',
})
export class AmongUsDesignComponent implements OnInit, OnDestroy {
  readonly timeEngine = inject(TimeEngineService);
  private readonly session = inject(SessionService);

  readonly sliderValue = signal<number>(0);
  readonly isDragging = signal(false);

  readonly dragHours$ = computed(() => {
    if (!this.isDragging()) return this.timeEngine.hours$();
    return Math.trunc(this.sliderValue());
  });
  readonly dragMinutes$ = computed(() => {
    if (!this.isDragging()) return this.timeEngine.minutes$();
    const v = this.sliderValue();
    const frac = v - Math.trunc(v);
    return Math.floor(((frac * 60) % 60 + 60) % 60);
  });
  readonly dragSeconds$ = computed(() => {
    if (!this.isDragging()) return this.timeEngine.seconds$();
    const v = this.sliderValue();
    const totalMin = v * 60;
    return Math.floor(((totalMin - Math.floor(totalMin)) * 60 + 60) % 60);
  });

  readonly mappedHours = computed(() => {
    if (this.isDragging()) return this.sliderValue();
    const ch = cycleHour(this.dragHours$());
    return ch + this.dragMinutes$() / 60;
  });

  constructor() {
    this.sliderValue.set(this.timeEngine.currentHour$());
  }

  readonly cycleMinutes = computed(() => {
    const ch = cycleHour(this.dragHours$());
    return ch * 60 + this.dragMinutes$();
  });

  readonly totalDays = computed(() => Math.floor(Math.abs(this.dragHours$()) / 24));

  readonly daysInfo = computed<DayInfo[]>(() => {
    const jsDay = new Date().getDay();
    const today = (jsDay + 6) % 7;
    return DAY_NAMES.map((name, i) => ({
      name,
      status: i < today ? 'past' : i === today ? 'today' : 'future'
    }));
  });

  readonly scannerSegments = Array.from({ length: 60 }, (_, i) => i);
  readonly sliderPercentage = computed(() => (this.cycleMinutes() / 1439) * 100);

  readonly currentHour = computed(() => cycleHour(this.dragHours$()));
  readonly currentMinute = computed(() => this.dragMinutes$());
  readonly currentSecond = computed(() => this.dragSeconds$());

  readonly clockDisplay = computed(() => {
    const h = padTime(this.currentHour());
    const m = padTime(this.currentMinute());
    return `${h}:${m}`;
  });

  readonly dateDisplay = computed(() => {
    const now = new Date();
    return `${dayName(now)}, ${dayOfMonth(now)} ${monthName(now)}`;
  });

  readonly tasks: Task[] = [
    { id: 1, name: 'Swipe Card', hour: '07:00', hourIndex: 7, completed: true },
    { id: 2, name: 'Calibrate Distributor', hour: '08:00', hourIndex: 8, completed: true },
    { id: 3, name: 'Clean Vent', hour: '09:00', hourIndex: 9, completed: true },
    { id: 4, name: 'Fix Wiring', hour: '10:00', hourIndex: 10, completed: true },
    { id: 5, name: 'Upload Data', hour: '11:00', hourIndex: 11, completed: true },
    { id: 6, name: 'Swipe Card', hour: '12:00', hourIndex: 12, completed: true },
    { id: 7, name: 'Prime Shields', hour: '13:00', hourIndex: 13, completed: true },
    { id: 8, name: 'Chart Course', hour: '14:00', hourIndex: 14, completed: true },
    { id: 9, name: 'Stabilize Steering', hour: '15:00', hourIndex: 15, completed: false },
    { id: 10, name: 'Clean Vent', hour: '16:00', hourIndex: 16, completed: false },
    { id: 11, name: 'Calibrate Distributor', hour: '17:00', hourIndex: 17, completed: false },
    { id: 12, name: 'Fix Wiring', hour: '18:00', hourIndex: 18, completed: false },
    { id: 13, name: 'Swipe Card', hour: '19:00', hourIndex: 19, completed: false },
    { id: 14, name: 'Upload Data', hour: '20:00', hourIndex: 20, completed: false },
    { id: 15, name: 'Prime Shields', hour: '21:00', hourIndex: 21, completed: false },
    { id: 16, name: 'Chart Course', hour: '22:00', hourIndex: 22, completed: false },
    { id: 17, name: 'Stabilize Steering', hour: '23:00', hourIndex: 23, completed: false },
    { id: 18, name: 'Clean Vent', hour: '00:00', hourIndex: 0, completed: false },
    { id: 19, name: 'Fix Wiring', hour: '01:00', hourIndex: 1, completed: false },
    { id: 20, name: 'Swipe Card', hour: '02:00', hourIndex: 2, completed: false },
    { id: 21, name: 'Calibrate Distributor', hour: '03:00', hourIndex: 3, completed: false },
    { id: 22, name: 'Upload Data', hour: '04:00', hourIndex: 4, completed: false },
    { id: 23, name: 'Prime Shields', hour: '05:00', hourIndex: 5, completed: false },
    { id: 24, name: 'Chart Course', hour: '06:00', hourIndex: 6, completed: false },
  ];

  readonly currentTask = computed(() => {
    const h = this.currentHour();
    return this.tasks.find(t => t.hourIndex === h) ?? this.tasks[0];
  });

  readonly remainingPercentage = computed(() => (this.currentMinute() / 60) * 100);
  readonly minutesLeft = computed(() => this.currentMinute());
  readonly barCritical = computed(() => this.remainingPercentage() > 80);
  readonly crewmatePosition = this.remainingPercentage;

  readonly scannerBlockLit = (idx: number): boolean => idx < this.currentSecond();
  readonly scannerRemaining = this.currentSecond;

  readonly frameIndices = [0, 1, 2, 3, 4, 5, 6, 7];
  readonly currentFrameIndex = signal(0);

  private frameInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.session.addLog('AMONG US WORLD INITIALIZED', 'success');
    this.frameInterval = setInterval(() => {
      this.currentFrameIndex.update(i => (i + 1) % 8);
    }, 80);
  }

  ngOnDestroy(): void {
    clearInterval(this.frameInterval);
  }

  onSliderChange(value: number): void {
    this.isDragging.set(true);
    this.sliderValue.set(value);
  }

  onDragEnd(): void {
    this.isDragging.set(false);
    this.timeEngine.setHora(this.sliderValue());
  }

  onResetTime(): void {
    this.sliderValue.set(cycleHour(this.timeEngine.hours$()) + this.timeEngine.minutes$() / 60);
    this.timeEngine.resetToRealTime();
  }
}
