import type { ProjectRepository } from '@/lib/db/project-repository';
// import { generateProjectId } from '@/lib/utils/nanoid';
import type { IDbProject } from '@/types/project';

export class ProjectRuntimeService {
  private repo: ProjectRepository;

  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async createProject(
    name: string,
    type: IDbProject['type']
  ): Promise<IDbProject> {
    // const id = generateProjectId();
    const id = 'demo';
    return await this.repo.create(id, name, type);
  }

  async getProject(id: string): Promise<IDbProject | undefined> {
    return await this.repo.get(id);
  }

  async deleteProject(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async renameProject(id: string, newName: string): Promise<void> {
    await this.repo.rename(id, newName);
  }

  async listProjects(): Promise<IDbProject[]> {
    return await this.repo.list();
  }

  async projectExists(id: string): Promise<boolean> {
    return (await this.repo.get(id)) !== undefined;
  }

  async updateProjectKey(
    id: string,
    key: keyof IDbProject,
    value: IDbProject[typeof key]
  ): Promise<void> {
    await this.repo.updateKey(id, key, value);
  }
}
