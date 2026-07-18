import { Injectable } from '@angular/core';

const SOUND_MAP: Record<string, string> = {
  'gta': '/sounds/GtaSound.mp3',
  'amongus': '/sounds/AmongUsSound.mp3',
  'subnautica': '/sounds/SubnauticaSound.mp3',
  'fallout': '/sounds/FalloutSound.mp3',
  'cyberpunk': '/sounds/CyberpunkSound.mp3',
  'assassins-creed': '/sounds/AssassinsCreedSoun.mp3',
  'fortnite': '/sounds/FortniteSound.mp3',
  'dark-souls': '/sounds/DarkSoulsSound.mp3',
  'no-mans-sky': '/sounds/NoMansSkySound.mp3',
  'god-of-war': '/sounds/GowSound.mp3',
};

@Injectable({ providedIn: 'root' })
export class AudioService {
  private current?: HTMLAudioElement;

  playWorldSound(worldId: string): void {
    const path = SOUND_MAP[worldId];
    if (!path) return;
    this.current?.pause();
    this.current = new Audio(path);
    this.current.volume = 0.5;
    this.current.play().catch(() => {});
  }
}
