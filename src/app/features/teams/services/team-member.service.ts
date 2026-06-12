import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { TeamMember, AssignMemberRequest, ChangeRoleRequest } from '@features/teams/models/team-member.model';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService extends ApiService {

  getMembers(teamId: number) {
    return this.get<TeamMember[]>(`/teams/${teamId}/members`);
  }

  assignMember(teamId: number, request: AssignMemberRequest) {
    return this.post<TeamMember>(`/teams/${teamId}/members`, request);
  }

  removeMember(teamId: number, userId: number) {
    return this.delete<void>(`/teams/${teamId}/members/${userId}`);
  }

  changeRole(teamId: number, userId: number, request: ChangeRoleRequest) {
    return this.patch<TeamMember>(`/teams/${teamId}/members/${userId}`, request);
  }
}
