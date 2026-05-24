import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import {
  Decision,
  CreateDecisionRequest,
  UpdateDecisionRequest,
  DecisionStatus
} from '@features/decisions/models/decision.model';

@Injectable({
  providedIn: 'root'
})
export class DecisionService extends ApiService {

  getAll() {
    return this.get<Decision[]>('/decisions');
  }

  getById(id: number) {
    return this.get<Decision>(`/decisions/${id}`);
  }

  getByTeam(teamId: number) {
    return this.get<Decision[]>(`/decisions/team/${teamId}`);
  }

  search(keyword: string) {
    return this.get<Decision[]>(`/decisions/search?keyword=${keyword}`);
  }

  create(request: CreateDecisionRequest) {
    return this.post<Decision>('/decisions', request);
  }

  update(id: number, request: UpdateDecisionRequest) {
    return this.put<Decision>(`/decisions/${id}`, request);
  }

  updateStatus(id: number, status: DecisionStatus) {
    return this.patch<Decision>(`/decisions/${id}/status`, { status });
  }

  remove(id: number) {
    return this.delete<void>(`/decisions/${id}`);
  }
}