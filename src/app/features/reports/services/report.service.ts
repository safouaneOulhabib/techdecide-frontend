import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Report, ReportSummary, CreateReportRequest, UpdateReportRequest } from '@features/reports/models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService extends ApiService {

  getAll() {
    return this.get<ReportSummary[]>('/reports');
  }

  getById(id: number) {
    return this.get<Report>(`/reports/${id}`);
  }

  create(request: CreateReportRequest) {
    return this.post<Report>('/reports', request);
  }

  update(id: number, request: UpdateReportRequest) {
    return this.put<Report>(`/reports/${id}`, request);
  }

  remove(id: number) {
    return this.delete<void>(`/reports/${id}`);
  }
}
