import { Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { Decision, DecisionStatus } from '@features/decisions/models/decision.model';
import { OnDestroy } from '@angular/core';
import { AuthStore } from '@features/auth/store/auth.store';
import { CommentForm } from '@features/decisions/components/comment-form/comment-form';
import { CommentList } from '@features/decisions/components/comment-list/comment-list';
import { Comment, CreateCommentRequest } from '@features/decisions/models/comment.model';
import { AuthResponse } from '@features/auth/models/auth.model';
import { CommentStore } from '@features/decisions/store/comment.store';
import { VoteSummary } from '@features/decisions/components/vote-summary/vote-summary';
import { DecisionStatusSelector } from '@features/decisions/components/decision-status-selector/decision-status-selector';
import { DecisionStatusBadge } from '@features/decisions/components/decision-status-badge/decision-status-badge';

@Component({
  selector: 'app-decision-detail',
  standalone: true,
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    DatePipe,
    DecisionStatusBadge,
    CommentForm,
    CommentList,
    VoteSummary,
    DecisionStatusSelector
  ],
  templateUrl: './decision-detail.container.html',
  styleUrl: './decision-detail.container.scss'
})
export class DecisionDetailContainer implements OnInit, OnDestroy {
  private readonly decisionStore = inject(DecisionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly decision: Signal<Decision | null> = this.decisionStore.selectedDecision;
  readonly loading: Signal<boolean> = this.decisionStore.loading;
  readonly error: Signal<string | null> = this.decisionStore.error;

  private readonly commentStore = inject(CommentStore);
  private readonly authStore = inject(AuthStore);

  readonly comments: Signal<Comment[]> = this.commentStore.comments;
  readonly commentsLoading: Signal<boolean> = this.commentStore.loading;
  readonly currentUser: Signal<AuthResponse | null> = this.authStore.user;

  private decisionId = 0;

  ngOnInit() {
    this.decisionId = Number(this.route.snapshot.paramMap.get('id'));
    this.decisionStore.loadById(this.decisionId); // changed from this.store
    this.commentStore.loadByDecision(this.decisionId);
  }

  goBack() {
    this.router.navigate(['/decisions']);
  }

  onCommentSubmit(request: CreateCommentRequest) {
    this.commentStore.create(this.decisionId, request);
  }

  onCommentDelete(commentId: number) {
    this.commentStore.remove(commentId);
  }

  onEdit() {
    this.router.navigate(['/decisions', this.decisionId, 'edit']);
  }

  onStatusChange(status: DecisionStatus) {
    this.decisionStore.updateStatus(this.decisionId, status);
  }

  ngOnDestroy() {
    this.commentStore.clearComments();
  }
}