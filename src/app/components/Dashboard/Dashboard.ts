import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../Sidebar/Sidebar';
import { PowerScreenComponent } from '../PowerScreen/PowerScreen';
import { WorldRendererComponent } from '../WorldRenderer/WorldRenderer';
import { SessionService } from '../../services/session';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent, PowerScreenComponent,
    WorldRendererComponent,
  ],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css',
})
export class DashboardComponent {
  readonly session = inject(SessionService);

  readonly isSystemOnline = signal(false);
  readonly selectedDesign = signal<string>('');
  readonly hoveredWorld = signal<string | null>(null);
  readonly sidebarCollapsed = signal(true);

  readonly particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 4 + ((i * 13) % 92),
    y: 3 + ((i * 19) % 94),
    size: 1 + (i % 2),
    opacity: 0.008 + (i % 4) * 0.004,
    delay: (i % 6) * 2.5,
    duration: 20 + (i % 3) * 6,
  }));

  onPowerOnFinished(): void {
    this.isSystemOnline.set(true);
    this.sidebarCollapsed.set(true);
  }

  onStartSession(): void {
    this.session.startSession();
    this.session.addLog('USER INITIATED SESSION', 'info');
    this.sidebarCollapsed.set(false);
  }

  onDesignChange(id: string): void {
    this.selectedDesign.set(id);
    if (this.session.sessionActive()) {
      const label = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      this.session.addLog(`SELECTED: ${label}`, 'info');
      this.session.setCurrentWorld(id);
    }
  }

  onHoverChange(id: string | null): void {
    if (this.session.sessionActive()) {
      this.hoveredWorld.set(id);
    }
  }

  onEnterWorld(id: string): void {
    this.selectedDesign.set(id);
    if (this.session.sessionActive()) {
      const label = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      this.session.addLog(`ENTERING WORLD: ${label}`, 'info');
      this.session.setCurrentWorld(id);
    }
  }

  onBackToHub(): void {
    this.selectedDesign.set('');
    this.hoveredWorld.set(null);
    if (this.session.sessionActive()) {
      this.session.addLog('RETURNED TO HUB', 'info');
    }
  }

  onVideoTimeUpdate(video: HTMLVideoElement): void {
    if (video.duration && video.currentTime >= video.duration - 0.35) {
      video.currentTime = 0;
    }
  }
}
