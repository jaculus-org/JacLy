import { storage, STORAGE_KEYS } from '@/lib/storage';
import { generateNanoId } from '../utils';
import path from 'path';

export type JaclyProjectType = 'jacly' | 'code';

export type JaclyProject = {
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

export function getProjectDbName(projectId: string): string {
  return `jacly-${projectId}`;
}

export function getProjectFsRoot(projectId: string): string {
  return path.join('/', projectId);
}

export function getProjects(): JaclyProject[] {
  return storage.get(STORAGE_KEYS.PROJECTS, []);
}

export function getProjectById(projectId: string): JaclyProject | null {
  const projects = getProjects();
  return projects.find(project => project.id === projectId) || null;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const projects = getProjects();
  const index = projects.findIndex(project => project.id === projectId);
  if (index >= 0) {
    const fsProjectName = getProjectDbName(projectId);
    await deleteIndexedDB(fsProjectName);
    projects.splice(index, 1);
    storage.set(STORAGE_KEYS.PROJECTS, projects);
    return true;
  }
  return false;
}

export function saveProject(project: JaclyProject): void {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);

  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  storage.set(STORAGE_KEYS.PROJECTS, projects);
}

export function createNewProject(
  name: string,
  type: JaclyProjectType
): JaclyProject | null {
  const newProject: JaclyProject = {
    name: name,
    // id: generateProjectName(),
    id: 'demo',
    createdAt: new Date(),
    updatedAt: new Date(),
    isStarred: false,
    archived: null,
    jaculusVersion: '0.1.0',
    type: type,
  };

  const projects = getProjects();
  if (projects.find(p => p.id === newProject.id)) {
    return null;
  }

  return newProject;
}

export function generateProjectName() {
  const id = generateNanoId();
  return id.match(/.{1,5}/g)?.join('-') ?? id;
}

export function deleteIndexedDB(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('blocked'));
  });
}
