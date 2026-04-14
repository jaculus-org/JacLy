import { useLiveQuery } from 'dexie-react-hooks';
import type { ISettings } from '@/core/types/settings';
import { Route } from '@/routes/__root';

export const useSettings = () => {
  const { settingsRepo } = Route.useRouteContext();

  if (!settingsRepo) {
    throw new Error('settingsRepo is not available in RouterContext');
  }

  const settings = useLiveQuery(() => settingsRepo.get(), []);

  const updateSettings = async (value: Partial<ISettings>) => {
    await settingsRepo.update(value);
  };

  const setSettings = async (key: keyof ISettings, value: ISettings[typeof key]) => {
    const currentSettings = await settingsRepo.get();
    await settingsRepo.update({
      ...currentSettings,
      [key]: value,
    });
  };

  const resetSettings = async () => {
    await settingsRepo.reset();
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    setSettings,
  };
};
