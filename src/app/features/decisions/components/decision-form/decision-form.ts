import { Component, input, output, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { Team } from '@features/teams/models/team.model';
import { Tag } from '@features/tags/models/tag.model';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  Decision
} from '@features/decisions/models/decision.model';

export type DecisionFormData = {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  teamId: number;
  tagIds: number[];
  alternatives: { name: string; rejectionReason: string }[];
};

@Component({
  selector: 'app-decision-form',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CardModule,
    MultiSelectModule
  ],
  templateUrl: './decision-form.html',
  styleUrl: './decision-form.scss'
})
export class DecisionForm implements OnInit {
  // Inputs
  existingDecision = input<Decision | null>(null);
  teams = input.required<Team[]>();
  tags = input.required<Tag[]>();
  loading = input.required<boolean>();

  // Outputs
  formSubmit = output<DecisionFormData>();
  formCancel = output<void>();

  // Internal form state
  form = signal<DecisionFormData>({
    title: '',
    context: '',
    decision: '',
    consequences: '',
    teamId: 0,
    tagIds: [],
    alternatives: []
  });

  newAlternative = signal({ name: '', rejectionReason: '' });

  get isEditMode(): boolean {
    return !!this.existingDecision();
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Save Changes' : 'Create Decision';
  }

  ngOnInit() {
    const existing = this.existingDecision();
    if (existing) {
      this.form.set({
        title: existing.title,
        context: existing.context,
        decision: existing.decision,
        consequences: existing.consequences || '',
        teamId: 0,
        tagIds: existing.tags.map(t => t.id),
        alternatives: existing.alternatives.map(a => ({
          name: a.name,
          rejectionReason: a.rejectionReason || ''
        }))
      });
    } else {
      const onlyTeam = this.teams();
      if (onlyTeam.length === 1) {
        this.form.update(f => ({ ...f, teamId: onlyTeam[0].id }));
      }
    }
  }

  addAlternative() {
    const alt = this.newAlternative();
    if (!alt.name.trim()) return;

    this.form.update(f => ({
      ...f,
      alternatives: [...f.alternatives, { ...alt }]
    }));

    this.newAlternative.set({ name: '', rejectionReason: '' });
  }

  removeAlternative(index: number) {
    this.form.update(f => ({
      ...f,
      alternatives: f.alternatives.filter((_, i) => i !== index)
    }));
  }

  onSubmit() {
    this.formSubmit.emit(this.form());
  }

  onCancel() {
    this.formCancel.emit();
  }
}