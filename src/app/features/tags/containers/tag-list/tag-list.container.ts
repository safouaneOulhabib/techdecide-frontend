import { Component, inject, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagStore } from '@features/tags/store/tag.store';
import { Tag, CreateTagRequest } from '@features/tags/models/tag.model';

@Component({
  selector: 'app-tag-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    ColorPickerModule,
    ProgressSpinnerModule,
    MessageModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './tag-list.container.html',
  styleUrl: './tag-list.container.scss'
})
export class TagListContainer implements OnInit {
  private readonly store = inject(TagStore);
  private readonly confirmationService = inject(ConfirmationService);

  readonly tags: Signal<Tag[]> = this.store.tags;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

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
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the tag "${tag.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.remove(tag.id);
      }
    });
  }
}
