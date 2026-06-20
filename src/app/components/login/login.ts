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
  public readonly usernameError = signal<string>('');
  public readonly passwordError = signal<string>('');

  private validateUsername(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      this.usernameError.set('EL USUARIO DEBE TENER AL MENOS 2 CARACTERES.');
      return false;
    }
    if (trimmed.length > 15) {
      this.usernameError.set('EL USUARIO NO PUEDE EXCEDER 15 CARACTERES.');
      return false;
    }
    this.usernameError.set('');
    return true;
  }

  private validatePassword(value: string): boolean {
    if (value.length < 8) {
      this.passwordError.set('LA CONTRASEÑA DEBE TENER AL MENOS 8 CARACTERES.');
      return false;
    }
    if (value.length > 15) {
      this.passwordError.set('LA CONTRASEÑA NO PUEDE EXCEDER 15 CARACTERES.');
      return false;
    }
    this.passwordError.set('');
    return true;
  }

  public async handleSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentUsername = this.username().trim();
    const currentPassword = this.password();

    const validUser = this.validateUsername(currentUsername);
    const validPass = this.validatePassword(currentPassword);
    if (!validUser || !validPass) return;

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
