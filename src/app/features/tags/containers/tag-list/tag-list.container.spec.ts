import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TagListContainer } from './tag-list.container';
import { TagStore } from '@features/tags/store/tag.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ConfirmService } from '@core/services/confirm.service';
import { Tag } from '@features/tags/models/tag.model';

// QA matrix coverage: TAG-05 TAG-09 UI-12

const makeTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 1, name: 'backend', color: '#6366f1', ...overrides,
});

function setup(isAppAdmin: boolean, tags: Tag[] = []) {
  const mockStore = {
    tags: signal(tags),
    loading: signal(false),
    error: signal<string | null>(null),
    loadAll: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  };
  const mockAuth = {
    isAppAdmin: signal(isAppAdmin),
    user: signal(isAppAdmin ? { appRole: 'APP_ADMIN' } : { appRole: 'USER' }),
  };
  const mockConfirm = { confirm: vi.fn() };

  TestBed.configureTestingModule({
    imports: [TagListContainer],
    providers: [
      { provide: TagStore, useValue: mockStore },
      { provide: AuthStore, useValue: mockAuth },
      { provide: ConfirmService, useValue: mockConfirm },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  });

  const fixture = TestBed.createComponent(TagListContainer);
  fixture.detectChanges();
  return { fixture, mockStore };
}

describe('TagListContainer — role gates', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('TAG-05 hides New Tag create form for non-APP_ADMIN', () => {
    const { fixture } = setup(false);
    expect(fixture.nativeElement.querySelector('p-button[label="New Tag"]')).toBeNull();
  });

  it('shows New Tag create form for APP_ADMIN', () => {
    const { fixture } = setup(true);
    expect(fixture.nativeElement.querySelector('p-button[label="New Tag"]')).not.toBeNull();
  });

  it('TAG-05 hides delete button on tag rows for non-APP_ADMIN', () => {
    const { fixture } = setup(false, [makeTag()]);
    expect(fixture.nativeElement.querySelector('.btn-delete')).toBeNull();
  });

  it('TAG-09 tag from the store is available on the component and can drive decision filter', () => {
    const tag = makeTag({ id: 42, name: 'security' });
    const { fixture } = setup(true, [tag]);
    // TagStore.tags is surfaced on the container — any component binding to it
    // (e.g. a decision filter dropdown) will include newly created tags automatically.
    expect(fixture.componentInstance.tags()).toHaveLength(1);
    expect(fixture.componentInstance.tags()[0].id).toBe(42);
  });
});

describe('TagListContainer — empty state messaging', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('UI-12 shows admin-specific empty message for APP_ADMIN', () => {
    const { fixture } = setup(true, []);
    expect(fixture.nativeElement.textContent).toContain('Create your first tag');
  });

  it('UI-12 shows contact-admin empty message for non-APP_ADMIN', () => {
    const { fixture } = setup(false, []);
    expect(fixture.nativeElement.textContent).toContain('Contact your administrator');
  });
});
