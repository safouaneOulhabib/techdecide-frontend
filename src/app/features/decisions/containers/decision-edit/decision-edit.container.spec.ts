import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecisionEditContainer } from './decision-edit.container';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { TagStore } from '@features/tags/store/tag.store';
import { Decision } from '@features/decisions/models/decision.model';

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1, title: 'Use REST', context: 'ctx', decision: 'dec', consequences: '',
  status: 'DRAFT', supersededById: null, supersededByTitle: null,
  authorId: 1, authorName: 'Alice', projectId: 1, projectName: 'GTN',
  teams: [], tags: [], alternatives: [],
  canVote: false, canGovern: false, canPropose: true, canEdit: true, canDelete: true,
  reviewDate: '', createdAt: '', updatedAt: '',
  ...overrides,
});

describe('DecisionEditContainer — canEdit guard', () => {
  let decision$: ReturnType<typeof signal<Decision | null>>;
  const mockRouter = { navigate: vi.fn() };

  beforeEach(() => {
    decision$ = signal<Decision | null>(null);
    vi.clearAllMocks();

    const mockDecisionStore = {
      selectedDecision: decision$,
      loading: signal(false),
      error: signal<string | null>(null),
      loadById: vi.fn(),
      update: vi.fn(),
      clearSelected: vi.fn(),
    };

    const mockTagStore = {
      tags: signal([]),
      loadAll: vi.fn(),
    };

    const mockRoute = {
      snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } },
    };

    TestBed.configureTestingModule({
      imports: [DecisionEditContainer],
      providers: [
        { provide: DecisionStore, useValue: mockDecisionStore },
        { provide: TagStore, useValue: mockTagStore },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('redirects to /decisions/:id when the loaded decision has canEdit=false', () => {
    const fixture = TestBed.createComponent(DecisionEditContainer);
    fixture.detectChanges();

    decision$.set(makeDecision({ id: 5, canEdit: false }));
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/decisions', 5]);
  });

  it('does NOT redirect when canEdit=true', () => {
    const fixture = TestBed.createComponent(DecisionEditContainer);
    fixture.detectChanges();

    decision$.set(makeDecision({ id: 5, canEdit: true }));
    fixture.detectChanges();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('does NOT redirect while decision is still null (loading)', () => {
    const fixture = TestBed.createComponent(DecisionEditContainer);
    decision$.set(null);
    fixture.detectChanges();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
