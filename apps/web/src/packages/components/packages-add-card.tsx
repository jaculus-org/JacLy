'use client';

import type { RegistryListProject } from '@jaculus/project/registry';
import { PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { Button } from '@/ui/components/button';
import { Card } from '@/ui/components/card';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/ui/components/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/select';
import { useJacPackages } from '../state/packages-context';

export function JacPackagesAddCard() {
  const [packagePickerResetKey, setPackagePickerResetKey] = useState(0);
  const {
    state: {
      availableLibChoices,
      availableLibVersions,
      selectedLib,
      selectedLibVersion,
      isInstalling,
    },
    actions: { selectLib, selectLibVersion, addLibrary },
  } = useJacPackages();

  async function handleAddLibrary() {
    await addLibrary();
    setPackagePickerResetKey((key) => key + 1);
  }

  return (
    <Card className="p-3">
      <div className="mb-3 flex items-start gap-2">
        <PackagePlus className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="font-semibold">{m.project_panel_pkg_add_title()}</h3>
          <p className="text-xs text-muted-foreground">{m.project_panel_pkg_add_help()}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            {m.project_panel_pkg_name()}
          </label>
          <Combobox
            key={packagePickerResetKey}
            items={availableLibChoices}
            onValueChange={(value) => selectLib((value as RegistryListProject | null)?.id ?? null)}
            itemToStringLabel={(item: RegistryListProject) => item.id}
            disabled={isInstalling}
            autoHighlight
          >
            <ComboboxInput
              placeholder={m.project_panel_pkg_search()}
              className="w-full"
              disabled={isInstalling}
            />
            <ComboboxContent>
              <ComboboxEmpty>{m.project_panel_pkg_not_found()}</ComboboxEmpty>
              <ComboboxList>
                {(item: RegistryListProject) => (
                  <ComboboxItem key={item.id} value={item}>
                    <div className="flex flex-col">
                      <span className="text-sm">{item.id}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      )}
                    </div>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted-foreground">
            {m.project_panel_pkg_version()}
          </label>
          <Select
            value={selectedLibVersion ?? ''}
            onValueChange={(value) => selectLibVersion(value || null)}
            disabled={isInstalling || !selectedLib || availableLibVersions.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={m.project_panel_pkg_version_choose()} />
            </SelectTrigger>
            <SelectContent className="w-full">
              <div className="max-h-60 overflow-y-auto">
                {availableLibVersions.map((version) => (
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
          disabled={isInstalling || !selectedLib || availableLibVersions.length === 0}
          className="w-full"
        >
          <PackagePlus />
          {m.project_panel_pkg_add_selected()}
        </Button>
      </div>
    </Card>
  );
}
