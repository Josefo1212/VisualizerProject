import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../Sidebar/Sidebar';
import { PowerScreenComponent } from '../PowerScreen/PowerScreen';
import { GtaDesignComponent } from '../GtaDesign/GtaDesign';
import { AmongUsDesignComponent } from '../AmongUsDesign/AmongUsDesign';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, PowerScreenComponent, GtaDesignComponent, AmongUsDesignComponent],
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
