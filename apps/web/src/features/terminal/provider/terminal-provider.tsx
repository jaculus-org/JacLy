import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type TerminalStreamType =
  | 'console-in'
  | 'console-out'
  | 'console-err'
  | 'compiler-stdout'
  | 'compiler-stderr'
  | 'runtime-stdout'
  | 'runtime-stderr';

export interface TerminalEntry {
  timestamp: Date;
  type: TerminalStreamType;
  content: string;
}

export type AddToTerminal = (type: TerminalStreamType, content: string) => void;

export interface TerminalContextValue {
  consoleEntries: TerminalEntry[];
  logEntries: TerminalEntry[];

  addEntry: AddToTerminal;
  clear(): void;
  clearType(type: TerminalStreamType): void;
}

export const TerminalContext = createContext<TerminalContextValue | null>(null);

export const logKeys = ['compiler', 'runtime'];

interface TerminalProviderProps {
  children: ReactNode;
}

export function TerminalProvider({ children }: TerminalProviderProps) {
  const maxEntries = 1000;
  const [entries, setEntries] = useState<TerminalEntry[]>([]);

  const addEntry = useCallback((type: TerminalStreamType, content: string) => {
    setEntries(prev => {
      const newEntry: TerminalEntry = {
        timestamp: new Date(),
        type,
        content,
      };
      const updated = [...prev, newEntry];
      if (updated.length > maxEntries) {
        updated.shift();
      }
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  const clearType = useCallback((type: TerminalStreamType) => {
    setEntries(prev => prev.filter(entry => entry.type !== type));
  }, []);

  const consoleEntries = useMemo(
    () => entries.filter(entry => entry.type.startsWith('console')),
    [entries]
  );

  // non-console entries
  const logEntries = useMemo(
    () => entries.filter(entry => !entry.type.startsWith('console')),
    [entries]
  );

  const contextValue = useMemo<TerminalContextValue>(
    () => ({
      consoleEntries,
      logEntries,
      addEntry,
      clear,
      clearType,
    }),
    [consoleEntries, logEntries, addEntry, clear, clearType]
  );

  return (
    <TerminalContext.Provider value={contextValue}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal(): TerminalContextValue {
  const context = use(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within an TerminalProvider');
  }
  return context;
}

export function getStreamInfo(type: TerminalStreamType) {
  const streamMap: Record<TerminalStreamType, { name: string; color: string }> =
    {
      'console-in': { name: 'Console Input', color: 'blue' },
      'console-out': { name: 'Console Output', color: 'green' },
      'console-err': { name: 'Console Error', color: 'red' },
      'compiler-stdout': { name: 'Compiler Stdout', color: 'green' },
      'compiler-stderr': { name: 'Compiler Stderr', color: 'red' },
      'runtime-stdout': { name: 'Runtime Stdout', color: 'green' },
      'runtime-stderr': { name: 'Runtime Stderr', color: 'red' },
    };
  return streamMap[type];
}
