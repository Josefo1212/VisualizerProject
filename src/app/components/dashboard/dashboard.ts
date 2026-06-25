import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../sidebar/Sidebar';
import { PowerScreenComponent } from '../power-screen/PowerScreen';
import { TimeManagerService } from '../../services/time-manager';
import { GtaDesignComponent } from '../gta-design/GtaDesign';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, PowerScreenComponent, GtaDesignComponent],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css',
})
export class DashboardComponent {
  private readonly timeManager = inject(TimeManagerService);
  readonly isSystemOnline = signal<boolean>(false);
  readonly selectedDesign = signal<string>('');

  onPowerOnFinished(): void {
    this.isSystemOnline.set(true);
  }

  onDesignChange(id: string): void {
    this.selectedDesign.set(id);
    if (id === 'gta') {
      this.timeManager.startRealTime();
    } else {
      this.timeManager.stop();
    }
  }

  onVideoTimeUpdate(video: HTMLVideoElement): void {
    if (video.duration && video.currentTime >= video.duration - 0.35) {
      video.currentTime = 0;
    }
  }
}
