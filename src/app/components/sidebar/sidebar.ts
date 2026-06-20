import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  public readonly collapsed = signal<boolean>(false);

  public toggle(): void {
    this.collapsed.update(v => !v);
  }
}
