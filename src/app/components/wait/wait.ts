import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wait',
  standalone: true,
  templateUrl: './Wait.html',
  styleUrl: './Wait.css',
})
export class WaitComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 3000);
  }
}
