import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './Slider.html',
  styleUrl: './Slider.css',
})
export class SliderComponent {
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 24;
  @Input() step = 0.1;
  @Input() formatFn?: (v: number) => string;
  @Output() valueChange = new EventEmitter<number>();

  get percent(): number {
    return ((this.value - this.min) / (this.max - this.min)) * 100;
  }

  get displayValue(): string {
    return this.formatFn ? this.formatFn(this.value) : this.value.toFixed(1);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(parseFloat(target.value));
  }
}
