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
  | 'source-code'
  | 'generated-code'
  | 'wokwi'
  | 'packages'
  | 'logs';

export type PanelAction = 'close' | 'expand' | 'collapse' | 'focus';

export type NewPanelProps = {
  'source-code': { filePath?: string };
};
