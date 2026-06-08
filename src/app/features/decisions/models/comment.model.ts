export type Vote = 'APPROVE' | 'REJECT' | 'ABSTAIN';

export interface Comment {
  id: number;
  authorId: number;
  content: string;
  vote: Vote | null;
  authorName: string;
  decisionId: number;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
  vote?: Vote;
}