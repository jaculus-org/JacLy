import { storage } from '@/lib/storage';
import { deleteIndexedDB } from '../utils';

export type JaclyProjectType = 'jacly' | 'code';

export type JacProject = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  archived: Date | null;
  jaculusVersion: string;
  type: JaclyProjectType;
  folderStructure?: Record<string, boolean>;
};

export type JacProjectMap = Record<string, JacProject>;

// use a local storage for now
const PROJECTS_STORAGE_KEY = 'jaculus_projects';

export function saveProject(project: JacProject): JacProject {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  if (existingIndex !== -1) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  storage.set(PROJECTS_STORAGE_KEY, projects);
  return project;
}

export function loadProjects(): JacProject[] {
  return storage.get(PROJECTS_STORAGE_KEY, []);
}

export function getProjectById(id: string): JacProject | undefined {
  const projects = loadProjects();
  return projects.find(p => p.id === id);
}

export function deleteProject(id: string) {
  const projects = loadProjects();
  const updatedProjects = projects.filter(p => p.id !== id);
  storage.set(PROJECTS_STORAGE_KEY, updatedProjects);
  deleteIndexedDB(id);
}

export function updateProjectFolderStructure(
  projectId: string,
  folderStructure: Record<string, boolean>
) {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    const updatedProject = {
      ...projects[projectIndex],
      folderStructure,
      updatedAt: new Date(),
    };
    projects[projectIndex] = updatedProject;
    storage.set(PROJECTS_STORAGE_KEY, projects);
    return updatedProject;
  }
  return null;
}
