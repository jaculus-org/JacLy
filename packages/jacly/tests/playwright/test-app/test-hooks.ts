import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

type Point = [number, number];
type Bounds = { top: number; bottom: number; left: number; right: number };
type BlockGeometry = {
  center: Point;
  centerTop: Point;
  bounds: Bounds;
  connections: {
    previous: Point | null;
    next: Point | null;
    output: Point | null;
    inputs: Record<string, Point>;
  };
};
type BlockQuery =
  | { workspace?: 'main' | 'toolbox'; id: string; type?: never }
  | { workspace?: 'main' | 'toolbox'; type: string; id?: never };
type ConnectionKind = 'previous' | 'next';
type TestStateAccess = {
  getLatestJson: () => object | null;
  getLatestGeneratedCode: () => string;
  getCurrentGeneratedCode: () => string;
};

type JaclyTestApi = {
  isReady: () => boolean;
  getAllBlockIds: () => string[];
  getTopBlockTypes: () => string[];
  getToolboxBlockTypes: () => string[];
  getBlockCount: () => number;
  getWorkspaceJson: () => object;
  getLatestJsonChange: () => object | null;
  getLatestGeneratedCode: () => string;
  getCurrentGeneratedCode: () => string;
  getBlockGeometry: (query: BlockQuery) => BlockGeometry;
  getEmptyWorkspacePoint: () => Point;
  getWorkspacePoint: (x: number, y: number) => Point;
  getConnectionPoint: (blockId: string, connection: ConnectionKind) => Point;
  getInputConnectionPoint: (blockId: string, inputName: string) => Point;
  hasGeneratorForBlockType: (blockType: string) => boolean;
};

declare global {
  interface Window {
    __jaclyTest?: JaclyTestApi;
    Blockly?: typeof Blockly;
  }
}

function getMainWorkspace(): Blockly.WorkspaceSvg {
  const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg | null;
  if (!workspace) {
    throw new Error('Blockly main workspace is not ready');
  }
  return workspace;
}

function getWorkspace(kind: 'main' | 'toolbox' = 'main'): Blockly.WorkspaceSvg {
  if (kind === 'main') {
    return getMainWorkspace();
  }

  const flyout = getMainWorkspace().getFlyout();
  if (!flyout) {
    throw new Error('Blockly flyout workspace is not ready');
  }

  return flyout.getWorkspace();
}

function getBlockGeometry(query: BlockQuery): BlockGeometry {
  const workspace = getWorkspace(query.workspace);
  const block =
    'id' in query
      ? workspace.getBlockById(query.id)
      : workspace.getTopBlocks(false).find((candidate) => candidate.type === query.type);

  if (!block) {
    throw new Error(
      'id' in query
        ? `Block "${query.id}" not found in ${query.workspace ?? 'main'} workspace`
        : `Block type "${query.type}" not found in ${query.workspace ?? 'main'} workspace`,
    );
  }

  const blockBounds = block.getBoundingRectangleWithoutChildren();
  const topLeft = Blockly.utils.svgMath.wsToScreenCoordinates(
    workspace,
    new Blockly.utils.Coordinate(blockBounds.left, blockBounds.top),
  );
  const bottomRight = Blockly.utils.svgMath.wsToScreenCoordinates(
    workspace,
    new Blockly.utils.Coordinate(blockBounds.right, blockBounds.bottom),
  );
  const rect = {
    top: topLeft.y,
    bottom: bottomRight.y,
    left: topLeft.x,
    right: bottomRight.x,
  };
  const toPoint = (connection: Blockly.Connection | null | undefined): Point | null => {
    if (!connection) return null;
    const point = Blockly.utils.svgMath.wsToScreenCoordinates(
      workspace,
      new Blockly.utils.Coordinate(connection.x, connection.y),
    );
    return [point.x, point.y];
  };
  const inputConnections: Record<string, Point> = {};
  for (const input of block.inputList) {
    const point = toPoint(input.connection);
    if (point) inputConnections[input.name] = point;
  }

  return {
    center: [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2],
    centerTop: [(rect.left + rect.right) / 2, rect.top + 1],
    bounds: {
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    },
    connections: {
      previous: toPoint(block.previousConnection),
      next: toPoint(block.nextConnection),
      output: toPoint(block.outputConnection),
      inputs: inputConnections,
    },
  };
}

