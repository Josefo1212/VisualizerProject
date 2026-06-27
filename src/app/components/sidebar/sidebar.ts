import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { HoverRevealComponent } from '../HoverReveal/HoverReveal';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [HoverRevealComponent],
  templateUrl: './Sidebar.html',
  styleUrl: './Sidebar.css',
})
export class SidebarComponent {
  @Input() inactive = false;
  @Input() selectedDesign = '';
  @Output() designChange = new EventEmitter<string>();

  readonly collapsed = signal<boolean>(false);

  readonly designs = [
    { id: 'gta', icon: '🌆', name: 'Los Santos', cover: '/GTA/botonGTA.jpg' },
    { id: 'amongus', icon: '🚀', name: 'Among Us', cover: '/AmongUs/botonAmongUs.jpg' },
  ];

  toggle(): void {
    if (this.inactive) return;
    this.collapsed.update(v => !v);
  }

  selectDesign(id: string): void {
    if (this.inactive) return;
    this.designChange.emit(id);
  }
}
