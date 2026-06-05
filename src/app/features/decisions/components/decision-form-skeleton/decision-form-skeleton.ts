import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-decision-form-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './decision-form-skeleton.html',
  styleUrl: './decision-form-skeleton.scss'
})
export class DecisionFormSkeleton {}