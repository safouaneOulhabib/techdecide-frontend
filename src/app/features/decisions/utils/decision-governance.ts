import { DecisionStatus } from '../models/decision.model';

const TRANSITIONS_APP_ADMIN: Record<DecisionStatus, DecisionStatus[]> = {
  DRAFT:      ['PROPOSED'],
  PROPOSED:   ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED:   [],
  REJECTED:   ['DRAFT'],
  SUPERSEDED: []
};

const TRANSITIONS_TEAM_ADMIN: Record<DecisionStatus, DecisionStatus[]> = {
  DRAFT:      ['PROPOSED'],
  PROPOSED:   ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED:   [],
  REJECTED:   [],
  SUPERSEDED: []
};

const TRANSITIONS_MEMBER: Record<DecisionStatus, DecisionStatus[]> = {
  DRAFT:      ['PROPOSED'],
  PROPOSED:   [],
  APPROVED:   [],
  REJECTED:   [],
  SUPERSEDED: []
};

export function allowedTransitions(
  status: DecisionStatus,
  teamRole: string | null = null,
  appRole: string = 'USER'
): DecisionStatus[] {
  if (appRole === 'APP_ADMIN') return TRANSITIONS_APP_ADMIN[status];
  if (teamRole === 'TEAM_ADMIN') return TRANSITIONS_TEAM_ADMIN[status];
  return TRANSITIONS_MEMBER[status];
}

export function canEdit(status: DecisionStatus): boolean {
  return status === 'DRAFT' || status === 'PROPOSED';
}

export function canDelete(status: DecisionStatus): boolean {
  return status === 'DRAFT' || status === 'PROPOSED' || status === 'REJECTED';
}

export function canSupersede(status: DecisionStatus): boolean {
  return status === 'APPROVED';
}