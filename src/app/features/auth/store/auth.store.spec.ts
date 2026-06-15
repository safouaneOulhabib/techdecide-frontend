import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth.model';

const mockUser = (overrides: Partial<AuthResponse> = {}): AuthResponse => ({
  id: 1,
  token: 'tok',
  email: 'alice@test.com',
  name: 'Alice',
  appRole: 'USER',
  teamRole: 'TEAM_ADMIN',
  teamId: 1,
  ...overrides,
});

const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  currentUser: vi.fn().mockReturnValue(null),
};

const mockRouter = { navigate: vi.fn() };

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService.currentUser.mockReturnValue(null);
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
    store = TestBed.inject(AuthStore);
  });

  it('has correct initial state when no session', () => {
    expect(store.user()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('rehydrates user from session on init', () => {
    const user = mockUser();
    mockAuthService.currentUser.mockReturnValue(user);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
    const freshStore = TestBed.inject(AuthStore);
    expect(freshStore.user()).toEqual(user);
  });

  describe('computed: isAppAdmin', () => {
    it('true when appRole=APP_ADMIN', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ appRole: 'APP_ADMIN' })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isAppAdmin()).toBe(true);
    });

    it('false when appRole=USER', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ appRole: 'USER' })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isAppAdmin()).toBe(false);
    });

    it('false when no user', () => {
      expect(store.isAppAdmin()).toBe(false);
    });
  });

  describe('computed: isTeamAdmin', () => {
    it('true when teamRole=TEAM_ADMIN', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ teamRole: 'TEAM_ADMIN' })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isTeamAdmin()).toBe(true);
    });

    it('false when teamRole=MEMBER', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ teamRole: 'MEMBER' })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isTeamAdmin()).toBe(false);
    });
  });

  describe('computed: isTeamAdminOrAppAdmin', () => {
    it('true when APP_ADMIN', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ appRole: 'APP_ADMIN', teamRole: null })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isTeamAdminOrAppAdmin()).toBe(true);
    });

    it('true when TEAM_ADMIN', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ appRole: 'USER', teamRole: 'TEAM_ADMIN' })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isTeamAdminOrAppAdmin()).toBe(true);
    });

    it('false when MEMBER and USER', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ appRole: 'USER', teamRole: 'MEMBER' })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.isTeamAdminOrAppAdmin()).toBe(false);
    });
  });

  describe('computed: hasTeam', () => {
    it('true when teamId is set', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ teamId: 1 })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.hasTeam()).toBe(true);
    });

    it('false when teamId is null', () => {
      mockAuthService.login.mockReturnValue(of(mockUser({ teamId: null })));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.hasTeam()).toBe(false);
    });
  });

  describe('login', () => {
    it('sets user and navigates to /decisions on success', () => {
      const user = mockUser();
      mockAuthService.login.mockReturnValue(of(user));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.user()).toEqual(user);
      expect(store.loading()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/decisions']);
    });

    it('sets error on failure', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
      store.login({ email: 'a@b.com', password: 'wrong' });
      expect(store.error()).toBe('Invalid credentials');
      expect(store.user()).toBeNull();
    });

    it('uses fallback error message', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({})));
      store.login({ email: 'a@b.com', password: 'wrong' });
      expect(store.error()).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('clears user state and calls authService.logout', () => {
      mockAuthService.login.mockReturnValue(of(mockUser()));
      store.login({ email: 'a@b.com', password: 'p' });
      expect(store.user()).not.toBeNull();
      store.logout();
      expect(store.user()).toBeNull();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('sets user and navigates to /decisions on success', () => {
      const user = mockUser({ email: 'new@test.com', name: 'New User' });
      mockAuthService.register.mockReturnValue(of(user));
      store.register({ name: 'New User', email: 'new@test.com', password: 'Pass1234!' });
      expect(store.user()).toEqual(user);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/decisions']);
    });

    it('sets error message on failure', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Email already taken' } }))
      );
      store.register({ name: 'X', email: 'x@test.com', password: 'Pass1234!' });
      expect(store.user()).toBeNull();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Email already taken');
    });

    it('uses fallback error message when server sends no message', () => {
      mockAuthService.register.mockReturnValue(throwError(() => ({})));
      store.register({ name: 'X', email: 'x@test.com', password: 'Pass1234!' });
      expect(store.error()).toBe('Registration failed');
    });
  });
});
