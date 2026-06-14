import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DecisionStatus } from '@features/decisions/models/decision.model';
import { ProjectSummary } from '@features/projects/models/project.model';
import { Tag } from '@features/tags/models/tag.model';

export type DecisionFiltersValue = {
  keyword: string;
  status: DecisionStatus | null;
  projectId: number | null;
  tagId: number | null;
};

@Component({
  selector: 'app-decision-filters',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, InputTextModule],
  templateUrl: './decision-filters.html',
  styleUrl: './decision-filters.scss'
})
export class DecisionFilters {
  projects = input<ProjectSummary[]>([]);
  tags = input.required<Tag[]>();
  filtersChange = output<DecisionFiltersValue>();

  filters = signal<DecisionFiltersValue>({
    keyword: '',
    status: null,
    projectId: null,
    tagId: null
  });

  statusOptions = [
    { label: 'All Statuses', value: null },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Proposed', value: 'PROPOSED' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Superseded', value: 'SUPERSEDED' }
  ];

  onFilterChange() {
    this.filtersChange.emit(this.filters());
  }

  clearFilters() {
    this.filters.set({ keyword: '', status: null, projectId: null, tagId: null });
    this.filtersChange.emit(this.filters());
  }

  get hasActiveFilters(): boolean {
    const f = this.filters();
    return !!f.keyword || !!f.status || !!f.projectId || !!f.tagId;
  }
}
