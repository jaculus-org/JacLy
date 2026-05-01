import '@/blocks/built-ins';

import type { JaclyBlocksData } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { javascriptGenerator as jsg } from 'blockly/javascript';
import { registerPlaceholderBlock } from '@/blocks/registration/placeholder-block';
import { generateCodeFromWorkspace } from '@/codegen/workspace/generate-code-from-workspace';
import {
  buildToolboxFromParsedConfigs,
  collectParsedBlockTypes,
  parseToolboxConfigs,
} from '@/toolbox/loading/toolbox-processing';
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
  private detachAttachedWorkspace: (() => void) | null = null;

  constructor() {
    registerPlaceholderBlock();
  }

  private snapshotBlocklyRegistrations(
    blockTypes: Iterable<string>,
  ): Map<string, { block?: unknown; generator?: unknown }> {
    const snapshot = new Map<string, { block?: unknown; generator?: unknown }>();

    for (const blockType of blockTypes) {
      snapshot.set(blockType, {
        block: Blockly.Blocks[blockType],
        generator: jsg.forBlock[blockType],
      });
    }

    return snapshot;
  }

  private restoreBlocklyRegistrations(
    snapshot: Map<string, { block?: unknown; generator?: unknown }>,
  ): void {
    for (const [blockType, entry] of snapshot) {
      if (entry.block === undefined) {
        delete Blockly.Blocks[blockType];
      } else {
        Blockly.Blocks[blockType] = entry.block as (typeof Blockly.Blocks)[string];
      }

      if (entry.generator === undefined) {
        delete jsg.forBlock[blockType];
      } else {
        jsg.forBlock[blockType] = entry.generator as (typeof jsg.forBlock)[string];
      }
    }
  }

  private rebuildBlockData(
    data: JaclyBlocksData,
    updateAttachedWorkspace: boolean,
  ): Blockly.utils.toolbox.ToolboxDefinition {
    const previousState = this.state;
    const oldTypes = new Set(previousState.registeredBlockTypes);
    const parsedConfigs = parseToolboxConfigs(data);
    const affectedTypes = collectParsedBlockTypes(parsedConfigs);
    const registrationSnapshot = this.snapshotBlocklyRegistrations(affectedTypes);
    const nextState = createEngineState();

    let newConfig: Blockly.utils.toolbox.ToolboxDefinition;
    try {
      newConfig = buildToolboxFromParsedConfigs(nextState, parsedConfigs);
    } catch (error) {
      this.restoreBlocklyRegistrations(registrationSnapshot);
      throw error;
    }

    for (const type of oldTypes) {
      if (!nextState.registeredBlockTypes.has(type)) {
        delete Blockly.Blocks[type];
        delete jsg.forBlock[type];
      }
    }

    resetEngineState(previousState);
    this.state = nextState;

    if (updateAttachedWorkspace && this.attachedWorkspace) {
      this.detachAttachedWorkspace?.();
      this.detachAttachedWorkspace = attachEngineWorkspace(this.state, this.attachedWorkspace);
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
    if (this.attachedWorkspace) {
      this.detachFromWorkspace(this.attachedWorkspace);
    }
    this.attachedWorkspace = workspace;
    this.detachAttachedWorkspace = attachEngineWorkspace(this.state, workspace);
  }

  detachFromWorkspace(workspace: Blockly.WorkspaceSvg): void {
    if (this.attachedWorkspace === workspace) {
      this.detachAttachedWorkspace?.();
      this.detachAttachedWorkspace = null;
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
