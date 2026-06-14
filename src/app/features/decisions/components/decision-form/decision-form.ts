import { Component, input, output, OnInit, OnChanges, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { MultiSelectModule } from 'primeng/multiselect';
import { Tag } from '@features/tags/models/tag.model';
import { Decision } from '@features/decisions/models/decision.model';
import { ProjectSummary, ProjectTeam } from '@features/projects/models/project.model';

export type DecisionFormData = {
  title: string;
  context: string;
  decision: string;
  consequences: string;
  projectId: number;
  teamIds: number[];
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
export class DecisionForm implements OnInit, OnChanges {
  existingDecision = input<Decision | null>(null);
  projects = input<ProjectSummary[]>([]);
  projectTeams = input<ProjectTeam[]>([]);
  tags = input.required<Tag[]>();
  loading = input.required<boolean>();
  ownTeamId = input<number | null>(null);

  formSubmit = output<DecisionFormData>();
  formCancel = output<void>();
  projectChange = output<number>();

  form = signal<DecisionFormData>({
    title: '',
    context: '',
    decision: '',
    consequences: '',
    projectId: 0,
    teamIds: [],
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
        projectId: 0,
        teamIds: [],
        tagIds: existing.tags.map(t => t.id),
        alternatives: existing.alternatives.map(a => ({
          name: a.name,
          rejectionReason: a.rejectionReason || ''
        }))
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projectTeams'] && !this.isEditMode) {
      const teams = this.projectTeams();
      this.form.update(f => ({ ...f, teamIds: teams.map(t => t.teamId) }));
    }
  }

  onProjectChange(projectId: number) {
    this.form.update(f => ({ ...f, projectId, teamIds: [] }));
    if (projectId) {
      this.projectChange.emit(projectId);
    }
  }

  removeTeam(teamId: number) {
    if (teamId === this.ownTeamId()) return;
    this.form.update(f => ({ ...f, teamIds: f.teamIds.filter(id => id !== teamId) }));
  }

  teamName(teamId: number): string {
    return this.projectTeams().find(t => t.teamId === teamId)?.teamName ?? String(teamId);
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
