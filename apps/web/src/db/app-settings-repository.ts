import type { AppDB } from './db';

export class AppSettingsRepository {
  private db: AppDB;

  constructor(db: AppDB) {
    this.db = db;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const row = await this.db.appSettings.get(key);
    return row?.value as T | undefined;
  }

  async set<T extends string>(key: string, value: T): Promise<void> {
    await this.db.appSettings.put({ key, value, updatedAt: Date.now() });
  }
}
