import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { TagService } from '@features/tags/services/tag.service';
import { Tag, CreateTagRequest } from '@features/tags/models/tag.model';

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
    },

    create(request: CreateTagRequest) {
      patchState(store, { loading: true, error: null });
      service.create(request).subscribe({
        next: (tag) => patchState(store, {
          tags: [...store.tags(), tag],
          loading: false
        }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to create tag',
          loading: false
        })
      });
    },

    remove(id: number) {
      service.remove(id).subscribe({
        next: () => patchState(store, {
          tags: store.tags().filter(t => t.id !== id)
        }),
        error: (err) => patchState(store, {
          error: err.error?.message || 'Failed to delete tag'
        })
      });
    }
  }))
);
