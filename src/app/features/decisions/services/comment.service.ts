import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { Comment, CreateCommentRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService extends ApiService {

  getByDecision(decisionId: number) {
    return this.get<Comment[]>(`/decisions/${decisionId}/comments`);
  }

  create(decisionId: number, request: CreateCommentRequest) {
    return this.post<Comment>(`/decisions/${decisionId}/comments`, request);
  }

  remove(commentId: number) {
    return this.delete<void>(`/comments/${commentId}`);
  }
}