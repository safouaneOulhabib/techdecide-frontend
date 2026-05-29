import { Component, input, computed } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Comment } from '@features/decisions/models/comment.model';

@Component({
  selector: 'app-vote-summary',
  standalone: true,
  imports: [TagModule],
  templateUrl: './vote-summary.html',
  styleUrl: './vote-summary.scss'
})
export class VoteSummary {
  comments = input.required<Comment[]>();

  approved = computed(() =>
    this.comments().filter(c => c.vote === 'APPROVE').length
  );

  rejected = computed(() =>
    this.comments().filter(c => c.vote === 'REJECT').length
  );

  abstained = computed(() =>
    this.comments().filter(c => c.vote === 'ABSTAIN').length
  );

  totalVotes = computed(() =>
    this.approved() + this.rejected() + this.abstained()
  );
}