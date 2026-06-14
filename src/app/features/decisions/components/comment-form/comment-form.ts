import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CreateCommentRequest, Vote } from '@features/decisions/models/comment.model';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule, ButtonModule, TextareaModule, SelectButtonModule],
  templateUrl: './comment-form.html',
  styleUrl: './comment-form.scss'
})
export class CommentForm {
  canVote = input<boolean>(true);
  onSubmit = output<CreateCommentRequest>();

  content = signal('');
  selectedVote = signal<Vote | null>(null);

  voteOptions = [
    { label: '✅ Approve', value: 'APPROVE' },
    { label: '❌ Reject', value: 'REJECT' },
    { label: '🤔 Abstain', value: 'ABSTAIN' }
  ];

  submit() {
    if (!this.content().trim()) return;

    this.onSubmit.emit({
      content: this.content(),
      vote: this.canVote() ? (this.selectedVote() ?? undefined) : undefined
    });

    this.content.set('');
    this.selectedVote.set(null);
  }
}
