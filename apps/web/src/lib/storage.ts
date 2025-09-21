// localStorage utility functions for consistent state management
// Usage examples:
// const theme = storage.get(STORAGE_KEYS.THEME, 'light');
// storage.set(STORAGE_KEYS.USER_PREFERENCES, { fontSize: 14, autoSave: true });

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (_error) {
      console.warn(`Failed to load ${key} from localStorage:`, _error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T, throwIfError = false): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      console.warn(`Failed to save ${key} to localStorage:`, _error);
      if (throwIfError) throw _error;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (_error) {
      console.warn(`Failed to remove ${key} from localStorage:`, _error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (_error) {
      console.warn('Failed to clear localStorage:', _error);
    }
  },
};

// Specific storage keys - add new keys here as needed
export const STORAGE_KEYS = {
  THEME: 'jacly-theme',
  LAYOUT_MODEL: 'jacly-layout-model',
  USER_PREFERENCES: 'jacly-user-preferences',
  BLOCKLY_WORKSPACE: 'jacly-blockly-workspace',
  JACLY: 'jacly-config',
  PROJECTS: 'jacly-projects',
  ACTIVE_PROJECT: 'jacly-active-project',
} as const;
