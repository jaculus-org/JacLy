import type { JaclyBlocksData } from '@jaculus/project';

// messages sent from the extension host to the webview
export type ExtensionToWebviewMessage =
  | { type: 'load'; initialJson: object; jaclyBlocksData: JaclyBlocksData }
  | { type: 'reloadBlocks'; jaclyBlocksData: JaclyBlocksData }
  | { type: 'error'; message: string };

// messages sent from the webview to the extension host
export type WebviewToExtensionMessage =
  | { type: 'ready' }
  | { type: 'saveJson'; json: object }
  | { type: 'generatedCode'; code: string };
