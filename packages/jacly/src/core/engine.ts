import './built-in-blocks';

import * as Blockly from 'blockly/core';
import { JaclyBlocksData } from '@jaculus/project';
import { registerJaclyCustomCategory } from '../editor/lib/custom-category';
import { EngineState, createEngineState } from './engine-state';
import { loadToolboxConfiguration } from './toolbox/toolbox-builder';
import { generateCodeFromWorkspace } from './codegen/workspace-codegen';
import { registerWorkspaceChangeListener } from './workspace/rules';
import { registerDocsCallbacks } from './toolbox/category-header';
import { registerCrossTabCopyPaste } from '../editor/plugins/cross-tab-copy-paste';
import { registerFieldColour } from '@blockly/field-colour';
import { WorkspaceSvgExtended } from './types/custom-block';

export class JaclyEngine {
  private readonly state: EngineState = createEngineState();
  private attachedWorkspace: Blockly.WorkspaceSvg | null = null;

  constructor() {
    registerJaclyCustomCategory();
  }

  buildToolbox(data: JaclyBlocksData): Blockly.utils.toolbox.ToolboxDefinition {
    return loadToolboxConfiguration(this.state, data);
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
}
