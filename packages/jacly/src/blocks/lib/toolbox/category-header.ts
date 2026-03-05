import * as Blockly from 'blockly/core';
import { JaclyConfig } from '../../schema';

// Blockly supports 'web-class' on labels/buttons but its type defs don't include it
type FlyoutItem = Blockly.utils.toolbox.ToolboxItemInfo & {
  'web-class'?: string;
  callbackkey?: string;
  gap?: string;
};

// Keep track of docs links to open on button click
const docsCallbackRegistry = new Map<string, string>();

// Create header items for a category flyout (title, description, docs button)
export function buildCategoryHeader(config: JaclyConfig): FlyoutItem[] {
  const header: FlyoutItem[] = [];

  // Category title — large bold text
  if (config.name) {
    header.push({
      kind: 'label',
      text: config.name,
      'web-class': 'jacly-flyout-title',
    });
  }

  // Description — smaller, muted subtitle
  if (config.description) {
    header.push({
      kind: 'label',
      text: config.description,
      'web-class': 'jacly-flyout-description',
    });
  }

  // Docs link button
  if (config.docs) {
    const callbackKey = `jacly_docs_${config.category}`;
    docsCallbackRegistry.set(callbackKey, config.docs);
    header.push({
      kind: 'button',
      text: '📖 Open documentation',
      callbackkey: callbackKey,
      'web-class': 'jacly-flyout-docs-btn',
    });
  }

  // Divider between header and blocks
  if (header.length > 0) {
    header.push({ kind: 'sep', gap: '24' } as FlyoutItem);
  }

  return header;
}

// Register callback handlers for all docs buttons
export function registerDocsCallbacks(workspace: Blockly.WorkspaceSvg): void {
  for (const [callbackKey, docsUrl] of docsCallbackRegistry) {
    workspace.registerButtonCallback(callbackKey, () => {
      window.open(docsUrl, '_blank', 'noopener,noreferrer');
    });
  }
}
