import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Tag, CreateTagRequest } from '@features/tags/models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class TagService extends ApiService {

  getAll() {
    return this.get<Tag[]>('/tags');
  }

  getById(id: number) {
    return this.get<Tag>(`/tags/${id}`);
  }

  create(request: CreateTagRequest) {
    return this.post<Tag>('/tags', request);
  }

  remove(id: number) {
    return this.delete<void>(`/tags/${id}`);
  }
}