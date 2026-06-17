import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProjectCard } from './project-card';
import { ProjectSummary } from '@features/projects/models/project.model';

const makeProject = (overrides: Partial<ProjectSummary> = {}): ProjectSummary => ({
  id: 1,
  name: 'GTN',
  organizationName: 'TechDecide',
  teamCount: 2,
  ...overrides,
});

describe('ProjectCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectCard],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function create(isAppAdmin: boolean) {
    const fixture = TestBed.createComponent(ProjectCard);
    fixture.componentRef.setInput('project', makeProject());
    fixture.componentRef.setInput('isAppAdmin', isAppAdmin);
    fixture.detectChanges();
    return fixture;
  }

  it('PROJ-11 hides the delete action for MEMBER users', () => {
    const fixture = create(false);
    expect(fixture.nativeElement.querySelector('.btn-delete')).toBeNull();
  });

  it('shows the delete action for APP_ADMIN users', () => {
    const fixture = create(true);
    expect(fixture.nativeElement.querySelector('.btn-delete')).not.toBeNull();
  });
});
