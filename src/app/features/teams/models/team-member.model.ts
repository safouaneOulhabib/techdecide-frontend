export type TeamMember = {
  userId: number;
  name: string;
  email: string;
  role: string;
  teamId: number;
};

export type AssignMemberRequest = {
  userId: number;
};

export type ChangeRoleRequest = {
  role: string;
};
