export type DecisionStatus =
  'DRAFT' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';

export interface Alternative {
  id: number;
  name: string;
  rejectionReason: string;
}

export interface Decision {
  id: number;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: DecisionStatus;
  authorName: string;
  teamName: string;
  tags: string[];
  alternatives: Alternative[];
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDecisionRequest {
  title: string;
  context: string;
  decision: string;
  consequences?: string;
  teamId: number;
  tagIds?: number[];
  alternatives?: { name: string; rejectionReason?: string }[];
  reviewDate?: string;
}

export interface UpdateDecisionRequest {
  title?: string;
  context?: string;
  decision?: string;
  consequences?: string;
  tagIds?: number[];
  alternatives?: { name: string; rejectionReason?: string }[];
  reviewDate?: string;
}