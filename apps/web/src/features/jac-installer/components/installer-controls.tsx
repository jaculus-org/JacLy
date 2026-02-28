import { m } from '@/paraglide/messages';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import { Separator } from '@/features/shared/components/ui/separator';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/features/shared/components/ui/field';
import { Input } from '@/features/shared/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/features/shared/components/ui/tabs';
import { Button } from '@/features/shared/components/ui/button';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { type InstallerSourceTab, useInstaller } from '../installer-context';

export function InstallerControls() {
  const { state, actions, meta } = useInstaller();

  return (
    <>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="baudrate-select">
            {m.installer_baudrate_label()}
          </FieldLabel>
          <Select
            onValueChange={val => actions.setBaudrate(Number(val))}
            value={state.baudrate.toString()}
            disabled={state.autoLoading || state.isConnected}
          >
            <SelectTrigger className="w-full" id="baudrate-select">
              <SelectValue
                placeholder={m.installer_baudrate_select_placeholder()}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{m.installer_baudrate_label()}</SelectLabel>
                {meta.baudrates.map(baud => (
                  <SelectItem key={baud} value={baud.toString()}>
                    {baud} bps
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>{m.installer_baudrate_desc()}</FieldDescription>
        </Field>

        {!state.isConnected ? (
          <ButtonLoading
            onClick={actions.connect}
            loading={state.autoLoading}
            className="w-full"
          >
            {m.installer_btn_connect()}
          </ButtonLoading>
        ) : (
          <Button
            onClick={actions.disconnect}
            variant="outline"
            className="w-full"
            disabled={state.installing}
          >
            {m.installer_btn_disconnect()}
          </Button>
        )}
      </FieldGroup>

      {state.isConnected && (
        <>
          <Separator />

          <Tabs
            value={state.sourceTab}
            onValueChange={value =>
              actions.setSourceTab(value as InstallerSourceTab)
            }
          >
            <TabsList className="grid w-full grid-cols-3" variant="default">
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>

            <TabsContent value="online" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="chip-select">
                    {m.installer_chip_label()}
                  </FieldLabel>
                  <Select
                    onValueChange={actions.changeChip}
                    value={state.selectedChip || undefined}
                    disabled={state.autoLoading || state.isConnected}
                  >
                    <SelectTrigger className="w-full" id="chip-select">
                      <SelectValue
                        placeholder={m.installer_chip_select_placeholder()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{m.installer_chip_label()}</SelectLabel>
                        {state.chipList.map(chip => (
                          <SelectItem key={chip.chip} value={chip.chip}>
                            {chip.chip}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="variant-select">
                    {m.installer_variant_label()}
                  </FieldLabel>
                  <Select
                    onValueChange={actions.changeVariant}
                    value={state.selectedVariant?.id || undefined}
                    disabled={
                      !state.selectedChip ||
                      state.autoLoading ||
                      state.installing
                    }
                  >
                    <SelectTrigger className="w-full" id="variant-select">
                      <SelectValue
                        placeholder={m.installer_variant_select_placeholder()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{m.installer_variant_label()}</SelectLabel>
                        {state.chipList
                          .find(chip => chip.chip === state.selectedChip)
                          ?.variants.map(variant => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {m.installer_variant_desc()}
                  </FieldDescription>
                </Field>

                <Separator />

                <Field>
                  <FieldLabel htmlFor="version-select">
                    {m.installer_version_label()}
                  </FieldLabel>
                  <Select
                    onValueChange={actions.changeVersion}
                    value={state.selectedVersion || undefined}
                    disabled={!state.selectedVariant || state.installing}
                  >
                    <SelectTrigger className="w-full" id="version-select">
                      <SelectValue
                        placeholder={m.installer_version_select_placeholder()}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{m.installer_version_label()}</SelectLabel>
                        {state.versionList.map(version => (
                          <SelectItem
                            key={version.version}
                            value={version.version}
                          >
                            {version.version}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {m.installer_version_desc()}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <Field>
                <FieldLabel htmlFor="firmware-url">Firmware URL</FieldLabel>
                <Input
                  id="firmware-url"
                  placeholder="https://example.com/firmware.tar.gz"
                  value={state.firmwareUrl}
                  onChange={event =>
                    actions.setFirmwareUrl(event.currentTarget.value)
                  }
                  disabled={state.autoLoading || state.installing}
                />
                <FieldDescription>
                  Must be a .tar.gz or .tgz firmware package.
                </FieldDescription>
              </Field>
            </TabsContent>

            <TabsContent value="file" className="mt-4">
              <Field>
                <FieldLabel htmlFor="firmware-file">Firmware File</FieldLabel>
                <Input
                  id="firmware-file"
                  type="file"
                  accept=".tar.gz,.tgz,application/gzip,application/x-gzip"
                  onChange={event =>
                    actions.setFirmwareFile(
                      event.currentTarget.files?.[0] ?? null
                    )
                  }
                  disabled={state.autoLoading || state.installing}
                />
                <FieldDescription>
                  Upload a .tar.gz or .tgz firmware package.
                </FieldDescription>
              </Field>
            </TabsContent>
          </Tabs>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="erase-select">
                {m.installer_erase_label()}
              </FieldLabel>
              <Select
                onValueChange={val => actions.setEraseFlash(val === 'yes')}
                value={state.eraseFlash ? 'yes' : 'no'}
                disabled={state.autoLoading || state.installing}
              >
                <SelectTrigger className="w-full" id="erase-select">
                  <SelectValue
                    placeholder={m.installer_erase_select_placeholder()}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>
                      {m.installer_erase_select_placeholder()}
                    </SelectLabel>
                    <SelectItem value="yes">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {m.installer_erase_yes()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.installer_erase_yes_desc()}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="no">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {m.installer_erase_no()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.installer_erase_no_desc()}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <ButtonLoading
            onClick={actions.flash}
            loading={state.installing}
            disabled={
              state.autoLoading ||
              !state.isConnected ||
              (state.sourceTab === 'online' &&
                (!state.selectedVariant || !state.selectedVersion)) ||
              (state.sourceTab === 'url' && !state.firmwareUrl) ||
              (state.sourceTab === 'file' && !state.firmwareFile)
            }
            className="w-full"
          >
            {state.installing
              ? m.installer_btn_flashing()
              : m.installer_btn_flash({ chip: state.selectedChip || '' })}
          </ButtonLoading>

          <Separator />
        </>
      )}
    </>
  );
}
