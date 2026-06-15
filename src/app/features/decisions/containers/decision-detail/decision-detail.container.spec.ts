import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecisionDetailContainer } from './decision-detail.container';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { CommentStore } from '@features/decisions/store/comment.store';
import { Decision } from '@features/decisions/models/decision.model';

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1, title: 'Use GraphQL', context: 'We need an API', decision: 'Use REST',
  consequences: '', status: 'DRAFT', supersededById: null, supersededByTitle: null,
  authorId: 1, authorName: 'Alice', projectId: 1, projectName: 'GTN',
  teams: [], tags: [], alternatives: [],
  canVote: false, canGovern: false, canPropose: false, canEdit: false, canDelete: false,
  reviewDate: '', createdAt: '', updatedAt: '',
  ...overrides,
});

describe('DecisionDetailContainer — computed signals', () => {
  let selectedDecision$: ReturnType<typeof signal<Decision | null>>;
  let approvedDecisions$: ReturnType<typeof signal<Decision[]>>;

  const mockRoute = { paramMap: { subscribe: vi.fn() } };
  const mockRouter = { navigate: vi.fn() };
  const mockLocation = { back: vi.fn() };

  beforeEach(() => {
    selectedDecision$ = signal<Decision | null>(null);
    approvedDecisions$ = signal<Decision[]>([]);
    vi.clearAllMocks();

    const mockDecisionStore = {
      selectedDecision: selectedDecision$,
      loading: signal(false),
      error: signal<string | null>(null),
      decisions: signal([]),
      approvedDecisions: approvedDecisions$,
      loadById: vi.fn(),
      loadAll: vi.fn(),
      remove: vi.fn(),
      updateStatus: vi.fn(),
      clearSelected: vi.fn(),
    };

    const mockAuthStore = {
      user: signal(null),
      isAppAdmin: signal(false),
      isTeamAdmin: signal(false),
      isTeamAdminOrAppAdmin: signal(false),
      hasTeam: signal(false),
    };

    const mockCommentStore = {
      comments: signal([]),
      loading: signal(false),
      error: signal<string | null>(null),
      loadByDecision: vi.fn(),
      create: vi.fn(),
      remove: vi.fn(),
      clearComments: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [DecisionDetailContainer],
      providers: [
        { provide: DecisionStore, useValue: mockDecisionStore },
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: CommentStore, useValue: mockCommentStore },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
        { provide: Location, useValue: mockLocation },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe('canEditCurrent', () => {
    it('returns false when no decision selected', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canEditCurrent()).toBe(false);
    });

    it('returns decision.canEdit when decision is set', () => {
      selectedDecision$.set(makeDecision({ canEdit: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canEditCurrent()).toBe(true);
    });

    it('returns false when decision.canEdit is false', () => {
      selectedDecision$.set(makeDecision({ canEdit: false }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canEditCurrent()).toBe(false);
    });
  });

  describe('canDeleteCurrent', () => {
    it('returns false when no decision selected', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canDeleteCurrent()).toBe(false);
    });

    it('returns true when decision.canDelete is true', () => {
      selectedDecision$.set(makeDecision({ canDelete: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canDeleteCurrent()).toBe(true);
    });
  });

  describe('canVoteCurrent', () => {
    it('returns false when no decision', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canVoteCurrent()).toBe(false);
    });

    it('returns decision.canVote', () => {
      selectedDecision$.set(makeDecision({ canVote: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canVoteCurrent()).toBe(true);
    });
  });

  describe('canProposeCurrent', () => {
    it('returns false when no decision', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canProposeCurrent()).toBe(false);
    });

    it('returns decision.canPropose', () => {
      selectedDecision$.set(makeDecision({ canPropose: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canProposeCurrent()).toBe(true);
    });
  });

  describe('canGoverncurrent', () => {
    it('returns false when no decision', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canGoverncurrent()).toBe(false);
    });

    it('returns decision.canGovern', () => {
      selectedDecision$.set(makeDecision({ canGovern: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canGoverncurrent()).toBe(true);
    });
  });

  describe('canSupersedeCurrent', () => {
    it('returns false when no decision', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canSupersedeCurrent()).toBe(false);
    });

    it('returns false for DRAFT even if canGovern=true', () => {
      selectedDecision$.set(makeDecision({ status: 'DRAFT', canGovern: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canSupersedeCurrent()).toBe(false);
    });

    it('returns false for APPROVED but canGovern=false', () => {
      selectedDecision$.set(makeDecision({ status: 'APPROVED', canGovern: false }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canSupersedeCurrent()).toBe(false);
    });

    it('returns true for APPROVED with canGovern=true', () => {
      selectedDecision$.set(makeDecision({ status: 'APPROVED', canGovern: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canSupersedeCurrent()).toBe(true);
    });

    it('returns false for REJECTED even if canGovern=true', () => {
      selectedDecision$.set(makeDecision({ status: 'REJECTED', canGovern: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canSupersedeCurrent()).toBe(false);
    });

    it('returns false for SUPERSEDED even if canGovern=true', () => {
      selectedDecision$.set(makeDecision({ status: 'SUPERSEDED', canGovern: true }));
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.canSupersedeCurrent()).toBe(false);
    });
  });

  describe('supersedeCandidates', () => {
    it('returns empty when no approved decisions', () => {
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      expect(fixture.componentInstance.supersedeCandidates()).toEqual([]);
    });

    it('returns approved decisions excluding current', () => {
      approvedDecisions$.set([
        makeDecision({ id: 1, status: 'APPROVED' }),
        makeDecision({ id: 2, status: 'APPROVED' }),
        makeDecision({ id: 3, status: 'APPROVED' }),
      ]);
      const fixture = TestBed.createComponent(DecisionDetailContainer);
      // decisionId defaults to 0, so all three appear
      expect(fixture.componentInstance.supersedeCandidates().length).toBe(3);
    });
  });
});
