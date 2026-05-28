import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Comment } from '@features/decisions/models/comment.model';

type TagSeverity = 'success' | 'danger' | 'secondary' |
  'info' | 'warn' | 'contrast' | null | undefined;

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [DatePipe, ButtonModule, TagModule, DividerModule],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.scss'
})
export class CommentList {
  comments = input.required<Comment[]>();
  currentUserName = input.required<string>();
  onDelete = output<number>();

  getVoteSeverity(vote: string | null): TagSeverity {
    const map: Record<string, TagSeverity> = {
      APPROVE: 'success',
      REJECT: 'danger',
      ABSTAIN: 'secondary'
    };
    return vote ? map[vote] : null;
  }

  getVoteLabel(vote: string | null): string {
    const map: Record<string, string> = {
      APPROVE: '✅ Approved',
      REJECT: '❌ Rejected',
      ABSTAIN: '🤔 Abstained'
    };
    return vote ? map[vote] : '';
  }

  canDelete(comment: Comment): boolean {
    return comment.authorName === this.currentUserName();
  }
}