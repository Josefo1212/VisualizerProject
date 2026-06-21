import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './Register.html',
  styleUrl: './Register.css',
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
  public readonly usernameError = signal<string>('');
  public readonly emailError = signal<string>('');
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

  private validateEmail(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length < 10) {
      this.emailError.set('EL CORREO DEBE TENER AL MENOS 10 CARACTERES.');
      return false;
    }
    if (trimmed.length > 50) {
      this.emailError.set('EL CORREO NO PUEDE EXCEDER 50 CARACTERES.');
      return false;
    }
    if (!trimmed.endsWith('@gmail.com')) {
      this.emailError.set('EL CORREO DEBE SER @gmail.com.');
      return false;
    }
    this.emailError.set('');
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
    const currentEmail = this.email().trim();
    const currentPassword = this.password();

    const validUser = this.validateUsername(currentUsername);
    const validEmail = this.validateEmail(currentEmail);
    const validPass = this.validatePassword(currentPassword);
    if (!validUser || !validEmail || !validPass) return;

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
