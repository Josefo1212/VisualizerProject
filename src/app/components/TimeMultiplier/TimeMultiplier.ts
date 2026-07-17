import { Component, inject, input } from '@angular/core';
import { TimeEngineService } from '../../services/timeEngine';

@Component({
  selector: 'app-time-multiplier',
  standalone: true,
  templateUrl: './TimeMultiplier.html',
  styleUrl: './TimeMultiplier.css',
})
export class TimeMultiplierComponent {
  readonly disabled = input(false);
  readonly time = inject(TimeEngineService);

  onClick(): void {
    if (this.disabled()) return;
    this.time.cycleMultiplier();
  }
}
