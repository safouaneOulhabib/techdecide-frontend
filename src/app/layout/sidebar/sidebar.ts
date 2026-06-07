import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '@features/auth/store/auth.store';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TooltipModule ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private readonly authStore = inject(AuthStore);
  readonly currentUser = this.authStore.user;

  navItems = [
    { label: 'Decisions', icon: 'pi-list-check', route: '/decisions' },
    { label: 'Organizations', icon: 'pi-building', route: '/organizations' },
    { label: 'Teams', icon: 'pi-users', route: '/teams' },
    { label: 'Tags', icon: 'pi-tag', route: '/tags' },
    { label: 'Reports', icon: 'pi-book', route: '/reports' }
  ];

  readonly isCollapsed = signal(false);

  toggleCollapsed() {
    this.isCollapsed.update(v => !v);
  }
}