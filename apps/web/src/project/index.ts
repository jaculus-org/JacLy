export { ProjectEditorLayout } from './components/editor/project-editor-layout';
export {
  FileExplorerPanel,
  FileExplorerProvider,
  useJacFileExplorer,
} from './components/file-explorer';
export { PanelWrapper } from './components/panel-wrapper';
export { ErrorPanel } from './components/panels/error-panel';
export { LogsPanel } from './components/panels/logs-panel';
export { ProjectEditorHeader } from './components/project-editor-header';
export { ProjectImportPage } from './components/project-import/project-import-page';
export {
  ProjectIndexContainer,
  type ProjectIndexContainerProps,
  type ProjectIndexFsService,
  type ProjectIndexRuntimeService,
} from './components/project-index/project-index-container';
export { ProjectIndexHeader } from './components/project-index/project-index-header';
export { ProjectIndexPage } from './components/project-index/project-index-page';
export { ProjectIndexSkeleton } from './components/project-index/project-index-skeleton';
export { ProjectLoadError } from './components/project-load-error';
export { ProjectLoadingIndicator } from './components/project-loading';
export { ProjectNameEditor } from './components/project-name-editor';
export { ProjectNew, ProjectNewPage } from './components/project-new';
export { useKeyboardShortcut } from './hooks/use-keyboard-shortcut';
export {
  defaultBorderLayout,
  defaultGlobalSettings,
  defaultLayout,
  flexLayoutDefaultJson,
} from './lib/flexlayout/defaults';
export {
  controlPanel,
  findAllTabIds,
  getUpdatedLayoutModel,
  openPanel,
  processAllTabs,
} from './lib/flexlayout/model';
export {
  applyPanelDefinitionToTab,
  getPanelDefinition,
  getPanelTitle,
  PANEL_DEFINITIONS,
} from './lib/flexlayout/panel-registry';
export {
  buildPackageImportUrl,
  collectFiles,
  downloadProjectAsTarGz,
  downloadProjectAsZip,
  packProjectAsTarGz,
  packProjectAsZip,
} from './services/download';
export { durableWriteFile } from './services/durable-file-write';
export {
  createLatestFileWriter,
  type LatestFileWriter,
} from './services/latest-file-writer';
export {
  loadPackageFromBytes,
  loadPackageFromFile,
  loadPackageFromUri,
  type PackageLoadResult,
} from './services/load-package';
export {
  isMounted,
  mountProject,
  type ProjectFsInterface,
  ProjectFsService,
  renameProject,
  unmountProject,
} from './services/project-fs-service';
export { ProjectManagementService } from './services/project-runtime-service';
export {
  createProjectRegistry,
  defaultRegisters,
} from './services/registry';
export { loadPackageUri } from './services/request';
export {
  type ActiveProjectActions,
  ActiveProjectContext,
  type ActiveProjectContextValue,
  type ActiveProjectMeta,
  type ActiveProjectState,
  type ProjectError,
  type ProjectErrorReason,
  useActiveProject,
} from './state/active-project-context';
export { ActiveProjectProvider } from './state/active-project-provider';
export {
  type ProjectEditorActions,
  ProjectEditorContext,
  type ProjectEditorContextValue,
  type ProjectEditorMeta,
  type ProjectEditorState,
  useProjectEditor,
} from './state/project-editor-context';
export { ProjectEditorProvider } from './state/project-editor-provider';
export type {
  CodePanelProps,
  ErrorPanelProps,
  FlexLayoutAttributes,
  NewPanelProps,
  PanelAction,
  PanelType,
} from './types/flexlayout-type';
export { JaclyFiles } from './types/jacly-files';

import { ProjectEditorLayout } from './components/editor/project-editor-layout';
import { ProjectEditorHeader } from './components/project-editor-header';
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
