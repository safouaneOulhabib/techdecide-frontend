import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, withHooks, patchState } from '@ngrx/signals';
import { AuthService } from '@features/auth/services/auth.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '@features/auth/models/auth.model';

export type AuthState = {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({

    login(request: LoginRequest) {
      patchState(store, { loading: true, error: null });

      authService.login(request).subscribe({
        next: (response) => {
          patchState(store, { user: response, loading: false });
          router.navigate(['/decisions']);
        },
        error: (err) => {
          patchState(store, {
            error: err.error?.message || 'Invalid credentials',
            loading: false
          });
        }
      });
    },

    register(request: RegisterRequest) {
      patchState(store, { loading: true, error: null });

      authService.register(request).subscribe({
        next: (response) => {
          patchState(store, { user: response, loading: false });
          router.navigate(['/decisions']);
        },
        error: (err) => {
          patchState(store, {
            error: err.error?.message || 'Registration failed',
            loading: false
          });
        }
      });
    },

    logout() {
      authService.logout();
      patchState(store, initialState);
    }

  })),

  withHooks({
    onInit(store, authService = inject(AuthService)) {
      const user = authService.currentUser();
      if (user) {
        patchState(store, { user });
      }
    }
  })
);