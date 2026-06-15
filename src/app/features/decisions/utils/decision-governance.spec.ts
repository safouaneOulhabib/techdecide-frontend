import { describe, it, expect } from 'vitest';
import { allowedTransitions, canSupersede } from './decision-governance';
import { DecisionStatus } from '../models/decision.model';

const ALL_STATUSES: DecisionStatus[] = ['DRAFT', 'PROPOSED', 'APPROVED', 'REJECTED', 'SUPERSEDED'];

describe('allowedTransitions', () => {
  describe('canGovern=true, appRole=APP_ADMIN', () => {
    it('DRAFT → [PROPOSED]', () => {
      expect(allowedTransitions('DRAFT', true, true, 'APP_ADMIN')).toEqual(['PROPOSED']);
    });
    it('PROPOSED → [APPROVED, REJECTED, DRAFT]', () => {
      expect(allowedTransitions('PROPOSED', true, true, 'APP_ADMIN')).toEqual(['APPROVED', 'REJECTED', 'DRAFT']);
    });
    it('APPROVED → [] (terminal)', () => {
      expect(allowedTransitions('APPROVED', true, true, 'APP_ADMIN')).toEqual([]);
    });
    it('REJECTED → [DRAFT] (APP_ADMIN can reopen)', () => {
      expect(allowedTransitions('REJECTED', true, true, 'APP_ADMIN')).toEqual(['DRAFT']);
    });
    it('SUPERSEDED → [] (terminal)', () => {
      expect(allowedTransitions('SUPERSEDED', true, true, 'APP_ADMIN')).toEqual([]);
    });
  });

  describe('canGovern=true, appRole=USER (TEAM_ADMIN)', () => {
    it('DRAFT → [PROPOSED]', () => {
      expect(allowedTransitions('DRAFT', true, true, 'USER')).toEqual(['PROPOSED']);
    });
    it('PROPOSED → [APPROVED, REJECTED, DRAFT]', () => {
      expect(allowedTransitions('PROPOSED', true, true, 'USER')).toEqual(['APPROVED', 'REJECTED', 'DRAFT']);
    });
    it('APPROVED → []', () => {
      expect(allowedTransitions('APPROVED', true, true, 'USER')).toEqual([]);
    });
    it('REJECTED → [] (TEAM_ADMIN cannot reopen rejected)', () => {
      expect(allowedTransitions('REJECTED', true, true, 'USER')).toEqual([]);
    });
    it('SUPERSEDED → []', () => {
      expect(allowedTransitions('SUPERSEDED', true, true, 'USER')).toEqual([]);
    });
  });

  describe('canGovern=false, canPropose=true (MEMBER)', () => {
    it('DRAFT → [PROPOSED] (only transition allowed)', () => {
      expect(allowedTransitions('DRAFT', true, false)).toEqual(['PROPOSED']);
    });
    it('PROPOSED → [] (cannot approve/reject)', () => {
      expect(allowedTransitions('PROPOSED', true, false)).toEqual([]);
    });
    it('APPROVED → []', () => {
      expect(allowedTransitions('APPROVED', true, false)).toEqual([]);
    });
    it('REJECTED → []', () => {
      expect(allowedTransitions('REJECTED', true, false)).toEqual([]);
    });
    it('SUPERSEDED → []', () => {
      expect(allowedTransitions('SUPERSEDED', true, false)).toEqual([]);
    });
  });

  describe('canGovern=false, canPropose=false (observer / no-team)', () => {
    it.each(ALL_STATUSES)('%s → [] (no transitions)', (status) => {
      expect(allowedTransitions(status, false, false)).toEqual([]);
    });
  });

  describe('appRole defaults to USER when omitted', () => {
    it('REJECTED → [] when canGovern=true and appRole not passed', () => {
      expect(allowedTransitions('REJECTED', true, true)).toEqual([]);
    });
  });

  describe('canGovern=true takes priority over canPropose', () => {
    it('canGovern=true, canPropose=false: DRAFT → [PROPOSED]', () => {
      expect(allowedTransitions('DRAFT', false, true, 'USER')).toEqual(['PROPOSED']);
    });
    it('canGovern=true, canPropose=false: PROPOSED → [APPROVED, REJECTED, DRAFT]', () => {
      expect(allowedTransitions('PROPOSED', false, true, 'USER')).toEqual(['APPROVED', 'REJECTED', 'DRAFT']);
    });
  });
});

describe('canSupersede', () => {
  it('returns true only for APPROVED', () => {
    expect(canSupersede('APPROVED')).toBe(true);
  });

  it.each(['DRAFT', 'PROPOSED', 'REJECTED', 'SUPERSEDED'] as DecisionStatus[])(
    'returns false for %s',
    (status) => {
      expect(canSupersede(status)).toBe(false);
    }
  );
});
