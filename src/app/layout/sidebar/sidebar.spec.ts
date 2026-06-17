import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Sidebar } from './sidebar';
import { AuthStore } from '@features/auth/store/auth.store';

// QA matrix coverage: UI-06

describe('Sidebar — navigation structure and active state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [Sidebar, RouterTestingModule],
      providers: [
        { provide: AuthStore, useValue: { user: signal(null) } },
      ],
    });
  });

  it('UI-06 navItems covers all primary routes so routerLinkActive applies to each', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();

    const routes = fixture.componentInstance.navItems.map(i => i.route);
    expect(routes).toContain('/decisions');
    expect(routes).toContain('/organizations');
    expect(routes).toContain('/teams');
    expect(routes).toContain('/tags');
    expect(routes).toContain('/reports');
    expect(routes).toContain('/projects');
  });

  it('sidebar starts expanded (not collapsed)', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    expect(fixture.componentInstance.isCollapsed()).toBe(false);
  });

  it('toggle sets collapsed to true then back to false', () => {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    fixture.componentInstance.toggleCollapsed();
    expect(fixture.componentInstance.isCollapsed()).toBe(true);
    fixture.componentInstance.toggleCollapsed();
    expect(fixture.componentInstance.isCollapsed()).toBe(false);
  });
});
