import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DatePipe, Location } from '@angular/common';
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
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DecisionSupersedeDialog } from '@features/decisions/components/decision-supersede-dialog/decision-supersede-dialog';
import { canDelete, canEdit, canSupersede } from '@features/decisions/utils/decision-governance';

@Component({
  selector: 'app-decision-detail',
  standalone: true,
  imports: [
    ButtonModule,
    SkeletonModule,
    ProgressSpinnerModule,
    MessageModule,
    DatePipe,
    DecisionStatusBadge,
    CommentForm,
    CommentList,
    VoteSummary,
    DecisionStatusSelector,
    DecisionSupersedeDialog
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
  private readonly location = inject(Location);

  readonly comments: Signal<Comment[]> = this.commentStore.comments;
  readonly commentsLoading: Signal<boolean> = this.commentStore.loading;
  readonly currentUser: Signal<AuthResponse | null> = this.authStore.user;

  private decisionId = 0;

  // Supersede dialog state
  supersedeDialogVisible = signal(false);

  // Candidates for superseding: approved decisions, excluding the current one
  supersedeCandidates = computed(() =>
    this.decisionStore.approvedDecisions().filter(d => d.id !== this.decisionId)
  );

  readonly teamRole = computed(() => this.authStore.user()?.teamRole ?? null);
  readonly appRole = computed(() => this.authStore.user()?.appRole ?? 'USER');

  canSupersedeCurrent = computed(() => {
    const d = this.decision();
    if (!d || !canSupersede(d.status)) return false;
    const role = this.appRole();
    const tRole = this.teamRole();
    return role === 'APP_ADMIN' || tRole === 'TEAM_ADMIN';
  });

  canEditCurrent = computed(() => {
    const d = this.decision();
    return d ? canEdit(d.status) : false;
  });

  isTeamAdminOrAppAdmin = this.authStore.isTeamAdminOrAppAdmin;

  openSupersedeDialog() {
    if (this.decisionStore.decisions().length === 0) {
      this.decisionStore.loadAll();
    }
    this.supersedeDialogVisible.set(true);
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.decisionId = Number(params.get('id'));
      this.decisionStore.loadById(this.decisionId);
      this.commentStore.loadByDecision(this.decisionId);
    });
  }

  goBack() {
    this.location.back();
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

  onSupersedeConfirm(supersededById: number) {
    this.decisionStore.updateStatus(this.decisionId, 'SUPERSEDED', supersededById);
    this.supersedeDialogVisible.set(false);
  }

  onSupersedeCancel() {
    this.supersedeDialogVisible.set(false);
  }

  goToSuperseder() {
    const id = this.decision()?.supersededById;
    if (id != null) {
      this.router.navigate(['/decisions', id]);
    }
  }


  ngOnDestroy() {
    this.commentStore.clearComments();
    this.decisionStore.clearSelected();
  }
}