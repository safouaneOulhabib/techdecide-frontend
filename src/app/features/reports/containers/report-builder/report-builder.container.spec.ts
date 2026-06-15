import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReportBuilderContainer } from './report-builder.container';
import { ReportStore } from '@features/reports/store/report.store';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { ProjectStore } from '@features/projects/store/project.store';
import { Decision } from '@features/decisions/models/decision.model';
import { ProjectSummary } from '@features/projects/models/project.model';

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1, title: 'Use REST', context: 'ctx', decision: 'dec', consequences: '',
  status: 'DRAFT', supersededById: null, supersededByTitle: null,
  authorId: 1, authorName: 'Alice', projectId: 1, projectName: 'GTN',
  teams: [], tags: [], alternatives: [],
  canVote: false, canGovern: false, canPropose: true, canEdit: true, canDelete: true,
  reviewDate: '', createdAt: '', updatedAt: '',
  ...overrides,
});

const makeProject = (id: number, name = `Project ${id}`): ProjectSummary => ({
  id, name, organizationName: 'Org', teamCount: 1,
});

describe('ReportBuilderContainer', () => {
  let decisions$: ReturnType<typeof signal<Decision[]>>;
  let projects$: ReturnType<typeof signal<ProjectSummary[]>>;

  beforeEach(() => {
    decisions$ = signal<Decision[]>([]);
    projects$ = signal<ProjectSummary[]>([]);
    vi.clearAllMocks();

    const mockReportStore = {
      loading: signal(false),
      error: signal<string | null>(null),
      create: vi.fn(),
    };

    const mockDecisionStore = {
      decisions: decisions$,
      loadAll: vi.fn(),
    };

    const mockProjectStore = {
      projects: projects$,
      loadAll: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReportBuilderContainer],
      providers: [
        { provide: ReportStore, useValue: mockReportStore },
        { provide: DecisionStore, useValue: mockDecisionStore },
        { provide: ProjectStore, useValue: mockProjectStore },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe('decisionsForProject', () => {
    it('returns empty array when no project is selected', () => {
      decisions$.set([makeDecision({ id: 1, projectId: 1 })]);
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      expect(fixture.componentInstance.decisionsForProject()).toEqual([]);
    });

    it('filters to decisions belonging to the selected project', () => {
      decisions$.set([
        makeDecision({ id: 1, projectId: 1 }),
        makeDecision({ id: 2, projectId: 2 }),
        makeDecision({ id: 3, projectId: 1 }),
      ]);
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;

      comp.onProjectChange(1);

      expect(comp.decisionsForProject().length).toBe(2);
      expect(comp.decisionsForProject().every(d => d.projectId === 1)).toBe(true);
    });

    it('returns empty array when the selected project has no decisions', () => {
      decisions$.set([makeDecision({ id: 1, projectId: 2 })]);
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;

      comp.onProjectChange(99);

      expect(comp.decisionsForProject()).toEqual([]);
    });
  });

  describe('canCreate', () => {
    it('returns false when title is empty', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;
      comp.title.set('');
      comp.selectedProjectId.set(1);
      comp.selectedDecisionIds.set([1]);
      expect(comp.canCreate()).toBe(false);
    });

    it('returns false when title is whitespace only', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;
      comp.title.set('   ');
      comp.selectedProjectId.set(1);
      comp.selectedDecisionIds.set([1]);
      expect(comp.canCreate()).toBe(false);
    });

    it('returns false when no project is selected', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;
      comp.title.set('Q1 Review');
      comp.selectedProjectId.set(null);
      comp.selectedDecisionIds.set([1]);
      expect(comp.canCreate()).toBe(false);
    });

    it('returns false when no decisions are selected', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;
      comp.title.set('Q1 Review');
      comp.selectedProjectId.set(1);
      comp.selectedDecisionIds.set([]);
      expect(comp.canCreate()).toBe(false);
    });

    it('returns true when title, project, and at least one decision are set', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;
      comp.title.set('Q1 Review');
      comp.selectedProjectId.set(1);
      comp.selectedDecisionIds.set([5]);
      expect(comp.canCreate()).toBe(true);
    });
  });

  describe('onProjectChange — clears selected decisions on project switch', () => {
    it('resets selectedDecisionIds when the project changes', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;

      comp.selectedDecisionIds.set([1, 2, 3]);
      comp.onProjectChange(99);

      expect(comp.selectedDecisionIds()).toEqual([]);
    });

    it('sets the new projectId', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;

      comp.onProjectChange(7);

      expect(comp.selectedProjectId()).toBe(7);
    });

    it('resets decisions even when switching to null (deselect project)', () => {
      const fixture = TestBed.createComponent(ReportBuilderContainer);
      const comp = fixture.componentInstance;

      comp.selectedDecisionIds.set([10]);
      comp.onProjectChange(null);

      expect(comp.selectedDecisionIds()).toEqual([]);
      expect(comp.selectedProjectId()).toBeNull();
    });
  });
});
