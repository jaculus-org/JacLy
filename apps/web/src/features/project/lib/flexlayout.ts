import * as FlexLayout from 'flexlayout-react';
import type {
  FlexLayoutAttributes,
  NewPanelProps,
  PanelAction,
  PanelType,
} from '@/features/project/types/flexlayout-type';
import { flexLayoutDefaultJson } from '@/features/project/lib/flexlayout-defaults';

type JsonLayoutNode =
  | FlexLayout.IJsonTabNode
  | FlexLayout.IJsonTabSetNode
  | FlexLayout.IJsonRowNode;

export function processAllTabs(
  model: FlexLayout.IJsonModel,
  callback: (tab: FlexLayoutAttributes) => void
) {
  model.borders?.forEach(border => {
    border.children?.forEach(tabNode => {
      if (tabNode.type === 'tab') {
        callback(tabNode as FlexLayoutAttributes);
      }
    });
  });

  function processNode(
    node:
      | FlexLayout.IJsonTabSetNode
      | FlexLayout.IJsonRowNode
      | FlexLayout.IJsonTabNode
  ) {
    if (!node) return;

    if (node.type === 'tab') {
      callback(node as FlexLayoutAttributes);
    } else if (node.type === 'tabset') {
      const tabset = node as FlexLayout.IJsonTabSetNode;
      tabset.children?.forEach(child => processNode(child));
    } else if (node.type === 'row') {
      const row = node as FlexLayout.IJsonRowNode;
      row.children?.forEach(child => processNode(child));
    }
  }

  if (model.layout) {
    processNode(model.layout);
  }
}

export function findAllTabIds(model: FlexLayout.IJsonModel): Set<string> {
  const tabIds = new Set<string>();
  processAllTabs(model, tab => {
    if (tab.id) {
      tabIds.add(tab.id);
    }
  });
  return tabIds;
}

function findDefaultTab(tabId: string): {
  tab: FlexLayoutAttributes;
  location: 'border' | 'layout';
  borderIndex?: number;
} | null {
  // check borders
  for (let i = 0; i < (flexLayoutDefaultJson.borders?.length ?? 0); i++) {
    const border = flexLayoutDefaultJson.borders![i];
    const tab = border.children?.find(
      child => (child as FlexLayoutAttributes).id === tabId
    );
    if (tab) {
      return {
        tab: tab as FlexLayoutAttributes,
        location: 'border',
        borderIndex: i,
      };
    }
  }

  function findInNode(
    node: JsonLayoutNode | undefined
  ): FlexLayoutAttributes | null {
    if (!node) return null;

    if (node.type === 'tab' && (node as FlexLayoutAttributes).id === tabId) {
      return node as FlexLayoutAttributes;
    } else if (node.type === 'tabset') {
      const tabset = node as FlexLayout.IJsonTabSetNode;
      for (const child of tabset.children ?? []) {
        const found = findInNode(child);
        if (found) return found;
      }
    } else if (node.type === 'row') {
      const row = node as FlexLayout.IJsonRowNode;
      for (const child of row.children ?? []) {
        const found = findInNode(child);
        if (found) return found;
      }
    }
    return null;
  }

  const tab = findInNode(flexLayoutDefaultJson.layout);
  if (tab) {
    return { tab, location: 'layout' };
  }

  return null;
}

export function getUpdatedLayoutModel(
  json: FlexLayout.IJsonModel | undefined
): FlexLayout.IJsonModel {
  if (!json) {
    return structuredClone(flexLayoutDefaultJson);
  }

  const defaultTabIds = findAllTabIds(flexLayoutDefaultJson);
  const currentTabIds = findAllTabIds(json);

  const tabsToAdd: string[] = [];
  defaultTabIds.forEach(id => {
    if (!currentTabIds.has(id)) {
      tabsToAdd.push(id);
    }
  });

  // if no missing tabs, return original
  if (tabsToAdd.length === 0) {
    return json;
  }

  const updatedModel: FlexLayout.IJsonModel = structuredClone(json);

  if (!updatedModel.borders) {
    updatedModel.borders = [];
  }

  // validate borders and add missing ones
  while (
    updatedModel.borders.length < (flexLayoutDefaultJson.borders?.length ?? 0)
  ) {
    const defaultBorder =
      flexLayoutDefaultJson.borders![updatedModel.borders.length];
    updatedModel.borders.push({
      type: 'border',
      location: defaultBorder.location,
      size: defaultBorder.size,
      selected: -1,
      children: [],
    });
  }

  // add missing tabs
  for (const tabId of tabsToAdd) {
    const defaultTabInfo = findDefaultTab(tabId);
    if (!defaultTabInfo) continue;

    const newTab = structuredClone(defaultTabInfo.tab);

    if (
      defaultTabInfo.location === 'border' &&
      defaultTabInfo.borderIndex !== undefined
    ) {
      // add to the appropriate border
      const border = updatedModel.borders[defaultTabInfo.borderIndex];
      if (!border.children) {
        border.children = [];
      }
      border.children.push(newTab);
    } else {
      // add to the main layout
      if (!updatedModel.layout) {
        updatedModel.layout = structuredClone(flexLayoutDefaultJson.layout);
      } else {
        let targetTabset: FlexLayout.IJsonTabSetNode | null = null;

        function findTabset(
          node: JsonLayoutNode | undefined
        ): FlexLayout.IJsonTabSetNode | null {
          if (!node) return null;
          if (node.type === 'tabset') {
            return node as FlexLayout.IJsonTabSetNode;
          }
          if ('children' in node) {
            for (const child of node.children ?? []) {
              const found = findTabset(child);
              if (found) return found;
            }
          }
          return null;
        }

        targetTabset = findTabset(updatedModel.layout);

        if (targetTabset) {
          if (!targetTabset.children) {
            targetTabset.children = [];
          }
          targetTabset.children.push(newTab);
        } else {
          const newTabset: FlexLayout.IJsonTabSetNode = {
            type: 'tabset',
            id: 'main-tabset',
            children: [newTab],
          };
          if (!updatedModel.layout.children) {
            updatedModel.layout.children = [];
          }
          updatedModel.layout.children.push(newTabset);
        }
      }
    }
  }

  return updatedModel;
}

