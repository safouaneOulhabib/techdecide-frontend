import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { AuthStore } from '@features/auth/store/auth.store';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ButtonModule, MenubarModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private readonly authStore = inject(AuthStore);

  readonly currentUser = this.authStore.user;

  logout() {
    this.authStore.logout();
  }
}