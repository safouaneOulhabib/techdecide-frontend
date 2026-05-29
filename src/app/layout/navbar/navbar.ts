import { Component, inject, signal, computed } from '@angular/core';
import { AuthStore } from '@features/auth/store/auth.store';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  private readonly authStore = inject(AuthStore);

  isDark = signal(false);

  userInitial = computed(() => {
    const name = this.authStore.user()?.name || '';
    return name.charAt(0).toUpperCase();
  });

  toggleDarkMode() {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('my-app-dark');
  }

  logout() {
    this.authStore.logout();
  }
}