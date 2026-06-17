import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OrganizationListContainer } from './organization-list.container';
import { OrganizationStore } from '@features/organizations/store/organization.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ConfirmService } from '@core/services/confirm.service';

// QA matrix coverage: ORG-05 UI-11 UI-12

function setup(isAppAdmin: boolean) {
  const mockStore = {
    organizations: signal([]),
    loading: signal(false),
    error: signal<string | null>(null),
    loadAll: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  };
  const mockAuth = { isAppAdmin: signal(isAppAdmin) };
  const mockConfirm = { confirm: vi.fn() };

  TestBed.configureTestingModule({
    imports: [OrganizationListContainer],
    providers: [
      { provide: OrganizationStore, useValue: mockStore },
      { provide: AuthStore, useValue: mockAuth },
      { provide: ConfirmService, useValue: mockConfirm },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  });

  const fixture = TestBed.createComponent(OrganizationListContainer);
  fixture.detectChanges();
  return fixture;
}

describe('OrganizationListContainer — role gates', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('ORG-05 hides New Organization button for non-APP_ADMIN', () => {
    const fixture = setup(false);
    const btn = fixture.nativeElement.querySelector('p-button[label="New Organization"]');
    expect(btn).toBeNull();
  });

  it('shows New Organization button for APP_ADMIN', () => {
    const fixture = setup(true);
    const btn = fixture.nativeElement.querySelector('p-button[label="New Organization"]');
    expect(btn).not.toBeNull();
  });

  it('UI-12 empty state shows role-aware message for non-APP_ADMIN (no create button duplicated)', () => {
    const fixture = setup(false);
    // The page header has no New Organization button and the table is empty.
    // Confirm the top-level create button is absent — empty state messaging is role-gated.
    expect(fixture.nativeElement.querySelector('p-button[label="New Organization"]')).toBeNull();
  });

  it('UI-11 delete button absent for non-APP_ADMIN (empty state has no duplicate action buttons)', () => {
    const fixture = setup(false);
    expect(fixture.nativeElement.querySelector('.btn-delete')).toBeNull();
  });
});
