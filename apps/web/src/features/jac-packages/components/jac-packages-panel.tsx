'use client';

import { m } from '@/paraglide/messages';
import { Separator } from '@/features/shared/components/ui/separator';
import { useJacPackages } from '../jac-packages-context';
import { JacPackagesAddCard } from './jac-packages-add-card';
import { JacPackagesErrorCard } from './jac-packages-error-card';
import { JacPackagesInstallButton } from './jac-packages-install-button';
import { JacPackagesInstalledCard } from './jac-packages-installed-card';

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
