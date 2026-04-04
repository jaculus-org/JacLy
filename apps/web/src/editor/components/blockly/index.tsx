import { EditorJaclyProvider } from '../../state/blockly-provider';
import { EditorJaclyDisplay } from './blockly-display';

// Convenience wrapper — keeps the single-component usage at call sites unchanged.
export function JaclyEditorComponent() {
  return (
    <EditorJaclyProvider>
      <EditorJaclyDisplay />
    </EditorJaclyProvider>
  );
}
