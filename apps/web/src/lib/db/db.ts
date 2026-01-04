import Dexie, { type Table } from 'dexie';
import type { ISettings } from '@/types/settings';
import type { IProject } from '@/types/project';

export class AppDB extends Dexie {
  projects!: Table<IProject, string>;
  settings!: Table<ISettings, number>;

  constructor() {
    super('JaclyAppDB');
    this.version(1).stores({
      projects: 'id, name, type, createdAt, modifiedAt, deletedAt',
      settings: 'id',
    });
  }
}

export const db = new AppDB();
