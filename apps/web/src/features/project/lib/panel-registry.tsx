import * as FlexLayout from 'flexlayout-react';
import { m } from '@/paraglide/messages';
import {
  BlocklyEditorPanel,
  ChartPanel,
  CodePanel,
  ConsolePanel,
  ErrorPanel,
  GeneratedCode,
  InstallerPanel,
  JaculusPanel,
  LogsPanel,
  WokwiPanel,
} from '@/features/project/panels';
import { JacPackagesPanel, JacPackagesProvider } from '@/features/jac-packages';
import {
  JacFileExplorerPanel,
  JacFileExplorerProvider,
} from '@/features/jac-file-explorer';
import type { PanelType } from '@/features/project/types/flexlayout-type';

export interface PanelDefinition {
  canPopout?: boolean;
  enableWindowReMount?: boolean;
  render: (
    config: Record<string, unknown> | undefined,
    node: FlexLayout.TabNode
  ) => React.ReactNode;
  getTitle: (node: FlexLayout.TabNode) => string | undefined;
}

export const PANEL_DEFINITIONS: Record<PanelType, PanelDefinition> = {
  blockly: {
    canPopout: false,
    render: () => <BlocklyEditorPanel />,
    getTitle: () => m.project_panel_blockly(),
  },
  chart: {
    canPopout: true,
    enableWindowReMount: true,
    render: () => <ChartPanel />,
    getTitle: () => m.project_panel_chart(),
  },
  console: {
    canPopout: true,
    render: () => <ConsolePanel />,
    getTitle: () => m.project_panel_console(),
  },
  'file-explorer': {
    canPopout: false,
    render: () => (
      <JacFileExplorerProvider>
        <JacFileExplorerPanel />
      </JacFileExplorerProvider>
    ),
    getTitle: () => m.project_panel_fs(),
  },
  code: {
    canPopout: false,
    render: config => <CodePanel filePath={config?.filePath as string} />,
    getTitle: node => node.getName() || m.project_panel_fs(),
  },
  'generated-code': {
    canPopout: true,
    render: () => <GeneratedCode />,
    getTitle: () => m.project_panel_code(),
  },
  wokwi: {
    canPopout: false,
    render: () => <WokwiPanel />,
    getTitle: () => m.project_panel_wokwi(),
  },
  packages: {
    canPopout: false,
    render: () => (
      <JacPackagesProvider>
        <JacPackagesPanel />
      </JacPackagesProvider>
    ),
    getTitle: () => m.project_panel_packages(),
  },
  logs: {
    canPopout: false,
    render: () => <LogsPanel />,
    getTitle: () => m.project_panel_logs(),
  },
  jaculus: {
    canPopout: false,
    render: () => <JaculusPanel />,
    getTitle: () => m.project_panel_jaculus(),
  },
  installer: {
    canPopout: false,
    render: () => <InstallerPanel />,
    getTitle: () => m.project_panel_installer(),
  },
  error: {
    canPopout: false,
    render: () => <ErrorPanel />,
    getTitle: () => undefined,
  },
};

export function getPanelDefinition(component: string | undefined) {
  if (!component) {
    return undefined;
  }

  return PANEL_DEFINITIONS[component as PanelType];
}

export function getPanelTitle(node: FlexLayout.TabNode): string | undefined {
  return getPanelDefinition(node.getComponent())?.getTitle(node);
}

export function applyPanelDefinitionToTab<T extends FlexLayout.IJsonTabNode>(
  tab: T
): T {
  const definition = getPanelDefinition(tab.component);

  return {
    ...tab,
    enablePopout: definition?.canPopout ?? false,
    enablePopoutIcon: definition?.canPopout ?? false,
    enableWindowReMount: definition?.enableWindowReMount ?? false,
  };
}
