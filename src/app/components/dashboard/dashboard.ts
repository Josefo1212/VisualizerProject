import { Component, signal } from '@angular/core';
import { SidebarComponent } from '../sidebar/Sidebar';
import { PowerScreenComponent } from '../power-screen/PowerScreen';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, PowerScreenComponent],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css',
})
export class DashboardComponent {
  readonly isSystemOnline = signal<boolean>(false);

  onVideoTimeUpdate(video: HTMLVideoElement): void {
    if (video.duration && video.currentTime >= video.duration - 0.08) {
      video.currentTime = 0;
    }
  }
}
