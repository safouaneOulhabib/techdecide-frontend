import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError, Subject } from 'rxjs';
import { ProjectStore } from './project.store';
import { ProjectService } from '../services/project.service';
import { Project, ProjectSummary, ProjectTeam } from '../models/project.model';

const mockSummary = (overrides: Partial<ProjectSummary> = {}): ProjectSummary => ({
  id: 1, name: 'GTN', organizationName: 'TechDecide Corp', teamCount: 2, ...overrides,
});

const mockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 1, name: 'GTN', description: null, organizationId: 1,
  organizationName: 'TechDecide Corp', teamCount: 2,
  createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00',
  ...overrides,
});

const mockTeam = (overrides: Partial<ProjectTeam> = {}): ProjectTeam => ({
  teamId: 1, teamName: 'Backend Team', ...overrides,
});

const mockService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  getTeams: vi.fn(),
  getAvailableTeams: vi.fn(),
  assignTeam: vi.fn(),
  removeTeam: vi.fn(),
};

describe('ProjectStore', () => {
  let store: InstanceType<typeof ProjectStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ProjectStore,
        { provide: ProjectService, useValue: mockService },
      ],
    });
    store = TestBed.inject(ProjectStore);
  });

  it('has correct initial state', () => {
    expect(store.projects()).toEqual([]);
    expect(store.selectedProject()).toBeNull();
    expect(store.projectTeams()).toEqual([]);
    expect(store.availableTeams()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  describe('loadAll', () => {
    it('populates projects on success', () => {
      mockService.getAll.mockReturnValue(of([mockSummary()]));
      store.loadAll();
      expect(store.projects().length).toBe(1);
      expect(store.projects()[0].name).toBe('GTN');
    });

    it('sets error on failure', () => {
      mockService.getAll.mockReturnValue(throwError(() => ({ error: { message: 'Forbidden' } })));
      store.loadAll();
      expect(store.error()).toBe('Forbidden');
    });
  });

  describe('loadById', () => {
    it('sets selectedProject on success', () => {
      mockService.getById.mockReturnValue(of(mockProject({ id: 5 })));
      store.loadById(5);
      expect(store.selectedProject()?.id).toBe(5);
    });

    it('clears selectedProject before loading', () => {
      mockService.getById.mockReturnValue(of(mockProject({ id: 1 })));
      store.loadById(1);
      const subject = new Subject();
      mockService.getById.mockReturnValue(subject);
      store.loadById(2);
      expect(store.selectedProject()).toBeNull();
    });
  });

  describe('create', () => {
    it('appends summary to projects list', () => {
      mockService.create.mockReturnValue(of(mockProject({ id: 7, name: 'Alpha', teamCount: 0 })));
      store.create({ name: 'Alpha', description: null, organizationId: 1 });
      expect(store.projects().length).toBe(1);
      expect(store.projects()[0].name).toBe('Alpha');
      expect(store.projects()[0].teamCount).toBe(0);
    });
  });

  describe('remove', () => {
    it('removes project from list', () => {
      mockService.getAll.mockReturnValue(of([mockSummary({ id: 1 }), mockSummary({ id: 2 })]));
      store.loadAll();
      mockService.remove.mockReturnValue(of(null));
      store.remove(1);
      expect(store.projects().length).toBe(1);
      expect(store.projects()[0].id).toBe(2);
    });
  });

  describe('assignTeam', () => {
    it('adds team to projectTeams and removes from available', () => {
      const t1 = mockTeam({ teamId: 1, teamName: 'Backend' });
      const t2 = mockTeam({ teamId: 2, teamName: 'Devops' });
      mockService.getAvailableTeams.mockReturnValue(of([t1, t2]));
      store.loadAvailableTeams(1);
      mockService.assignTeam.mockReturnValue(of(t1));
      store.assignTeam(1, 1);
      expect(store.projectTeams().some(t => t.teamId === 1)).toBe(true);
      expect(store.availableTeams().some(t => t.teamId === 1)).toBe(false);
    });

    it('increments teamCount on selectedProject', () => {
      mockService.getById.mockReturnValue(of(mockProject({ id: 1, teamCount: 1 })));
      store.loadById(1);
      mockService.assignTeam.mockReturnValue(of(mockTeam()));
      store.assignTeam(1, 1);
      expect(store.selectedProject()?.teamCount).toBe(2);
    });
  });

  describe('removeTeam', () => {
    it('removes team from projectTeams and adds back to available', () => {
      const t1 = mockTeam({ teamId: 1, teamName: 'Backend' });
      mockService.getTeams.mockReturnValue(of([t1]));
      store.loadTeams(1);
      mockService.removeTeam.mockReturnValue(of(null));
      store.removeTeam(1, 1);
      expect(store.projectTeams().some(t => t.teamId === 1)).toBe(false);
      expect(store.availableTeams().some(t => t.teamId === 1)).toBe(true);
    });

    it('decrements teamCount on selectedProject, floor at 0', () => {
      mockService.getById.mockReturnValue(of(mockProject({ id: 1, teamCount: 1 })));
      store.loadById(1);
      mockService.getTeams.mockReturnValue(of([mockTeam()]));
      store.loadTeams(1);
      mockService.removeTeam.mockReturnValue(of(null));
      store.removeTeam(1, 1);
      expect(store.selectedProject()?.teamCount).toBe(0);
    });
  });

  describe('clearSelected', () => {
    it('resets selectedProject, projectTeams, availableTeams, error', () => {
      mockService.getById.mockReturnValue(of(mockProject()));
      store.loadById(1);
      store.clearSelected();
      expect(store.selectedProject()).toBeNull();
      expect(store.projectTeams()).toEqual([]);
      expect(store.availableTeams()).toEqual([]);
    });
  });
});
