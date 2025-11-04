import type { JacProject } from '@/components/projects/projects-list';
import { getProjectFsRoot } from './project-manager';
import path from 'path';

export function getBuildPath(project: JacProject): string {
  return path.join(getProjectFsRoot(project.id), 'build');
}
