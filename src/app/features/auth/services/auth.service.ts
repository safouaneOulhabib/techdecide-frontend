import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '@features/auth/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {

  private router = inject(Router);

  // Token kept in memory to prevent XSS attacks via localStorage
  private _token = signal<string | null>(null);
  private _currentUser = signal<AuthResponse | null>(null);

  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();

  constructor() {
    super();
    this.loadFromSession();
  }

  register(request: RegisterRequest) {
    return this.post<AuthResponse>('/auth/register', request).pipe(
      tap(response => this.saveUser(response))
    );
  }

  login(request: LoginRequest) {
    return this.post<AuthResponse>('/auth/login', request).pipe(
      tap(response => this.saveUser(response))
    );
  }

  logout() {
    localStorage.removeItem('auth_user');
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!this._token();
  }

  getToken(): string | null {
    return this._token();
  }

  private saveUser(response: AuthResponse) {
    this._token.set(response.token);
    this._currentUser.set(response);
    // sessionStorage survives refresh but clears on tab close — acceptable tradeoff
    localStorage.setItem('auth_user', JSON.stringify(response));
  }

  private loadFromSession() {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      if (!parsed.token || this.isTokenExpired(parsed.token)) {
        localStorage.removeItem('auth_user');
        return;
      }
      this._token.set(parsed.token);
      this._currentUser.set(parsed);
    } catch {
      localStorage.removeItem('auth_user');
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp is in seconds
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}