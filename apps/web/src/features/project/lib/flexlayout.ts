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
  model.borders?.forEach(border => {
    border.children?.forEach(tabNode => {
      callback(tabNode as FlexLayoutAttributes);
    });
  });

  function processNode(node: FlexLayout.IJsonRowNode) {
    node.children?.forEach(child => {
      if (child.type === 'tab') {
        const tabNode = child as FlexLayout.IJsonTabSetNode;
        callback(tabNode as FlexLayoutAttributes);
      } else if (child.type === 'tabset') {
        processNode(child as FlexLayout.IJsonRowNode);
      }
    });
  }

  if (model.layout) {
    processNode(model.layout);
  }
}

export function findAllTabIds(model: FlexLayout.IJsonModel): Set<string> {
  const tabIds = new Set<string>();
  processAllTabs(model, tab => {
    tabIds.add(tab.id);
  });
  return tabIds;
}

export function getUpdatedLayoutModel(
  json: FlexLayout.IJsonModel | null
): FlexLayout.IJsonModel {
  if (!json) {
    return flexLayoutDefaultJson;
  }

  const defaultTabIds = findAllTabIds(flexLayoutDefaultJson);
  const currentTabIds = findAllTabIds(json);

  // Find tabs to add (in default but not in current)
  const tabsToAdd = new Set<string>();
  defaultTabIds.forEach(id => {
    if (!currentTabIds.has(id)) {
      tabsToAdd.add(id);
    }
  });

  // Clone the current model (keep all existing tabs, even if removed from default)
  const updatedModel: FlexLayout.IJsonModel = structuredClone(json);

  // Ensure borders structure exists
  if (!updatedModel.borders && flexLayoutDefaultJson.borders) {
    updatedModel.borders = flexLayoutDefaultJson.borders.map(border => ({
      ...border,
      children: [],
    }));
  } else if (updatedModel.borders && flexLayoutDefaultJson.borders) {
    // Ensure all default borders exist
    flexLayoutDefaultJson.borders.forEach((defaultBorder, borderIndex) => {
      if (!updatedModel.borders![borderIndex]) {
        updatedModel.borders![borderIndex] = {
          ...defaultBorder,
          children: [],
        };
      }
    });
  }

  // Add missing tabs from default layout
  if (tabsToAdd.size > 0) {
    flexLayoutDefaultJson.borders?.forEach((defaultBorder, borderIndex) => {
      defaultBorder.children?.forEach(defaultTab => {
        const tabNode = defaultTab as FlexLayoutAttributes;
        if (tabsToAdd.has(tabNode.id) && updatedModel.borders) {
          if (!updatedModel.borders[borderIndex].children) {
            updatedModel.borders[borderIndex].children = [];
          }
          updatedModel.borders[borderIndex].children?.push(
            structuredClone(defaultTab)
          );
        }
      });
    });

    // Add missing tabs from main layout
    flexLayoutDefaultJson.layout.children?.forEach(child => {
      if (child.type === 'tabset') {
        const tabsetNode = child as FlexLayout.IJsonTabSetNode;
        const missingTabsForThisTabset: FlexLayout.IJsonTabNode[] = [];

        // Collect all missing tabs for this tabset
        tabsetNode.children?.forEach(defaultTab => {
          const tabNode = defaultTab as FlexLayoutAttributes;
          if (tabsToAdd.has(tabNode.id)) {
            missingTabsForThisTabset.push(structuredClone(defaultTab));
          }
        });

        if (missingTabsForThisTabset.length === 0) return;

        // Try to find corresponding tabset in updatedModel
        let tabsetFound = false;

        function findAndAddTabs(node: FlexLayout.IJsonRowNode): boolean {
          let found = false;
          node.children?.forEach(child => {
            if (child.type === 'tabset') {
              const currentTabset = child as FlexLayout.IJsonTabSetNode;
              if (currentTabset.id === tabsetNode.id) {
                if (!currentTabset.children) {
                  currentTabset.children = [];
                }
                currentTabset.children.push(...missingTabsForThisTabset);
                found = true;
              }
            } else if (child.type === 'row' || child.type === 'column') {
              if (findAndAddTabs(child as FlexLayout.IJsonRowNode)) {
                found = true;
              }
            }
          });
          return found;
        }

        if (updatedModel.layout) {
          tabsetFound = findAndAddTabs(updatedModel.layout);
        }

        // If tabset not found, add the entire tabset from default
        if (!tabsetFound && updatedModel.layout) {
          const newTabset = structuredClone(tabsetNode);
          // Only include the missing tabs
          newTabset.children = missingTabsForThisTabset;

          if (!updatedModel.layout.children) {
            updatedModel.layout.children = [];
          }
          updatedModel.layout.children.push(newTabset);
        }
      }
    });
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
      debugger;
      if (isInBorder) {
        // For border panels, just select them to make them visible
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));
      } else {
        model.doAction(FlexLayout.Actions.selectTab(node.getId()));
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(node.getId(), {
            size: 100,
          })
        );
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
    case 'focus':
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

      let tabset = model.getNodeById('main-tabset');
      if (!tabset) {
        model.doAction(
          FlexLayout.Actions.addNode(
            {
              type: 'tabset',
              id: 'main-tabset',
            },
            model.getRoot().getId(),
            FlexLayout.DockLocation.CENTER,
            -1
          )
        );
        tabset = model.getNodeById('main-tabset') as FlexLayout.TabSetNode;
      }

      const toNode: FlexLayout.IJsonTabNode = {
        type: 'tab',
        name: props?.filePath?.split('/').pop() || 'Unnamed',
        component: 'code',
        id: panelId,
        enableClose: true,
        config: { filePath: props?.filePath },
      };
      model.doAction(
        FlexLayout.Actions.addNode(
          toNode,
          tabset.getId(),
          FlexLayout.DockLocation.CENTER,
          -1
        )
      );

      break;
    }
    default:
      console.warn(`openPanel: Unsupported panel type '${type}'`);
  }
}
