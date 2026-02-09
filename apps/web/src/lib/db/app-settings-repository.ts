import type { ISettings } from '@/types/settings';
import { defaultSettings } from '@/types/settings';
import type { AppDB } from '@/lib/db/db';

export class AppSettingsRepository {
  private db: AppDB;

  constructor(db: AppDB) {
    this.db = db;
  }

  async get(): Promise<ISettings> {
    const settings = await this.db.settings.toArray();
    if (settings.length === 0) {
      await this.initialize();
      return defaultSettings;
    }
    return settings[0];
  }

  async update(value: Partial<ISettings>): Promise<void> {
    const count = await this.db.settings.count();

    if (count === 0) {
      await this.db.settings.add({ ...defaultSettings, ...value });
    } else {
      await this.db.settings.where('id').aboveOrEqual(0).modify(value);
    }
  }

  async reset(): Promise<void> {
    await this.db.settings.clear();
    await this.db.settings.add(defaultSettings);
  }

  private async initialize(): Promise<void> {
    const count = await this.db.settings.count();
    if (count === 0) {
      await this.db.settings.add(defaultSettings);
    }
  }
}
