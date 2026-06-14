import { Component, computed, inject, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagStore } from '@features/tags/store/tag.store';
import { Tag, CreateTagRequest } from '@features/tags/models/tag.model';
import { ConfirmService } from '@core/services/confirm.service';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthStore } from '@features/auth/store/auth.store';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ColorPickerModule,
    SkeletonModule,
    MessageModule
  ],
  templateUrl: './tag-list.container.html',
  styleUrl: './tag-list.container.scss'
})
export class TagListContainer implements OnInit {
  private readonly store = inject(TagStore);
  private readonly confirmService = inject(ConfirmService);
  private readonly authStore = inject(AuthStore);

  readonly tags: Signal<Tag[]> = this.store.tags;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;
  readonly isAppAdmin = computed(() => this.authStore.user()?.appRole === 'APP_ADMIN');

  newTagName = '';
  newTagColor = '#6366f1';

  ngOnInit() {
    this.store.loadAll();
  }

  onCreateTag() {
    if (!this.newTagName.trim()) return;
    const req: CreateTagRequest = {
      name: this.newTagName.trim(),
      color: this.newTagColor
    };
    this.store.create(req);
    this.newTagName = '';
    this.newTagColor = '#6366f1';
  }

  onDeleteTag(tag: Tag) {
  this.confirmService.confirm(
    `Are you sure you want to delete the tag "${tag.name}"?`,
    () => this.store.remove(tag.id)
  );
}
}
