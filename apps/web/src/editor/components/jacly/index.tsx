import { EditorJaclyProvider } from '../../state/jacly-provider';
import { EditorJaclyDisplay } from './jacly-display';

export function JaclyEditorComponent() {
  return (
    <EditorJaclyProvider>
      <EditorJaclyDisplay />
    </EditorJaclyProvider>
  );
}
