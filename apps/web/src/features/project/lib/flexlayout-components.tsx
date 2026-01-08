import * as FlexLayout from 'flexlayout-react';
import type { PanelType } from '@/features/project/types/flexlayout-type';
import { PanelWrapper } from '@/features/project/components/panel-warpper';
import { FileExplorerPanel } from '../components/panels/file-explorer';
import { CodePanel } from '../components/panels/code';
import { GeneratedCode } from '../components/panels/generated-code';
import { ConsolePanel } from '../components/panels/console';
import { LogsPanel } from '../components/panels/logs';
import { PackagesPanel } from '../components/panels/packages';
import { BlocklyEditorPanel } from '../components/panels/blockly';
import { JaculusPanel } from '../components/panels/jaculus';

// Component registry - map panel types to component factory functions
const PANEL_COMPONENTS: Record<
  PanelType,
  (config?: Record<string, unknown>) => React.ReactNode
> = {
  blockly: () => <BlocklyEditorPanel />,
  console: () => <ConsolePanel />,
  'file-explorer': () => <FileExplorerPanel />,
  code: config => <CodePanel filePath={config?.filePath as string} />,
  'generated-code': () => <GeneratedCode />,
  wokwi: () => <>wokwi</>,
  packages: () => <PackagesPanel />,
  logs: () => <LogsPanel />,
  jaculus: () => <JaculusPanel />,
};

export function factory(node: FlexLayout.TabNode) {
  const component = node.getComponent() as PanelType;
  const tabName = node.getName();
  const isInBorder = node.getParent() instanceof FlexLayout.BorderNode;
  const isHighlighted = false;

  const config = node.getConfig();
  const wrapComponent = (
    children: React.ReactNode,
    showName: boolean = false,
    highlight: boolean = false
  ) => (
    <PanelWrapper
      name={tabName && showName ? tabName : undefined}
      highlight={highlight}
    >
      {children}
    </PanelWrapper>
  );

  const panelFactory = PANEL_COMPONENTS[component];
  const panelContent = panelFactory ? (
    panelFactory(config)
  ) : (
    <div>Unknown component: {component}</div>
  );

  return wrapComponent(panelContent, isInBorder, isHighlighted);
}
