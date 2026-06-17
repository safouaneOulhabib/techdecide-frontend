import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ProjectTeamRow } from './project-team-row';
import { ProjectTeam } from '@features/projects/models/project.model';

const team: ProjectTeam = { teamId: 1, teamName: 'Backend' };

describe('ProjectTeamRow', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProjectTeamRow],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  function create(isAppAdmin: boolean) {
    const fixture = TestBed.createComponent(ProjectTeamRow);
    fixture.componentRef.setInput('team', team);
    fixture.componentRef.setInput('isAppAdmin', isAppAdmin);
    fixture.detectChanges();
    return fixture;
  }

  it('PROJ-12 hides assign/remove controls for MEMBER users on project detail', () => {
    const fixture = create(false);
    expect(fixture.nativeElement.querySelector('.btn-remove')).toBeNull();
  });

  it('shows remove controls for APP_ADMIN users on project detail', () => {
    const fixture = create(true);
    expect(fixture.nativeElement.querySelector('.btn-remove')).not.toBeNull();
  });
});
