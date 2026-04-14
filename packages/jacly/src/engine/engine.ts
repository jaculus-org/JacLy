import '@/blocks/built-ins';

import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import { JaclyBlocksData } from '@jaculus/project';
import { EngineState, createEngineState } from './engine-state';
import { loadToolboxConfiguration } from '@/toolbox/loading/toolbox-loader';
import { generateCodeFromWorkspace } from '@/codegen/workspace/generate-code-from-workspace';
import { registerPlaceholderBlock } from '@/blocks/registration/placeholder-block';
import {
  sanitizeWorkspaceState,
  type SanitizationResult,
} from '@/workspace/validation/workspace-validation';
import type { EngineMissingPackages } from '@/workspace/validation/types';
import { attachEngineWorkspace } from './workspace-attachment';

export class JaclyEngine {
  private state: EngineState = createEngineState();
  private attachedWorkspace: Blockly.WorkspaceSvg | null = null;

  constructor() {
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
    attachEngineWorkspace(this.state, workspace);
  }

  detachFromWorkspace(workspace: Blockly.WorkspaceSvg): void {
    if (this.attachedWorkspace === workspace) {
      this.attachedWorkspace = null;
    }
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
