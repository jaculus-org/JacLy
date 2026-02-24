'use client';

import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useJacPackages } from '../jac-packages-context';

export function JacPackagesInstallButton() {
  const {
    state: { isInstalling },
    actions: { installAll },
  } = useJacPackages();

  return (
    <Button
      onClick={installAll}
      disabled={isInstalling}
      className="w-full"
      size="lg"
    >
      <RefreshCw className={isInstalling ? 'animate-spin' : ''} />
      {isInstalling
        ? m.project_panel_pkg_installing()
        : m.project_panel_pkg_install()}
    </Button>
  );
}
