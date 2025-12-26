import Dexie, { type Table } from 'dexie';

export interface AppSettingRow {
  key: string;
  value: string;
  updatedAt: number;
}

export class AppDB extends Dexie {
  appSettings!: Table<AppSettingRow, string>;

  constructor() {
    super('JaclyAppDB');
    this.version(1).stores({
      appSettings: 'key, value, updatedAt',
    });
  }
}

export const db = new AppDB();
