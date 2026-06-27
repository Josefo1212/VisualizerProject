import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-hover-reveal',
  standalone: true,
  template: `
    <div
      class="hover-reveal-bg"
      [style.background-image]="coverImage ? 'url(' + coverImage + ')' : 'none'"
    ></div>
    <div class="hover-reveal-overlay"></div>
    <ng-content></ng-content>
  `,
  styleUrl: './HoverReveal.css',
})
export class HoverRevealComponent {
  @Input({ required: true }) coverImage = '';
  @Input() disabled = false;

  @HostBinding('attr.data-disabled')
  get disabledAttr() {
    return this.disabled ? '' : null;
  }
}
