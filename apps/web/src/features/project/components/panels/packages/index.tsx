import { m } from '@/paraglide/messages';
import logger from '@/features/jac-device/lib/logger';
import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
import type { Dependencies } from 'node_modules/@jaculus/project/dist/src/project/package';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/features/shared/components/ui/button';
import { Input } from '@/features/shared/components/ui/input';
import { Card } from '@/features/shared/components/ui/card';
import { Badge } from '@/features/shared/components/ui/badge';
import { Separator } from '@/features/shared/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
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
import { RefreshCw, Plus, Trash2, Package, Search } from 'lucide-react';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import path from 'path';

export function PackagesPanel() {
  const { jacProject, reloadNodeModules } = useJacDevice();
  const { fs, projectPath } = useActiveProject();
  const [installedLibs, setInstalledLibs] = useState<Dependencies>({});
  const [availableLibs, setAvailableLibs] = useState<string[]>([]);
  const [availableLibVersions, setAvailableLibVersions] = useState<string[]>(
    []
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLib, setSelectedLib] = useState<string | null>(null);
  const [selectedLibVersion, setSelectedLibVersion] = useState<string | null>(
    null
  );

  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = useCallback(async () => {
    try {
      setIsInstalling(true);
      setError(null);
      setInstalledLibs(await jacProject!.install());
      reloadNodeModules();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : m.project_panel_pkg_install_error()
      );
      logger.error('Error installing library:' + err);
    } finally {
      setIsInstalling(false);
    }
  }, [jacProject, reloadNodeModules]);

  const handleAddLibrary = useCallback(async () => {
    try {
      setIsInstalling(true);
      setError(null);
      if (selectedLib == null || availableLibVersions.length === 0) {
        setError(m.project_panel_pkg_select_error());
        return;
      }
      const versionToInstall = selectedLibVersion ?? availableLibVersions[0];
      setInstalledLibs(
        await jacProject!.addLibraryVersion(selectedLib, versionToInstall)
      );
      reloadNodeModules();
      enqueueSnackbar(
        m.project_panel_pkg_added({
          name: selectedLib,
          version: versionToInstall,
        }),
        { variant: 'success' }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : m.project_panel_pkg_add_error()
      );
      logger.error('Error adding library:' + err);
    } finally {
      setIsInstalling(false);
      setSelectedLib(null);
      setSelectedLibVersion(null);
    }
  }, [
    jacProject,
    selectedLib,
    selectedLibVersion,
    availableLibVersions,
    reloadNodeModules,
  ]);

  const handleRemoveLibrary = useCallback(
    async (library: string) => {
      try {
        setIsInstalling(true);
        setError(null);
        setInstalledLibs(await jacProject!.removeLibrary(library));
        reloadNodeModules();
        enqueueSnackbar(m.project_panel_pkg_removed({ name: library }), {
          variant: 'success',
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : m.project_panel_pkg_remove_error()
        );
        logger.error('Error removing library:' + err);
      } finally {
        setIsInstalling(false);
      }
    },
    [jacProject, reloadNodeModules]
  );

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        if (jacProject == null || jacProject.registry == null) return;
        setAvailableLibs(await jacProject.registry.listPackages());
        setInstalledLibs(await jacProject.installedLibraries());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : m.project_panel_pkg_load_error()
        );
        logger.error('Error loading libraries:' + err);
      }
    })();
  }, [jacProject]);

  useEffect(() => {
    (async () => {
      if (jacProject == null || jacProject.registry == null) return;
      if (!fs.existsSync(path.join(projectPath, 'node_modules'))) {
        await handleInstall();
        enqueueSnackbar(m.project_panel_pkg_load_success(), {
          variant: 'success',
        });
      }
    })();
  }, [fs, jacProject, handleInstall, projectPath]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        if (
          jacProject == null ||
          selectedLib == null ||
          jacProject.registry == null
        ) {
          setAvailableLibVersions([]);
          return;
        }
        const versions = await jacProject.registry.listVersions(selectedLib);
        setAvailableLibVersions(versions);

        if (versions.length == 1) {
          setSelectedLibVersion(versions[0]);
        } else {
          setSelectedLibVersion(null);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : m.project_panel_pkg_versions_error()
        );
        logger.error('Error loading library versions:' + err);
      }
    })();
  }, [selectedLib, jacProject]);

  if (jacProject == null) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {m.project_panel_pkg_no_project()}
      </div>
    );
  }

  // show only available libraries that are not installed yet
  const filteredAvailableLibs = availableLibs
    .filter(lib => !(lib in installedLibs))
    .filter(lib => lib.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      {/* Install/Update Button */}
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        className="w-full"
        size="lg"
      >
        <RefreshCw className={isInstalling ? 'animate-spin' : ''} />
        {isInstalling
          ? m.project_panel_pkg_installing()
          : m.project_panel_pkg_install()}
      </Button>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {/* Add New Package Section */}
      <Card className="p-3">
        <div className="mb-2 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <h3 className="font-semibold">{m.project_panel_pkg_add_title()}</h3>
        </div>

        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              {m.project_panel_pkg_select()}
            </label>
            <Select
              value={selectedLib ?? ''}
              onValueChange={setSelectedLib}
              disabled={isInstalling}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={m.project_panel_pkg_choose()} />
              </SelectTrigger>
              <SelectContent className="w-full">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={m.project_panel_pkg_search()}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {filteredAvailableLibs.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      {m.project_panel_pkg_not_found()}
                    </div>
                  ) : (
                    filteredAvailableLibs.map(lib => (
                      <SelectItem key={lib} value={lib}>
                        {lib}
                      </SelectItem>
                    ))
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              {m.project_panel_pkg_version()}
            </label>
            <Select
              value={selectedLibVersion ?? ''}
              onValueChange={setSelectedLibVersion}
              disabled={
                isInstalling ||
                !selectedLib ||
                availableLibVersions.length === 0
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={m.project_panel_pkg_version_choose()}
                />
              </SelectTrigger>
              <SelectContent className="w-full">
                <div className="max-h-60 overflow-y-auto">
                  {availableLibVersions.map(version => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddLibrary}
            disabled={
              isInstalling || !selectedLib || availableLibVersions.length === 0
            }
            className="w-full"
          >
            <Plus />
            {m.project_panel_pkg_add()}
          </Button>
        </div>
      </Card>

      <Separator />

      {/* Installed Packages Section */}
      <Card className="flex-1 overflow-hidden p-3">
        <div className="mb-2 flex items-center gap-2">
          <Package className="h-4 w-4" />
          <h3 className="font-semibold">
            {m.project_panel_pkg_installed()} (
            {Object.keys(installedLibs).length})
          </h3>
        </div>

        {Object.keys(installedLibs).length === 0 ? (
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
                      <AlertDialogAction
                        onClick={() => handleRemoveLibrary(name)}
                      >
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
    </div>
  );
}
