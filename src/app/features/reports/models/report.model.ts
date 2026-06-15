export type ReportSummary = {
  id: number;
  title: string;
  introduction: string | null;
  authorId: number;
  authorName: string;
  projectId: number;
  projectName: string;
  createdAt: string;
  updatedAt: string | null;
  itemCount: number;
  statusCounts: Record<string, number>;
};

export type ReportItem = {
  id: number;
  originalDecisionId: number;
  decisionTitle: string;
  decisionStatus: string;
  decisionContext: string | null;
  decisionContent: string | null;
  decisionConsequences: string | null;
  decisionTeamName: string | null;
  decisionAuthorName: string | null;
  decisionCreatedAt: string | null;
  alternatives: { name: string; rejectionReason: string | null }[];
  position: number;
};

export type Report = {
  id: number;
  title: string;
  introduction: string | null;
  authorId: number;
  authorName: string;
  projectId: number;
  projectName: string;
  createdAt: string;
  updatedAt: string | null;
  items: ReportItem[];
};

export type CreateReportRequest = {
  projectId: number;
  title: string;
  introduction: string | null;
  decisionIds: number[];
};

export type UpdateReportRequest = {
  title: string;
  introduction: string | null;
};
