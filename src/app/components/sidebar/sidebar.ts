import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './Sidebar.html',
  styleUrl: './Sidebar.css',
})
export class SidebarComponent {
  @Input() inactive = false;
  @Input() selectedDesign = '';
  @Output() designChange = new EventEmitter<string>();

  readonly collapsed = signal<boolean>(false);

  readonly designs = [
    { id: 'gta', icon: '🌆', name: 'Los Santos' },
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
