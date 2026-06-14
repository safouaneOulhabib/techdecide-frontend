import { Tag } from "@features/tags/models/tag.model";

export type DecisionStatus =
  'DRAFT' | 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';

export type Alternative = {
  id: number;
  name: string;
  rejectionReason: string;
};

export type TeamRef = {
  teamId: number;
  teamName: string;
};

export type Decision = {
  id: number;
  title: string;
  context: string;
  decision: string;
  consequences: string;
  status: DecisionStatus;
  supersededById: number | null;
  supersededByTitle: string | null;
  authorId: number;
  authorName: string;
  projectId: number;
  projectName: string;
  teams: TeamRef[];
  canVote: boolean;
  canGovern: boolean;
  canPropose: boolean;
  canEdit: boolean;
  canDelete: boolean;
  tags: Tag[];
  alternatives: Alternative[];
  reviewDate: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDecisionRequest = {
  title: string;
  context: string;
  decision: string;
  consequences?: string;
  projectId: number;
  teamIds: number[];
  tagIds?: number[];
  alternatives?: { name: string; rejectionReason?: string }[];
  reviewDate?: string;
};

export type UpdateDecisionRequest = {
  title?: string;
  context?: string;
  decision?: string;
  consequences?: string;
  tagIds?: number[];
  alternatives?: { name: string; rejectionReason?: string }[];
  reviewDate?: string;
};
