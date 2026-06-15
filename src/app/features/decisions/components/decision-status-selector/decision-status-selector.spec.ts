import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DecisionStatusSelector } from './decision-status-selector';

describe('DecisionStatusSelector — visibleOptions & hasTransitions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DecisionStatusSelector],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function create(inputs: {
    currentStatus: string;
    canPropose?: boolean;
    canGovern?: boolean;
    appRole?: string;
  }) {
    const fixture = TestBed.createComponent(DecisionStatusSelector);
    fixture.componentRef.setInput('currentStatus', inputs.currentStatus);
    fixture.componentRef.setInput('canPropose', inputs.canPropose ?? false);
    fixture.componentRef.setInput('canGovern', inputs.canGovern ?? false);
    fixture.componentRef.setInput('appRole', inputs.appRole ?? 'USER');
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  describe('hasTransitions', () => {
    it('is false with no flags (DRAFT + USER + no permissions)', () => {
      const comp = create({ currentStatus: 'DRAFT' });
      expect(comp.hasTransitions()).toBe(false);
    });

    it('is true when canPropose=true from DRAFT', () => {
      const comp = create({ currentStatus: 'DRAFT', canPropose: true });
      expect(comp.hasTransitions()).toBe(true);
    });

    it('is true when canGovern=true from PROPOSED', () => {
      const comp = create({ currentStatus: 'PROPOSED', canGovern: true });
      expect(comp.hasTransitions()).toBe(true);
    });

    it('is false for SUPERSEDED regardless of flags', () => {
      const comp = create({ currentStatus: 'SUPERSEDED', canPropose: true, canGovern: true });
      expect(comp.hasTransitions()).toBe(false);
    });
  });

  describe('visibleOptions', () => {
    it('always includes current status', () => {
      const comp = create({ currentStatus: 'APPROVED' });
      const values = comp.visibleOptions().map(o => o.value);
      expect(values).toContain('APPROVED');
    });

    it('DRAFT + canPropose: shows DRAFT + PROPOSED', () => {
      const comp = create({ currentStatus: 'DRAFT', canPropose: true });
      const values = comp.visibleOptions().map(o => o.value);
      expect(values).toContain('DRAFT');
      expect(values).toContain('PROPOSED');
      expect(values).not.toContain('APPROVED');
      expect(values).not.toContain('REJECTED');
    });

    it('PROPOSED + canGovern: shows PROPOSED + APPROVED + REJECTED', () => {
      const comp = create({ currentStatus: 'PROPOSED', canGovern: true });
      const values = comp.visibleOptions().map(o => o.value);
      expect(values).toContain('PROPOSED');
      expect(values).toContain('APPROVED');
      expect(values).toContain('REJECTED');
    });

    it('APPROVED + canGovern: shows only APPROVED (no further transitions)', () => {
      const comp = create({ currentStatus: 'APPROVED', canGovern: true });
      const values = comp.visibleOptions().map(o => o.value);
      expect(values).toContain('APPROVED');
      expect(values.length).toBe(1);
    });

    it('no flags returns only current status for DRAFT', () => {
      const comp = create({ currentStatus: 'DRAFT' });
      const values = comp.visibleOptions().map(o => o.value);
      expect(values).toEqual(['DRAFT']);
    });
  });
});
