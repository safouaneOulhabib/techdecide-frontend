import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Project, ProjectSummary, ProjectTeam, CreateProjectRequest } from '@features/projects/models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends ApiService {

  getAll() {
    return this.get<ProjectSummary[]>('/projects');
  }

  getById(id: number) {
    return this.get<Project>(`/projects/${id}`);
  }

  create(request: CreateProjectRequest) {
    return this.post<Project>('/projects', request);
  }

  remove(id: number) {
    return this.delete<void>(`/projects/${id}`);
  }

  getTeams(projectId: number) {
    return this.get<ProjectTeam[]>(`/projects/${projectId}/teams`);
  }

  getAvailableTeams(projectId: number) {
    return this.get<ProjectTeam[]>(`/projects/${projectId}/available-teams`);
  }

  assignTeam(projectId: number, teamId: number) {
    return this.post<ProjectTeam>(`/projects/${projectId}/teams`, { teamId });
  }

  removeTeam(projectId: number, teamId: number) {
    return this.delete<void>(`/projects/${projectId}/teams/${teamId}`);
  }
}
