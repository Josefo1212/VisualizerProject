import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  readonly switchToRegister = output<void>();

  public readonly username = signal<string>('');
  public readonly password = signal<string>('');
  public readonly showPassword = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly successMessage = signal<string>('');

  public async handleSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentUsername = this.username().trim();
    const currentPassword = this.password();

    if (!currentUsername || !currentPassword) {
      this.errorMessage.set('ERROR: CAMPOS REQUERIDOS INCOMPLETOS.');
      return;
    }

    try {
      const isValid = await this.authService.login({
        username: currentUsername,
        password: currentPassword,
      });

      if (!isValid) {
        this.errorMessage.set('ACCESO DENEGADO: CREDENCIALES ERRÓNEAS.');
      }
    } catch {
      this.errorMessage.set('ERROR DE CONEXIÓN CON LA BASE DE DATOS.');
    }
  }
}
