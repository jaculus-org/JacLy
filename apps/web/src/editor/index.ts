export { CodeEditor } from './components';
export { CodeEditorBasic } from './components/code-editor';
export { CodeEditorReadOnly } from './components/code-editor-read';
export { MonacoProjectInitializer } from './components/monaco-project-initializer';
export { useMonacoModel } from './hooks/use-monaco-model';
export { inferLanguageFromPath } from './services/language';
export { MonacoProjectService } from './services/monaco-project-service';
export {
  EditorSyncService,
  editorSyncService,
} from './services/editor-sync-service';

export { useEditorJacly } from './state/blockly-context';
export { EditorJaclyProvider } from './state/blockly-provider';
export { EditorJaclyDisplay } from './components/blockly/blockly-display';
export { JaclyEditorComponent } from './components/blockly';

export { BlocklyEditorPanel } from './components/panels/blockly-panel';
export { CodePanel } from './components/panels/code-panel';
export { GeneratedCode } from './components/panels/generated-code-panel';

import { EditorJaclyProvider } from './state/blockly-provider';
import { EditorJaclyDisplay } from './components/blockly/blockly-display';

export const EditorJacly = {
  Provider: EditorJaclyProvider,
  Display: EditorJaclyDisplay,
};
