import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest
} from '@features/organizations/models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends ApiService {

  getAll() {
    return this.get<Organization[]>('/organizations');
  }

  getById(id: number) {
    return this.get<Organization>(`/organizations/${id}`);
  }

  create(request: CreateOrganizationRequest) {
    return this.post<Organization>('/organizations', request);
  }

  update(id: number, request: UpdateOrganizationRequest) {
    return this.put<Organization>(`/organizations/${id}`, request);
  }

  remove(id: number) {
    return this.delete<void>(`/organizations/${id}`);
  }
}