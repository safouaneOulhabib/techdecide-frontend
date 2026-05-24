export interface Organization {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  description?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
}