import * as Blockly from 'blockly/core';

export interface TypedVarConfig {
  varType: string;
  blockGet: string;
  blockSet: string;
  createButtonLabel: string;
  createCallbackKey: string;
}

export function buildTypedVariableFlyout(
  workspace: Blockly.WorkspaceSvg,
  config: TypedVarConfig
): Blockly.utils.toolbox.FlyoutItemInfo[] {
  const vars = workspace.getVariableMap().getVariablesOfType(config.varType);

  const createButton: Blockly.utils.toolbox.ButtonInfo = {
    kind: 'button',
    text: config.createButtonLabel,
    callbackkey: config.createCallbackKey,
  };

  if (vars.length === 0) {
    return [createButton];
  }

  const reversed = [...vars].reverse();
  const newest = reversed[0];

  // Single SET block with the newest variable pre-selected
  const setBlock: Blockly.utils.toolbox.BlockInfo = {
    kind: 'block',
    type: config.blockSet,
    fields: {
      VAR: {
        name: newest.getName(),
        id: newest.getId(),
        type: newest.getType(),
      },
    },
  };

  // One GET block per variable
  const getBlocks: Blockly.utils.toolbox.FlyoutItemInfo[] = reversed.map(
    variable =>
      ({
        kind: 'block',
        type: config.blockGet,
        fields: {
          VAR: {
            name: variable.getName(),
            id: variable.getId(),
            type: variable.getType(),
          },
        },
      }) as Blockly.utils.toolbox.BlockInfo
  );

  return [createButton, setBlock, ...getBlocks];
}

export function registerTypedVariableCategory(
  workspace: Blockly.WorkspaceSvg,
  config: TypedVarConfig,
  categoryName: string
): void {
  workspace.registerToolboxCategoryCallback(categoryName, ws =>
    buildTypedVariableFlyout(ws, config)
  );

  workspace.registerButtonCallback(config.createCallbackKey, button => {
    Blockly.Variables.createVariableButtonHandler(
      button.getTargetWorkspace(),
      undefined,
      config.varType
    );
  });
}
