import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './Login.html',
  styleUrl: './Login.css',
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
        this.errorMessage.set('ACCESS DENIED: INVALID CREDENTIALS.');
      }
    } catch {
      this.errorMessage.set('DATABASE CONNECTION ERROR.');
    }
  }
}
