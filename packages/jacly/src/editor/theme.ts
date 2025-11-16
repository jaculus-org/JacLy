import * as Blockly from 'blockly/core';

export type Theme = 'light' | 'dark';

export const lightTheme = Blockly.Themes.Zelos;

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
});
