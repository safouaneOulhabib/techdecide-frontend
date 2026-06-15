import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Subject, of, throwError } from 'rxjs';
import { DecisionStore } from './decision.store';
import { DecisionService } from '../services/decision.service';
import { Decision } from '../models/decision.model';

const mockDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1,
  title: 'Test Decision',
  context: 'ctx',
  decision: 'dec',
  consequences: '',
  status: 'DRAFT',
  supersededById: null,
  supersededByTitle: null,
  authorId: 1,
  authorName: 'Alice',
  projectId: 1,
  projectName: 'GTN',
  teams: [],
  canVote: false,
  canGovern: false,
  canPropose: true,
  canEdit: true,
  canDelete: true,
  tags: [],
  alternatives: [],
  reviewDate: '',
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00',
  ...overrides,
});

const mockService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  remove: vi.fn(),
  search: vi.fn(),
};

describe('DecisionStore', () => {
  let store: InstanceType<typeof DecisionStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        DecisionStore,
        { provide: DecisionService, useValue: mockService },
      ],
    });
    store = TestBed.inject(DecisionStore);
  });

  it('has correct initial state', () => {
    expect(store.decisions()).toEqual([]);
    expect(store.selectedDecision()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('computed signals', () => {
    it('totalDecisions counts all decisions', () => {
      mockService.getAll.mockReturnValue(of([mockDecision({ id: 1 }), mockDecision({ id: 2 })]));
      TestBed.runInInjectionContext(() => store.loadAll());
      expect(store.totalDecisions()).toBe(2);
    });

    it('approvedDecisions filters APPROVED only', () => {
      mockService.getAll.mockReturnValue(of([
        mockDecision({ id: 1, status: 'APPROVED' }),
        mockDecision({ id: 2, status: 'DRAFT' }),
        mockDecision({ id: 3, status: 'APPROVED' }),
      ]));
      TestBed.runInInjectionContext(() => store.loadAll());
      expect(store.approvedDecisions().length).toBe(2);
      expect(store.approvedDecisions().every(d => d.status === 'APPROVED')).toBe(true);
    });

    it('draftDecisions filters DRAFT only', () => {
      mockService.getAll.mockReturnValue(of([
        mockDecision({ id: 1, status: 'DRAFT' }),
        mockDecision({ id: 2, status: 'PROPOSED' }),
      ]));
      TestBed.runInInjectionContext(() => store.loadAll());
      expect(store.draftDecisions().length).toBe(1);
      expect(store.draftDecisions()[0].status).toBe('DRAFT');
    });
  });

  describe('loadAll', () => {
    it('sets loading=true then populates decisions on success', () => {
      const decisions = [mockDecision()];
      mockService.getAll.mockReturnValue(of(decisions));
      store.loadAll();
      expect(store.decisions()).toEqual(decisions);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('sets error and clears loading on failure', () => {
      mockService.getAll.mockReturnValue(throwError(() => ({ error: { message: 'Server error' } })));
      store.loadAll();
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Server error');
    });

    it('uses fallback error message when no message in response', () => {
      mockService.getAll.mockReturnValue(throwError(() => ({})));
      store.loadAll();
      expect(store.error()).toBe('Failed to load decisions');
    });
  });

  describe('loadById', () => {
    it('sets selectedDecision on success', () => {
      const d = mockDecision({ id: 42 });
      mockService.getById.mockReturnValue(of(d));
      store.loadById(42);
      expect(store.selectedDecision()).toEqual(d);
      expect(store.loading()).toBe(false);
    });

    it('sets error on failure', () => {
      mockService.getById.mockReturnValue(throwError(() => ({ error: { message: 'Not found' } })));
      store.loadById(99);
      expect(store.error()).toBe('Not found');
      expect(store.selectedDecision()).toBeNull();
    });
  });

  describe('remove', () => {
    it('removes decision from list', () => {
      mockService.getAll.mockReturnValue(of([mockDecision({ id: 1 }), mockDecision({ id: 2 })]));
      store.loadAll();
      mockService.remove.mockReturnValue(of(null));
      store.remove(1);
      expect(store.decisions().length).toBe(1);
      expect(store.decisions()[0].id).toBe(2);
    });

    it('sets error on failure', () => {
      mockService.remove.mockReturnValue(throwError(() => ({ error: { message: 'Delete failed' } })));
      store.remove(1);
      expect(store.error()).toBe('Delete failed');
    });
  });

  describe('clearSelected', () => {
    it('resets selectedDecision to null', () => {
      mockService.getById.mockReturnValue(of(mockDecision({ id: 1 })));
      store.loadById(1);
      expect(store.selectedDecision()).not.toBeNull();
      store.clearSelected();
      expect(store.selectedDecision()).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('updates decision in list and selectedDecision', () => {
      const original = mockDecision({ id: 1, status: 'DRAFT' });
      const updated = mockDecision({ id: 1, status: 'PROPOSED' });
      mockService.getAll.mockReturnValue(of([original]));
      store.loadAll();
      mockService.updateStatus.mockReturnValue(of(updated));
      store.updateStatus(1, 'PROPOSED');
      expect(store.decisions()[0].status).toBe('PROPOSED');
      expect(store.selectedDecision()?.status).toBe('PROPOSED');
    });
  });
});
