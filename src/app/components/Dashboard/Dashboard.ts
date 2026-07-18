import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('bgVideo1') private v1Ref!: ElementRef<HTMLVideoElement>;

  readonly video1Opacity = signal(1);
  readonly video2Opacity = signal(0);
  private isTransitioning = false;

  readonly displayOpacity1 = computed(() => this.isSystemOnline() ? this.video1Opacity() : 0);
  readonly displayOpacity2 = computed(() => this.isSystemOnline() ? this.video2Opacity() : 0);

  onVideoTimeUpdate(current: HTMLVideoElement, other: HTMLVideoElement): void {
    if (!current.duration || this.isTransitioning) return;

    const threshold = 0.5;
    if (current.currentTime >= current.duration - threshold) {
      this.isTransitioning = true;

      other.currentTime = 0;
      other.play().catch(() => {});

      const isV1 = current === this.v1Ref.nativeElement;
      this.video1Opacity.set(isV1 ? 0 : 1);
      this.video2Opacity.set(isV1 ? 1 : 0);

      setTimeout(() => {
        current.pause();
        current.currentTime = 0;
        this.isTransitioning = false;
      }, 600);
    }
  }

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

}
