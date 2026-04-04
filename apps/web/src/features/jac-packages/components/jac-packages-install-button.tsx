'use client';

import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
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
