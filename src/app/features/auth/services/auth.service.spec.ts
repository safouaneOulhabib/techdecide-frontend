import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

// Encodes a JWT payload into a minimal JWT string (header.payload.sig)
function makeToken(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.sig`;
}

const mockRouter = { navigate: vi.fn() };
const mockHttpClient = { post: vi.fn() };

describe('AuthService — isTokenExpired (via loadFromSession)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter },
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads a valid non-expired token from localStorage on init', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeToken({ sub: 'alice@test.com', exp: futureExp });
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1, token, email: 'alice@test.com', name: 'Alice',
      appRole: 'USER', teamRole: 'MEMBER', teamId: 1,
    }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).toBe(token);
  });

  it('clears an expired token from localStorage on init', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 1;
    const token = makeToken({ sub: 'alice@test.com', exp: pastExp });
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1, token, email: 'alice@test.com', name: 'Alice',
      appRole: 'USER', teamRole: 'MEMBER', teamId: 1,
    }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('treats a token with missing exp as valid (non-standard JWT trusted by default)', () => {
    // Intentional design: if exp is absent the service cannot confirm expiry,
    // so it trusts the token. The server will reject it if invalid.
    const token = makeToken({ sub: 'alice@test.com' }); // no exp field
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1, token, email: 'alice@test.com', name: 'Alice',
      appRole: 'USER', teamRole: 'MEMBER', teamId: 1,
    }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('treats a token with a non-number exp as valid (same "trust by default" rule)', () => {
    const token = makeToken({ sub: 'alice@test.com', exp: 'not-a-number' });
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1, token, email: 'alice@test.com', name: 'Alice',
      appRole: 'USER', teamRole: 'MEMBER', teamId: 1,
    }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears storage when the JWT is malformed (cannot decode payload)', () => {
    localStorage.setItem('auth_user', JSON.stringify({
      id: 1, token: 'not.a.jwt',
      email: 'alice@test.com', name: 'Alice',
      appRole: 'USER', teamRole: 'MEMBER', teamId: 1,
    }));

    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});
