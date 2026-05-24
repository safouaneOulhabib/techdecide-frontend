import { Component, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '@features/auth/store/auth.store';
import { LoginRequest } from '@features/auth/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule
  ],
  templateUrl: './login.container.html',
  styleUrl: './login.container.scss'
})
export class LoginContainer {
  private readonly store = inject(AuthStore);

  // Explicitly typed signals — fixes strict template checking
  readonly loading: Signal<boolean> = this.store.loading;
  readonly error: Signal<string | null> = this.store.error;

  credentials: LoginRequest = {
    email: '',
    password: ''
  };

  onSubmit() {
    this.store.login(this.credentials);
  }
}