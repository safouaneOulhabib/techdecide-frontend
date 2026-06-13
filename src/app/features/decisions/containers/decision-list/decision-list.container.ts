import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { AuthStore } from '@features/auth/store/auth.store';
import { DecisionCard } from '@features/decisions/components/decision-card/decision-card';
import { Decision } from '@features/decisions/models/decision.model';
import { signal, computed } from '@angular/core';
import { TeamStore } from '@features/teams/store/team.store';
import { TagStore } from '@features/tags/store/tag.store';
import { DecisionFilters, DecisionFiltersValue } from '@features/decisions/components/decision-filters/decision-filters';
import { Team } from '@features/teams/models/team.model';
import { Tag } from '@features/tags/models/tag.model';
import { SkeletonModule } from 'primeng/skeleton';


@Component({
  selector: 'app-decision-list',
  standalone: true,
  imports: [
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    DecisionCard,
    DecisionFilters,
    SkeletonModule,
  ],
  templateUrl: './decision-list.container.html',
  styleUrl: './decision-list.container.scss'
})
export class DecisionListContainer implements OnInit {
  private readonly store = inject(DecisionStore);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly allDecisions: Signal<Decision[]> = this.store.decisions;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  private readonly teamStore = inject(TeamStore);
  private readonly tagStore = inject(TagStore);

  readonly teams: Signal<Team[]> = this.teamStore.teams;
  readonly tags: Signal<Tag[]> = this.tagStore.tags;

  readonly hasTeam = this.authStore.hasTeam;

  activeFilters = signal<DecisionFiltersValue>({
    keyword: '',
    status: null,
    teamId: null,
    tagId: null
  });

  filteredDecisions = computed(() => {
    const filters = this.activeFilters();
    return this.allDecisions().filter(d => {
      const matchesKeyword = !filters.keyword ||
        d.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        d.context.toLowerCase().includes(filters.keyword.toLowerCase());

      const matchesStatus = !filters.status || d.status === filters.status;

      const matchesTeam = !filters.teamId || d.teamName ===
        this.teams().find(t => t.id === filters.teamId)?.name;

      const matchesTag = !filters.tagId ||
        d.tags.some(t => t.id === filters.tagId);

      return matchesKeyword && matchesStatus && matchesTeam && matchesTag;
    });
  });



  ngOnInit() {
    this.store.loadAll();
    this.teamStore.loadAll();
    this.tagStore.loadAll();
  }

  onFiltersChange(filters: DecisionFiltersValue) {
    this.activeFilters.set(filters);
  }

  onView(id: number) {
    this.router.navigate(['/decisions', id]);
  }

  onDelete(id: number) {
    this.store.remove(id);
  }

  onCreateNew() {
    this.router.navigate(['/decisions/create']);
  }
}