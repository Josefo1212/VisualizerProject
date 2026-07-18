import { Component, inject, input, output, signal, effect } from '@angular/core';
import { SessionService } from '../../services/session';
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
import { SpotlightComponent } from '../Spotlight/Spotlight';
import { PanelTelemetryComponent } from '../PanelTelemetry/PanelTelemetry';

@Component({
  selector: 'app-world-renderer',
  standalone: true,
  imports: [
    GtaDesignComponent, AmongUsDesignComponent, SubnauticaDesignComponent,
    FalloutDesignComponent, CyberpunkDesignComponent, AssassinsCreedDesignComponent,
    FortniteDesignComponent, DarkSoulsDesignComponent, NoMansSkyDesignComponent,
    GodOfWarDesignComponent, SpotlightComponent, PanelTelemetryComponent,
  ],
  templateUrl: './WorldRenderer.html',
  styleUrls: ['./WorldRenderer.css'],
})
export class WorldRendererComponent {
  readonly session = inject(SessionService);

  readonly worldId = input<string>('');
  readonly hoveredWorld = input<string | null>(null);
  readonly sessionActive = input(false);

  readonly enterWorld = output<string>();
  readonly startSession = output<void>();

  readonly previousWorld = signal<string>('');
  readonly transitioning = signal(false);
  readonly animReady = signal(true);

  private prev = '';
  private safetyTimer: ReturnType<typeof setTimeout> | null = null;
  private animReadyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const next = this.worldId();
      if (next === this.prev) return;
      this.previousWorld.set(this.prev);
      this.prev = next;
      this.animReady.set(false);
      this.transitioning.set(true);
      if (this.safetyTimer) clearTimeout(this.safetyTimer);
      this.safetyTimer = setTimeout(() => this.endTransition(), 550);
    });
  }

  private endTransition(): void {
    this.transitioning.set(false);
    if (this.animReadyTimeout) clearTimeout(this.animReadyTimeout);
    this.animReadyTimeout = setTimeout(() => this.animReady.set(true), 150);
  }
}
