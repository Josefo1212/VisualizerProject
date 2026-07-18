import { Component, input, Output, EventEmitter, model, inject } from '@angular/core';
import { HoverRevealComponent } from '../HoverReveal/HoverReveal';
import { TimeMultiplierComponent } from '../TimeMultiplier/TimeMultiplier';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HoverRevealComponent, TimeMultiplierComponent],
  templateUrl: './Sidebar.html',
  styleUrl: './Sidebar.css',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);

  readonly inactive = input(false);
  readonly sessionActive = input(false);
  readonly selectedDesign = input('');
  @Output() designChange = new EventEmitter<string>();
  @Output() hoverChange = new EventEmitter<string | null>();

  readonly collapsed = model(false);

  readonly designs = [
    { id: 'gta', icon: '🌆', name: 'Grand Theft Auto', cover: '/GTA/botonGTA.jpg', svgIcon: '/GTA/iconGta.svg' },
    { id: 'amongus', icon: '🚀', name: 'Among Us', cover: '/AmongUs/botonAmongUs.jpg', svgIcon: '/AmongUs/iconAmongUs.svg' },
    { id: 'subnautica', icon: '🌊', name: 'Subnautica', cover: '/Subnautica/botonSubnautica.jpg', svgIcon: '/Subnautica/iconSubnautica.svg' },
    { id: 'fallout', icon: '☢️', name: 'Fallout', cover: '/Fallout/botonFallout.jpg', svgIcon: '/Fallout/iconFallout.svg' },
    { id: 'cyberpunk', icon: '🖥️', name: 'Cyberpunk 2077', cover: '/CyberPunk/botonCyberPunk.jpg', svgIcon: '/CyberPunk/iconCyberpunk.png' },
    { id: 'assassins-creed', icon: '🦅', name: "Assassin's Creed", cover: "/Assassin'sCreed/botonAssassin'sCreed.jpg", svgIcon: "/Assassin'sCreed/iconAssassin'sCreed.png" },
    { id: 'fortnite', icon: '🌀', name: 'Fortnite', cover: '/Fortnite/botonFortnite.jpg', svgIcon: '/Fortnite/iconFortnite.png' },
    { id: 'dark-souls', icon: '🔥', name: 'Dark Souls', cover: '/DarkSouls/botonDarkSouls.jpg', svgIcon: '/DarkSouls/iconDarkSouls.png' },
    { id: 'no-mans-sky', icon: '🌌', name: "No Man's Sky", cover: "/NoMan'sSky/botonNoMan'sSky.jpg", svgIcon: "/NoMan'sSky/iconNoMan'sSky.png" },
    { id: 'god-of-war', icon: '🪓', name: 'God of War', cover: '/GodOfWar/botonGodOfWar.jpg', svgIcon: '/GodOfWar/iconGodOfWar.png' },
  ];

  toggleCollapse(): void {
    if (this.inactive()) return;
    this.collapsed.update(v => !v);
  }

  selectDesign(id: string): void {
    if (this.inactive() || !this.sessionActive()) return;
    this.designChange.emit(id);
  }

  goToDashboard(): void {
    this.designChange.emit('');
  }

  logout(): void {
    this.auth.logout();
  }
}
