import { DecisionStatus } from '../models/decision.model';

const TRANSITIONS_GOVERN_APP_ADMIN: Record<DecisionStatus, DecisionStatus[]> = {
  DRAFT:      ['PROPOSED'],
  PROPOSED:   ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED:   [],
  REJECTED:   ['DRAFT'],
  SUPERSEDED: [],
};

const TRANSITIONS_GOVERN_TEAM_ADMIN: Record<DecisionStatus, DecisionStatus[]> = {
  DRAFT:      ['PROPOSED'],
  PROPOSED:   ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED:   [],
  REJECTED:   [],
  SUPERSEDED: [],
};

/**
 * Returns allowed status transitions based on per-actor DTO flags.
 * canGovern: TEAM_ADMIN of an involved team or APP_ADMIN
 * canPropose: any involved-team member (or APP_ADMIN)
 * appRole: needed to distinguish APP_ADMIN REJECTED→DRAFT privilege
 */
export function allowedTransitions(
  status: DecisionStatus,
  canPropose: boolean,
  canGovern: boolean,
  appRole: string = 'USER'
): DecisionStatus[] {
  if (canGovern) {
    return appRole === 'APP_ADMIN'
      ? TRANSITIONS_GOVERN_APP_ADMIN[status]
      : TRANSITIONS_GOVERN_TEAM_ADMIN[status];
  }
  if (canPropose && status === 'DRAFT') return ['PROPOSED'];
  return [];
}

export function canSupersede(status: DecisionStatus): boolean {
  return status === 'APPROVED';
}
