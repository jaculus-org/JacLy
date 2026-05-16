import {
  type BoardsIndex,
  getBoardsIndex,
  getBoardVersionFirmwareTarUrl,
  getBoardVersions,
} from '@jaculus/firmware/boards';
import { getRequest } from '@jaculus/jacly/project';
import { ESPLoader, type IEspLoaderTerminal, type LoaderOptions, Transport } from 'esptool-js';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/core';
import { m } from '@/core/paraglide/messages';
import { executeWithTimeout, TimeoutError } from '@/ui/lib/timeout';
import {
  InstallerContext,
  type InstallerSourceTab,
  type InstallerState,
} from './installer-context';
import { ESP32Flasher } from './services/flasher';

interface ChipWithPsram {
  getPsramCap?(loader: ESPLoader): Promise<number>;
}

export const baudrates = ['921600', '460800', '230400', '115200'];

function createInitialState(initialUrl?: string): InstallerState {
  return {
    baudrate: Number(baudrates[0]),
    chipList: [],
    selectedChip: null,
    selectedVariant: null,
    versionList: [],
    selectedVersion: null,
    eraseFlash: true,
    sourceTab: initialUrl ? 'url' : 'online',
    firmwareUrl: initialUrl ?? '',
    firmwareFile: null,
    autoLoading: false,
    installing: false,
    isConnected: false,
    flashProgress: null,
    showPopupText: null,
  };
}

