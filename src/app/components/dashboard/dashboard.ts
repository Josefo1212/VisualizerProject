import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { SidebarComponent } from '../Sidebar/Sidebar';
import { PowerScreenComponent } from '../PowerScreen/PowerScreen';
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

const WORLD_NAMES: Record<string, string> = {
  'gta': 'Grand Theft Auto',
  'amongus': 'Among Us',
  'subnautica': 'Subnautica',
  'fallout': 'Fallout',
  'cyberpunk': 'Cyberpunk 2077',
  'assassins-creed': "Assassin's Creed",
  'fortnite': 'Fortnite',
  'dark-souls': 'Dark Souls',
  'no-mans-sky': "No Man's Sky",
  'god-of-war': 'God of War',
};

const BOOT_LINES = [
  'Initializing Core...',
  'Loading Engine...',
  'Loading Worlds...',
  'Synchronizing Time...',
  'Unlocking Modules...',
  'Ready.',
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SidebarComponent, PowerScreenComponent,
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
  readonly destroyRef = inject(DestroyRef);

  readonly isSystemOnline = signal(false);
  readonly selectedDesign = signal<string>('');
  readonly currentTime = signal('');

  /* ─── Boot sequence ─── */
  readonly bootPhase = signal(0);
  readonly bootComplete = signal(false);
  readonly bootLines = BOOT_LINES;

  /* ─── Scan line sweep ─── */
  readonly scanActive = signal(false);

  readonly particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 3 + ((i * 11) % 94),
    y: 2 + ((i * 17) % 96),
    size: 1 + (i % 3),
    opacity: 0.01 + (i % 6) * 0.006,
    delay: (i % 9) * 1.8,
    duration: 16 + (i % 5) * 5,
  }));

  readonly currentWorldName = computed(() => {
    const id = this.selectedDesign();
    return id ? WORLD_NAMES[id] ?? id : 'Dashboard';
  });

  readonly dayName = computed(() => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date().getDay()];
  });

  onPowerOnFinished(): void {
    this.isSystemOnline.set(true);
    this.startBootSequence();
  }

  private startBootSequence(): void {
    this.bootPhase.set(0);
    this.bootComplete.set(false);
    const intervalId = setInterval(() => {
      this.bootPhase.update(p => {
        if (p >= this.bootLines.length - 1) {
          clearInterval(intervalId);
          setTimeout(() => {
            this.bootComplete.set(true);
            this.session.startSession();
            this.startScanLine();
          }, 500);
          return this.bootLines.length - 1;
        }
        return p + 1;
      });
    }, 420);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  private startScanLine(): void {
    const id = setInterval(() => {
      this.scanActive.set(true);
      setTimeout(() => this.scanActive.set(false), 1000);
    }, 9000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  onDesignChange(id: string): void {
    this.selectedDesign.set(id);
    if (this.session.sessionActive()) {
      this.session.setCurrentWorld(id);
    }
  }

  onVideoTimeUpdate(video: HTMLVideoElement): void {
    if (video.duration && video.currentTime >= video.duration - 0.35) {
      video.currentTime = 0;
    }
  }

  constructor() {
    const id = setInterval(() => {
      this.currentTime.set(new Date().toLocaleTimeString());
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }
}
