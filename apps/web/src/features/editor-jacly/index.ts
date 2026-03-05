export { useEditorJacly } from './editor-jacly-context';
export { EditorJaclyProvider } from './editor-jacly-provider';
export { EditorJaclyDisplay } from './editor-jacly-display';
export { JaclyEditorComponent } from './components';

import { EditorJaclyProvider } from './editor-jacly-provider';
import { EditorJaclyDisplay } from './editor-jacly-display';

export const EditorJacly = {
  Provider: EditorJaclyProvider,
  Display: EditorJaclyDisplay,
};
