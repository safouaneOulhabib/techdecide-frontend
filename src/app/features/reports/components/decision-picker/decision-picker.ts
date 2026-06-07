import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { Decision } from '@features/decisions/models/decision.model';
import { Team } from '@features/teams/models/team.model';
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
  teams = input.required<Team[]>();
  selectedIds = output<number[]>();

  searchQuery = signal('');
  selectedTeamId = signal<number | null>(null);
  checkedIds = signal<Set<number>>(new Set());

  filteredDecisions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const teamId = this.selectedTeamId();
    const teamName = teamId
      ? this.teams().find(t => t.id === teamId)?.name
      : null;

    return this.decisions().filter(d => {
      const matchesSearch = !q || d.title.toLowerCase().includes(q);
      const matchesTeam = !teamName || d.teamName === teamName;
      return matchesSearch && matchesTeam;
    });
  });

  selectedCount = computed(() => this.checkedIds().size);

  teamOptions = computed(() => [
    { label: 'All teams', value: null },
    ...this.teams().map(t => ({ label: t.name, value: t.id }))
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

  onTeamChange(value: number | null) {
    this.selectedTeamId.set(value);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }
}
