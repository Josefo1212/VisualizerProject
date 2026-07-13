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
  @Input() accent?: string;
  @Input() trackColor?: string;
  @Input() formatFn?: (v: number) => string;

  @Output() valueChange = new EventEmitter<number>();
  @Output() dragStart = new EventEmitter<void>();
  @Output() dragEnd = new EventEmitter<void>();

  get percent(): number {
    const range = this.max - this.min || 1;
    return ((this.value - this.min) / range) * 100;
  }

  get displayValue(): string {
    return this.formatFn ? this.formatFn(this.value) : this.value.toFixed(1);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(parseFloat(target.value));
  }

  onDragStart(): void {
    this.dragStart.emit();
  }

  onDragEnd(): void {
    this.dragEnd.emit();
  }
}
