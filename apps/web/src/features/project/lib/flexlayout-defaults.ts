import * as FlexLayout from 'flexlayout-react';

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
          name: 'Blockly Editor',
          component: 'blockly',
          id: 'blockly',
          enableClose: true,
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
        name: 'Jaculus',
        component: 'jaculus',
        id: 'jaculus',
        enableClose: false,
      },
      {
        type: 'tab',
        name: 'File Explorer',
        component: 'file-explorer',
        id: 'file-explorer',
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
        name: 'Console',
        component: 'console',
        id: 'console',
        enableClose: false,
      },
      {
        type: 'tab',
        name: 'Generated Code',
        component: 'generated-code',
        id: 'generated-code',
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
