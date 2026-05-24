import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest
} from '@features/teams/models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends ApiService {

  getAll() {
    return this.get<Team[]>('/teams');
  }

  getById(id: number) {
    return this.get<Team>(`/teams/${id}`);
  }

  getByOrganization(organizationId: number) {
    return this.get<Team[]>(`/teams/organization/${organizationId}`);
  }

  create(request: CreateTeamRequest) {
    return this.post<Team>('/teams', request);
  }

  update(id: number, request: UpdateTeamRequest) {
    return this.put<Team>(`/teams/${id}`, request);
  }

  remove(id: number) {
    return this.delete<void>(`/teams/${id}`);
  }
}