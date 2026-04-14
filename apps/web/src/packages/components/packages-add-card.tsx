'use client';

import type { RegistryListProject } from '@jaculus/project/registry';
import { Plus } from 'lucide-react';
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

  return (
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
          <Combobox
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
          onClick={addLibrary}
          disabled={isInstalling || !selectedLib || availableLibVersions.length === 0}
          className="w-full"
        >
          <Plus />
          {m.project_panel_pkg_add()}
        </Button>
      </div>
    </Card>
  );
}
