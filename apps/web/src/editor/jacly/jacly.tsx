import { EditorJaclyDisplay } from './jacly-display';
import { EditorJaclyProvider } from './jacly-provider';

export function JaclyEditorComponent() {
  return (
    <EditorJaclyProvider>
      <EditorJaclyDisplay />
    </EditorJaclyProvider>
  );
}
