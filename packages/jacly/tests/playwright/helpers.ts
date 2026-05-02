import { expect, type Page } from '@playwright/test';
import type { Act } from './test';

type Point = [number, number];
type ConnectionPoint = Point | null;
type BlockGeometry = {
  center: Point;
  centerTop: Point;
  bounds: { top: number; bottom: number; left: number; right: number };
  connections: {
    previous: ConnectionPoint;
    next: ConnectionPoint;
    output: ConnectionPoint;
    inputs: Record<string, Point>;
  };
};

async function getTestApiResult<T>(page: Page, selector: () => T): Promise<T> {
  return await page.evaluate(selector);
}

async function getBlockGeometry(
  page: Page,
  query: { workspace?: 'main' | 'toolbox'; id?: string; type?: string },
): Promise<BlockGeometry> {
  return await page.evaluate((blockQuery) => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: {
          getBlockGeometry: (query: {
            workspace?: 'main' | 'toolbox';
            id?: string;
            type?: string;
          }) => BlockGeometry;
        };
      }
    ).__jaclyTest;
    return testApi.getBlockGeometry(
      blockQuery as { workspace?: 'main' | 'toolbox'; id?: string; type?: string },
    );
  }, query);
}

function offsetPoint(anchor: Point, from: Point): Point {
  return [anchor[0] - from[0], anchor[1] - from[1]];
}

function addPoints(a: Point, b: Point): Point {
  return [a[0] + b[0], a[1] + b[1]];
}

function getDragLiftPoint(geometry: BlockGeometry): Point {
  const width = geometry.bounds.right - geometry.bounds.left;
  const height = geometry.bounds.bottom - geometry.bounds.top;
  return [geometry.center[0] + width * 0.35, geometry.center[1] + height * 0.35];
}

async function dragViaMouse(
  page: Page,
  act: Act,
  start: Point,
  lift: Point,
  target: Point,
): Promise<void> {
  await act(page.mouse.move(start[0], start[1]));
  await act(page.mouse.down());
  await act(page.mouse.move(lift[0], lift[1], { steps: 12 }));
  await act(page.mouse.move(target[0], target[1], { steps: 28 }));
  await act(page.mouse.up());
}

export async function gotoTestApp(page: Page, fixture = 'basic') {
  await page.goto(`/?test=1&fixture=${fixture}`);
  await expect(page.getByTestId('jacly-test-app')).toBeVisible();
  await expect(page.getByTestId('jacly-editor')).toBeVisible();
  await page.waitForFunction(() => {
    return Boolean(
      (
        window as typeof window & { __jaclyTest?: { isReady: () => boolean } }
      ).__jaclyTest?.isReady(),
    );
  });
  await page.locator('.blocklySvg').hover();
}

export async function openToolboxCategory(page: Page, act: Act, name: string) {
  await act(page.getByRole('treeitem', { name, exact: true }).click());
}

export async function waitForToolboxBlock(page: Page, blockType: string) {
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const testApi = (
          window as typeof window & {
            __jaclyTest: { getToolboxBlockTypes: () => string[] };
          }
        ).__jaclyTest;
        return testApi.getToolboxBlockTypes();
      });
    })
    .toContain(blockType);
}

export async function dragToolboxBlockToWorkspace(page: Page, act: Act, blockType: string) {
  const source = await getBlockGeometry(page, { workspace: 'toolbox', type: blockType });
  const target = await page.evaluate(() => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: {
          getEmptyWorkspacePoint: () => [number, number];
        };
      }
    ).__jaclyTest;
    return testApi.getEmptyWorkspacePoint();
  });

  await dragViaMouse(page, act, source.center, getDragLiftPoint(source), target);
}

export async function dragToolboxBlockToConnection(
  page: Page,
  act: Act,
  blockType: string,
  targetBlockId: string,
  targetConnection: 'previous' | 'next',
  sourceConnection: 'previous' | 'next' | 'output',
) {
  const source = await getBlockGeometry(page, { workspace: 'toolbox', type: blockType });
  const target = await getBlockGeometry(page, { workspace: 'main', id: targetBlockId });
  const sourceAnchor = source.connections[sourceConnection];
  const targetAnchor = target.connections[targetConnection];
  if (!sourceAnchor) {
    throw new Error(`Toolbox block "${blockType}" has no ${sourceConnection} connection`);
  }
  if (!targetAnchor) {
    throw new Error(`Workspace block "${targetBlockId}" has no ${targetConnection} connection`);
  }

  const delta = offsetPoint(source.center, sourceAnchor);
  await dragViaMouse(
    page,
    act,
    source.center,
    getDragLiftPoint(source),
    addPoints(targetAnchor, delta),
  );
}

