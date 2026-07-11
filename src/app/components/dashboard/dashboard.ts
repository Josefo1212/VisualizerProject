import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../Sidebar/Sidebar';
import { PowerScreenComponent } from '../PowerScreen/PowerScreen';
import { SpotlightComponent } from '../Spotlight/Spotlight';
import { PanelTelemetriaComponent } from '../PanelTelemetria/PanelTelemetria';
import { GtaDesignComponent } from '../GtaDesign/GtaDesign';
import { AmongUsDesignComponent } from '../AmongUsDesign/AmongUsDesign';
import { SubnauticaDesignComponent } from '../SubnauticaDesign/SubnauticaDesign';
import { FalloutDesignComponent } from '../FalloutDesign/FalloutDesign';
import { CyberpunkDesignComponent } from '../CyberpunkDesign/CyberpunkDesign';
import { AssassinsCreedDesignComponent } from '../AssassinsCreedDesign/AssassinsCreedDesign';
import { FortniteDesignComponent } from '../FortniteDesign/FortniteDesign';
import { DarkSoulsDesignComponent } from '../DarkSoulsDesign/DarkSoulsDesign';
import { NoMansSkyDesignComponent } from '../NoMansSkyDesign/NoMansSkyDesign';
import { GodOfWarDesignComponent } from '../GodOfWarDesign/GodOfWarDesign';
import { SessionService } from '../../services/session';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent, PowerScreenComponent,
    SpotlightComponent, PanelTelemetriaComponent,
    GtaDesignComponent, AmongUsDesignComponent, SubnauticaDesignComponent,
    FalloutDesignComponent, CyberpunkDesignComponent, AssassinsCreedDesignComponent,
    FortniteDesignComponent, DarkSoulsDesignComponent, NoMansSkyDesignComponent,
    GodOfWarDesignComponent,
  ],
  templateUrl: './Dashboard.html',
  styleUrl: './Dashboard.css',
})
export class DashboardComponent {
  readonly session = inject(SessionService);

  readonly isSystemOnline = signal(false);
  readonly selectedDesign = signal<string>('');
  readonly hoveredWorld = signal<string | null>(null);

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
  }

  onStartSession(): void {
    this.session.startSession();
  }

  onDesignChange(id: string): void {
    this.selectedDesign.set(id);
    if (this.session.sessionActive()) {
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
      this.session.setCurrentWorld(id);
    }
  }

  onBackToHub(): void {
    this.selectedDesign.set('');
    this.hoveredWorld.set(null);
  }

  onVideoTimeUpdate(video: HTMLVideoElement): void {
    if (video.duration && video.currentTime >= video.duration - 0.35) {
      video.currentTime = 0;
    }
  }
}
