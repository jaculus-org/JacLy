import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { m } from '@/paraglide/messages';
import {
  ESPLoader,
  Transport,
  type IEspLoaderTerminal,
  type LoaderOptions,
} from 'esptool-js';
import {
  getBoardsIndex,
  getBoardVersionFirmwareTarUrl,
  getBoardVersions,
  type BoardsIndex,
} from '@jaculus/firmware/boards';
import { enqueueSnackbar } from 'notistack';
import {
  executeWithTimeout,
  TimeoutError,
} from '@/features/shared/lib/timeout';
import { type InstallerState, InstallerContext } from './installer-context';
import { ESP32Flasher } from './libs/flasher';

interface ChipWithPsram {
  getPsramCap?(loader: ESPLoader): Promise<number>;
}

export const baudrates = ['921600', '460800', '230400', '115200'];

const initialState: InstallerState = {
  baudrate: Number(baudrates[0]),
  chipList: [],
  selectedChip: null,
  selectedVariant: null,
  versionList: [],
  selectedVersion: null,
  eraseFlash: true,
  autoLoading: false,
  installing: false,
  isConnected: false,
  flashProgress: null,
  terminalOutput: [],
  showPopupText: null,
};

export function InstallerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InstallerState>(initialState);
  const transportRef = useRef<Transport | null>(null);
  const flasherRef = useRef<ESP32Flasher | null>(null);
  const terminal: IEspLoaderTerminal = useMemo(
    () => ({
      clean() {
        setState(prev => ({ ...prev, terminalOutput: [] }));
      },
      writeLine(data: string) {
        setState(prev => ({
          ...prev,
          terminalOutput: [...prev.terminalOutput, data],
        }));
      },
      write(data: string) {
        setState(prev => {
          const terminalOutput = [...prev.terminalOutput];
          if (terminalOutput.length === 0) {
            terminalOutput.push(data);
          } else {
            terminalOutput[terminalOutput.length - 1] += data;
          }
          return { ...prev, terminalOutput };
        });
      },
    }),
    []
  );

  const changeVariant = useCallback(
    async (variantId: string, chipId?: string) => {
      const currentChip = chipId || state.selectedChip;
      const variant =
        state.chipList
          .find(chip => chip.chip === currentChip)
          ?.variants.find(variant => variant.id === variantId) || null;

      setState(prev => ({ ...prev, selectedVariant: variant }));

      if (variant) {
        const versions = await getBoardVersions(variant.id);
        versions.sort((a, b) => {
          const aIsNode = a.version.toLowerCase().includes('node');
          const bIsNode = b.version.toLowerCase().includes('node');
          if (aIsNode && !bIsNode) return -1;
          if (!aIsNode && bIsNode) return 1;
          return 0;
        });

        setState(prev => ({
          ...prev,
          versionList: versions,
          selectedVersion: versions[0]?.version ?? null,
        }));
      }
    },
    [state.chipList, state.selectedChip]
  );

  const changeChip = useCallback(
    (chipId: string, chipListOverride?: BoardsIndex[]) => {
      const chipList = chipListOverride ?? state.chipList;
      const variants =
        chipList.find(chip => chip.chip === chipId)?.variants || [];

      setState(prev => ({
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
    [changeVariant, state.chipList]
  );

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const boards = await getBoardsIndex();
      if (!isMounted) return;
      setState(prev => ({ ...prev, chipList: boards }));
      if (boards.length === 1) {
        changeChip(boards[0].chip, boards);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [changeChip]);

  const changeVersion = useCallback((version: string) => {
    setState(prev => ({ ...prev, selectedVersion: version }));
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, autoLoading: true, terminalOutput: [] }));

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
        romBaudrate: 115200,
      };
      const newEsploader = new ESPLoader(flashOptions);

      try {
        await executeWithTimeout(newEsploader.main(), 3000);
      } catch (error) {
        if (error instanceof TimeoutError) {
          terminal.writeLine(m.installer_msg_timeout_bootloader());
          setState(prev => ({
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
      terminal.writeLine(
        m.installer_msg_flash_size({
          size: (await newEsploader.getFlashSize()).toString(),
        })
      );

      const newFlasher = new ESP32Flasher(terminal, progress => {
        setState(prev => ({ ...prev, flashProgress: progress }));
      });
      await newFlasher.setup(newEsploader);
      flasherRef.current = newFlasher;

      changeChip(chipName);

      if (chipName === 'ESP32-S3') {
        const chipWithPsram = newEsploader.chip as ChipWithPsram;
        if (typeof chipWithPsram.getPsramCap === 'function') {
          const size = await chipWithPsram.getPsramCap(newEsploader);
          switch (size) {
            case 0:
              await changeVariant('ESP32-S3-Generic-NoPSRAM', chipName);
              break;
            case 2:
              await changeVariant('ESP32-S3-Generic-QuadPSRAM', chipName);
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

      setState(prev => ({
        ...prev,
        isConnected: true,
      }));

      enqueueSnackbar(m.installer_msg_connected({ chipName: chipName }), {
        variant: 'success',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : m.installer_msg_unknown_error();
      terminal.writeLine(`Error: ${message}`);
      enqueueSnackbar(m.installer_msg_connection_failed({ message: message }), {
        variant: 'error',
      });
      setState(prev => ({
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
      setState(prev => ({ ...prev, autoLoading: false }));
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

    setState(prev => ({
      ...prev,
      isConnected: false,
      flashProgress: null,
    }));

    enqueueSnackbar(m.installer_msg_disconnected(), { variant: 'info' });
  }, [terminal]);

  const flash = useCallback(async () => {
    const flasher = flasherRef.current;
    if (!flasher || !state.selectedVariant || !state.selectedVersion) return;

    setState(prev => ({ ...prev, installing: true, flashProgress: null }));

    try {
      const firmwareUrl = getBoardVersionFirmwareTarUrl(
        state.selectedVariant.id,
        state.selectedVersion
      );
      terminal.writeLine(`\n${m.installer_msg_flash_starting()}`);
      terminal.writeLine(
        m.installer_msg_flash_firmware({
          variant: state.selectedVariant.name,
          version: state.selectedVersion,
        })
      );

      await flasher.flash(firmwareUrl, !state.eraseFlash);

      enqueueSnackbar(m.installer_msg_flash_success(), { variant: 'success' });
      setState(prev => ({
        ...prev,
        showPopupText: m.installer_msg_flash_reset_hint(),
      }));

      setTimeout(() => {
        void disconnect();
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : m.installer_msg_unknown_error();
      terminal.writeLine(`Error: ${message}`);
      enqueueSnackbar(m.installer_msg_flash_failed({ message: message }), {
        variant: 'error',
      });
    } finally {
      setState(prev => ({
        ...prev,
        installing: false,
        flashProgress: null,
      }));
    }
  }, [
    disconnect,
    state.eraseFlash,
    state.selectedVariant,
    state.selectedVersion,
    terminal,
  ]);

  const value = useMemo(
    () => ({
      state,
      actions: {
        setBaudrate: (value: number) =>
          setState(prev => ({ ...prev, baudrate: value })),
        setEraseFlash: (value: boolean) =>
          setState(prev => ({ ...prev, eraseFlash: value })),
        changeChip: (chipId: string) => changeChip(chipId),
        changeVariant: (variantId: string) => changeVariant(variantId),
        changeVersion,
        connect,
        disconnect,
        flash,
        closePopup: () => setState(prev => ({ ...prev, showPopupText: null })),
      },
      meta: {
        baudrates,
      },
    }),
    [
      changeChip,
      changeVariant,
      changeVersion,
      connect,
      disconnect,
      flash,
      state,
    ]
  );

  return (
    <InstallerContext.Provider value={value}>
      {children}
    </InstallerContext.Provider>
  );
}
