import { DecisionStatus } from '../models/decision.model';

const ALLOWED_TRANSITIONS: Record<DecisionStatus, DecisionStatus[]> = {
  DRAFT:      ['PROPOSED'],
  PROPOSED:   ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED:   [],
  REJECTED:   ['DRAFT'],
  SUPERSEDED: []
};

export function allowedTransitions(status: DecisionStatus): DecisionStatus[] {
  return ALLOWED_TRANSITIONS[status];
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