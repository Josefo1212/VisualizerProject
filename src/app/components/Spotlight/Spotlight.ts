import { Component, input, Output, EventEmitter, computed, effect, signal } from '@angular/core';

interface WorldData {
  id: string;
  name: string;
  tagline: string;
  color: string;
}

const WORLDS: WorldData[] = [
  { id: 'gta',              name: 'Grand Theft Auto',    tagline: 'The city never sleeps, neither does time',              color: '#ff6ec7' },
  { id: 'amongus',          name: 'Among Us',             tagline: 'Time reveals who you can trust',                        color: '#ff4444' },
  { id: 'subnautica',       name: 'Subnautica',           tagline: 'The depths hold timeless secrets',                     color: '#0066ff' },
  { id: 'fallout',          name: 'Fallout',              tagline: 'Every second echoes through the wasteland',             color: '#00ff41' },
  { id: 'cyberpunk',        name: 'Cyberpunk 2077',       tagline: 'Time flows through neon and rain',                     color: '#ff6600' },
  { id: 'assassins-creed',  name: "Assassin's Creed",     tagline: 'Time shapes the creed',                                color: '#00ccff' },
  { id: 'fortnite',         name: 'Fortnite',             tagline: 'Every storm has a beginning',                          color: '#ff00ff' },
  { id: 'dark-souls',       name: 'Dark Souls',           tagline: 'Time is a dying ember',                                color: '#ff4400' },
  { id: 'no-mans-sky',      name: "No Man's Sky",         tagline: 'Infinite worlds, infinite moments',                    color: '#00ffcc' },
  { id: 'god-of-war',       name: 'God of War',           tagline: 'Time carved in runes and valor',                       color: '#4488ff' },
];

@Component({
  selector: 'app-spotlight',
  standalone: true,
  templateUrl: './Spotlight.html',
  styleUrl: './Spotlight.css',
})
export class SpotlightComponent {
  readonly worldId = input<string | null>(null);
  readonly sessionActive = input(false);
  @Output() enterWorld = new EventEmitter<string>();
  @Output() startSession = new EventEmitter<void>();

  readonly currentWorld = computed(() => WORLDS.find(w => w.id === this.worldId()) ?? null);
  readonly accentColor = computed(() => this.currentWorld()?.color ?? '#00f3ff');

  readonly transitioning = signal(false);
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      this.worldId();
      this.transitioning.set(true);
      if (this.transitionTimer) clearTimeout(this.transitionTimer);
      this.transitionTimer = setTimeout(() => this.transitioning.set(false), 300);
    });
  }

  onStartSession(): void {
    this.startSession.emit();
  }

  onEnter(): void {
    const id = this.worldId();
    if (id) this.enterWorld.emit(id);
  }
}
