import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { TeamStore } from '@features/teams/store/team.store';
import { TagStore } from '@features/tags/store/tag.store';
import { DecisionForm, DecisionFormData } from '@features/decisions/components/decision-form/decision-form';
import { Team } from '@features/teams/models/team.model';
import { Tag } from '@features/tags/models/tag.model';

@Component({
  selector: 'app-decision-create',
  standalone: true,
  imports: [ButtonModule, MessageModule, DecisionForm],
  templateUrl: './decision-create.container.html',
  styleUrl: './decision-create.container.scss'
})
export class DecisionCreateContainer implements OnInit {
  private readonly decisionStore = inject(DecisionStore);
  private readonly teamStore = inject(TeamStore);
  private readonly tagStore = inject(TagStore);
  private readonly router = inject(Router);

  readonly loading: Signal<boolean> = this.decisionStore.loading;
  readonly error: Signal<string | null> = this.decisionStore.error;
  readonly teams: Signal<Team[]> = this.teamStore.teams;
  readonly tags: Signal<Tag[]> = this.tagStore.tags;

  ngOnInit() {
    this.teamStore.loadAll();
    this.tagStore.loadAll();
  }

  onFormSubmit(data: DecisionFormData) {
    this.decisionStore.create({
      title: data.title,
      context: data.context,
      decision: data.decision,
      consequences: data.consequences,
      teamId: data.teamId,
      tagIds: data.tagIds,
      alternatives: data.alternatives
    }).subscribe({
      next: () => this.router.navigate(['/decisions'])
    });
  }

  onFormCancel() {
    this.router.navigate(['/decisions']);
  }
}