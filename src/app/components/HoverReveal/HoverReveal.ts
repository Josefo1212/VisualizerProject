import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-hover-reveal',
  standalone: true,
  template: `
    <div
      class="hover-reveal-bg"
      [style.background-image]="bgStyle"
    ></div>
    <ng-content></ng-content>
  `,
  styleUrl: './HoverReveal.css',
})
export class HoverRevealComponent {
  @Input({ required: true }) coverImage = '';
  @Input() disabled = false;

  get bgStyle(): string {
    return this.coverImage ? `url("${this.coverImage}")` : 'none';
  }

  @HostBinding('attr.data-disabled')
  get disabledAttr() {
    return this.disabled ? '' : null;
  }
}
