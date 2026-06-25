import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../sidebar/Sidebar';
import { PowerScreenComponent } from '../power-screen/PowerScreen';
import { GtaDesignComponent } from '../gta-design/GtaDesign';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, PowerScreenComponent, GtaDesignComponent],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css',
})
export class DashboardComponent {
  readonly isSystemOnline = signal<boolean>(false);
  readonly selectedDesign = signal<string>('');

  onPowerOnFinished(): void {
    this.isSystemOnline.set(true);
  }

  onDesignChange(id: string): void {
    this.selectedDesign.set(id);
  }

  onVideoTimeUpdate(video: HTMLVideoElement): void {
    if (video.duration && video.currentTime >= video.duration - 0.35) {
      video.currentTime = 0;
    }
  }
}
