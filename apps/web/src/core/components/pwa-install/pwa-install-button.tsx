import { DownloadIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import { usePwaInstall } from './pwa-install-context';

export function PwaInstallButton() {
  const {
    state: { canInstall, isInstalled, isInstalling },
    actions: { promptInstall },
  } = usePwaInstall();

  if (!canInstall || isInstalled) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => void promptInstall()}
      disabled={isInstalling}
    >
      <DownloadIcon className="size-4" />
      {m.pwa_install_button()}
    </Button>
  );
}
