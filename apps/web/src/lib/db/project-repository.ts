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
      layout: undefined,
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

  async renameWithId(
    oldId: string,
    newId: string,
    newName: string
  ): Promise<void> {
    if (oldId === newId) {
      await this.rename(oldId, newName);
      return;
    }

    const project = await this.db.projects.get(oldId);
    if (!project) throw new Error('Project not found');

    const existing = await this.db.projects.get(newId);
    if (existing) throw new Error('Project already exists');

    const now = Date.now();
    await this.db.transaction('rw', this.db.projects, async () => {
      await this.db.projects.add({
        ...project,
        id: newId,
        name: newName,
        modifiedAt: now,
      });
      await this.db.projects.delete(oldId);
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
    await this.db.projects.update(id, { [key]: value } as Partial<IDbProject>);
  }
}
