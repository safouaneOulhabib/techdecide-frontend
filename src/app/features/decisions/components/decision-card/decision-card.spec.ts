import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecisionCard } from './decision-card';
import { Decision } from '@features/decisions/models/decision.model';
import { ConfirmService } from '@core/services/confirm.service';

const mockConfirmService = { confirm: vi.fn() };

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1, title: 'Use GraphQL', context: '', decision: '',
  consequences: '', status: 'DRAFT', supersededById: null, supersededByTitle: null,
  authorId: 1, authorName: 'Alice', projectId: 1, projectName: 'GTN',
  teams: [], tags: [], alternatives: [],
  canVote: false, canGovern: false, canPropose: false, canEdit: false, canDelete: false,
  reviewDate: '', createdAt: '', updatedAt: '',
  ...overrides,
});

describe('DecisionCard — team chip computeds', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DecisionCard],
      providers: [{ provide: ConfirmService, useValue: mockConfirmService }],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function create(decision: Decision) {
    const fixture = TestBed.createComponent(DecisionCard);
    fixture.componentRef.setInput('decision', decision);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  describe('visibleTeams', () => {
    it('returns empty when no teams', () => {
      const comp = create(makeDecision({ teams: [] }));
      expect(comp.visibleTeams()).toEqual([]);
    });

    it('LIST-01 returns all teams when 2 or fewer', () => {
      const teams = [
        { teamId: 1, teamName: 'Backend' },
        { teamId: 2, teamName: 'Frontend' },
      ];
      const comp = create(makeDecision({ teams }));
      expect(comp.visibleTeams().length).toBe(2);
    });

    it('LIST-02 caps at 2 even when more teams present', () => {
      const teams = [
        { teamId: 1, teamName: 'Backend' },
        { teamId: 2, teamName: 'Frontend' },
        { teamId: 3, teamName: 'DevOps' },
      ];
      const comp = create(makeDecision({ teams }));
      expect(comp.visibleTeams().length).toBe(2);
      expect(comp.visibleTeams()[0].teamName).toBe('Backend');
    });
  });

  describe('hiddenTeamCount', () => {
    it('returns 0 when 2 or fewer teams', () => {
      const comp = create(makeDecision({ teams: [{ teamId: 1, teamName: 'Backend' }] }));
      expect(comp.hiddenTeamCount()).toBe(0);
    });

    it('LIST-02 returns correct overflow count', () => {
      const teams = Array.from({ length: 5 }, (_, i) => ({ teamId: i + 1, teamName: `Team ${i + 1}` }));
      const comp = create(makeDecision({ teams }));
      expect(comp.hiddenTeamCount()).toBe(3);
    });

    it('returns 0 when no teams', () => {
      const comp = create(makeDecision({ teams: [] }));
      expect(comp.hiddenTeamCount()).toBe(0);
    });
  });
  describe('rendering safety', () => {
    it('SEC-06 escapes HTML in the decision title on render', () => {
      const fixture = TestBed.createComponent(DecisionCard);
      fixture.componentRef.setInput('decision', makeDecision({ title: '<img src=x onerror=alert(1)>' }));
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('.card-title') as HTMLElement;
      expect(title.textContent).toBe('<img src=x onerror=alert(1)>');
      expect(title.innerHTML).not.toContain('<img');
    });
  });
});
