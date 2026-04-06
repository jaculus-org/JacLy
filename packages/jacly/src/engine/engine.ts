import '../core/built-in-blocks';

import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import { JaclyBlocksData } from '@jaculus/project';
import { registerJaclyCustomCategory } from '../editor/lib/custom-category';
import { EngineState, createEngineState } from './engine-state';
import { loadToolboxConfiguration } from '../core/toolbox/toolbox-builder';
import { generateCodeFromWorkspace } from '../core/codegen/workspace-codegen';
import { registerWorkspaceChangeListener } from '../core/workspace/rules';
import { registerDocsCallbacks } from '../core/toolbox/category-header';
import { registerCrossTabCopyPaste } from '../editor/plugins/cross-tab-copy-paste';
import { registerFieldColour } from '@blockly/field-colour';
import { WorkspaceSvgExtended } from '../core/types/custom-block';
import { registerPlaceholderBlock } from '../core/registration/placeholder-block';
import {
  sanitizeWorkspaceState,
  type SanitizationResult,
} from '../core/workspace/workspace-validation';

export interface EngineMissingPackages {
  [packageName: string]: Set<string>;
}

export class JaclyEngine {
  private state: EngineState = createEngineState();
  private attachedWorkspace: Blockly.WorkspaceSvg | null = null;

  constructor() {
    registerJaclyCustomCategory();
    registerPlaceholderBlock();
  }

  buildToolbox(data: JaclyBlocksData): Blockly.utils.toolbox.ToolboxDefinition {
    return loadToolboxConfiguration(this.state, data);
  }

  reloadBlockData(data: JaclyBlocksData): void {
    const oldTypes = new Set(this.state.registeredBlockTypes);

    this.state = createEngineState();
    const newConfig = loadToolboxConfiguration(this.state, data);

    for (const type of oldTypes) {
      if (!this.state.registeredBlockTypes.has(type)) {
        delete Blockly.Blocks[type];
        delete jsg.forBlock[type];
      }
    }

    this.attachedWorkspace?.updateToolbox(newConfig);
  }

  attachToWorkspace(workspace: Blockly.WorkspaceSvg): void {
    if (this.attachedWorkspace === workspace) return;
    this.attachedWorkspace = workspace;
    registerWorkspaceChangeListener(workspace as WorkspaceSvgExtended);
    registerDocsCallbacks(this.state, workspace);
    registerCrossTabCopyPaste();
    registerFieldColour();
  }

  generateCode(workspace: Blockly.WorkspaceSvg): string {
    return generateCodeFromWorkspace(this.state, workspace);
  }

  async validateWorkspace(
    json: object,
    onMissingPackage: (missingPackages: EngineMissingPackages) => Promise<void>
  ): Promise<SanitizationResult> {
    return sanitizeWorkspaceState(json, onMissingPackage);
  }
}
