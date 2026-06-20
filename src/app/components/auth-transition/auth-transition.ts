import { Component, signal } from '@angular/core';
import { LoginComponent } from '../login/login';
import { RegisterComponent } from '../register/register';

interface Particle {
  id: number;
  x: string;
  y: string;
  size: string;
  delay: string;
  duration: string;
}

@Component({
  selector: 'app-auth-transition',
  standalone: true,
  imports: [LoginComponent, RegisterComponent],
  templateUrl: './auth-transition.html',
  styleUrl: './auth-transition.css',
})
export class AuthTransition {
  public readonly currentView = signal<'login' | 'register'>('login');
  public readonly transitioning = signal(false);
  public readonly direction = signal<'right' | 'left'>('right');
  public readonly particles = signal<Particle[]>([]);

  public switchToRegister(): void {
    if (this.currentView() === 'register') return;
    this.direction.set('right');
    this.startTransition();
  }

  public switchToLogin(): void {
    if (this.currentView() === 'login') return;
    this.direction.set('left');
    this.startTransition();
  }

  private startTransition(): void {
    this.particles.set(this.generateParticles(50));
    this.transitioning.set(true);

    setTimeout(() => {
      if (this.direction() === 'right') {
        this.currentView.set('register');
      } else {
        this.currentView.set('login');
      }
      this.transitioning.set(false);
      this.particles.set([]);
    }, 800);
  }

  private generateParticles(count: number): Particle[] {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100 + '%',
      y: Math.random() * 100 + '%',
      size: Math.random() * 6 + 2 + 'px',
      delay: Math.random() * 0.35 + 's',
      duration: Math.random() * 0.25 + 0.55 + 's',
    }));
  }
}
