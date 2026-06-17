import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { TeamListContainer } from './team-list.container';
import { TeamStore } from '@features/teams/store/team.store';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ConfirmService } from '@core/services/confirm.service';

// QA matrix coverage: TEAM-05

function setup(isAppAdmin: boolean, hasTeam = true) {
  const mockTeamStore = {
    teams: signal([]),
    loading: signal(false),
    error: signal<string | null>(null),
    loadAll: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  };
  const mockOrgStore = {
    organizations: signal([]),
    loadAll: vi.fn(),
  };
  const mockAuth = {
    isAppAdmin: signal(isAppAdmin),
    hasTeam: signal(hasTeam),
  };
  const mockConfirm = { confirm: vi.fn() };
  const mockRouter = { navigate: vi.fn() };

  TestBed.configureTestingModule({
    imports: [TeamListContainer],
    providers: [
      { provide: TeamStore, useValue: mockTeamStore },
      { provide: OrganizationStore, useValue: mockOrgStore },
      { provide: AuthStore, useValue: mockAuth },
      { provide: ConfirmService, useValue: mockConfirm },
      { provide: Router, useValue: mockRouter },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  });

  const fixture = TestBed.createComponent(TeamListContainer);
  fixture.detectChanges();
  return fixture;
}

describe('TeamListContainer — role gates', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TEAM-05 hides New Team button for non-APP_ADMIN', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('p-button[label="New Team"]')).toBeNull();
  });

  it('shows New Team button for APP_ADMIN', () => {
    const fixture = setup(true);
    expect(fixture.nativeElement.querySelector('p-button[label="New Team"]')).not.toBeNull();
  });

  it('TEAM-05 delete button absent for non-APP_ADMIN member with a team', () => {
    const fixture = setup(false, true);
    expect(fixture.nativeElement.querySelector('.btn-delete')).toBeNull();
  });

  it('shows lock empty state for non-APP_ADMIN without a team', () => {
    const fixture = setup(false, false);
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('not assigned to a team');
  });
});
