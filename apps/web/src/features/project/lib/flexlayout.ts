import * as FlexLayout from 'flexlayout-react';
import type {
  FlexLayoutAttributes,
  PanelAction,
  PanelType,
} from '@/features/project/types/flexlayout-type';
import { flexLayoutDefaultJson } from '@/features/project/lib/flexlayout-defaults';

export function processAllTabs(
  model: FlexLayout.IJsonModel,
  callback: (tab: FlexLayoutAttributes) => void
) {
  // Process tabs in borders
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

// Find a tab by ID in the default model and return it with its location info
function findDefaultTab(tabId: string): {
  tab: FlexLayoutAttributes;
  location: 'border' | 'layout';
  borderIndex?: number;
} | null {
  // Check borders
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

  // Check main layout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function findInNode(node: any): FlexLayoutAttributes | null {
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

  // Find tabs to add (in default but not in current)
  const tabsToAdd: string[] = [];
  defaultTabIds.forEach(id => {
    if (!currentTabIds.has(id)) {
      tabsToAdd.push(id);
    }
  });

  // If no tabs to add, return the current model as-is
  if (tabsToAdd.length === 0) {
    return json;
  }

  // Clone the current model
  const updatedModel: FlexLayout.IJsonModel = structuredClone(json);

  // Ensure borders array exists and matches default borders length
  if (!updatedModel.borders) {
    updatedModel.borders = [];
  }

  // Ensure we have the same number of borders as default
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

  // Add missing tabs
  for (const tabId of tabsToAdd) {
    const defaultTabInfo = findDefaultTab(tabId);
    if (!defaultTabInfo) continue;

    const newTab = structuredClone(defaultTabInfo.tab);

    if (
      defaultTabInfo.location === 'border' &&
      defaultTabInfo.borderIndex !== undefined
    ) {
      // Add to the appropriate border
      const border = updatedModel.borders[defaultTabInfo.borderIndex];
      if (!border.children) {
        border.children = [];
      }
      border.children.push(newTab);
    } else {
      // Add to main layout - find or create main-tabset
      if (!updatedModel.layout) {
        updatedModel.layout = structuredClone(flexLayoutDefaultJson.layout);
      } else {
        // Find the main-tabset or first available tabset
        let targetTabset: FlexLayout.IJsonTabSetNode | null = null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function findTabset(node: any): FlexLayout.IJsonTabSetNode | null {
          if (!node) return null;
          if (node.type === 'tabset') {
            return node as FlexLayout.IJsonTabSetNode;
          } else if (node.type === 'row') {
            const row = node as FlexLayout.IJsonRowNode;
            for (const child of row.children ?? []) {
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
          // No tabset found, create one
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
        // For border panels, only select if not already visible
        const border = parent as FlexLayout.BorderNode;
        const selectedNode = border.getSelectedNode();
        if (selectedNode?.getId() !== node.getId()) {
          model.doAction(FlexLayout.Actions.selectTab(node.getId()));
        }
      } else {
        // Only expand if currently collapsed (size is 0)
        const tabNode = node as FlexLayout.TabNode;
        const currentSize = tabNode.getRect()?.height ?? 0;
        if (currentSize === 0) {
          model.doAction(
            FlexLayout.Actions.updateNodeAttributes(node.getId(), {
              size: 100,
            })
          );
        }
        // Always focus the tab
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));
      }
      break;
    case 'collapse':
      if (isInBorder) {
        // For border panels, unselect by selecting -1 to hide the border
        const border = parent as FlexLayout.BorderNode;
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(border.getId(), {
            selected: -1,
          })
        );
      } else {
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(node.getId(), {
            size: 0,
          })
        );
      }
      break;
    case 'toggle':
      model.doAction(FlexLayout.Actions.selectTab(node.getId()));
      break;
  }
}

export function openPanel(
  model: FlexLayout.Model,
  type: PanelType,
  props?: { filePath?: string }
) {
  if (!model) return;

  switch (type) {
    case 'code': {
      const panelId = `source-code-${props?.filePath}`;
      const node = model.getNodeById(panelId);
      if (node) {
        // Panel already exists, just focus it
        model.doAction(FlexLayout.Actions.selectTab(panelId));
        return;
      }

      const toNode: FlexLayout.IJsonTabNode = {
        type: 'tab',
        name: props?.filePath?.split('/').pop() || 'Unnamed',
        component: 'code',
        id: panelId,
        enableClose: true,
        config: { filePath: props?.filePath },
      };

      // Try to find an existing tabset to add to
      let tabset = model.getNodeById('main-tabset');

      // If main-tabset doesn't exist, find any tabset in the layout
      if (!tabset) {
        const root = model.getRoot();
        root.getChildren().forEach(child => {
          if (!tabset && child.getType() === 'tabset') {
            tabset = child;
          } else if (child.getType() === 'row') {
            // Search in row children
            child.getChildren().forEach(rowChild => {
              if (!tabset && rowChild.getType() === 'tabset') {
                tabset = rowChild;
              }
            });
          }
        });
      }

      if (tabset) {
        // Add to existing tabset
        model.doAction(
          FlexLayout.Actions.addNode(
            toNode,
            tabset.getId(),
            FlexLayout.DockLocation.CENTER,
            -1
          )
        );
      } else {
        // No tabset exists - add directly to root, which will create a new tabset
        model.doAction(
          FlexLayout.Actions.addNode(
            toNode,
            model.getRoot().getId(),
            FlexLayout.DockLocation.CENTER,
            -1
          )
        );
      }

      break;
    }
    default:
      console.warn(`openPanel: Unsupported panel type '${type}'`);
  }
}
