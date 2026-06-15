import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ReportStore } from '@features/reports/store/report.store';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { ProjectStore } from '@features/projects/store/project.store';
import { DecisionPicker } from '@features/reports/components/decision-picker/decision-picker';
import { Decision } from '@features/decisions/models/decision.model';
import { ProjectSummary } from '@features/projects/models/project.model';

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, TextareaModule, MessageModule, SelectModule, DecisionPicker],
  templateUrl: './report-builder.container.html',
  styleUrl: './report-builder.container.scss'
})
export class ReportBuilderContainer implements OnInit {
  private readonly reportStore = inject(ReportStore);
  private readonly decisionStore = inject(DecisionStore);
  private readonly projectStore = inject(ProjectStore);
  private readonly router = inject(Router);

  readonly decisions: Signal<Decision[]> = this.decisionStore.decisions;
  readonly projects: Signal<ProjectSummary[]> = this.projectStore.projects;
  readonly loading: Signal<boolean> = this.reportStore.loading;
  readonly error: Signal<string | null> = this.reportStore.error;

  title = signal('');
  introduction = signal('');
  selectedProjectId = signal<number | null>(null);
  selectedDecisionIds = signal<number[]>([]);

  projectOptions = computed(() => [
    { label: 'Select a project...', value: null },
    ...this.projects().map(p => ({ label: p.name, value: p.id }))
  ]);

  decisionsForProject = computed(() => {
    const projectId = this.selectedProjectId();
    if (!projectId) return [];
    return this.decisions().filter(d => d.projectId === projectId);
  });

  canCreate = computed(() =>
    this.title().trim().length > 0 &&
    this.selectedProjectId() !== null &&
    this.selectedDecisionIds().length > 0
  );

  ngOnInit() {
    this.decisionStore.loadAll();
    this.projectStore.loadAll();
  }

  onProjectChange(value: number | null) {
    this.selectedProjectId.set(value);
    this.selectedDecisionIds.set([]);
  }

  onDecisionIdsChange(ids: number[]) {
    this.selectedDecisionIds.set(ids);
  }

  onCancel() {
    this.router.navigate(['/reports']);
  }

  onCreate() {
    if (!this.canCreate()) return;

    this.reportStore.create({
      projectId: this.selectedProjectId()!,
      title: this.title().trim(),
      introduction: this.introduction().trim() || null,
      decisionIds: this.selectedDecisionIds()
    }).subscribe({
      next: (report) => this.router.navigate(['/reports', report.id]),
      error: () => {}
    });
  }
}
