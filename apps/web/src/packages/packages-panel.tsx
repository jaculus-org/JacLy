'use client';

import { useEffect, useRef } from 'react';
import { m } from '@/core/paraglide/messages';
import { useProjectEditor } from '@/project';
import { Separator } from '@/ui/components/separator';
import { useJacPackages } from './packages-context';
import { JacPackagesAddCard } from './packages-add-card';
import { JacPackagesErrorCard } from './packages-error-card';
import { JacPackagesInstallButton } from './packages-install-button';
import { JacPackagesInstalledCard } from './packages-installed-card';

export function JacPackagesPanel() {
  const { meta } = useJacPackages();
  const { actions } = useProjectEditor();
  const openedErrorFile = useRef(false);

  useEffect(() => {
    if (meta.packageJsonError && !openedErrorFile.current) {
      openedErrorFile.current = true;
      actions.openPanel('code', { filePath: 'package.json' });
    }
  }, [meta.packageJsonError, actions]);

  if (!meta.hasProject) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
        {meta.packageJsonError ? (
          <>
            <p className="text-center">{m.project_panel_pkg_format_error()}</p>
            <p className="text-xs text-destructive text-center max-w-md">{meta.packageJsonError}</p>
          </>
        ) : (
          m.project_panel_pkg_no_project()
        )}
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
