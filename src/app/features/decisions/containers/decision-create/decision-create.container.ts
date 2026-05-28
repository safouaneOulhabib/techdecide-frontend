import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { CreateDecisionRequest } from '@features/decisions/models/decision.model';
import { Team } from '@features/teams/models/team.model';
import { Tag } from '@features/tags/models/tag.model';
import { TeamStore } from '@features/teams/store/team.store';
import { TagStore } from '@features/tags/store/tag.store';

@Component({
  selector: 'app-decision-create',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    MessageModule,
    CardModule
  ],
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

  form: CreateDecisionRequest = {
    title: '',
    context: '',
    decision: '',
    consequences: '',
    teamId: 0,
    tagIds: [],
    alternatives: []
  };

  newAlternative = { name: '', rejectionReason: '' };

  ngOnInit() {
    this.teamStore.loadAll();
    this.tagStore.loadAll();
  }

  addAlternative() {
    if (this.newAlternative.name.trim()) {
      this.form.alternatives = [
        ...(this.form.alternatives || []),
        { ...this.newAlternative }
      ];
      this.newAlternative = { name: '', rejectionReason: '' };
    }
  }

  removeAlternative(index: number) {
    this.form.alternatives = this.form.alternatives?.filter((_, i) => i !== index);
  }

  onSubmit() {
    this.decisionStore.create(this.form);
    this.router.navigate(['/decisions']);
  }

  goBack() {
    this.router.navigate(['/decisions']);
  }
}