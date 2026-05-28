import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { CommentService } from '@features/decisions/services/comment.service';
import { Comment, CreateCommentRequest } from '@features/decisions/models/comment.model';

export type CommentState = {
  comments: Comment[];
  loading: boolean;
  error: string | null;
};

const initialState: CommentState = {
  comments: [],
  loading: false,
  error: null
};

export const CommentStore = signalStore(
  { providedIn: 'root' },
  withState<CommentState>(initialState),
  withMethods((store, service = inject(CommentService)) => ({

    loadByDecision(decisionId: number) {
      patchState(store, { loading: true, error: null });
      service.getByDecision(decisionId).subscribe({
        next: (comments) => patchState(store, { comments, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to load comments',
          loading: false
        })
      });
    },

    create(decisionId: number, request: CreateCommentRequest) {
      patchState(store, { loading: true, error: null });
      service.create(decisionId, request).subscribe({
        next: (comment) => patchState(store, (state) => ({
          comments: [...state.comments, comment],
          loading: false
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to add comment',
          loading: false
        })
      });
    },

    remove(commentId: number) {
      service.remove(commentId).subscribe({
        next: () => patchState(store, (state) => ({
          comments: state.comments.filter(c => c.id !== commentId)
        })),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to delete comment'
        })
      });
    },

    clearComments() {
      patchState(store, { comments: [], error: null });
    }
  }))
);