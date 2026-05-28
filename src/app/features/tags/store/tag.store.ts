import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { TagService } from '@features/tags/services/tag.service';
import { Tag } from '@features/tags/models/tag.model';

export type TagState = {
  tags: Tag[];
  loading: boolean;
  error: string | null;
};

const initialState: TagState = {
  tags: [],
  loading: false,
  error: null
};

export const TagStore = signalStore(
  { providedIn: 'root' },
  withState<TagState>(initialState),
  withMethods((store, service = inject(TagService)) => ({
    loadAll() {
      patchState(store, { loading: true, error: null });
      service.getAll().subscribe({
        next: (tags) => patchState(store, { tags, loading: false }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to load tags',
          loading: false
        })
      });
    }
  }))
);