import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { DecisionForm } from './decision-form';
import { Decision } from '@features/decisions/models/decision.model';
import { ProjectTeam } from '@features/projects/models/project.model';

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: 1, title: 'Use REST', context: 'ctx', decision: 'dec', consequences: '',
  status: 'DRAFT', supersededById: null, supersededByTitle: null,
  authorId: 1, authorName: 'Alice', projectId: 1, projectName: 'GTN',
  teams: [], tags: [], alternatives: [],
  canVote: false, canGovern: false, canPropose: true, canEdit: true, canDelete: true,
  reviewDate: '', createdAt: '', updatedAt: '',
  ...overrides,
});

const makeTeam = (teamId: number, teamName = `Team ${teamId}`): ProjectTeam => ({ teamId, teamName });

describe('DecisionForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DecisionForm],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  describe('removeTeam — own-team lock', () => {
    it('DEC-04 removes a team that is NOT the own team', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('ownTeamId', 10);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      comp.form.update(f => ({ ...f, teamIds: [10, 20, 30] }));

      comp.removeTeam(20);

      expect(comp.form().teamIds).toEqual([10, 30]);
    });

    it('DEC-03 does NOT remove the own team', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('ownTeamId', 10);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      comp.form.update(f => ({ ...f, teamIds: [10, 20] }));

      comp.removeTeam(10); // own team — must be blocked

      expect(comp.form().teamIds).toEqual([10, 20]); // unchanged
    });

    it('removes a team when ownTeamId is null (no lock in effect)', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('ownTeamId', null);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      comp.form.update(f => ({ ...f, teamIds: [10, 20] }));

      comp.removeTeam(10);

      expect(comp.form().teamIds).toEqual([20]);
    });
  });

  describe('ngOnChanges — projectTeams auto-populate in create mode', () => {
    it('DEC-02 sets teamIds to all project teams when projectTeams changes in create mode', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('existingDecision', null); // create mode
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      const newTeams = [makeTeam(1), makeTeam(2)];

      // Update the signal first so ngOnChanges reads the new value
      fixture.componentRef.setInput('projectTeams', newTeams);
      comp.ngOnChanges({ projectTeams: new SimpleChange([], newTeams, false) });

      expect(comp.form().teamIds).toEqual([1, 2]);
    });

    it('does NOT auto-set teamIds in edit mode', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('existingDecision', makeDecision()); // edit mode
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      const newTeams = [makeTeam(99)];

      fixture.componentRef.setInput('projectTeams', newTeams);
      comp.ngOnChanges({ projectTeams: new SimpleChange([], newTeams, false) });

      expect(comp.form().teamIds).toEqual([]); // untouched
    });

    it('ignores changes to other inputs (no projectTeams key in changes)', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.componentRef.setInput('existingDecision', null);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      comp.form.update(f => ({ ...f, teamIds: [5] })); // pre-set

      comp.ngOnChanges({ loading: new SimpleChange(false, true, false) });

      expect(comp.form().teamIds).toEqual([5]); // unchanged
    });
  });

  describe('onProjectChange — resets teamIds on project switch', () => {
    it('DEC-11 clears teamIds when a new project is selected', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      const comp = fixture.componentInstance;
      comp.form.update(f => ({ ...f, teamIds: [1, 2, 3] }));

      comp.onProjectChange(99);

      expect(comp.form().teamIds).toEqual([]);
    });

    it('updates the projectId in the form', () => {
      const fixture = TestBed.createComponent(DecisionForm);
      fixture.componentRef.setInput('tags', []);
      fixture.componentRef.setInput('loading', false);
      fixture.detectChanges();

      fixture.componentInstance.onProjectChange(42);

      expect(fixture.componentInstance.form().projectId).toBe(42);
    });
  });
});
