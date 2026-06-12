export type TeamMember = {
  userId: number;
  name: string;
  email: string;
  role: string;
  teamId: number;
  createdAt: string;
};

export type AssignMemberRequest = {
  userId: number;
  role: string;
};

export type ChangeRoleRequest = {
  role: string;
};

export type TeamMemberState = {
  members: TeamMember[];
  availableUsers: AvailableUser[];
  loading: boolean;
  error: string | null;
};

export type AvailableUser = {
  id: number;
  name: string;
  email: string;
};