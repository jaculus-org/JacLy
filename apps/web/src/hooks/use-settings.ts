import { useLiveQuery } from 'dexie-react-hooks';
import type { ISettings } from '@/types/settings';
import { Route } from '@/routes/__root';

export const useSettings = () => {
  const { settingsService } = Route.useRouteContext();

  if (!settingsService) {
    throw new Error('settingsService is not available in RouterContext');
  }

  const settings = useLiveQuery(() => settingsService.getSettings(), []);

  const updateSettings = async (value: Partial<ISettings>) => {
    await settingsService.updateSettings(value);
  };

  const setSettings = async (
    key: keyof ISettings,
    value: ISettings[typeof key]
  ) => {
    await settingsService.setSettings(key, value);
  };

  const resetSettings = async () => {
    await settingsService.resetSettings();
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    setSettings,
  };
};
