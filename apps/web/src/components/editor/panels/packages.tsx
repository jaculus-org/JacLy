import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useJacProject } from '@/providers/jac-project-provider';
import {
  Package,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { enqueueSnackbar } from 'notistack';

export function PackagesPanel() {
  const { projectInstance } = useJacProject();
  const [libsRegistry, setLibsRegistry] = useState<string[]>([]);
  const [libsInstalled, setLibsInstalled] = useState<Record<string, string>>(
    {}
  );
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [installing, setInstalling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string | undefined>(
    undefined
  );
  const [selectedVersion, setSelectedVersion] = useState<string | undefined>(
    undefined
  );
  const [openLibraryCombo, setOpenLibraryCombo] = useState(false);
  const [openVersionCombo, setOpenVersionCombo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLibraries = useCallback(async () => {
    try {
      setError(null);
      if (projectInstance?.registry) {
        const registryLibs = await projectInstance.registry.list();
        setLibsRegistry(registryLibs || []);
      }
      if (projectInstance) {
        const installed = await projectInstance.installedLibraries();
        setLibsInstalled(installed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load libraries');
      console.error('Error loading libraries:', err);
    }
  }, [projectInstance]);

  const fetchVersions = useCallback(
    async (libraryName: string) => {
      try {
        setError(null);
        if (projectInstance?.registry) {
          const versions =
            await projectInstance.registry.listVersions(libraryName);
          setAvailableVersions(versions);
          setSelectedVersion(versions.length > 0 ? versions[0] : '');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to fetch versions for ${libraryName}`
        );
        console.error('Error fetching versions:', err);
        setAvailableVersions([]);
      }
    },
    [projectInstance]
  );

  // Load libraries on mount
  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  // Fetch versions when library is selected
  useEffect(() => {
    if (selectedLibrary && projectInstance?.registry) {
      fetchVersions(selectedLibrary);
    }
  }, [selectedLibrary, projectInstance, fetchVersions]);

  const handleInstall = useCallback(async () => {
    try {
      setInstalling(true);
      setError(null);
      if (projectInstance) {
        await projectInstance.install();
        enqueueSnackbar('Packages installed successfully', {
          variant: 'success',
        });
        await loadLibraries();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
      console.error('Error during installation:', err);
    } finally {
      setInstalling(false);
    }
  }, [projectInstance, loadLibraries]);

  const handleAddLibrary = useCallback(async () => {
    if (!selectedLibrary) {
      setError('Please select a library');
      return;
    }

    try {
      setError(null);
      if (selectedVersion) {
        await projectInstance.addLibraryVersion(
          selectedLibrary.trim(),
          selectedVersion.trim()
        );
        enqueueSnackbar(`Added ${selectedLibrary}@${selectedVersion}`, {
          variant: 'success',
        });
      } else {
        await projectInstance.addLibrary(selectedLibrary.trim());
        enqueueSnackbar(`Added ${selectedLibrary} (latest)`, {
          variant: 'success',
        });
      }
      setSelectedLibrary(undefined);
      setSelectedVersion(undefined);
      await loadLibraries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add library');
      console.error('Error adding library:', err);
    }
  }, [selectedLibrary, selectedVersion, projectInstance, loadLibraries]);

  const handleRemoveLibrary = useCallback(
    async (libraryName: string) => {
      if (!confirm(`Remove ${libraryName}?`)) return;

      try {
        setError(null);
        if (projectInstance) {
          await projectInstance.removeLibrary(libraryName);
          enqueueSnackbar(`Removed ${libraryName}`, { variant: 'info' });
          await loadLibraries();
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to remove library'
        );
        console.error('Error removing library:', err);
      }
    },
    [projectInstance, loadLibraries]
  );

  const filteredLibraries = libsInstalled
    ? Object.entries(libsInstalled).filter(([name]) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="h-full w-full flex flex-col bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Packages
          </h2>
        </div>

        {/* Install/Update Button */}
        <Button
          onClick={handleInstall}
          disabled={installing}
          variant="default"
          className="w-full"
        >
          {installing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Installing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Install / Update Packages
            </>
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add New Package Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Add New Package
            </h3>
          </div>

          <div className="space-y-2">
            {/* Library Combobox */}
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5">
                Select Package
              </label>
              <Popover
                open={openLibraryCombo}
                onOpenChange={setOpenLibraryCombo}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLibraryCombo}
                    className="w-full justify-between bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    {selectedLibrary ? selectedLibrary : 'Choose package...'}
                    <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <Command>
                    <CommandInput
                      placeholder="Search packages..."
                      className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                    <CommandList>
                      <CommandEmpty className="text-slate-500 dark:text-slate-400 py-3 text-center text-sm">
                        No packages found
                      </CommandEmpty>
                      <CommandGroup>
                        {libsRegistry
                          .filter(
                            lib => !libsInstalled || !(lib in libsInstalled)
                          )
                          .map(lib => (
                            <CommandItem
                              key={lib}
                              value={lib}
                              onSelect={currentValue => {
                                setSelectedLibrary(
                                  currentValue === selectedLibrary
                                    ? ''
                                    : currentValue
                                );
                                setSelectedVersion('latest');
                                setOpenLibraryCombo(false);
                              }}
                              className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedLibrary === lib
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {lib}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Version Combobox */}
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1.5">
                Select Version
              </label>
              <Popover
                open={openVersionCombo}
                onOpenChange={setOpenVersionCombo}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openVersionCombo}
                    disabled={!selectedLibrary}
                    className="w-full justify-between bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedVersion || 'Choose version...'}
                    <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <Command>
                    <CommandInput
                      placeholder="Search version..."
                      className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                    <CommandList>
                      <CommandEmpty className="text-slate-500 dark:text-slate-400 py-3 text-center text-sm">
                        No versions found
                      </CommandEmpty>
                      <CommandGroup>
                        {availableVersions.map(version => (
                          <CommandItem
                            key={version}
                            value={version}
                            onSelect={currentValue => {
                              setSelectedVersion(
                                currentValue === selectedVersion
                                  ? ''
                                  : currentValue
                              );
                              setOpenVersionCombo(false);
                            }}
                            className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedVersion === version
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {version}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddLibrary}
              disabled={!selectedLibrary}
              variant="default"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-300 dark:bg-slate-700 my-4" />

        {/* Installed Packages Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Installed Packages ({filteredLibraries.length})
            </h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Search installed packages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {filteredLibraries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              {libsInstalled && Object.keys(libsInstalled).length === 0
                ? 'No packages installed yet'
                : 'No packages match your search'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLibraries.map(([name, version]) => (
                <div
                  key={name}
                  className="group flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 text-left min-w-0">
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        v{version}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRemoveLibrary(name)}
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
