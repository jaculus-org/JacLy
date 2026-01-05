import * as FlexLayout from 'flexlayout-react';
import type { PanelType } from '@/features/editor/types/flexlayout-type';
import { PanelWrapper } from '@/features/editor/components/panel-warpper';
import { FileExplorerPanel } from '../components/panels/file-explorer';

// Component registry - map panel types to their components
const PANEL_COMPONENTS: Record<PanelType, React.ReactNode> = {
  blockly: <>blockly</>,
  console: <>console</>,
  'file-explorer': <FileExplorerPanel />,
  'source-code': <>source-code</>,
  'generated-code': <>generated-code</>,
  wokwi: <>wokwi</>,
  packages: <>packages</>,
  logs: <>logs</>,
};

export function factory(node: FlexLayout.TabNode) {
  const component = node.getComponent() as PanelType;
  const tabName = node.getName();
  const isInBorder = node.getParent() instanceof FlexLayout.BorderNode;
  const isHighlighted = false;

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

  const panelContent = PANEL_COMPONENTS[component] ?? (
    <div>Unknown component: {component}</div>
  );
  return wrapComponent(panelContent, isInBorder, isHighlighted);
}
