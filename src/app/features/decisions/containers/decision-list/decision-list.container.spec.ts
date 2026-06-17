import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecisionListContainer } from './decision-list.container';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { ProjectStore } from '@features/projects/store/project.store';
import { TagStore } from '@features/tags/store/tag.store';
import { Decision } from '@features/decisions/models/decision.model';

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1, title: 'Use REST', context: 'need an API', decision: 'REST',
  consequences: '', status: 'DRAFT', supersededById: null, supersededByTitle: null,
  authorId: 1, authorName: 'Alice', projectId: 1, projectName: 'GTN',
  teams: [], tags: [], alternatives: [],
  canVote: false, canGovern: false, canPropose: false, canEdit: false, canDelete: false,
  reviewDate: '', createdAt: '', updatedAt: '',
  ...overrides,
});

describe('DecisionListContainer — filteredDecisions', () => {
  let decisions$: ReturnType<typeof signal<Decision[]>>;
  let loading$: ReturnType<typeof signal<boolean>>;
  let hasTeam$: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    decisions$ = signal<Decision[]>([]);
    loading$ = signal(false);
    hasTeam$ = signal(true);
    vi.clearAllMocks();

    const mockDecisionStore = {
      decisions: decisions$,
      loading: loading$,
      error: signal<string | null>(null),
      loadAll: vi.fn(),
      remove: vi.fn(),
    };

    const mockAuthStore = {
      user: signal(null),
      isAppAdmin: signal(false),
      hasTeam: hasTeam$,
    };

    const mockProjectStore = {
      projects: signal([]),
      loadAll: vi.fn(),
    };

    const mockTagStore = {
      tags: signal([]),
      loadAll: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [DecisionListContainer],
      providers: [
        { provide: DecisionStore, useValue: mockDecisionStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: ProjectStore, useValue: mockProjectStore },
        { provide: TagStore, useValue: mockTagStore },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe('initial state', () => {
    it('filteredDecisions returns all decisions when no filter active', () => {
      decisions$.set([makeDecision({ id: 1 }), makeDecision({ id: 2 })]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      expect(fixture.componentInstance.filteredDecisions().length).toBe(2);
    });

    it('hasTeam reflects auth store', () => {
      const fixture = TestBed.createComponent(DecisionListContainer);
      expect(fixture.componentInstance.hasTeam()).toBe(true);
    });

    it('hasTeam reflects false', () => {
      hasTeam$.set(false);
      const fixture = TestBed.createComponent(DecisionListContainer);
      expect(fixture.componentInstance.hasTeam()).toBe(false);
    });
  });

  describe('loading skeleton state', () => {
    it('UI-01 loading=true with empty list triggers skeleton condition (loading && empty)', () => {
      loading$.set(true);
      decisions$.set([]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      expect(comp.loading()).toBe(true);
      expect(comp.filteredDecisions().length).toBe(0);
      // The skeleton block condition: loading() && filteredDecisions().length === 0
      expect(comp.loading() && comp.filteredDecisions().length === 0).toBe(true);
    });

    it('UI-02 during skeleton state allDecisions is empty — no stale data surfaced', () => {
      loading$.set(true);
      decisions$.set([]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      expect(fixture.componentInstance.allDecisions()).toEqual([]);
    });

    it('UI-02 after load completes, decisions arrive and loading flag drops to false', () => {
      loading$.set(true);
      decisions$.set([]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;

      loading$.set(false);
      decisions$.set([makeDecision({ id: 1 })]);

      expect(comp.loading()).toBe(false);
      expect(comp.allDecisions().length).toBe(1);
      // Skeleton condition is now false
      expect(comp.loading() && comp.filteredDecisions().length === 0).toBe(false);
    });
  });

  describe('keyword filter', () => {
    it('LIST-06 filters by title (case-insensitive)', () => {
      decisions$.set([
        makeDecision({ id: 1, title: 'Use GraphQL', context: '' }),
        makeDecision({ id: 2, title: 'Use REST', context: '' }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: 'graphql', status: null, projectId: null, tagId: null });
      expect(comp.filteredDecisions().length).toBe(1);
      expect(comp.filteredDecisions()[0].id).toBe(1);
    });

    it('filters by context', () => {
      decisions$.set([
        makeDecision({ id: 1, title: 'D1', context: 'we need caching' }),
        makeDecision({ id: 2, title: 'D2', context: 'we need auth' }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: 'caching', status: null, projectId: null, tagId: null });
      expect(comp.filteredDecisions().length).toBe(1);
      expect(comp.filteredDecisions()[0].id).toBe(1);
    });
  });

  describe('status filter', () => {
    it('LIST-03 filters to matching status only', () => {
      decisions$.set([
        makeDecision({ id: 1, status: 'APPROVED' }),
        makeDecision({ id: 2, status: 'DRAFT' }),
        makeDecision({ id: 3, status: 'APPROVED' }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: '', status: 'APPROVED', projectId: null, tagId: null });
      expect(comp.filteredDecisions().length).toBe(2);
    });
  });

  describe('project filter', () => {
    it('LIST-04 filters to matching projectId', () => {
      decisions$.set([
        makeDecision({ id: 1, projectId: 1 }),
        makeDecision({ id: 2, projectId: 2 }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: '', status: null, projectId: 2, tagId: null });
      expect(comp.filteredDecisions().length).toBe(1);
      expect(comp.filteredDecisions()[0].projectId).toBe(2);
    });
  });

  describe('tag filter', () => {
    it('LIST-05 TAG-09 filters decisions that include the tag', () => {
      decisions$.set([
        makeDecision({ id: 1, tags: [{ id: 10, name: 'security', color: '#fff' }] }),
        makeDecision({ id: 2, tags: [{ id: 20, name: 'perf', color: '#000' }] }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: '', status: null, projectId: null, tagId: 10 });
      expect(comp.filteredDecisions().length).toBe(1);
      expect(comp.filteredDecisions()[0].id).toBe(1);
    });
  });

  describe('combined filters', () => {
    it('LIST-07 applies keyword + status together', () => {
      decisions$.set([
        makeDecision({ id: 1, title: 'Use Redis', context: '', status: 'APPROVED' }),
        makeDecision({ id: 2, title: 'Use Redis', context: '', status: 'DRAFT' }),
        makeDecision({ id: 3, title: 'Use Postgres', context: '', status: 'APPROVED' }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: 'redis', status: 'APPROVED', projectId: null, tagId: null });
      expect(comp.filteredDecisions().length).toBe(1);
      expect(comp.filteredDecisions()[0].id).toBe(1);
    });
  });

  describe('filter reset and empty results', () => {
    it('LIST-08 restores the full list when filters are cleared', () => {
      decisions$.set([
        makeDecision({ id: 1, title: 'Use Redis', status: 'APPROVED' }),
        makeDecision({ id: 2, title: 'Use Postgres', status: 'DRAFT' }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: 'redis', status: null, projectId: null, tagId: null });
      expect(comp.filteredDecisions().length).toBe(1);

      comp.onFiltersChange({ keyword: '', status: null, projectId: null, tagId: null });

      expect(comp.filteredDecisions().length).toBe(2);
    });

    it('LIST-09 returns an empty subset when no decision matches filters', () => {
      decisions$.set([
        makeDecision({ id: 1, title: 'Use Redis', status: 'APPROVED' }),
      ]);
      const fixture = TestBed.createComponent(DecisionListContainer);
      const comp = fixture.componentInstance;
      comp.onFiltersChange({ keyword: 'not-present', status: null, projectId: null, tagId: null });

      expect(comp.filteredDecisions()).toEqual([]);
    });
  });
});