function isFirmwarePackage(name: string) {
  return /\.(tar\.gz|tgz)(\?|#|$)/i.test(name);
}

function getUrlParam(key: string) {
  if (typeof window === 'undefined') return '';
  return new URL(window.location.href).searchParams.get(key) ?? '';
}

export function InstallerProvider({
  children,
  initialUrl,
  syncUrlParam = true,
}: {
  children: ReactNode;
  initialUrl?: string;
  syncUrlParam?: boolean;
}) {
  const [state, setState] = useState<InstallerState>(() => createInitialState(initialUrl));
  const isConnectedRef = useRef(false);
  const transportRef = useRef<Transport | null>(null);
  const flasherRef = useRef<ESP32Flasher | null>(null);
  const terminal: IEspLoaderTerminal = useMemo(
    () => ({
      clean() {
        logger.clearLevel('installer');
      },
      writeLine(data: string) {
        logger.installer(data);
      },
      write(data: string) {
        logger.installer(data);
      },
    }),
    [],
  );

  const changeVariant = useCallback(
    async (variantId: string, chipId?: string) => {
      const currentChip = chipId || state.selectedChip;
      const variant =
        state.chipList
          .find((chip) => chip.chip === currentChip)
          ?.variants.find((variant) => variant.id === variantId) || null;

      setState((prev) => ({ ...prev, selectedVariant: variant }));

      if (variant) {
        const versions = await getBoardVersions(getRequest, variant.id, logger);
        setState((prev) => ({
          ...prev,
          versionList: versions,
          selectedVersion: versions[0]?.version ?? null,
        }));
      }
    },
    [state.chipList, state.selectedChip],
  );

  const changeChip = useCallback(
    (chipId: string, chipListOverride?: BoardsIndex[]) => {
      const chipList = chipListOverride ?? state.chipList;
      const variants = chipList.find((chip) => chip.chip === chipId)?.variants || [];

      setState((prev) => ({
        ...prev,
        selectedChip: chipId,
        selectedVariant: null,
        versionList: [],
        selectedVersion: null,
      }));

      if (variants.length === 1) {
        void changeVariant(variants[0].id, chipId);
      }
    },
    [changeVariant, state.chipList],
  );

  useEffect(() => {
    isConnectedRef.current = state.isConnected;
  }, [state.isConnected]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const boards = await getBoardsIndex(getRequest, logger);
      if (!isMounted) return;
      setState((prev) => ({ ...prev, chipList: boards }));
      if (boards.length === 1) {
        // Auto-select the only available chip
        const chipId = boards[0].chip;
        const variants = boards[0].variants || [];
        setState((prev) => ({
          ...prev,
          selectedChip: chipId,
          selectedVariant: null,
          versionList: [],
          selectedVersion: null,
        }));
        // If there's only one variant, select it and fetch versions
        if (variants.length === 1) {
          const variantId = variants[0].id;
          (async () => {
            const versions = await getBoardVersions(getRequest, variantId, logger);
            if (!isMounted) return;
            setState((prev) => ({
              ...prev,
              selectedVariant: variants[0],
              versionList: versions,
              selectedVersion: versions[0]?.version ?? null,
            }));
          })();
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!syncUrlParam) return;
    const current = getUrlParam('url');
    if (!current) return;
    setState((prev) => {
      if (prev.firmwareUrl === current && prev.sourceTab === 'url') {
        return prev;
      }
      return {
        ...prev,
        firmwareUrl: current,
        sourceTab: 'url',
      };
    });
  }, [syncUrlParam]);

  useEffect(() => {
    if (!syncUrlParam) return;
    if (state.sourceTab !== 'url') return;
    const current = getUrlParam('url');
    if (state.firmwareUrl === current) return;
    const timer = window.setTimeout(() => {
      const nextUrl = new URL(window.location.href);
      if (state.firmwareUrl) {
        nextUrl.searchParams.set('url', state.firmwareUrl);
      } else {
        nextUrl.searchParams.delete('url');
      }
      window.history.replaceState(null, '', nextUrl.toString());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [state.firmwareUrl, state.sourceTab, syncUrlParam]);

  const changeVersion = useCallback((version: string) => {
    setState((prev) => ({ ...prev, selectedVersion: version }));
  }, []);

  const psramVariantMap: Record<number, { sizeMb: number; variantId: string }> = {
    0: { sizeMb: 0, variantId: 'ESP32-S3-Generic-NoPSRAM' },
    1: { sizeMb: 8, variantId: 'ESP32-S3-Generic-OctalPSRAM' },
    2: { sizeMb: 2, variantId: 'ESP32-S3-Generic-QuadPSRAM' },
    3: { sizeMb: 16, variantId: 'ESP32-S3-Generic-16MB-PSRAM' },
    4: { sizeMb: 4, variantId: 'ESP32-S3-Generic-4MB-PSRAM' },
  };

  const connect = useCallback(async () => {
    logger.clearLevel('installer');
    setState((prev) => ({ ...prev, autoLoading: true }));

    let newTransport: Transport | null = null;

    try {
      const device = await navigator.serial.requestPort({ filters: [] });
      newTransport = new Transport(device, true, true);
      transportRef.current = newTransport;

      terminal.writeLine(m.installer_msg_connecting());

      const flashOptions: LoaderOptions = {
        transport: newTransport,
        baudrate: state.baudrate,
        debugLogging: false,
      };
      const newEsploader = new ESPLoader(flashOptions);

      try {
        await executeWithTimeout(newEsploader.main(), 3000);
      } catch (error) {
        if (error instanceof TimeoutError) {
          terminal.writeLine(m.installer_msg_timeout_bootloader());
          setState((prev) => ({
            ...prev,
            showPopupText: m.installer_msg_timeout_bootloader(),
          }));
          await newEsploader.transport.disconnect();
        }
        throw error;
      }

      const chipName = newEsploader.chip.CHIP_NAME;

      if (!chipName.startsWith('ESP32')) {
        throw new Error(m.installer_msg_unsupported_chip({ chipName }));
      }

      terminal.writeLine(m.installer_msg_connected_terminal({ chipName }));

      const flashSize = await newEsploader.detectFlashSize();
      if (flashSize) {
        terminal.writeLine(
          m.installer_msg_flash_size({
            size: flashSize.toString(),
          }),
        );
      }

      const newFlasher = new ESP32Flasher(terminal, (progress) => {
        setState((prev) => ({ ...prev, flashProgress: progress }));
      });
      await newFlasher.setup(newEsploader);
      flasherRef.current = newFlasher;

      changeChip(chipName);

      if (chipName === 'ESP32-S3') {
        const chipWithPsram = newEsploader.chip as ChipWithPsram;
        if (typeof chipWithPsram.getPsramCap === 'function') {
          const size = await chipWithPsram.getPsramCap(newEsploader);
          const psramInfo = psramVariantMap[size];
          const psramInfoText = `Detected PSRAM size: ${psramInfo ? `${psramInfo.sizeMb}MB` : 'Unknown'}`;
          console.log(psramInfoText);
          terminal.writeLine(psramInfoText);

          if (psramInfo) {
            await changeVariant(psramInfo.variantId, chipName);
          } else {
            enqueueSnackbar(
              m.installer_msg_unsupported_psram({
                size: size,
              }),
              {
                variant: 'error',
              },
            );
          }
        }
      }

      setState((prev) => ({
        ...prev,
        isConnected: true,
      }));

      enqueueSnackbar(m.installer_msg_connected({ chipName: chipName }), {
        variant: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : m.installer_msg_unknown_error();
      terminal.writeLine(`Error: ${message}`);
      enqueueSnackbar(m.installer_msg_connection_failed({ message: message }), {
        variant: 'error',
      });
      setState((prev) => ({
        ...prev,
        isConnected: false,
      }));

      if (newTransport) {
        try {
          await newTransport.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      }

      transportRef.current = null;
      flasherRef.current = null;
    } finally {
      setState((prev) => ({ ...prev, autoLoading: false }));
    }
  }, [changeChip, changeVariant, state.baudrate, terminal]);

  const disconnect = useCallback(async () => {
    const flasher = flasherRef.current;
    if (flasher) {
      try {
        await flasher.disconnect();
        terminal.writeLine(`\n${m.installer_msg_disconnected_terminal()}`);
        terminal.writeLine(`\n${m.installer_msg_disconnected_hint()}`);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }

    transportRef.current = null;
    flasherRef.current = null;

    setState((prev) => ({
      ...prev,
      isConnected: false,
      flashProgress: null,
    }));

    enqueueSnackbar(m.installer_msg_disconnected(), { variant: 'info' });
  }, [terminal]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serial' in navigator)) return;
    const handler = () => {
      if (!isConnectedRef.current) return;
      void disconnect();
    };
    navigator.serial.addEventListener('disconnect', handler);
    return () => {
      navigator.serial.removeEventListener('disconnect', handler);
    };
  }, [disconnect]);

  const flash = useCallback(async () => {
    const flasher = flasherRef.current;
    if (!flasher) return;

    let firmwareUrl: string | null;
    let revokeUrl: string | null = null;

    if (state.sourceTab === 'online') {
      if (!state.selectedVariant || !state.selectedVersion) {
        enqueueSnackbar('Select a firmware variant and version first.', {
          variant: 'error',
        });
        return;
      }
      firmwareUrl = getBoardVersionFirmwareTarUrl(state.selectedVariant.id, state.selectedVersion);
    } else if (state.sourceTab === 'url') {
      if (!state.firmwareUrl) {
        enqueueSnackbar('Enter a firmware URL.', { variant: 'error' });
        return;
      }
      if (!isFirmwarePackage(state.firmwareUrl)) {
        enqueueSnackbar('Firmware URL must end with .tar.gz or .tgz', {
          variant: 'error',
        });
        return;
      }
      firmwareUrl = state.firmwareUrl;
    } else {
      if (!state.firmwareFile) {
        enqueueSnackbar('Choose a firmware file.', { variant: 'error' });
        return;
      }
      if (!isFirmwarePackage(state.firmwareFile.name)) {
        enqueueSnackbar('Firmware file must be a .tar.gz or .tgz archive.', {
          variant: 'error',
        });
        return;
      }
      firmwareUrl = URL.createObjectURL(state.firmwareFile);
      revokeUrl = firmwareUrl;
    }

    setState((prev) => ({ ...prev, installing: true, flashProgress: null }));

    try {
      terminal.writeLine(`\n${m.installer_msg_flash_starting()}`);
      terminal.writeLine(
        m.installer_msg_flash_firmware({
          variant: state.selectedVariant?.name ?? 'custom',
          version: state.selectedVersion ?? 'custom',
        }),
      );

      await flasher.flash(firmwareUrl, !state.eraseFlash);

      enqueueSnackbar(m.installer_msg_flash_success(), { variant: 'success' });
      setState((prev) => ({
        ...prev,
        showPopupText: m.installer_msg_flash_reset_hint(),
      }));

      setTimeout(() => {
        void disconnect();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : m.installer_msg_unknown_error();
      terminal.writeLine(`Error: ${message}`);
      enqueueSnackbar(m.installer_msg_flash_failed({ message: message }), {
        variant: 'error',
      });
    } finally {
      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
      setState((prev) => ({
        ...prev,
        installing: false,
        flashProgress: null,
      }));
    }
  }, [
    disconnect,
    state.eraseFlash,
    state.firmwareFile,
    state.firmwareUrl,
    state.selectedVariant,
    state.selectedVersion,
    state.sourceTab,
    terminal,
  ]);

  const value = useMemo(
    () => ({
      state,
      actions: {
        setBaudrate: (value: number) => setState((prev) => ({ ...prev, baudrate: value })),
        setEraseFlash: (value: boolean) => setState((prev) => ({ ...prev, eraseFlash: value })),
        setSourceTab: (tab: InstallerSourceTab) =>
          setState((prev) => ({ ...prev, sourceTab: tab })),
        setFirmwareUrl: (value: string) => setState((prev) => ({ ...prev, firmwareUrl: value })),
        setFirmwareFile: (file: File | null) =>
          setState((prev) => ({ ...prev, firmwareFile: file })),
        changeChip: (chipId: string) => changeChip(chipId),
        changeVariant: (variantId: string) => changeVariant(variantId),
        changeVersion,
        connect,
        disconnect,
        flash,
        closePopup: () => setState((prev) => ({ ...prev, showPopupText: null })),
      },
      meta: {
        baudrates,
      },
    }),
    [changeChip, changeVariant, changeVersion, connect, disconnect, flash, state],
  );

  return <InstallerContext.Provider value={value}>{children}</InstallerContext.Provider>;
}
