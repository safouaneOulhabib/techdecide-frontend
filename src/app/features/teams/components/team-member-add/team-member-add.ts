import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-team-member-add',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputNumberModule],
  templateUrl: './team-member-add.html',
  styleUrl: './team-member-add.scss',
})
export class TeamMemberAdd {
  loading = input.required<boolean>();
  onAssign = output<number>();

  userId = signal<number | null>(null);

  submit() {
    const id = this.userId();
    if (id == null || id <= 0) return;
    this.onAssign.emit(id);
    this.userId.set(null);
  }
}
