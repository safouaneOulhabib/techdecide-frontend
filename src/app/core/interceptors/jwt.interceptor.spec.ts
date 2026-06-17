import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpRequest, HttpResponse, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '@features/auth/services/auth.service';

const mockAuthService = {
  getToken: vi.fn(),
  logout: vi.fn(),
};

function run(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  return TestBed.runInInjectionContext(() => jwtInterceptor(req, next));
}

const GET = (url: string) => new HttpRequest('GET', url);
const POST = (url: string) => new HttpRequest('POST', url, null);

describe('jwtInterceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    });
  });

  describe('token attachment', () => {
    it('attaches Authorization: Bearer header to protected requests', () => {
      mockAuthService.getToken.mockReturnValue('my-jwt');
      let captured!: HttpRequest<unknown>;
      const next: HttpHandlerFn = (r) => {
        captured = r as HttpRequest<unknown>;
        return of(new HttpResponse({ status: 200 }));
      };

      run(GET('/api/decisions'), next).subscribe();

      expect(captured.headers.get('Authorization')).toBe('Bearer my-jwt');
    });

    it('passes request through unchanged when there is no token', () => {
      mockAuthService.getToken.mockReturnValue(null);
      let captured!: HttpRequest<unknown>;
      const next: HttpHandlerFn = (r) => {
        captured = r as HttpRequest<unknown>;
        return of(new HttpResponse({ status: 200 }));
      };

      run(GET('/api/decisions'), next).subscribe();

      expect(captured.headers.get('Authorization')).toBeNull();
    });
  });

  describe('auth endpoint skip (prevents stale-token poisoning)', () => {
    it('does NOT attach token to /auth/login even when a token exists', () => {
      mockAuthService.getToken.mockReturnValue('stale-token');
      let captured!: HttpRequest<unknown>;
      const next: HttpHandlerFn = (r) => {
        captured = r as HttpRequest<unknown>;
        return of(new HttpResponse({ status: 200 }));
      };

      run(POST('/auth/login'), next).subscribe();

      expect(captured.headers.get('Authorization')).toBeNull();
    });

    it('does NOT attach token to /auth/register', () => {
      mockAuthService.getToken.mockReturnValue('stale-token');
      let captured!: HttpRequest<unknown>;
      const next: HttpHandlerFn = (r) => {
        captured = r as HttpRequest<unknown>;
        return of(new HttpResponse({ status: 200 }));
      };

      run(POST('/auth/register'), next).subscribe();

      expect(captured.headers.get('Authorization')).toBeNull();
    });
  });

  describe('401 error handling', () => {
    it('SEC-09 calls authService.logout() when a protected request returns 401', () => {
      mockAuthService.getToken.mockReturnValue('expired-token');
      const next: HttpHandlerFn = () =>
        throwError(() => new HttpErrorResponse({ status: 401 }));

      run(GET('/api/decisions'), next).subscribe({ error: () => {} });

      expect(mockAuthService.logout).toHaveBeenCalledOnce();
    });

    it('does NOT call logout on 401 from /auth/login (prevents redirect loops)', () => {
      mockAuthService.getToken.mockReturnValue(null);
      const next: HttpHandlerFn = () =>
        throwError(() => new HttpErrorResponse({ status: 401 }));

      run(POST('/auth/login'), next).subscribe({ error: () => {} });

      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it('does NOT call logout on non-401 errors', () => {
      mockAuthService.getToken.mockReturnValue('token');
      const next: HttpHandlerFn = () =>
        throwError(() => new HttpErrorResponse({ status: 403 }));

      run(GET('/api/decisions'), next).subscribe({ error: () => {} });

      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it('re-throws the original error regardless of status', () => {
      mockAuthService.getToken.mockReturnValue('token');
      const err = new HttpErrorResponse({ status: 500 });
      const next: HttpHandlerFn = () => throwError(() => err);
      let caught: unknown;

      run(GET('/api/decisions'), next).subscribe({
        error: (e) => { caught = e; },
      });

      expect(caught).toBe(err);
    });
  });
});
