import { EditorJaclyProvider } from '../editor-jacly-provider';
import { EditorJaclyDisplay } from '../editor-jacly-display';

// Convenience wrapper — keeps the single-component usage at call sites unchanged.
export function JaclyEditorComponent() {
  return (
    <EditorJaclyProvider>
      <EditorJaclyDisplay />
    </EditorJaclyProvider>
  );
}
