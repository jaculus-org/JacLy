export { ProjectEditorLayout } from './project-editor-layout';
export {
  useProjectEditor,
  type ProjectEditorActions,
  type ProjectEditorContextValue,
  type ProjectEditorMeta,
  type ProjectEditorState,
} from './project-editor-context';
export { ProjectEditorProvider } from './project-editor-provider';
export { ProjectEditorHeader } from '@/project';

import { ProjectEditorHeader } from '@/project';
import { ProjectEditorLayout } from './project-editor-layout';
import { ProjectEditorProvider } from './project-editor-provider';

export const ProjectEditor = {
  Provider: ProjectEditorProvider,
  Header: ProjectEditorHeader,
  Layout: ProjectEditorLayout,
};
