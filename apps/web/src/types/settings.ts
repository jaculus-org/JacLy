export type Font = 'default' | 'mono' | 'sans' | 'serif';
export type EditorTheme = 'vs-dark' | 'vs-light' | 'high-contrast';

export type ThemeNormalized = 'dark' | 'light';
export type Theme = ThemeNormalized | 'system';

export interface ISettings {
  id: number;
  font: Font;
  fontSize: number;
  editorTheme: EditorTheme;
  enableGestures: boolean;
  enableAutosave: boolean;
  autosaveInterval: number;
  showLineNumbers: boolean;
  enableMinimap: boolean;
  theme: Theme;
}

export const defaultSettings: ISettings = {
  id: 0,
  font: 'default',
  fontSize: 14,
  editorTheme: 'vs-dark',
  enableGestures: true,
  enableAutosave: true,
  autosaveInterval: 5000,
  showLineNumbers: true,
  enableMinimap: true,
  theme: 'system',
};
