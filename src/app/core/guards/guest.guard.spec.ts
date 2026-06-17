import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { guestGuard } from './guest.guard';
import { AuthService } from '@features/auth/services/auth.service';

const mockAuthService = { isAuthenticated: vi.fn() };
const mockRouter = { navigate: vi.fn() };

function run(): boolean {
  return TestBed.runInInjectionContext(() =>
    guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  ) as boolean;
}

describe('guestGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('AUTH-11 redirects authenticated user visiting /auth/login to /decisions', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = run();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/decisions']);
    expect(result).toBe(false);
  });

  it('allows unauthenticated user to reach the login page', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = run();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
