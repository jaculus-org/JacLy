import '@/blocks/built-ins';

import type { JaclyBlocksData } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import { createInstanceTracker } from '@/blocks/instances';
import { registerPlaceholderBlock } from '@/blocks/registration/placeholder-block';
import { generateCodeFromWorkspace } from '@/codegen/workspace/generate-code-from-workspace';
import { loadToolboxConfiguration } from '@/toolbox/loading/toolbox-loader';
import type { EngineMissingPackages } from '@/workspace/validation/types';
import {
  type SanitizationResult,
  sanitizeWorkspaceState,
} from '@/workspace/validation/workspace-validation';
import { createEngineState, type EngineState, resetEngineState } from './engine-state';
import { attachEngineWorkspace } from './workspace-attachment';

export class JaclyEngine {
  private state: EngineState = createEngineState();
  private attachedWorkspace: Blockly.WorkspaceSvg | null = null;

  constructor() {
    registerPlaceholderBlock();
  }

  private rebuildBlockData(
    data: JaclyBlocksData,
    updateAttachedWorkspace: boolean,
  ): Blockly.utils.toolbox.ToolboxDefinition {
    const oldTypes = new Set(this.state.registeredBlockTypes);

    resetEngineState(this.state);
    const newConfig = loadToolboxConfiguration(this.state, data);

    for (const type of oldTypes) {
      if (!this.state.registeredBlockTypes.has(type)) {
        delete Blockly.Blocks[type];
        delete jsg.forBlock[type];
      }
    }

    if (updateAttachedWorkspace && this.attachedWorkspace) {
      const tracker = createInstanceTracker(this.state, this.attachedWorkspace);
      this.state.instanceTrackers.set(this.attachedWorkspace, tracker);
      tracker.rebuild();
      this.attachedWorkspace.updateToolbox(newConfig);
    }

    return newConfig;
  }

  buildToolbox(data: JaclyBlocksData): Blockly.utils.toolbox.ToolboxDefinition {
    return this.rebuildBlockData(data, false);
  }

  reloadBlockData(data: JaclyBlocksData): Blockly.utils.toolbox.ToolboxDefinition {
    return this.rebuildBlockData(data, true);
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
    onMissingPackage: (missingPackages: EngineMissingPackages) => Promise<void>,
  ): Promise<SanitizationResult> {
    return sanitizeWorkspaceState(json, onMissingPackage);
  }
}
