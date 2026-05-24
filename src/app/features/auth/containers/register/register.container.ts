import { Component, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '@features/auth/store/auth.store';
import { RegisterRequest } from '@features/auth/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: './register.container.html',
  styleUrl: './register.container.scss'
})
export class RegisterContainer {
  private readonly store = inject(AuthStore);

  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  credentials: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };

  onSubmit() {
    this.store.register(this.credentials);
  }
}