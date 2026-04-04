export {
  useActiveProject,
  ActiveProjectContext,
  type ActiveProjectActions,
  type ActiveProjectContextValue,
  type ActiveProjectMeta,
  type ActiveProjectState,
  type ProjectError,
  type ProjectErrorReason,
} from './state/active-project-context';
export { ActiveProjectProvider } from './state/active-project-provider';

export {
  useProjectEditor,
  ProjectEditorContext,
  type ProjectEditorActions,
  type ProjectEditorContextValue,
  type ProjectEditorMeta,
  type ProjectEditorState,
} from './state/project-editor-context';
export { ProjectEditorProvider } from './state/project-editor-provider';
export { ProjectEditorLayout } from './components/editor/project-editor-layout';

export { PanelWrapper } from './components/panel-wrapper';
export { ProjectEditorHeader } from './components/project-editor-header';
export { ProjectLoadError } from './components/project-load-error';
export { ProjectLoadingIndicator } from './components/project-loading';
export { ProjectNameEditor } from './components/project-name-editor';

export { ErrorPanel } from './components/panels/error-panel';
export { LogsPanel } from './components/panels/logs-panel';

export { JacFileExplorerPanel as FileExplorerPanel } from './components/file-explorer/file-explorer-panel';
export { JacFileExplorerProvider as FileExplorerProvider } from './components/file-explorer/file-explorer-provider';
export { useJacFileExplorer } from './components/file-explorer/file-explorer-context';

export {
  ProjectFsService,
  type ProjectFsInterface,
  isMounted,
  mountProject,
  renameProject,
  unmountProject,
} from './services/project-fs-service';
export { ProjectManagementService } from './services/project-runtime-service';

export {
  PANEL_DEFINITIONS,
  getPanelDefinition,
  getPanelTitle,
  applyPanelDefinitionToTab,
} from './lib/panel-registry';
export {
  buildPackageImportUrl,
  collectFiles,
  downloadProjectAsTarGz,
  downloadProjectAsZip,
  packProjectAsTarGz,
  packProjectAsZip,
} from './lib/download';
export {
  defaultBorderLayout,
  defaultGlobalSettings,
  defaultLayout,
  flexLayoutDefaultJson,
} from './lib/flexlayout-defaults';
export {
  controlPanel,
  findAllTabIds,
  getUpdatedLayoutModel,
  openPanel,
  processAllTabs,
} from './lib/flexlayout';
export {
  loadPackageFromBytes,
  loadPackageFromFile,
  loadPackageFromUri,
  type PackageLoadResult,
} from './lib/load-package';
export { getRequest } from './lib/request';

export type {
  CodePanelProps,
  ErrorPanelProps,
  FlexLayoutAttributes,
  NewPanelProps,
  PanelAction,
  PanelType,
} from './types/flexlayout-type';
export { JaclyFiles } from './types/jacly-files';

export { useKeyboardShortcut } from './hooks/use-keyboard-shortcut';

import { ProjectEditorHeader } from './components/project-editor-header';
import { ProjectEditorLayout } from './components/editor/project-editor-layout';
import { ActiveProjectProvider } from './state/active-project-provider';
import { ProjectEditorProvider } from './state/project-editor-provider';

export const ActiveProject = {
  Provider: ActiveProjectProvider,
};

export const ProjectEditor = {
  Provider: ProjectEditorProvider,
  Header: ProjectEditorHeader,
  Layout: ProjectEditorLayout,
};
