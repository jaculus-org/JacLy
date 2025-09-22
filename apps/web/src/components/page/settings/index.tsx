import { ResetLayout } from '@/components/settings/reset-layout';
import { useIntlayer } from 'react-intlayer';

export function SettingsPage() {
  const content = useIntlayer('settings');

  return (
    <>
      <h1 className="text-3xl font-bold">{content.settings}</h1>

      <ResetLayout />
    </>
  );
}
