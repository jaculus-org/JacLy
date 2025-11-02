import type { IJsonRowNode } from 'flexlayout-react';
import * as FlexLayout from 'flexlayout-react';

export const defaultLayout: IJsonRowNode = {
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
          name: 'Blockly',
          component: 'blockly',
          id: 'blockly',
          enableClose: false,
        },
      ],
    },
  ],
};

export const defaultJson: FlexLayout.IJsonModel = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableMaximize: true,
    tabSetEnableDrop: true,
    tabSetEnableDrag: true,
    tabSetEnableTabStrip: true,
  },
  borders: [
    {
      type: 'border',
      location: 'left',
      size: 250,
      selected: -1,
      children: [
        {
          type: 'tab',
          name: 'Jaculus',
          component: 'jac-config',
          id: 'jac-config',
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
      selected: 0,
      children: [
        {
          type: 'tab',
          name: 'Generated Code',
          component: 'generated-code',
          id: 'generated-code',
          enableClose: false,
        },
        {
          type: 'tab',
          name: 'Terminal',
          component: 'terminal',
          id: 'terminal',
          enableClose: false,
        },
      ],
    },
  ],
  layout: defaultLayout,
};
