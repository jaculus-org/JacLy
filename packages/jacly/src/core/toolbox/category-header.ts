import * as Blockly from 'blockly/core';
import { JaclyConfig } from '../schema';
import type { EngineState } from '../engine-state';

type FlyoutItem = Blockly.utils.toolbox.ToolboxItemInfo & {
  'web-class'?: string;
  callbackkey?: string;
  gap?: string;
};

const defaultGithubDocs =
  'https://github.com/jaculus-org/Jaculus-libraries/tree/master/';

export function buildCategoryHeader(
  state: EngineState,
  config: JaclyConfig
): FlyoutItem[] {
  const header: FlyoutItem[] = [];

  if (config.name) {
    header.push({
      kind: 'label',
      text: config.name,
      'web-class': 'jacly-flyout-title',
    });
  }

  if (config.description) {
    header.push({
      kind: 'label',
      text: config.description,
      'web-class': 'jacly-flyout-description',
    });
  }

  if (config.docs) {
    const callbackKey = `jacly_docs_${config.category}`;
    state.docsCallbacks.set(
      callbackKey,
      `${defaultGithubDocs}${config.category}#readme`
    );
    header.push({
      kind: 'button',
      text: '📖 Open documentation',
      callbackkey: callbackKey,
      'web-class': 'jacly-flyout-docs-btn',
    });
  }

  if (header.length > 0) {
    header.push({ kind: 'sep', gap: '24' } as FlyoutItem);
  }

  return header;
}

export function registerDocsCallbacks(
  state: EngineState,
  workspace: Blockly.WorkspaceSvg
): void {
  for (const [callbackKey, docsUrl] of state.docsCallbacks) {
    workspace.registerButtonCallback(callbackKey, () => {
      window.open(docsUrl, '_blank', 'noopener,noreferrer');
    });
  }
}
