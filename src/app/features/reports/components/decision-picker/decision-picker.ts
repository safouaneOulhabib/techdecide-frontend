import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { Decision } from '@features/decisions/models/decision.model';
import { ProjectSummary } from '@features/projects/models/project.model';
import { DecisionStatusBadge } from '@features/decisions/components/decision-status-badge/decision-status-badge';

@Component({
  selector: 'app-decision-picker',
  standalone: true,
  imports: [FormsModule, SelectModule, CheckboxModule, InputTextModule, DecisionStatusBadge],
  templateUrl: './decision-picker.html',
  styleUrl: './decision-picker.scss'
})
export class DecisionPicker {
  decisions = input.required<Decision[]>();
  projects = input<ProjectSummary[]>([]);
  selectedIds = output<number[]>();

  searchQuery = signal('');
  selectedProjectId = signal<number | null>(null);
  checkedIds = signal<Set<number>>(new Set());

  filteredDecisions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const projectId = this.selectedProjectId();

    return this.decisions().filter(d => {
      const matchesSearch = !q || d.title.toLowerCase().includes(q);
      const matchesProject = !projectId || d.projectId === projectId;
      return matchesSearch && matchesProject;
    });
  });

  selectedCount = computed(() => this.checkedIds().size);

  projectOptions = computed(() => [
    { label: 'All projects', value: null },
    ...this.projects().map(p => ({ label: p.name, value: p.id }))
  ]);

  isChecked(id: number): boolean {
    return this.checkedIds().has(id);
  }

  toggleDecision(id: number) {
    const next = new Set(this.checkedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.checkedIds.set(next);
    this.selectedIds.emit(Array.from(next));
  }

  onProjectChange(value: number | null) {
    this.selectedProjectId.set(value);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }
}
