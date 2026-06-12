export type TeamMember = {
  userId: number;
  name: string;
  email: string;
  teamRole: string;
  teamId: number;
  createdAt: string;
};

export type AssignMemberRequest = {
  userId: number;
  teamRole: string;
};

export type ChangeRoleRequest = {
  teamRole: string;
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