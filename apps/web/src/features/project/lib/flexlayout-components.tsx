import * as FlexLayout from 'flexlayout-react';
import type { PanelType } from '@/features/project/types/flexlayout-type';
import { PanelWrapper } from '@/features/project/components';
import {
  BlocklyEditorPanel,
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
import { getPanelTitle } from './flexlayout-defaults';
import { m } from '@/paraglide/messages';

// Component registry - map panel types to component factory functions
const PANEL_COMPONENTS: Record<
  PanelType,
  (config?: Record<string, unknown>) => React.ReactNode
> = {
  blockly: () => <BlocklyEditorPanel />,
  console: () => <ConsolePanel />,
  'file-explorer': () => (
    <JacFileExplorerProvider>
      <JacFileExplorerPanel />
    </JacFileExplorerProvider>
  ),
  code: config => <CodePanel filePath={config?.filePath as string} />,
  'generated-code': () => <GeneratedCode />,
  wokwi: () => <WokwiPanel />,
  packages: () => (
    <JacPackagesProvider>
      <JacPackagesPanel />
    </JacPackagesProvider>
  ),
  logs: () => <LogsPanel />,
  jaculus: () => <JaculusPanel />,
  installer: () => <InstallerPanel />,
  error: () => <ErrorPanel />,
};

export function factory(node: FlexLayout.TabNode) {
  const component = node.getComponent() as PanelType;
  const isInBorder = node.getParent() instanceof FlexLayout.BorderNode;
  const isHighlighted = false;

  const config = node.getConfig();
  const wrapComponent = (
    children: React.ReactNode,
    showName: boolean = false,
    highlight: boolean = false
  ) => (
    <PanelWrapper
      name={showName ? getPanelTitle(node) : undefined}
      highlight={highlight}
    >
      {children}
    </PanelWrapper>
  );

  const panelFactory = PANEL_COMPONENTS[component];
  const panelContent = panelFactory ? (
    panelFactory(config)
  ) : (
    <div>
      {m.project_panel_unknown_component()} {component}
    </div>
  );

  return wrapComponent(panelContent, isInBorder, isHighlighted);
}
