import { useEffect, useState, useRef, useCallback } from 'react';
import { m } from '@/paraglide/messages';
import {
  ESPLoader,
  Transport,
  type IEspLoaderTerminal,
  type LoaderOptions,
} from 'esptool-js';
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
  FieldSet,
} from '@/features/shared/components/ui/field';
import { Progress } from '@/features/shared/components/ui/progress';
import { Button } from '@/features/shared/components/ui/button';
import {
  getBoardsIndex,
  getBoardVersionFirmwareTarUrl,
  getBoardVersions,
  type BoardsIndex,
  type BoardVariant,
  type BoardVersion,
} from '@jaculus/firmware/boards';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { enqueueSnackbar } from 'notistack';
import { ESP32Flasher, type FlashProgress } from '../libs/flasher';
import { ScrollArea } from '@/features/shared/components/ui/scroll-area';

interface ChipWithPsram {
  getPsramCap?(loader: ESPLoader): Promise<number>;
}

export function Installer() {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [flasher, setFlasher] = useState<ESP32Flasher | null>(null);

  const boudratesUpload = [921600, 460800, 230400, 115200];
  const [baudrate, setBaudrate] = useState<number>(921600);

  const [chipList, setChipList] = useState<BoardsIndex[]>([]);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<BoardVariant | null>(
    null
  );

  const [versionList, setVersionList] = useState<BoardVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const [eraseFlash, setEraseFlash] = useState<boolean>(true);

  const [autoLoading, setAutoLoading] = useState<boolean>(false);

  const [installing, setInstalling] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [flashProgress, setFlashProgress] = useState<FlashProgress | null>(
    null
  );
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleChangeVariant = useCallback(
    async (variantId: string, chipId?: string) => {
      const currentChip = chipId || selectedChip;
      const variant =
        chipList
          .find(chip => chip.chip === currentChip)
          ?.variants.find(variant => variant.id === variantId) || null;
      setSelectedVariant(variant);

      if (variant) {
        const versions = await getBoardVersions(variant.id);
        versions.sort((a, b) => {
          const aIsNode = a.version.toLowerCase().includes('node');
          const bIsNode = b.version.toLowerCase().includes('node');
          if (aIsNode && !bIsNode) return -1;
          if (!aIsNode && bIsNode) return 1;
          return 0;
        });
        setVersionList(versions);
        if (versions.length > 0) {
          setSelectedVersion(versions[0].version);
        } else {
          setSelectedVersion(null);
        }
      }
    },
    [chipList, selectedChip]
  );

  const handleChangeChip = useCallback(
    (chipId: string) => {
      setSelectedChip(chipId);
      setSelectedVariant(null);

      const variants =
        chipList.find(chip => chip.chip === chipId)?.variants || [];
      if (variants.length === 1) {
        handleChangeVariant(variants[0].id, chipId);
      } else {
        setVersionList([]);
      }
    },
    [chipList, handleChangeVariant]
  );

  useEffect(() => {
    (async () => {
      const boards = await getBoardsIndex();
      setChipList(boards);
      // Auto-select if only one chip available
      if (boards.length === 1) {
        handleChangeChip(boards[0].chip);
      }
    })();
  }, [handleChangeChip]);

  const handleChangeVersion = useCallback((version: string) => {
    setSelectedVersion(version);
  }, []);

  // Terminal implementation
  const terminal: IEspLoaderTerminal = {
    clean() {
      setTerminalOutput([]);
    },
    writeLine(data: string) {
      setTerminalOutput(prev => [...prev, data]);
      setTimeout(
        () => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
        100
      );
    },
    write(data: string) {
      setTerminalOutput(prev => {
        const newOutput = [...prev];
        if (newOutput.length === 0) {
          newOutput.push(data);
        } else {
          newOutput[newOutput.length - 1] += data;
        }
        return newOutput;
      });
      setTimeout(
        () => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
        100
      );
    },
  };

  async function handleConnect() {
    setAutoLoading(true);
    setTerminalOutput([]);

    try {
      const device = await navigator.serial.requestPort({ filters: [] });
      const newTransport = new Transport(device, true, true);
      setTransport(newTransport);

      terminal.writeLine('Connecting to device...');

      const flashOptions: LoaderOptions = {
        transport: newTransport,
        baudrate: baudrate,
        debugLogging: false,
        romBaudrate: 115200,
      };
      const newEsploader = new ESPLoader(flashOptions);
      await newEsploader.main();

      const chipName = newEsploader.chip.CHIP_NAME;

      // Verify it's an ESP32 family chip
      if (!chipName.startsWith('ESP32')) {
        throw new Error(
          `Unsupported chip: ${chipName}. Only ESP32 family chips are supported.`
        );
      }

      terminal.writeLine(`Connected to ${chipName}`);
      terminal.writeLine(`Flash size: ${await newEsploader.getFlashSize()}KB`);

      // Create flasher instance
      const newFlasher = new ESP32Flasher(terminal, setFlashProgress);
      await newFlasher.setup(newEsploader);
      setFlasher(newFlasher);

      handleChangeChip(chipName);

      if (chipName === 'ESP32-S3') {
        const chipWithPsram = newEsploader.chip as ChipWithPsram;
        if (typeof chipWithPsram.getPsramCap === 'function') {
          const size = await chipWithPsram.getPsramCap(newEsploader);
          switch (size) {
            case 0:
              handleChangeVariant('ESP32-S3-Generic-NoPSRAM', chipName);
              break;
            case 2:
              handleChangeVariant('ESP32-S3-Generic-QuadPSRAM', chipName);
              break;
            default:
              enqueueSnackbar(
                m.installer_msg_unsupported_psram({ size: size.toString() }),
                {
                  variant: 'error',
                }
              );
              break;
          }
        }
      }

      setIsConnected(true);
      enqueueSnackbar(m.installer_msg_connected({ chipName: chipName }), {
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      terminal.writeLine(`Error: ${message}`);
      enqueueSnackbar(m.installer_msg_connection_failed({ message: message }), {
        variant: 'error',
      });
      setIsConnected(false);
    } finally {
      setAutoLoading(false);
    }
  }

  async function handleFlash() {
    if (!flasher || !selectedVariant || !selectedVersion || !transport) return;

    setInstalling(true);
    setFlashProgress(null);

    try {
      const firmwareUrl = getBoardVersionFirmwareTarUrl(
        selectedVariant.id,
        selectedVersion
      );
      terminal.writeLine(`\n=== Starting flash process ===`);
      terminal.writeLine(
        `Firmware: ${selectedVariant.name} ${selectedVersion}`
      );

      await flasher.flash(firmwareUrl, !eraseFlash);

      enqueueSnackbar(m.installer_msg_flash_success(), { variant: 'success' });

      // Auto-disconnect after successful flash
      setTimeout(() => {
        handleDisconnect();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      terminal.writeLine(`Error: ${message}`);
      enqueueSnackbar(m.installer_msg_flash_failed({ message: message }), {
        variant: 'error',
      });
    } finally {
      setInstalling(false);
      setFlashProgress(null);
    }
  }

  async function handleDisconnect() {
    if (flasher) {
      try {
        await flasher.disconnect();
        terminal.writeLine('\nDisconnected from device.');
        terminal.writeLine('\nYou can now program device and have a fun!');
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }

    setTransport(null);
    setFlasher(null);
    setIsConnected(false);
    setFlashProgress(null);
    enqueueSnackbar(m.installer_msg_disconnected(), { variant: 'info' });
  }

  const getProgressLabel = () => {
    if (!flashProgress) return null;

    switch (flashProgress.stage) {
      case 'downloading':
        return m.installer_progress_downloading();
      case 'extracting':
        return m.installer_progress_extracting();
      case 'flashing':
        return m.installer_progress_flashing({
          fileName: flashProgress.fileName,
          fileIndex: (flashProgress.fileIndex + 1).toString(),
          totalFiles: flashProgress.totalFiles.toString(),
        });
      default:
        return m.installer_progress_processing();
    }
  };

  return (
    <FieldSet className="flex flex-col gap-4 w-full max-w-4xl">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="baudrate-select">
            {m.installer_baudrate_label()}
          </FieldLabel>
          <Select
            onValueChange={val => setBaudrate(Number(val))}
            value={baudrate.toString()}
            disabled={autoLoading || isConnected}
          >
            <SelectTrigger className="w-full" id="baudrate-select">
              <SelectValue
                placeholder={m.installer_baudrate_select_placeholder()}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{m.installer_baudrate_label()}</SelectLabel>
                {boudratesUpload.map(baud => (
                  <SelectItem key={baud} value={baud.toString()}>
                    {baud} bps
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>{m.installer_baudrate_desc()}</FieldDescription>
        </Field>

        {!isConnected ? (
          <ButtonLoading
            onClick={handleConnect}
            loading={autoLoading}
            className="w-full"
          >
            {m.installer_btn_connect()}
          </ButtonLoading>
        ) : (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full"
            disabled={installing}
          >
            {m.installer_btn_disconnect()}
          </Button>
        )}
      </FieldGroup>

      {isConnected && (
        <>
          <Separator />

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="chip-select">
                {m.installer_chip_label()}
              </FieldLabel>
              <Select
                onValueChange={handleChangeChip}
                value={selectedChip || undefined}
                disabled={autoLoading || isConnected}
              >
                <SelectTrigger className="w-full" id="chip-select">
                  <SelectValue
                    placeholder={m.installer_chip_select_placeholder()}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{m.installer_chip_label()}</SelectLabel>
                    {chipList.map(chip => (
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
                onValueChange={handleChangeVariant}
                value={selectedVariant?.id || undefined}
                disabled={!selectedChip || autoLoading || installing}
              >
                <SelectTrigger className="w-full" id="variant-select">
                  <SelectValue
                    placeholder={m.installer_variant_select_placeholder()}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{m.installer_variant_label()}</SelectLabel>
                    {chipList
                      .find(chip => chip.chip === selectedChip)
                      ?.variants.map(variant => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>{m.installer_variant_desc()}</FieldDescription>
            </Field>

            <Separator />

            <Field>
              <FieldLabel htmlFor="version-select">
                {m.installer_version_label()}
              </FieldLabel>
              <Select
                onValueChange={handleChangeVersion}
                value={selectedVersion || undefined}
                disabled={!selectedVariant || installing}
              >
                <SelectTrigger className="w-full" id="version-select">
                  <SelectValue
                    placeholder={m.installer_version_select_placeholder()}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{m.installer_version_label()}</SelectLabel>
                    {versionList.map(version => (
                      <SelectItem key={version.version} value={version.version}>
                        {version.version}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>{m.installer_version_desc()}</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="erase-select">
                {m.installer_erase_label()}
              </FieldLabel>
              <Select
                onValueChange={val => setEraseFlash(val === 'yes')}
                value={eraseFlash ? 'yes' : 'no'}
                disabled={autoLoading || installing}
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

          {flashProgress && (
            <Field className="w-full">
              <FieldLabel htmlFor="flash-progress">
                <span>{getProgressLabel()}</span>
                <span className="ml-auto">
                  {flashProgress.percentage.toFixed(0)}%
                </span>
              </FieldLabel>
              <Progress value={flashProgress.percentage} id="flash-progress" />
            </Field>
          )}

          <ButtonLoading
            onClick={handleFlash}
            loading={installing}
            disabled={
              !selectedVersion ||
              autoLoading ||
              !selectedVariant?.id ||
              !isConnected
            }
            className="w-full"
          >
            {installing
              ? m.installer_btn_flashing()
              : m.installer_btn_flash({ chip: selectedChip || '' })}
          </ButtonLoading>

          <Separator />
        </>
      )}

      <Field>
        <FieldLabel htmlFor="terminal-output">
          {m.installer_terminal_label()}
        </FieldLabel>
        <ScrollArea
          className="h-46 w-full rounded-md border border-gray-700"
          id="terminal-output"
        >
          <div className="bg-black text-green-400 font-mono text-sm p-4">
            {terminalOutput.length === 0 ? (
              <div className="text-gray-500">
                {m.installer_terminal_empty()}
              </div>
            ) : (
              terminalOutput.map((line, index) => <div key={index}>{line}</div>)
            )}
            <div ref={terminalEndRef} />
          </div>
        </ScrollArea>
      </Field>
    </FieldSet>
  );
}
