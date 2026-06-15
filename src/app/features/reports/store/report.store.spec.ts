import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ReportStore } from './report.store';
import { ReportService } from '../services/report.service';
import { Report, ReportSummary } from '../models/report.model';

const mockReport = (overrides: Partial<Report> = {}): Report => ({
  id: 1,
  title: 'Q1 Review',
  introduction: null,
  authorId: 1,
  authorName: 'Alice',
  projectId: 1,
  projectName: 'GTN',
  createdAt: '2024-01-01T00:00:00',
  updatedAt: null,
  items: [],
  ...overrides,
});

const mockSummary = (overrides: Partial<ReportSummary> = {}): ReportSummary => ({
  id: 1,
  title: 'Q1 Review',
  introduction: null,
  authorId: 1,
  authorName: 'Alice',
  projectId: 1,
  projectName: 'GTN',
  createdAt: '2024-01-01T00:00:00',
  updatedAt: null,
  itemCount: 0,
  statusCounts: {},
  ...overrides,
});

const mockService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('ReportStore', () => {
  let store: InstanceType<typeof ReportStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ReportStore,
        { provide: ReportService, useValue: mockService },
      ],
    });
    store = TestBed.inject(ReportStore);
  });

  it('has correct initial state', () => {
    expect(store.reports()).toEqual([]);
    expect(store.selectedReport()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadAll', () => {
    it('populates reports on success', () => {
      const summaries = [mockSummary({ id: 1 }), mockSummary({ id: 2 })];
      mockService.getAll.mockReturnValue(of(summaries));
      store.loadAll();
      expect(store.reports()).toEqual(summaries);
      expect(store.loading()).toBe(false);
    });

    it('sets error on failure', () => {
      mockService.getAll.mockReturnValue(throwError(() => ({ error: { message: 'Network error' } })));
      store.loadAll();
      expect(store.error()).toBe('Network error');
      expect(store.loading()).toBe(false);
    });
  });

  describe('loadById', () => {
    it('sets selectedReport on success', () => {
      const report = mockReport({ id: 5 });
      mockService.getById.mockReturnValue(of(report));
      store.loadById(5);
      expect(store.selectedReport()).toEqual(report);
    });

    it('sets error on failure', () => {
      mockService.getById.mockReturnValue(throwError(() => ({ error: { message: 'Not found' } })));
      store.loadById(99);
      expect(store.error()).toBe('Not found');
    });
  });

  describe('create', () => {
    it('appends summary to reports list on success', () => {
      const report = mockReport({
        id: 10,
        items: [{ id: 1, originalDecisionId: 1, decisionTitle: 'D1', decisionStatus: 'APPROVED', decisionContext: null, decisionContent: null, decisionConsequences: null, decisionTeamName: null, decisionAuthorName: null, decisionCreatedAt: null, alternatives: [], position: 0 }],
      });
      mockService.create.mockReturnValue(of(report));
      store.create({ projectId: 1, title: 'Q1 Review', introduction: null, decisionIds: [1] }).subscribe();
      expect(store.reports().length).toBe(1);
      expect(store.reports()[0].id).toBe(10);
      expect(store.reports()[0].itemCount).toBe(1);
    });

    it('builds statusCounts from items', () => {
      const report = mockReport({
        id: 10,
        items: [
          { id: 1, originalDecisionId: 1, decisionTitle: 'D1', decisionStatus: 'APPROVED', decisionContext: null, decisionContent: null, decisionConsequences: null, decisionTeamName: null, decisionAuthorName: null, decisionCreatedAt: null, alternatives: [], position: 0 },
          { id: 2, originalDecisionId: 2, decisionTitle: 'D2', decisionStatus: 'APPROVED', decisionContext: null, decisionContent: null, decisionConsequences: null, decisionTeamName: null, decisionAuthorName: null, decisionCreatedAt: null, alternatives: [], position: 1 },
          { id: 3, originalDecisionId: 3, decisionTitle: 'D3', decisionStatus: 'REJECTED', decisionContext: null, decisionContent: null, decisionConsequences: null, decisionTeamName: null, decisionAuthorName: null, decisionCreatedAt: null, alternatives: [], position: 2 },
        ],
      });
      mockService.create.mockReturnValue(of(report));
      store.create({ projectId: 1, title: 'Q1 Review', introduction: null, decisionIds: [1, 2, 3] }).subscribe();
      expect(store.reports()[0].statusCounts).toEqual({ APPROVED: 2, REJECTED: 1 });
    });

    it('sets error on failure', () => {
      mockService.create.mockReturnValue(throwError(() => ({ error: { message: 'Create failed' } })));
      store.create({ projectId: 1, title: 'Q1', introduction: null, decisionIds: [] }).subscribe({ error: () => {} });
      expect(store.error()).toBe('Create failed');
    });
  });

  describe('remove', () => {
    it('removes report from list', () => {
      mockService.getAll.mockReturnValue(of([mockSummary({ id: 1 }), mockSummary({ id: 2 })]));
      store.loadAll();
      mockService.remove.mockReturnValue(of(null));
      store.remove(1);
      expect(store.reports().length).toBe(1);
      expect(store.reports()[0].id).toBe(2);
    });
  });

  describe('clearSelected', () => {
    it('resets selectedReport to null', () => {
      mockService.getById.mockReturnValue(of(mockReport()));
      store.loadById(1);
      store.clearSelected();
      expect(store.selectedReport()).toBeNull();
    });
  });
});
