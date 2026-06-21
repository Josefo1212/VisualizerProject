import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './Sidebar.html',
  styleUrl: './Sidebar.css',
})
export class SidebarComponent {
  @Input() inactive = false;
  readonly collapsed = signal<boolean>(false);

  toggle(): void {
    if (this.inactive) return;
    this.collapsed.update(v => !v);
  }
}
