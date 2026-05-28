import { Component, inject, OnInit, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DatePipe } from '@angular/common';
import { DecisionStore } from '@features/decisions/store/decision.store';
import { DecisionStatusBadge } from '@features/decisions/components/decision-status-badge/decision-status-badge';
import { Decision } from '@features/decisions/models/decision.model';

@Component({
  selector: 'app-decision-detail',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    DividerModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,
    DatePipe,
    DecisionStatusBadge
  ],
  templateUrl: './decision-detail.container.html',
  styleUrl: './decision-detail.container.scss'
})
export class DecisionDetailContainer implements OnInit {
  private readonly store = inject(DecisionStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly decision: Signal<Decision | null> = this.store.selectedDecision;
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.store.loadById(id);
  }

  goBack() {
    this.router.navigate(['/decisions']);
  }
}