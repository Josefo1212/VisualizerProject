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
      this.usernameError.set('USERNAME MUST BE AT LEAST 2 CHARACTERS.');
      return false;
    }
    if (trimmed.length > 15) {
      this.usernameError.set('USERNAME CANNOT EXCEED 15 CHARACTERS.');
      return false;
    }
    this.usernameError.set('');
    return true;
  }

  private validateEmail(value: string): boolean {
    const trimmed = value.trim();
    if (trimmed.length < 10) {
      this.emailError.set('EMAIL MUST BE AT LEAST 10 CHARACTERS.');
      return false;
    }
    if (trimmed.length > 50) {
      this.emailError.set('EMAIL CANNOT EXCEED 50 CHARACTERS.');
      return false;
    }
    if (!trimmed.endsWith('@gmail.com')) {
      this.emailError.set('EMAIL MUST BE @gmail.com.');
      return false;
    }
    this.emailError.set('');
    return true;
  }

  private validatePassword(value: string): boolean {
    if (value.length < 8) {
      this.passwordError.set('PASSWORD MUST BE AT LEAST 8 CHARACTERS.');
      return false;
    }
    if (value.length > 15) {
      this.passwordError.set('PASSWORD CANNOT EXCEED 15 CHARACTERS.');
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
        this.successMessage.set('REGISTRATION SUCCESSFUL. ROUTING TO LOGIN...');
        setTimeout(() => this.switchToLogin.emit(), 1500);
      } else {
        this.errorMessage.set('ERROR: USERNAME IS ALREADY REGISTERED.');
      }
    } catch {
      this.errorMessage.set('DATABASE CONNECTION ERROR.');
    }
  }
}
