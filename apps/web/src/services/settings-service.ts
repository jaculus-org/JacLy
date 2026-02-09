import type { AppSettingsRepository } from '@/lib/db/app-settings-repository';
import type { ISettings } from '@/types/settings';

export class SettingsService {
  private repo: AppSettingsRepository;

  constructor(repo: AppSettingsRepository) {
    this.repo = repo;
  }

  async getSettings(): Promise<ISettings> {
    return await this.repo.get();
  }

  async updateSettings(value: Partial<ISettings>): Promise<void> {
    await this.repo.update(value);
  }

  async setSettings(
    key: keyof ISettings,
    value: ISettings[typeof key]
  ): Promise<void> {
    const currentSettings = await this.repo.get();
    await this.repo.update({
      ...currentSettings,
      [key]: value,
    });
  }

  async resetSettings(): Promise<void> {
    await this.repo.reset();
  }
}
