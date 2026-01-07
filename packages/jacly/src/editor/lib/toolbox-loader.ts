import { JaclyBlocksFiles } from '@jaculus/project';
import * as Blockly from 'blockly/core';
import { ToolboxInfo } from '@/editor/types/toolbox';

export function loadToolboxConfiguration(
  _jaclyBlockFiles: JaclyBlocksFiles
): Blockly.utils.toolbox.ToolboxDefinition {
  let toolbox: ToolboxInfo = {
    kind: 'categoryToolbox',
    contents: [],
  };

  return toolbox;
}
