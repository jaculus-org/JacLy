import { m } from '@/paraglide/messages';
import * as FlexLayout from 'flexlayout-react';
import type { PanelType } from '../types/flexlayout-type';

export const defaultGlobalSettings: FlexLayout.IGlobalAttributes = {
  tabEnableClose: false,
  tabEnableRename: false,
  tabSetEnableMaximize: true,
  tabSetEnableDrop: true,
  tabSetEnableDrag: true,
  tabSetEnableTabStrip: true,
};

export const defaultLayout: FlexLayout.IJsonRowNode = {
  type: 'row',
  weight: 100,
  children: [
    {
      type: 'tabset',
      weight: 100,
      id: 'main-tabset',
      children: [
        {
          type: 'tab',
          component: 'blockly',
          id: 'blockly',
        },
      ],
    },
  ],
};

export const defaultBorderLayout: FlexLayout.IJsonBorderNode[] = [
  {
    type: 'border',
    location: 'left',
    size: 250,
    selected: -1,
    children: [
      {
        type: 'tab',
        component: 'file-explorer',
        id: 'file-explorer',
        enableClose: false,
      },
      {
        type: 'tab',
        component: 'packages',
        id: 'packages',
        enableClose: false,
      },
      {
        type: 'tab',
        component: 'jaculus',
        id: 'jaculus',
        enableClose: false,
      },
    ],
  },
  {
    type: 'border',
    location: 'right',
    size: 400,
    selected: -1,
    children: [
      {
        type: 'tab',
        component: 'console',
        id: 'console',
        enableClose: false,
      },
      {
        type: 'tab',
        component: 'generated-code',
        id: 'generated-code',
        enableClose: false,
      },
      {
        type: 'tab',
        component: 'logs',
        id: 'logs',
        enableClose: false,
      },
    ],
  },
];

export const flexLayoutDefaultJson: FlexLayout.IJsonModel = {
  global: defaultGlobalSettings,
  borders: defaultBorderLayout,
  layout: defaultLayout,
};


export function getPanelTitle(component: PanelType | undefined): string | undefined {
  if (component === undefined) {
    return undefined;
  }

  switch (component) {
    case 'blockly':
      return m.project_panel_blockly();
    case 'file-explorer':
      return m.project_panel_fs();
    case 'packages':
      return m.project_panel_packages();
    case 'jaculus':
      return m.project_panel_jaculus();
    case 'console':
      return m.project_panel_console();
    case 'generated-code':
      return m.project_panel_code();
    case 'logs':
      return m.project_panel_logs();
    case 'code':
      return m.project_panel_code_editor();
    case 'wokwi':
      return m.project_panel_wokwi();
    default:
      const _exhaustive: never = component; // exhaustiveness check
      return _exhaustive;
  }
}
