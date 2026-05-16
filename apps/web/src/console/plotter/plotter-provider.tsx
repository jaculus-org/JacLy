import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cloneHistoryMap } from '../services/key-value-history';
import type { KeyValueHistoryMap, KeyValueMap } from '../types/key-value-types';
import { useConsole } from '../console/console-context';
import { ConsolePlotterContext, type ConsolePlotterContextValue } from './plotter-context';

interface PausedSnapshot {
  availableKeys: string[];
  history: KeyValueHistoryMap;
  latestEntries: KeyValueMap;
}

export interface ConsolePlotterProviderProps {
  children: ReactNode;
  durationMs?: number;
}

export function ConsolePlotterProvider({
  children,
  durationMs = 30_000,
}: ConsolePlotterProviderProps) {
  const { state: consoleState, actions: consoleActions } = useConsole();
  const [paused, setPaused] = useState(false);
  const [pausedSnapshot, setPausedSnapshot] = useState<PausedSnapshot | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const previousAvailableKeysRef = useRef<string[]>([]);

  const liveAvailableKeys = useMemo(
    () => Object.keys(consoleState.keyValueHistory).sort(),
    [consoleState.keyValueHistory],
  );

  const availableKeys = pausedSnapshot?.availableKeys ?? liveAvailableKeys;
  const history = pausedSnapshot?.history ?? consoleState.keyValueHistory;
  const latestEntries = pausedSnapshot?.latestEntries ?? consoleState.keyValueEntries;

  useEffect(() => {
    if (paused) {
      return;
    }

    const previousAvailableKeys = previousAvailableKeysRef.current;
    previousAvailableKeysRef.current = liveAvailableKeys;

    setSelectedKeys((currentSelectedKeys) => {
      const filteredKeys = currentSelectedKeys.filter((key) => liveAvailableKeys.includes(key));

      if (
        previousAvailableKeys.length === 0 &&
        liveAvailableKeys.length > 0 &&
        currentSelectedKeys.length === 0
      ) {
        return liveAvailableKeys;
      }

      const newlyAvailableKeys = liveAvailableKeys.filter(
        (key) => !previousAvailableKeys.includes(key) && !filteredKeys.includes(key),
      );

      return [...filteredKeys, ...newlyAvailableKeys];
    });
  }, [liveAvailableKeys, paused]);

  const toggleSeries = useCallback(
    (key: string) => {
      setSelectedKeys((currentSelectedKeys) => {
        if (currentSelectedKeys.includes(key)) {
          return currentSelectedKeys.filter((item) => item !== key);
        }

        return availableKeys.filter(
          (availableKey) => availableKey === key || currentSelectedKeys.includes(availableKey),
        );
      });
    },
    [availableKeys],
  );

  const selectAll = useCallback(() => {
    setSelectedKeys(availableKeys);
  }, [availableKeys]);

  const clearSelection = useCallback(() => {
    setSelectedKeys([]);
  }, []);

  const togglePause = useCallback(() => {
    if (paused) {
      setPaused(false);
      setPausedSnapshot(null);
      return;
    }

    setPausedSnapshot({
      availableKeys: liveAvailableKeys,
      history: cloneHistoryMap(consoleState.keyValueHistory),
      latestEntries: { ...consoleState.keyValueEntries },
    });
    setPaused(true);
  }, [consoleState.keyValueEntries, consoleState.keyValueHistory, liveAvailableKeys, paused]);

  const clearConsole = useCallback(() => {
    consoleActions.clear();
  }, [consoleActions]);

  const value = useMemo<ConsolePlotterContextValue>(
    () => ({
      state: {
        availableKeys,
        history,
        latestEntries,
        paused,
        selectedKeys,
      },
      actions: {
        clearConsole,
        clearSelection,
        selectAll,
        togglePause,
        toggleSeries,
      },
      meta: {
        durationMs,
      },
    }),
    [
      availableKeys,
      history,
      latestEntries,
      paused,
      selectedKeys,
      clearConsole,
      clearSelection,
      selectAll,
      togglePause,
      toggleSeries,
      durationMs,
    ],
  );

  return <ConsolePlotterContext.Provider value={value}>{children}</ConsolePlotterContext.Provider>;
}