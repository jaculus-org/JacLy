import { CrossTabCopyPaste } from '@blockly/plugin-cross-tab-copy-paste';

// Module-level flag to prevent re-registration
const CrossTabCopyPasteWithFlag =
  CrossTabCopyPaste as typeof CrossTabCopyPaste & {
    _isRegistered?: boolean;
  };

export function registerCrossTabCopyPaste() {
  if (CrossTabCopyPasteWithFlag._isRegistered) {
    return;
  }

  const plugin = new CrossTabCopyPaste();
  plugin.init({ contextMenu: true, shortcut: true }, () => {
    console.log('Error initializing cross-tab copy-paste plugin');
  });

  CrossTabCopyPasteWithFlag._isRegistered = true;
}
