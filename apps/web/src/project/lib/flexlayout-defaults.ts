import * as FlexLayout from 'flexlayout-react';
import { applyPanelDefinitionToTab } from './panel-registry';

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
        applyPanelDefinitionToTab({
          type: 'tab',
          component: 'blockly',
          id: 'blockly',
        }),
      ],
    },
  ],
};

export const defaultBorderLayout: FlexLayout.IJsonBorderNode[] = [
  {
    type: 'border',
    location: 'left',
    size: 250,
    selected: 0,
    children: [
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'packages',
        id: 'packages',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'file-explorer',
        id: 'file-explorer',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'jaculus',
        id: 'jaculus',
        enableClose: false,
      }),
    ],
  },
  {
    type: 'border',
    location: 'right',
    size: 400,
    selected: -1,
    children: [
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'console',
        id: 'console',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'chart',
        id: 'chart',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'generated-code',
        id: 'generated-code',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'logs',
        id: 'logs',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'wokwi',
        id: 'wokwi',
        enableClose: false,
      }),
      applyPanelDefinitionToTab({
        type: 'tab',
        component: 'installer',
        id: 'installer',
        enableClose: false,
      }),
    ],
  },
];

export const flexLayoutDefaultJson: FlexLayout.IJsonModel = {
  global: defaultGlobalSettings,
  borders: defaultBorderLayout,
  layout: defaultLayout,
};