function getEmptyWorkspacePoint(): Point {
  const workspace = getMainWorkspace();
  const blocksBounds = workspace.getBlocksBoundingBox();
  const gridSpacing = workspace.getGrid()?.getSpacing() ?? 40;
  if (
    !Number.isFinite(blocksBounds.left) ||
    !Number.isFinite(blocksBounds.right) ||
    !Number.isFinite(blocksBounds.top) ||
    !Number.isFinite(blocksBounds.bottom)
  ) {
    const metrics = workspace.getMetrics();
    if (!metrics) {
      return getWorkspacePoint(gridSpacing * 2, gridSpacing * 2);
    }
    return getWorkspacePoint(metrics.viewLeft + gridSpacing * 2, metrics.viewTop + gridSpacing * 2);
  }
  return getWorkspacePoint(blocksBounds.right + gridSpacing, blocksBounds.bottom + gridSpacing);
}

function getWorkspacePoint(x: number, y: number): Point {
  const workspace = getMainWorkspace();
  const point = Blockly.utils.svgMath.wsToScreenCoordinates(
    workspace,
    new Blockly.utils.Coordinate(x, y),
  );
  return [point.x, point.y];
}

function getConnectionPoint(blockId: string, connection: ConnectionKind): Point {
  const workspace = getMainWorkspace();
  const block = workspace.getBlockById(blockId);
  if (!block) {
    throw new Error(`Block "${blockId}" not found in main workspace`);
  }

  const targetConnection =
    connection === 'previous' ? block.previousConnection : block.nextConnection;
  if (!targetConnection) {
    throw new Error(`Block "${blockId}" has no ${connection} connection`);
  }

  const point = Blockly.utils.svgMath.wsToScreenCoordinates(
    workspace,
    new Blockly.utils.Coordinate(targetConnection.x, targetConnection.y),
  );
  return [point.x, point.y];
}

function getInputConnectionPoint(blockId: string, inputName: string): Point {
  const workspace = getMainWorkspace();
  const block = workspace.getBlockById(blockId);
  if (!block) {
    throw new Error(`Block "${blockId}" not found in main workspace`);
  }

  const input = block.getInput(inputName);
  const connection = input?.connection;
  if (!connection) {
    throw new Error(`Block "${blockId}" has no input connection named "${inputName}"`);
  }

  const point = Blockly.utils.svgMath.wsToScreenCoordinates(
    workspace,
    new Blockly.utils.Coordinate(connection.x, connection.y),
  );
  return [point.x, point.y];
}

export function installJaclyTestHooks(testStateAccess: TestStateAccess): () => void {
  window.Blockly = Blockly;
  window.__jaclyTest = {
    isReady: () => {
      const workspace = Blockly.getMainWorkspace() as Blockly.WorkspaceSvg | null;
      return Boolean(workspace && document.querySelector('.blocklySvg'));
    },
    getAllBlockIds: () =>
      getMainWorkspace()
        .getAllBlocks(false)
        .map((block) => block.id)
        .sort(),
    getTopBlockTypes: () =>
      getMainWorkspace()
        .getTopBlocks(false)
        .map((block) => block.type)
        .sort(),
    getToolboxBlockTypes: () =>
      getWorkspace('toolbox')
        .getTopBlocks(false)
        .map((block) => block.type)
        .sort(),
    getBlockCount: () => getMainWorkspace().getAllBlocks(false).length,
    getWorkspaceJson: () => Blockly.serialization.workspaces.save(getMainWorkspace()),
    getLatestJsonChange: () => testStateAccess.getLatestJson(),
    getLatestGeneratedCode: () => testStateAccess.getLatestGeneratedCode(),
    getCurrentGeneratedCode: () => testStateAccess.getCurrentGeneratedCode(),
    getBlockGeometry,
    getEmptyWorkspacePoint,
    getWorkspacePoint,
    getConnectionPoint,
    getInputConnectionPoint,
    hasGeneratorForBlockType: (blockType: string) =>
      typeof javascriptGenerator.forBlock[blockType] === 'function',
  };

  return () => {
    delete window.__jaclyTest;
    delete window.Blockly;
  };
}
