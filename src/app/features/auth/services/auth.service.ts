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
    sessionStorage.clear();
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
    sessionStorage.setItem('auth_user', JSON.stringify(response));
  }

  private loadFromSession() {
    const user = sessionStorage.getItem('auth_user');
    if (user) {
      const parsed = JSON.parse(user) as AuthResponse;
      this._token.set(parsed.token);
      this._currentUser.set(parsed);
    }
  }
}