import { Component, effect, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { TagStore } from '@features/tags/store/tag.store';
import { DecisionForm, DecisionFormData } from '@features/decisions/components/decision-form/decision-form';
import { Decision } from '@features/decisions/models/decision.model';
import { Tag } from '@features/tags/models/tag.model';
import { DecisionFormSkeleton } from '@features/decisions/components/decision-form-skeleton/decision-form-skeleton';
import { canEdit } from '@features/decisions/utils/decision-governance';

@Component({
  selector: 'app-decision-edit',
  standalone: true,
  imports: [MessageModule, DecisionForm, DecisionFormSkeleton],
  templateUrl: './decision-edit.container.html',
  styleUrl: './decision-edit.container.scss'
})
export class DecisionEditContainer implements OnInit {
  private readonly decisionStore = inject(DecisionStore);
  private readonly tagStore = inject(TagStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly decision: Signal<Decision | null> = this.decisionStore.selectedDecision;
  readonly loading: Signal<boolean> = this.decisionStore.loading;
  readonly error: Signal<string | null> = this.decisionStore.error;
  readonly tags: Signal<Tag[]> = this.tagStore.tags;

  private decisionId = 0;

  constructor() {
    effect(() => {
      const d = this.decision();
      if (d && !canEdit(d.status)) {
        this.router.navigate(['/decisions', d.id]);
      }
    });
  }

  ngOnInit() {
    this.decisionId = Number(this.route.snapshot.paramMap.get('id'));
    this.decisionStore.loadById(this.decisionId);
    this.tagStore.loadAll();
  }

  onFormSubmit(data: DecisionFormData) {
    this.decisionStore.update(this.decisionId, {
      title: data.title,
      context: data.context,
      decision: data.decision,
      consequences: data.consequences,
      tagIds: data.tagIds,
      alternatives: data.alternatives
    }).subscribe({
      next: () => this.router.navigate(['/decisions', this.decisionId]),
      error: () => { }
    });
  }

  onFormCancel() {
    this.router.navigate(['/decisions', this.decisionId]);
  }
}
