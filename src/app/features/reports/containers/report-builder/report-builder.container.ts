import { Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ReportStore } from '@features/reports/store/report.store';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { TeamStore } from '@features/teams/store/team.store';
import { DecisionPicker } from '@features/reports/components/decision-picker/decision-picker';
import { Decision } from '@features/decisions/models/decision.model';
import { Team } from '@features/teams/models/team.model';

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule, TextareaModule, MessageModule, DecisionPicker],
  templateUrl: './report-builder.container.html',
  styleUrl: './report-builder.container.scss'
})
export class ReportBuilderContainer implements OnInit {
  private readonly reportStore = inject(ReportStore);
  private readonly decisionStore = inject(DecisionStore);
  private readonly teamStore = inject(TeamStore);
  private readonly router = inject(Router);

  readonly decisions: Signal<Decision[]> = this.decisionStore.decisions;
  readonly teams: Signal<Team[]> = this.teamStore.teams;
  readonly loading: Signal<boolean> = this.reportStore.loading;
  readonly error: Signal<string | null> = this.reportStore.error;

  title = signal('');
  introduction = signal('');
  selectedDecisionIds = signal<number[]>([]);

  canCreate = computed(() =>
    this.title().trim().length > 0 && this.selectedDecisionIds().length > 0
  );

  ngOnInit() {
    this.decisionStore.loadAll();
    this.teamStore.loadAll();
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
      title: this.title().trim(),
      introduction: this.introduction().trim() || null,
      decisionIds: this.selectedDecisionIds()
    }).subscribe({
      next: (report) => this.router.navigate(['/reports', report.id]),
      error: () => {}
    });
  }
}
