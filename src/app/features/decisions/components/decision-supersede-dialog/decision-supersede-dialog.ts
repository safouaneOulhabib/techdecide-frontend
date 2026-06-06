import { Component, computed, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Decision } from '@features/decisions/models/decision.model';

@Component({
  selector: 'app-decision-supersede-dialog',
  standalone: true,
  imports: [FormsModule, DialogModule, SelectModule, ButtonModule],
  templateUrl: './decision-supersede-dialog.html',
  styleUrl: './decision-supersede-dialog.scss'
})
export class DecisionSupersedeDialog {
  visible = input.required<boolean>();
  candidates = input.required<Decision[]>();

  confirm = output<number>();
  cancel = output<void>();

  selectedId = signal<number | null>(null);
  hasCandidates = computed(() => this.candidates().length > 0);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.selectedId.set(null);
      }
    });
  }

  onConfirm() {
    const id = this.selectedId();
    if (id != null) {
      this.confirm.emit(id);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}