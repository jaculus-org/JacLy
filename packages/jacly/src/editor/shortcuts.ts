import { ShortcutRegistry } from 'blockly/core';
import * as Blockly from 'blockly/core';

export enum names {
  FLYOUT_TOGGLE = 'flyout_toggle',
  COMMENT_SELECTED_BLOCK = 'comment_selected_block',
}

function registerToolboxToggle() {
  const toggleToolbox: ShortcutRegistry.KeyboardShortcut = {
    name: names.FLYOUT_TOGGLE,
    preconditionFn(workspace) {
      return workspace.getFlyout() !== null;
    },
    callback(workspace) {
      const flyout = workspace.getFlyout();
      if (flyout) {
        flyout.setVisible(!flyout.isVisible());
      }
      return true;
    },
    keyCodes: [Blockly.utils.KeyCodes.T],
  };
  ShortcutRegistry.registry.register(toggleToolbox);
}

export function registerShortcuts() {
  registerToolboxToggle();
}

registerShortcuts();
