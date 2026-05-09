import type * as Blockly from 'blockly/core';
import type { JaclyConfig } from '@/schema';
import type { EngineState } from '../../engine/engine-state';
import { examplesCallbackKey, registerExamplesCallbacks } from './examples-toggle';

type FlyoutItem = Blockly.utils.toolbox.ToolboxItemInfo & {
  'web-class'?: string;
  callbackkey?: string;
  gap?: string;
};

const defaultGithubDocs = 'https://github.com/jaculus-org/Jaculus-libraries/tree/master/';

function includeHeader(config: JaclyConfig, header: FlyoutItem[], state: EngineState) {
  header.push({
    kind: 'label',
    text: config.name,
    'web-class': 'jacly-flyout-title',
  });

  if (config.description) {
    header.push({
      kind: 'label',
      text: config.description,
      'web-class': 'jacly-flyout-description',
    });
  }

  if (config.docs) {
    const callbackKey = `jacly_docs_${config.category}`;
    const docsUrl = config.docs.startsWith('http')
      ? config.docs
      : `${defaultGithubDocs}${config.docs}`;
    // Blockly buttons work via callback key, not direct URLs. key is registered on workspace attach.
    state.docsCallbacks.set(callbackKey, docsUrl);
    header.push({
      kind: 'button',
      text: '📖 Open documentation',
      callbackkey: callbackKey,
      'web-class': 'jacly-flyout-docs-btn',
    });
  }

  const examplesItems = state.categoryExamplesItems.get(config.category);
  if (examplesItems && examplesItems.length > 0) {
    const blockCount = examplesItems.filter((e) => (e as any).kind === 'block').length;
    const isExpanded = state.expandedExamples.has(config.category);
    header.push({
      kind: 'button',
      text: isExpanded ? '▼ Examples' : `▶ Examples (${blockCount})`,
      callbackkey: examplesCallbackKey(config.category),
      'web-class': 'jacly-flyout-examples-btn',
    });
  }

  header.push({ kind: 'sep', gap: '24' } as FlyoutItem);
}

export function buildCategoryHeader(state: EngineState, config: JaclyConfig): FlyoutItem[] {
  const header: FlyoutItem[] = [];

  if (config.contents?.length) {
    includeHeader(config, header, state);
  }

  return header;
}

export function registerDocsCallbacks(state: EngineState, workspace: Blockly.WorkspaceSvg): void {
  for (const [callbackKey, docsUrl] of state.docsCallbacks) {
    workspace.registerButtonCallback(callbackKey, () => {
      window.open(docsUrl, '_blank', 'noopener,noreferrer');
    });
  }
  registerExamplesCallbacks(state, workspace);
}
