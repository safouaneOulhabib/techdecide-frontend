import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { TagStore } from './tag.store';
import { TagService } from '../services/tag.service';
import { Tag } from '../models/tag.model';

const mockTag = (overrides: Partial<Tag> = {}): Tag => ({
  id: 1, name: 'architecture', color: '#3b82f6', ...overrides,
});

const mockService = {
  getAll: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
};

describe('TagStore', () => {
  let store: InstanceType<typeof TagStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        TagStore,
        { provide: TagService, useValue: mockService },
      ],
    });
    store = TestBed.inject(TagStore);
  });

  it('has correct initial state', () => {
    expect(store.tags()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadAll', () => {
    it('populates tags on success', () => {
      mockService.getAll.mockReturnValue(of([mockTag({ id: 1 }), mockTag({ id: 2, name: 'security' })]));
      store.loadAll();
      expect(store.tags().length).toBe(2);
      expect(store.loading()).toBe(false);
    });

    it('sets error on failure', () => {
      mockService.getAll.mockReturnValue(throwError(() => ({ error: { message: 'Failed' } })));
      store.loadAll();
      expect(store.error()).toBe('Failed');
    });
  });

  describe('create', () => {
    it('appends new tag to list', () => {
      mockService.create.mockReturnValue(of(mockTag({ id: 5, name: 'performance' })));
      store.create({ name: 'performance', color: '#22c55e' });
      expect(store.tags().length).toBe(1);
      expect(store.tags()[0].name).toBe('performance');
    });

    it('sets error on failure', () => {
      mockService.create.mockReturnValue(throwError(() => ({ error: { message: 'Name taken' } })));
      store.create({ name: 'dup', color: '#fff' });
      expect(store.error()).toBe('Name taken');
    });
  });

  describe('remove', () => {
    it('removes tag from list', () => {
      mockService.getAll.mockReturnValue(of([mockTag({ id: 1 }), mockTag({ id: 2 })]));
      store.loadAll();
      mockService.remove.mockReturnValue(of(null));
      store.remove(1);
      expect(store.tags().length).toBe(1);
      expect(store.tags()[0].id).toBe(2);
    });

    it('sets error on failure', () => {
      mockService.remove.mockReturnValue(throwError(() => ({ error: { message: 'Cannot delete' } })));
      store.remove(99);
      expect(store.error()).toBe('Cannot delete');
    });
  });
});
