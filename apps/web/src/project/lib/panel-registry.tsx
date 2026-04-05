import type { ReactNode } from 'react';
import * as FlexLayout from 'flexlayout-react';
import { m } from '@/core/paraglide/messages';
import { ConsolePanel, ChartPanel } from '@/console';
import { DevicePanel } from '@/device';
import { JaclyEditorPanel, CodePanel, GeneratedCode } from '@/editor';
import {
  InstallerPanel,
  JacPackagesPanel,
  JacPackagesProvider,
} from '@/packages';
import { WokwiPanel } from '@/simulator';
import { JacFileExplorerPanel } from '../components/file-explorer/file-explorer-panel';
import { JacFileExplorerProvider } from '../components/file-explorer/file-explorer-provider';
import { ErrorPanel } from '../components/panels/error-panel';
import { LogsPanel } from '../components/panels/logs-panel';
import type { PanelType } from '../types/flexlayout-type';

export interface PanelDefinition {
  canPopout?: boolean;
  enableWindowReMount?: boolean;
  render: (
    config: Record<string, unknown> | undefined,
    node: FlexLayout.TabNode
  ) => ReactNode;
  getTitle: (node: FlexLayout.TabNode) => string | undefined;
}

export const PANEL_DEFINITIONS: Record<PanelType, PanelDefinition> = {
  blockly: {
    canPopout: false,
    render: () => <JaclyEditorPanel />,
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
    render: () => <DevicePanel />,
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
  if (!component) return undefined;
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
