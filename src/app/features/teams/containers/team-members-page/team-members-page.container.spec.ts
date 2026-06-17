import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TeamMembersPageContainer } from './team-members-page.container';
import { TeamMemberStore } from '@features/teams/store/team-member.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { TeamMember } from '@features/teams/models/team-member.model';

const makeMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  userId: 1, name: 'Alice Smith', email: 'alice@test.com',
  teamRole: 'MEMBER', teamId: 1, createdAt: '2024-01-01T00:00:00',
  ...overrides,
});

describe('TeamMembersPageContainer — computed signals', () => {
  let members$: ReturnType<typeof signal<TeamMember[]>>;
  let isAppAdmin$: ReturnType<typeof signal<boolean>>;
  let isTeamAdminOrAppAdmin$: ReturnType<typeof signal<boolean>>;

  const mockRoute = { paramMap: { subscribe: vi.fn() } };
  const mockRouter = { navigate: vi.fn() };
  const mockLocation = { back: vi.fn() };

  beforeEach(() => {
    members$ = signal<TeamMember[]>([]);
    isAppAdmin$ = signal(false);
    isTeamAdminOrAppAdmin$ = signal(false);

    const mockTeamMemberStore = {
      members: members$,
      availableUsers: signal([]),
      loading: signal(false),
      error: signal<string | null>(null),
      loadMembers: vi.fn(),
      loadAvailableUsers: vi.fn(),
      assignMember: vi.fn(),
      removeMember: vi.fn(),
      changeRole: vi.fn(),
      clearMembers: vi.fn(),
    };

    const mockAuthStore = {
      user: signal(null),
      isAppAdmin: isAppAdmin$,
      isTeamAdmin: signal(false),
      isTeamAdminOrAppAdmin: isTeamAdminOrAppAdmin$,
      hasTeam: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [TeamMembersPageContainer],
      providers: [
        { provide: TeamMemberStore, useValue: mockTeamMemberStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe('statsTotal', () => {
    it('returns 0 when no members', () => {
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.statsTotal()).toBe(0);
    });

    it('TM-15 returns correct count', () => {
      members$.set([makeMember({ userId: 1 }), makeMember({ userId: 2 })]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.statsTotal()).toBe(2);
    });
  });

  describe('statsTeamAdmins', () => {
    it('TM-15 counts only TEAM_ADMIN roles', () => {
      members$.set([
        makeMember({ userId: 1, teamRole: 'TEAM_ADMIN' }),
        makeMember({ userId: 2, teamRole: 'MEMBER' }),
        makeMember({ userId: 3, teamRole: 'TEAM_ADMIN' }),
      ]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.statsTeamAdmins()).toBe(2);
    });

    it('returns 0 when all are MEMBER', () => {
      members$.set([makeMember(), makeMember({ userId: 2 })]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.statsTeamAdmins()).toBe(0);
    });
  });

  describe('filteredMembers', () => {
    it('returns all members when no filter', () => {
      members$.set([makeMember({ userId: 1 }), makeMember({ userId: 2, name: 'Bob Jones' })]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.filteredMembers().length).toBe(2);
    });

    it('TM-17 filters by name (case-insensitive)', () => {
      members$.set([
        makeMember({ userId: 1, name: 'Alice Smith', email: 'alice@corp.com' }),
        makeMember({ userId: 2, name: 'Bob Jones', email: 'bob@corp.com' }),
      ]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      const comp = fixture.componentInstance;
      comp.searchTerm.set('alice');
      expect(comp.filteredMembers().length).toBe(1);
      expect(comp.filteredMembers()[0].name).toBe('Alice Smith');
    });

    it('TM-17 filters by email', () => {
      members$.set([
        makeMember({ userId: 1, email: 'alice@corp.com', name: 'Alice' }),
        makeMember({ userId: 2, email: 'bob@corp.com', name: 'Bob' }),
      ]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      const comp = fixture.componentInstance;
      comp.searchTerm.set('alice');
      expect(comp.filteredMembers().length).toBe(1);
    });

    it('TM-18 filters by role', () => {
      members$.set([
        makeMember({ userId: 1, teamRole: 'TEAM_ADMIN' }),
        makeMember({ userId: 2, teamRole: 'MEMBER' }),
      ]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      const comp = fixture.componentInstance;
      comp.roleFilter.set('TEAM_ADMIN');
      expect(comp.filteredMembers().length).toBe(1);
      expect(comp.filteredMembers()[0].teamRole).toBe('TEAM_ADMIN');
    });

    it('TM-17 TM-18 combines name filter and role filter', () => {
      members$.set([
        makeMember({ userId: 1, name: 'Alice', email: 'alice1@corp.com', teamRole: 'TEAM_ADMIN' }),
        makeMember({ userId: 2, name: 'Alice', email: 'alice2@corp.com', teamRole: 'MEMBER' }),
        makeMember({ userId: 3, name: 'Bob', email: 'bob@corp.com', teamRole: 'TEAM_ADMIN' }),
      ]);
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      const comp = fixture.componentInstance;
      comp.searchTerm.set('alice');
      comp.roleFilter.set('TEAM_ADMIN');
      expect(comp.filteredMembers().length).toBe(1);
      expect(comp.filteredMembers()[0].userId).toBe(1);
    });
  });

  describe('getInitials', () => {
    it('extracts two initials from two-word name', () => {
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.getInitials('Alice Smith')).toBe('AS');
    });

    it('extracts one initial from single-word name', () => {
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.getInitials('Alice')).toBe('A');
    });

    it('caps at two chars for longer names', () => {
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.getInitials('Alice Bob Charlie').length).toBe(2);
    });

    it('returns uppercase', () => {
      const fixture = TestBed.createComponent(TeamMembersPageContainer);
      expect(fixture.componentInstance.getInitials('alice smith')).toBe('AS');
    });
  });
});

// Cross-team guard tests need a route that fires its callback so teamId gets set.
describe('TeamMembersPageContainer — cross-team access guard (effect)', () => {
  let members$: ReturnType<typeof signal<TeamMember[]>>;
  let loading$: ReturnType<typeof signal<boolean>>;
  let isAppAdmin$: ReturnType<typeof signal<boolean>>;
  let user$: ReturnType<typeof signal<{ id: number } | null>>;

  const mockRouter = { navigate: vi.fn() };

  // Route that calls the paramMap subscriber immediately with teamId=1
  const mockRoute = {
    paramMap: {
      subscribe: vi.fn((cb: (p: { get: (k: string) => string | null }) => void) => {
        cb({ get: (key: string) => (key === 'id' ? '1' : null) });
      }),
    },
  };

  beforeEach(() => {
    members$ = signal<TeamMember[]>([]);
    loading$ = signal(false);
    isAppAdmin$ = signal(false);
    user$ = signal<{ id: number } | null>(null);
    vi.clearAllMocks();

    const mockTeamMemberStore = {
      members: members$,
      availableUsers: signal([]),
      loading: loading$,
      error: signal<string | null>(null),
      loadMembers: vi.fn(),
      loadAvailableUsers: vi.fn(),
      assignMember: vi.fn(),
      removeMember: vi.fn(),
      changeRole: vi.fn(),
      clearMembers: vi.fn(),
    };

    const mockAuthStore = {
      user: user$,
      isAppAdmin: isAppAdmin$,
      isTeamAdmin: signal(false),
      isTeamAdminOrAppAdmin: signal(false),
      hasTeam: signal(true),
    };

    TestBed.configureTestingModule({
      imports: [TeamMembersPageContainer],
      providers: [
        { provide: TeamMemberStore, useValue: mockTeamMemberStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: { back: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('TM-07 TM-12 TM-14 redirects to /decisions when user is NOT a member of the team', () => {
    user$.set({ id: 42 });
    members$.set([makeMember({ userId: 99 })]); // userId 42 is not in the list

    const fixture = TestBed.createComponent(TeamMembersPageContainer);
    fixture.detectChanges(); // ngOnInit sets teamId=1; effect fires

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/decisions']);
  });

  it('TM-08 does NOT redirect when the current user IS a member of the team', () => {
    user$.set({ id: 42 });
    members$.set([makeMember({ userId: 42 })]); // current user is present

    const fixture = TestBed.createComponent(TeamMembersPageContainer);
    fixture.detectChanges();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('does NOT redirect when isAppAdmin is true (APP_ADMIN bypasses team check)', () => {
    user$.set({ id: 1 });
    isAppAdmin$.set(true);
    members$.set([makeMember({ userId: 99 })]); // user not in list, but is APP_ADMIN

    const fixture = TestBed.createComponent(TeamMembersPageContainer);
    fixture.detectChanges();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('does NOT redirect while the store is still loading', () => {
    user$.set({ id: 1 });
    loading$.set(true);
    members$.set([]); // no members loaded yet

    const fixture = TestBed.createComponent(TeamMembersPageContainer);
    fixture.detectChanges();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('TM-09 hides the add member panel for MEMBER users', () => {
    user$.set({ id: 42 });
    members$.set([makeMember({ userId: 42 })]);

    const fixture = TestBed.createComponent(TeamMembersPageContainer);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-team-member-add')).toBeNull();
  });
});
