import {
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react';

export type TerminalStreamType =
  | 'serial-in'
  | 'serial-out'
  | 'compiler-stdout'
  | 'compiler-stderr'
  | 'runtime-stdout'
  | 'runtime-stderr'
  | 'system'
  | 'debug';

export interface TerminalEntry {
  id: string;
  timestamp: Date;
  type: TerminalStreamType;
  content: string;
  color: string;
}

export interface TerminalFilter {
  'serial-in': boolean;
  'serial-out': boolean;
  'compiler-stdout': boolean;
  'compiler-stderr': boolean;
  'runtime-stdout': boolean;
  'runtime-stderr': boolean;
  system: boolean;
  debug: boolean;
}

interface TerminalState {
  entries: TerminalEntry[];
  visibleTypes: TerminalFilter;
  maxEntries: number;

  // Actions
  addEntry: (type: TerminalStreamType, content: string) => void;
  toggleType: (type: TerminalStreamType) => void;
  setTypeVisible: (type: TerminalStreamType, visible: boolean) => void;
  clear: () => void;
  clearType: (type: TerminalStreamType) => void;
  setMaxEntries: (max: number) => void;
  filteredEntries: TerminalEntry[];
}

const streamColors: Record<TerminalStreamType, string> = {
  'serial-in': '#3b82f6', // blue
  'serial-out': '#10b981', // green
  'compiler-stdout': '#6366f1', // indigo
  'compiler-stderr': '#ef4444', // red
  'runtime-stdout': '#8b5cf6', // purple
  'runtime-stderr': '#f59e0b', // amber
  system: '#6b7280', // gray
  debug: '#ec4899', // pink
};

const defaultFilter: TerminalFilter = {
  'serial-in': true,
  'serial-out': true,
  'compiler-stdout': true,
  'compiler-stderr': true,
  'runtime-stdout': true,
  'runtime-stderr': true,
  system: true,
  debug: false, // debug off by default
};

export const useTerminalStore = () => {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [visibleTypes, setVisibleTypes] = useState<TerminalFilter>({
    ...defaultFilter,
  });
  const [maxEntries, setMaxEntriesState] = useState(1000);

  const addEntry = useCallback(
    (type: TerminalStreamType, content: string) => {
      const entry: TerminalEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        content: content.trim(),
        color: streamColors[type],
      };

      setEntries(prev => {
        const newEntries = [...prev, entry];
        // Trim to maxEntries if needed
        if (newEntries.length > maxEntries) {
          return newEntries.slice(-maxEntries);
        }
        return newEntries;
      });
    },
    [maxEntries]
  );

  const toggleType = useCallback((type: TerminalStreamType) => {
    setVisibleTypes(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

  const setTypeVisible = useCallback(
    (type: TerminalStreamType, visible: boolean) => {
      setVisibleTypes(prev => ({
        ...prev,
        [type]: visible,
      }));
    },
    []
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  const clearType = useCallback((type: TerminalStreamType) => {
    setEntries(prev => prev.filter(entry => entry.type !== type));
  }, []);

  const setMaxEntries = useCallback((max: number) => {
    setMaxEntriesState(max);
    setEntries(prev => prev.slice(-max));
  }, []);

  const filteredEntries = useMemo(
    () => entries.filter(entry => visibleTypes[entry.type]),
    [entries, visibleTypes]
  );

  return {
    entries,
    visibleTypes,
    maxEntries,
    addEntry,
    toggleType,
    setTypeVisible,
    clear,
    clearType,
    setMaxEntries,
    filteredEntries,
  };
};

// Context for sharing terminal state across components
export const TerminalContext = createContext<TerminalState | null>(null);

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};

// Helper to get stream type display name and description
export const getStreamInfo = (type: TerminalStreamType) => {
  const info = {
    'serial-in': {
      name: 'Serial In',
      description: 'Data received from device',
    },
    'serial-out': { name: 'Serial Out', description: 'Data sent to device' },
    'compiler-stdout': { name: 'Compiler', description: 'Build output' },
    'compiler-stderr': { name: 'Compiler Errors', description: 'Build errors' },
    'runtime-stdout': { name: 'Runtime', description: 'Program output' },
    'runtime-stderr': { name: 'Runtime Errors', description: 'Program errors' },
    system: { name: 'System', description: 'System messages' },
    debug: { name: 'Debug', description: 'Debug information' },
  };
  return info[type];
};
