'use client';

import { m } from '@/core/paraglide/messages';
import { Separator } from '@/ui/components/separator';
import { useJacPackages } from '../state/packages-context';
import { JacPackagesAddCard } from './packages-add-card';
import { JacPackagesErrorCard } from './packages-error-card';
import { JacPackagesInstallButton } from './packages-install-button';
import { JacPackagesInstalledCard } from './packages-installed-card';

export function JacPackagesPanel() {
  const { meta } = useJacPackages();

  if (!meta.hasProject) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {m.project_panel_pkg_no_project()}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <JacPackagesInstallButton />
      <JacPackagesErrorCard />
      <JacPackagesAddCard />
      <Separator />
      <JacPackagesInstalledCard />
    </div>
  );
}