function findTargetTabset(
  model: FlexLayout.Model
): FlexLayout.Node | undefined {
  const mainTabset = model.getNodeById('main-tabset');
  if (mainTabset) return mainTabset;

  let found: FlexLayout.Node | undefined;

  function searchNode(node: FlexLayout.Node): void {
    if (found) return;
    if (node.getType() === 'tabset') {
      found = node;
    } else {
      node.getChildren().forEach(searchNode);
    }
  }

  model.getRoot().getChildren().forEach(searchNode);
  return found;
}

// add a new tab to the center of the layout
function addTabToModel(
  model: FlexLayout.Model,
  tabNode: FlexLayout.IJsonTabNode
): void {
  const tabset = findTargetTabset(model);
  const targetId = tabset ? tabset.getId() : model.getRoot().getId();
  model.doAction(
    FlexLayout.Actions.addNode(
      tabNode,
      targetId,
      FlexLayout.DockLocation.CENTER,
      -1
    )
  );
}

export function controlPanel(
  model: FlexLayout.Model,
  type: PanelType,
  action: PanelAction
) {
  const node = model.getNodeById(type);
  if (!node) {
    console.warn(`Panel '${type}' not found in layout`);
    return;
  }

  const parent = node.getParent();
  const isInBorder = parent instanceof FlexLayout.BorderNode;

  switch (action) {
    case 'close':
      model.doAction(FlexLayout.Actions.deleteTab(node.getId()));
      break;
    case 'expand':
      if (isInBorder) {
        const border = parent as FlexLayout.BorderNode;
        const selectedNode = border.getSelectedNode();
        if (selectedNode?.getId() !== node.getId()) {
          model.doAction(FlexLayout.Actions.selectTab(node.getId()));
        }
      } else {
        const tabNode = node as FlexLayout.TabNode;
        const currentSize = tabNode.getRect()?.height ?? 0;
        if (currentSize === 0) {
          model.doAction(
            FlexLayout.Actions.updateNodeAttributes(node.getId(), { size: 100 })
          );
        }
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));
      }
      break;
    case 'collapse':
      if (isInBorder) {
        const border = parent as FlexLayout.BorderNode;
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(border.getId(), {
            selected: -1,
          })
        );
      } else {
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(node.getId(), { size: 0 })
        );
      }
      break;
    case 'toggle':
      if (isInBorder) {
        const border = parent as FlexLayout.BorderNode;
        const isVisible = border.getSelectedNode()?.getId() === node.getId();
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(border.getId(), {
            selected: isVisible ? -1 : border.getChildren().indexOf(node),
          })
        );
      } else {
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));
      }
      break;
    default: {
      const _exhaustive: never = action;
      console.warn(`controlPanel: Unsupported action '${_exhaustive}'`);
    }
  }
}

export function openPanel(
  model: FlexLayout.Model,
  type: 'code',
  props: NewPanelProps['code']
): void;
export function openPanel(
  model: FlexLayout.Model,
  type: 'error',
  props: NewPanelProps['error']
): void;

export function openPanel(
  model: FlexLayout.Model,
  type: 'code' | 'error',
  props: NewPanelProps['code'] | NewPanelProps['error']
): void {
  switch (type) {
    case 'code': {
      const { filePath } = props as NewPanelProps['code'];
      const panelId = `source-code-${filePath}`;
      const existing = model.getNodeById(panelId);
      if (existing) {
        model.doAction(FlexLayout.Actions.selectTab(panelId));
        return;
      }
      addTabToModel(model, {
        type: 'tab',
        name: filePath.split('/').pop() || 'Unnamed',
        component: 'code',
        id: panelId,
        enableClose: true,
        config: { filePath } satisfies NewPanelProps['code'],
      });
      break;
    }
    case 'error': {
      const errorProps = props as NewPanelProps['error'];
      const panelId = 'error-panel';
      const existing = model.getNodeById(panelId);
      if (existing) {
        model.doAction(FlexLayout.Actions.selectTab(panelId));
        return;
      }
      addTabToModel(model, {
        type: 'tab',
        name: 'Error',
        component: 'error',
        id: panelId,
        enableClose: false,
        config: errorProps satisfies NewPanelProps['error'],
      });
      break;
    }
    default: {
      const _exhaustive: never = type;
      console.warn(`openPanel: Unsupported panel type '${_exhaustive}'`);
    }
  }
}
