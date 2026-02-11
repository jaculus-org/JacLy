export type FlexLayoutAttributes = {
  type: string;
  name: string;
  id: string;
  enableClose: boolean;
};

export type PanelType =
  | 'blockly'
  | 'console'
  | 'file-explorer'
  | 'code'
  | 'generated-code'
  | 'wokwi'
  | 'packages'
  | 'logs'
  | 'jaculus';

export type PanelAction =
  | 'close' // close the panel (remove from layout)
  | 'expand' // open panel from collapsed state or focus if already expanded
  | 'collapse' // close tab but keep it in the layout
  | 'toggle'; // toggle between expand and collapse

export type NewPanelProps = {
  code: { filePath?: string };
};
