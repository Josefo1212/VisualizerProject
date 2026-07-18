import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

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

  private _dragging = false;

  get percent(): number {
    const range = this.max - this.min || 1;
    return ((this.value - this.min) / range) * 100;
  }

  get displayValue(): string {
    return this.formatFn ? this.formatFn(this.value) : this.value.toFixed(1);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = parseFloat(target.value);
    this.valueChange.emit(val);
  }

  onDragStart(): void {
    this._dragging = true;
    this.dragStart.emit();
  }

  onDragEnd(): void {
    if (!this._dragging) return;
    this._dragging = false;
    this.dragEnd.emit();
  }

  @HostListener('document:pointerup')
  onDocumentPointerUp(): void {
    this.onDragEnd();
  }

  @HostListener('document:pointercancel')
  onDocumentPointerCancel(): void {
    this.onDragEnd();
  }
}