export async function dragWorkspaceBlockToConnection(
  page: Page,
  act: Act,
  blockId: string,
  targetBlockId: string,
  targetConnection: 'previous' | 'next',
  sourceConnection: 'previous' | 'next' | 'output' = 'previous',
) {
  const source = await getBlockGeometry(page, { workspace: 'main', id: blockId });
  const target = await getBlockGeometry(page, { workspace: 'main', id: targetBlockId });
  const sourceAnchor = source.connections[sourceConnection];
  const targetAnchor = target.connections[targetConnection];
  if (!sourceAnchor) {
    throw new Error(`Workspace block "${blockId}" has no ${sourceConnection} connection`);
  }
  if (!targetAnchor) {
    throw new Error(`Workspace block "${targetBlockId}" has no ${targetConnection} connection`);
  }

  const delta = offsetPoint(source.center, sourceAnchor);
  await dragViaMouse(
    page,
    act,
    source.center,
    getDragLiftPoint(source),
    addPoints(targetAnchor, delta),
  );
}

export async function dragToolboxBlockToInput(
  page: Page,
  act: Act,
  blockType: string,
  targetBlockId: string,
  inputName: string,
) {
  const source = await getBlockGeometry(page, { workspace: 'toolbox', type: blockType });
  const target = await getBlockGeometry(page, { workspace: 'main', id: targetBlockId });
  const sourceAnchor = source.connections.output;
  const targetAnchor = target.connections.inputs[inputName];
  if (!sourceAnchor) {
    throw new Error(`Toolbox block "${blockType}" has no output connection`);
  }
  if (!targetAnchor) {
    throw new Error(
      `Workspace block "${targetBlockId}" has no input connection named "${inputName}"`,
    );
  }

  const delta = offsetPoint(source.center, sourceAnchor);
  await dragViaMouse(
    page,
    act,
    source.center,
    getDragLiftPoint(source),
    addPoints(targetAnchor, delta),
  );
}

export async function dragWorkspaceBlockToInput(
  page: Page,
  act: Act,
  blockId: string,
  targetBlockId: string,
  inputName: string,
) {
  const source = await getBlockGeometry(page, { workspace: 'main', id: blockId });
  const target = await getBlockGeometry(page, { workspace: 'main', id: targetBlockId });
  const sourceAnchor = source.connections.output;
  const targetAnchor = target.connections.inputs[inputName];
  if (!sourceAnchor) {
    throw new Error(`Workspace block "${blockId}" has no output connection`);
  }
  if (!targetAnchor) {
    throw new Error(
      `Workspace block "${targetBlockId}" has no input connection named "${inputName}"`,
    );
  }

  const delta = offsetPoint(source.center, sourceAnchor);
  await dragViaMouse(
    page,
    act,
    source.center,
    getDragLiftPoint(source),
    addPoints(targetAnchor, delta),
  );
}

export async function expectBlockCount(page: Page, count: number) {
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const testApi = (
          window as typeof window & {
            __jaclyTest: { getBlockCount: () => number };
          }
        ).__jaclyTest;
        return testApi.getBlockCount();
      });
    })
    .toBe(count);
}

export async function getBlockIdsByType(page: Page, blockType: string): Promise<string[]> {
  return await page.evaluate((type) => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: { getBlockIdsByType: (blockType: string) => string[] };
      }
    ).__jaclyTest;
    return testApi.getBlockIdsByType(type);
  }, blockType);
}

export async function clickBlockField(page: Page, act: Act, blockId: string, fieldName: string) {
  const [x, y] = await page.evaluate(
    ({ id, field }) => {
      const testApi = (
        window as typeof window & {
          __jaclyTest: { getFieldCenter: (blockId: string, fieldName: string) => [number, number] };
        }
      ).__jaclyTest;
      return testApi.getFieldCenter(id, field);
    },
    { id: blockId, field: fieldName },
  );
  await act(page.mouse.click(x, y));
}

export async function getTopBlockTypes(page: Page) {
  return await getTestApiResult(page, () => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: { getTopBlockTypes: () => string[] };
      }
    ).__jaclyTest;
    return testApi.getTopBlockTypes();
  });
}

export async function getAllBlockIds(page: Page) {
  return await getTestApiResult(page, () => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: { getAllBlockIds: () => string[] };
      }
    ).__jaclyTest;
    return testApi.getAllBlockIds();
  });
}

export async function getLatestJsonChange(page: Page) {
  return await getTestApiResult(page, () => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: { getLatestJsonChange: () => object | null };
      }
    ).__jaclyTest;
    return testApi.getLatestJsonChange();
  });
}

export async function getWorkspaceJson(page: Page) {
  return await getTestApiResult(page, () => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: { getWorkspaceJson: () => object };
      }
    ).__jaclyTest;
    return testApi.getWorkspaceJson();
  });
}

export async function getCurrentGeneratedCode(page: Page) {
  return await getTestApiResult(page, () => {
    const testApi = (
      window as typeof window & {
        __jaclyTest: { getCurrentGeneratedCode: () => string };
      }
    ).__jaclyTest;
    return testApi.getCurrentGeneratedCode();
  });
}

export async function waitForGeneratedCodeSubstring(page: Page, substring: string) {
  await expect
    .poll(async () => {
      return await getCurrentGeneratedCode(page);
    })
    .toContain(substring);
}
