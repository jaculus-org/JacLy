'use client';

import { m } from '@/paraglide/messages';
import { Badge } from '@/features/shared/components/ui/badge';
import { Button } from '@/features/shared/components/ui/button';
import { Card } from '@/features/shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/features/shared/components/ui/alert-dialog';
import { Package, Trash2 } from 'lucide-react';
import { useJacPackages } from '../jac-packages-context';

export function JacPackagesInstalledCard() {
  const {
    state: { installedLibs, isInstalling },
    actions: { removeLibrary },
  } = useJacPackages();

  const installedCount = Object.keys(installedLibs).length;

  return (
    <Card className="flex-1 overflow-hidden p-3">
      <div className="mb-2 flex items-center gap-2">
        <Package className="h-4 w-4" />
        <h3 className="font-semibold">
          {m.project_panel_pkg_installed()} ({installedCount})
        </h3>
      </div>

      {installedCount === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {m.project_panel_pkg_empty()}
        </div>
      ) : (
        <div className="h-full overflow-y-auto space-y-2 pr-2">
          {Object.entries(installedLibs).map(([name, version]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
                <Badge variant="secondary">{version}</Badge>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon-xs"
                    disabled={isInstalling}
                  >
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {m.project_panel_pkg_remove_title()}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {m.project_panel_pkg_remove_desc({ name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {m.project_panel_pkg_remove_cancel()}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeLibrary(name)}>
                      {m.project_panel_pkg_remove()}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
