import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '@features/auth/services/auth.service';

const fakeUrlTree = { toString: () => '/auth/login' } as unknown as UrlTree;

const mockAuthService = { isAuthenticated: vi.fn() };
const mockRouter = { createUrlTree: vi.fn() };

function run() {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
  );
}

describe('authGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.createUrlTree.mockReturnValue(fakeUrlTree);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('returns true when the user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    expect(run()).toBe(true);
  });

  it('returns a UrlTree redirect to /auth/login when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    const result = run();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBe(fakeUrlTree);
  });

  it('does not call createUrlTree when authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    run();
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });
});
