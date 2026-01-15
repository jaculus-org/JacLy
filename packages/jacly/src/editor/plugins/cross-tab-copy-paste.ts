import {CrossTabCopyPaste} from '@blockly/plugin-cross-tab-copy-paste';

export function registerCrossTabCopyPaste() {
  const plugin = new CrossTabCopyPaste();
  plugin.init({contextMenu: true, shortcut: true}, () => {
    console.log('Error initializing cross-tab copy-paste plugin');
  });
}
