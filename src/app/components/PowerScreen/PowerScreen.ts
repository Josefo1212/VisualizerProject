import { Component, signal, output, OnDestroy } from '@angular/core';

type PowerState = 'OFF' | 'BOOTING';

@Component({
  selector: 'app-power-screen',
  standalone: true,
  templateUrl: './PowerScreen.html',
  styleUrl: './PowerScreen.css',
})
export class PowerScreenComponent implements OnDestroy {
  readonly powerOnFinished = output<boolean>();

  readonly state = signal<PowerState>('OFF');
  readonly progress = signal<number>(0);

  private progressTimer: ReturnType<typeof setInterval> | null = null;
  private readonly DURATION = 5000;
  private readonly TICK = 30;

  ngOnDestroy(): void {
    this.clearTimer();
  }

  powerOn(): void {
    if (this.state() !== 'OFF') return;

   const audio = new Audio('sounds/JarvisSound.mp3');
   audio.play().catch(() => {});

    this.state.set('BOOTING');
    this.progress.set(0);

    const step = this.TICK / this.DURATION;
    this.progressTimer = setInterval(() => {
      this.progress.update(v => {
        const next = v + step;
        if (next >= 1) {
          this.clearTimer();
          this.state.set('OFF');
          this.progress.set(0);
          this.powerOnFinished.emit(true);
          return 1;
        }
        return next;
      });
    }, this.TICK);
  }

  private clearTimer(): void {
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }
}
