import * as FlexLayout from 'flexlayout-react';
import { factory } from '@/features/project/lib/flexlayout-components';
import { useProjectEditor } from './project-editor-context';
import './styles/flexlayout.css';

export function ProjectEditorLayout() {
  const { state, actions, meta } = useProjectEditor();

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <FlexLayout.Layout
        model={state.model}
        factory={factory}
        onModelChange={actions.handleModelChange}
        onRenderTab={meta.onRenderTab}
      />
    </div>
  );
}
