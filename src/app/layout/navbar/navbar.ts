import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@features/auth/store/auth.store';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenuModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  @ViewChild('profileMenu') profileMenu!: Menu;

  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  isDark = signal(false);

  userInitial = computed(() => {
    const name = this.authStore.user()?.name || '';
    return name.charAt(0).toUpperCase();
  });

  profileItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.authStore.logout()
    }
  ];

  toggleDarkMode() {
    this.isDark.update(v => !v);
    document.documentElement.classList.toggle('my-app-dark');
  }

  toggleProfileMenu(event: Event) {
    this.profileMenu.toggle(event);
  }
}