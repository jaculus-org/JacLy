import * as FlexLayout from 'flexlayout-react';
import { factory } from '../../lib/flexlayout/factory';
import { useProjectEditor } from '../../state/project-editor-context';
import './flexlayout.css';

export function ProjectEditorLayout() {
  const { state, actions, meta } = useProjectEditor();

  return (
    <div className="h-[calc(100vh-2.5rem)] w-full">
      <FlexLayout.Layout
        model={state.model}
        factory={factory}
        popoutURL="/popout.html"
        popoutWindowName="Jacly Panel"
        icons={{
          popout: () => <FlexLayout.PopoutIcon />,
        }}
        onModelChange={actions.handleModelChange}
        onRenderTab={meta.onRenderTab}
      />
    </div>
  );
}
