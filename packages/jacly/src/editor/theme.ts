import * as Blockly from 'blockly/core';

export type Theme = 'light' | 'dark';

// Create a light theme based on Zelos and register custom block styles.
export const lightTheme = Blockly.Theme.defineTheme('light', {
  name: 'light',
  base: Blockly.Themes.Zelos,
  blockStyles: {
    // Basic category style uses a readable blue color by default
    basic_category: {
      colourPrimary: '#2196F3',
      colourSecondary: '#1E88E5',
      colourTertiary: '#1976D2',
    },
  },
});

export const darkTheme = Blockly.Theme.defineTheme('dark', {
  name: 'dark',
  base: Blockly.Themes.Zelos,
  componentStyles: {
    workspaceBackgroundColour: '#1e1e1e',
    toolboxBackgroundColour: '#252526',
    toolboxForegroundColour: '#cccccc',
    flyoutBackgroundColour: '#252526',
    flyoutForegroundColour: '#cccccc',
    scrollbarColour: '#797979',
    insertionMarkerColour: '#ffffff',
    markerColour: '#4285f4',
    cursorColour: '#ffffff',
  },
  blockStyles: {
    basic_category: {
      colourPrimary: '#2196F3',
      colourSecondary: '#1E88E5',
      colourTertiary: '#1976D2',
    },
  },
});
