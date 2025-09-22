import { SettingsPage } from '@/components/page/settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
});
