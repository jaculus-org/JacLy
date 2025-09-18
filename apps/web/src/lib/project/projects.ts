export type Project = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isStarred: boolean;
  archived: Date | null;
  jaculusVersion: string;
};

// use a local storage for now
const PROJECTS_STORAGE_KEY = 'jaculus_projects';

export function saveProject(project: Project) {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  if (existingIndex !== -1) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function loadProjects(): Project[] {
  const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
  return projectsJson ? JSON.parse(projectsJson) : [];
}

export function getProjectById(id: string): Project | undefined {
  const projects = loadProjects();
  return projects.find(p => p.id === id);
}

export function deleteProject(id: string) {
  const projects = loadProjects();
  const updatedProjects = projects.filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
}
