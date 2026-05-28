import { Component, inject, OnInit, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { DecisionCard } from '@features/decisions/components/decision-card/decision-card';
import { Decision } from '@features/decisions/models/decision.model';

@Component({
  selector: 'app-decision-list',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    MessageModule,
    FormsModule,
    DecisionCard
  ],
  templateUrl: './decision-list.container.html',
  styleUrl: './decision-list.container.scss'
})
export class DecisionListContainer implements OnInit {
  private readonly store = inject(DecisionStore);
  private readonly router = inject(Router);

  readonly decisions: Signal<Decision[]> = this.store.decisions;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  searchKeyword = '';

  ngOnInit() {
    this.store.loadAll();
  }

  onSearch() {
    if (this.searchKeyword.trim()) {
      this.store.search(this.searchKeyword);
    } else {
      this.store.loadAll();
    }
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