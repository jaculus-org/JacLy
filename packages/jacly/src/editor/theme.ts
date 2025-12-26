import * as Blockly from 'blockly/core';

export type Theme = 'light' | 'dark';

const blockStyles = {
  basic_category: {
    colourPrimary: '#2196F3',
    colourSecondary: '#1E88E5',
    colourTertiary: '#1976D2',
  },
  adc_category: {
    colourPrimary: '#4CAF50',
    colourSecondary: '#43A047',
    colourTertiary: '#388E3C',
  },
  gpio_category: {
    colourPrimary: '#FF9800',
    colourSecondary: '#FB8C00',
    colourTertiary: '#F57C00',
  },
  i2c_category: {
    colourPrimary: '#9C27B0',
    colourSecondary: '#8E24AA',
    colourTertiary: '#7B1FA2',
  },
};

// Create a light theme based on Zelos and register custom block styles.
export const lightTheme = Blockly.Theme.defineTheme('light', {
  name: 'light',
  base: Blockly.Themes.Zelos,
  blockStyles,
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
  blockStyles,
});
