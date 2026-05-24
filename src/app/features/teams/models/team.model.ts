export interface Team {
  id: number;
  name: string;
  organizationId: number;
  organizationName: string;
  createdAt: string;
}

export interface CreateTeamRequest {
  name: string;
  organizationId: number;
}

export interface UpdateTeamRequest {
  name?: string;
  organizationId?: number;
}