export type ProjectSummary = {
  id: number;
  name: string;
  organizationName: string;
  teamCount: number;
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  organizationId: number;
  organizationName: string;
  teamCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectTeam = {
  teamId: number;
  teamName: string;
};

export type CreateProjectRequest = {
  name: string;
  description: string | null;
  organizationId: number;
};
