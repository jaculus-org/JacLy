import type { IDbProject } from '@/types/project';
import type { AppDB } from '@/lib/db/db';

export class ProjectRepository {
  private db: AppDB;

  constructor(db: AppDB) {
    this.db = db;
  }

  async get(id: string): Promise<IDbProject | undefined> {
    return this.db.projects.get(id);
  }

  async list(): Promise<IDbProject[]> {
    return this.db.projects
      .filter(project => project.deletedAt === null)
      .sortBy('modifiedAt');
  }

  async create(
    id: string,
    name: string,
    type: IDbProject['type']
  ): Promise<IDbProject> {
    const now = Date.now();
    const row: IDbProject = {
      id,
      name,
      type,
      createdAt: now,
      modifiedAt: now,
      deletedAt: null,
    };
    await this.db.projects.add(row);
    return row;
  }

  async rename(id: string, newName: string): Promise<void> {
    await this.db.projects.update(id, {
      name: newName,
      modifiedAt: Date.now(),
    });
  }

  async touch(id: string): Promise<void> {
    await this.db.projects.update(id, { modifiedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await this.db.projects.update(id, { deletedAt: Date.now() });
  }

  async updateKey(
    id: string,
    key: keyof IDbProject,
    value: IDbProject[typeof key]
  ): Promise<void> {
    await this.db.projects.update(id, { [key]: value });
  }
}
