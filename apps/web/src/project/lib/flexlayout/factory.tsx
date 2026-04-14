import * as FlexLayout from 'flexlayout-react';
import { m } from '@/core/paraglide/messages';
import { PanelWrapper } from '../../components/panel-wrapper';
import type { PanelType } from '../../types/flexlayout-type';
import { getPanelDefinition, getPanelTitle } from './panel-registry';

export function factory(node: FlexLayout.TabNode) {
  const component = node.getComponent() as PanelType;
  const isInBorder = node.getParent() instanceof FlexLayout.BorderNode;
  const isHighlighted = false;
  const canPopout = isInBorder && node.isEnablePopout() && !node.isPoppedOut();

  const config = node.getConfig();
  const wrapComponent = (
    children: React.ReactNode,
    showName: boolean = false,
    highlight: boolean = false,
  ) => (
    <PanelWrapper
      key={`${node.getId()}:${node.getWindowId()}`}
      name={showName ? getPanelTitle(node) : undefined}
      highlight={highlight}
      onPopout={
        canPopout
          ? () => node.getModel().doAction(FlexLayout.Actions.popoutTab(node.getId()))
          : undefined
      }
    >
      {children}
    </PanelWrapper>
  );

  const panelDefinition = getPanelDefinition(component);
  const panelContent = panelDefinition ? (
    panelDefinition.render(config, node)
  ) : (
    <div>
      {m.project_panel_unknown_component()} {component}
    </div>
  );

  return wrapComponent(panelContent, isInBorder, isHighlighted);
}
