import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { ProjectService } from '@features/projects/services/project.service';
import { Project, ProjectSummary, ProjectTeam, CreateProjectRequest } from '@features/projects/models/project.model';

export type ProjectState = {
  projects: ProjectSummary[];
  selectedProject: Project | null;
  projectTeams: ProjectTeam[];
  availableTeams: ProjectTeam[];
  loading: boolean;
  error: string | null;
};

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  projectTeams: [],
  availableTeams: [],
  loading: false,
  error: null,
};

export const ProjectStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectState>(initialState),
  withMethods((store, service = inject(ProjectService)) => ({

    loadAll() {
      patchState(store, (s) => ({ ...s, loading: true, error: null }));
      service.getAll().subscribe({
        next: (projects) => patchState(store, (s) => ({ ...s, projects, loading: false })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to load projects',
          loading: false,
        })),
      });
    },

    loadById(id: number) {
      patchState(store, (s) => ({ ...s, loading: true, error: null, selectedProject: null }));
      service.getById(id).subscribe({
        next: (selectedProject) => patchState(store, (s) => ({ ...s, selectedProject, loading: false })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to load project',
          loading: false,
        })),
      });
    },

    create(request: CreateProjectRequest) {
      patchState(store, (s) => ({ ...s, loading: true, error: null }));
      service.create(request).subscribe({
        next: (project) => patchState(store, (s) => ({
          ...s,
          projects: [...s.projects, {
            id: project.id,
            name: project.name,
            organizationName: project.organizationName,
            teamCount: project.teamCount,
          }],
          loading: false,
        })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to create project',
          loading: false,
        })),
      });
    },

    remove(id: number) {
      service.remove(id).subscribe({
        next: () => patchState(store, (s) => ({
          ...s,
          projects: s.projects.filter(p => p.id !== id),
        })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to delete project',
        })),
      });
    },

    loadTeams(projectId: number) {
      service.getTeams(projectId).subscribe({
        next: (projectTeams) => patchState(store, (s) => ({ ...s, projectTeams })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to load teams',
        })),
      });
    },

    loadAvailableTeams(projectId: number) {
      service.getAvailableTeams(projectId).subscribe({
        next: (availableTeams) => patchState(store, (s) => ({ ...s, availableTeams })),
        error: () => {},
      });
    },

    assignTeam(projectId: number, teamId: number) {
      service.assignTeam(projectId, teamId).subscribe({
        next: (pt) => patchState(store, (s) => ({
          ...s,
          projectTeams: [...s.projectTeams, pt],
          availableTeams: s.availableTeams.filter(t => t.teamId !== teamId),
          selectedProject: s.selectedProject
            ? { ...s.selectedProject, teamCount: s.selectedProject.teamCount + 1 }
            : null,
        })),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to assign team',
        })),
      });
    },

    removeTeam(projectId: number, teamId: number) {
      service.removeTeam(projectId, teamId).subscribe({
        next: () => patchState(store, (s) => {
          const removed = s.projectTeams.find(t => t.teamId === teamId);
          return {
            ...s,
            projectTeams: s.projectTeams.filter(t => t.teamId !== teamId),
            availableTeams: removed ? [...s.availableTeams, removed] : s.availableTeams,
            selectedProject: s.selectedProject
              ? { ...s.selectedProject, teamCount: Math.max(0, s.selectedProject.teamCount - 1) }
              : null,
          };
        }),
        error: (err) => patchState(store, (s) => ({
          ...s,
          error: err.error?.message || 'Failed to remove team',
        })),
      });
    },

    clearSelected() {
      patchState(store, (s) => ({
        ...s,
        selectedProject: null,
        projectTeams: [],
        availableTeams: [],
        error: null,
      }));
    },

  }))
);
