import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-hover-reveal',
  standalone: true,
  template: '<ng-content></ng-content>',
  styleUrl: './HoverReveal.css',
})
export class HoverRevealComponent {
  @Input({ required: true }) coverImage = '';
  @Input() disabled = false;
  @Input() cornerColor = '#00f3ff';

  @HostBinding('attr.data-disabled')
  get disabledAttr() {
    return this.disabled ? '' : null;
  }

  @HostBinding('style.--cover-img')
  get coverImgVar() {
    return this.coverImage ? `url(${this.coverImage})` : 'none';
  }

  @HostBinding('style.--corner-color')
  get cornerColorVar() {
    return this.cornerColor;
  }
}
