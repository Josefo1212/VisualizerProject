import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);

  readonly switchToLogin = output<void>();

  public readonly username = signal<string>('');
  public readonly email = signal<string>('');
  public readonly password = signal<string>('');
  public readonly showPassword = signal<boolean>(false);
  public readonly errorMessage = signal<string>('');
  public readonly successMessage = signal<string>('');

  public async handleSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentUsername = this.username().trim();
    const currentEmail = this.email().trim();
    const currentPassword = this.password();

    if (!currentUsername || !currentPassword || !currentEmail) {
      this.errorMessage.set('ERROR: CAMPOS REQUERIDOS INCOMPLETOS.');
      return;
    }

    try {
      const isValid = await this.authService.register({
        username: currentUsername,
        password: currentPassword,
        email: currentEmail,
      });

      if (isValid) {
        this.successMessage.set('REGISTRO EXITOSO. ENRUTANDO A ACCESO...');
        setTimeout(() => this.switchToLogin.emit(), 1500);
      } else {
        this.errorMessage.set('ERROR: EL USUARIO YA SE ENCUENTRA REGISTRADO.');
      }
    } catch {
      this.errorMessage.set('ERROR DE CONEXIÓN CON LA BASE DE DATOS.');
    }
  }
}
