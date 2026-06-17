import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectListContainer } from './project-list.container';
import { ProjectStore } from '@features/projects/store/project.store';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ConfirmService } from '@core/services/confirm.service';

// QA matrix coverage: PROJ-10

function setup(isAppAdmin: boolean, hasTeam = true) {
  const mockProjectStore = {
    projects: signal([]),
    projectTeams: signal([]),
    loading: signal(false),
    error: signal<string | null>(null),
    loadAll: vi.fn(),
    loadTeams: vi.fn(),
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
    imports: [ProjectListContainer],
    providers: [
      { provide: ProjectStore, useValue: mockProjectStore },
      { provide: OrganizationStore, useValue: mockOrgStore },
      { provide: AuthStore, useValue: mockAuth },
      { provide: ConfirmService, useValue: mockConfirm },
      { provide: Router, useValue: mockRouter },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  });

  const fixture = TestBed.createComponent(ProjectListContainer);
  fixture.detectChanges();
  return fixture;
}

describe('ProjectListContainer — role gates', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PROJ-10 hides New Project button for non-APP_ADMIN', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('p-button[label="New Project"]')).toBeNull();
  });

  it('shows New Project button for APP_ADMIN', () => {
    const fixture = setup(true);
    expect(fixture.nativeElement.querySelector('p-button[label="New Project"]')).not.toBeNull();
  });

  it('shows lock empty state for non-APP_ADMIN without a team', () => {
    const fixture = setup(false, false);
    expect(fixture.nativeElement.querySelector('.empty-state')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('not assigned');
  });
});
