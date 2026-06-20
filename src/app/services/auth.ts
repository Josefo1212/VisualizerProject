import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserStorage } from '../interfaces/user.interface';
import { DbService } from './db';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly db = inject(DbService);

  private readonly _isLoggedIn = signal<boolean>(false);
  private readonly _currentUser = signal<string | null>(null);

  public readonly isLoggedIn = this._isLoggedIn.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    this.initializeSession();
  }

  private async initializeSession(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const username = await this.db.getSession();
      if (username) {
        this._isLoggedIn.set(true);
        this._currentUser.set(username);
      }
    } catch {
      // IndexedDB not available
    }
  }

  async register(payload: UserStorage): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const existing = await this.db.findUserByUsername(payload.username.toLowerCase());
      if (existing) return false;

      await this.db.addUser({
        username: payload.username.trim().toLowerCase(),
        password: payload.password,
        email: payload.email,
      });
      return true;
    } catch {
      return false;
    }
  }

  async login(payload: User): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const user = await this.db.findUserByUsername(payload.username.toLowerCase());
      if (!user || user.password !== payload.password) return false;

      this._isLoggedIn.set(true);
      this._currentUser.set(user.username);
      await this.db.setSession(user.username);
      this.router.navigate(['/wait']);
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    if (typeof window !== 'undefined') {
      try {
        await this.db.clearSession();
      } catch {
        // IndexedDB not available
      }
    }
    this.router.navigate(['/login']);
  }
}
