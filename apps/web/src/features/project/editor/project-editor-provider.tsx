import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as FlexLayout from 'flexlayout-react';
import { enqueueSnackbar } from 'notistack';
import { m } from '@/paraglide/messages';
import { useJacDevice } from '@/features/jac-device';
import { useActiveProject } from '@/features/project/active-project';
import {
  flexLayoutDefaultJson,
  getPanelTitle,
} from '@/features/project/lib/flexlayout-defaults';
import {
  controlPanel,
  getUpdatedLayoutModel,
  openPanel,
} from '@/features/project/lib/flexlayout';
import type {
  NewPanelProps,
  PanelAction,
  PanelType,
} from '@/features/project/types/flexlayout-type';
import type { ProjectManagementService } from '@/services/project-runtime-service';
import { ProjectLoadingIndicator } from '@/features/project/components';
import { useKeyboardShortcut } from '../hooks/use-keyboard-shortcut';
import {
  ProjectEditorContext,
  type ProjectEditorActions,
  type ProjectEditorContextValue,
} from './project-editor-context';

interface ProjectEditorProviderProps {
  children: ReactNode;
  projectManService: ProjectManagementService;
}

export function ProjectEditorProvider({
  children,
  projectManService,
}: ProjectEditorProviderProps) {
  const {
    state: { dbProject, error },
  } = useActiveProject();
  const { state: jacState } = useJacDevice();
  const { pkg } = jacState;
  const [model, setModel] = useState<FlexLayout.Model | null>(null);

  const safeControlPanel = useCallback(
    (type: PanelType, action: PanelAction) => {
      if (!model) return;
      controlPanel(model, type, action);
    },
    [model]
  );

  const safeOpenPanel = useCallback(
    (
      type: 'code' | 'error',
      props: NewPanelProps['code'] | NewPanelProps['error']
    ) => {
      if (!model) return;
      openPanel(model, type as never, props as never);
    },
    [model]
  );

  useKeyboardShortcut(
    { key: 'p', ctrl: true, meta: true, enabled: !!model },
    () => safeControlPanel('packages', 'toggle')
  );
  useKeyboardShortcut(
    { key: 'e', ctrl: true, meta: true, enabled: !!model },
    () => safeControlPanel('file-explorer', 'toggle')
  );
  useKeyboardShortcut(
    { key: 'l', ctrl: true, meta: true, enabled: !!model },
    () => safeControlPanel('logs', 'toggle')
  );
  useKeyboardShortcut(
    { key: 's', ctrl: true, meta: true, enabled: !!model },
    () => safeControlPanel('console', 'toggle')
  );

  useEffect(() => {
    const loadLayout = async () => {
      try {
        const savedLayout = (await projectManService.getProject(dbProject.id))
          ?.layout;
        setModel(FlexLayout.Model.fromJson(getUpdatedLayoutModel(savedLayout)));
      } catch (error) {
        console.error('Failed to load layout settings:', error);
        enqueueSnackbar(m.project_layout_load_error(), {
          variant: 'info',
        });
        setModel(FlexLayout.Model.fromJson(flexLayoutDefaultJson));
      }
    };

    loadLayout();
  }, [projectManService, dbProject.id]);

  useEffect(() => {
    if (!model) return;
    const projectType = pkg?.jaculus?.projectType;
    if (!projectType) return;

    if (error) {
      safeControlPanel('blockly', 'close');
      safeOpenPanel('error', { error });
      return;
    }

    safeControlPanel('error', 'close');

    if (projectType !== 'jacly') {
      safeControlPanel('blockly', 'close');
      safeOpenPanel('code', { filePath: 'src/index.ts' });
    }
  }, [model, pkg, error, safeControlPanel, safeOpenPanel]);

  const handleModelChange = useCallback<
    ProjectEditorActions['handleModelChange']
  >(
    async newModel => {
      setModel(newModel);

      try {
        await projectManService.updateProjectKey(
          dbProject.id,
          'layout',
          newModel.toJson()
        );
      } catch (_error) {
        console.error('Error saving layout model:', _error);
      }
    },
    [projectManService, dbProject.id]
  );

  const onRenderTab = useCallback(
    (
      node: FlexLayout.TabNode,
      renderValues: {
        leading: React.ReactNode;
        content: React.ReactNode;
        buttons: React.ReactNode[];
      }
    ) => {
      const translatedName = getPanelTitle(node);
      if (translatedName) {
        renderValues.content = translatedName;
      }
    },
    []
  );

  const value = useMemo<ProjectEditorContextValue | null>(() => {
    if (!model) return null;

    return {
      state: { model },
      actions: {
        controlPanel: safeControlPanel,
        openPanel: safeOpenPanel as ProjectEditorActions['openPanel'],
        handleModelChange,
      },
      meta: { onRenderTab },
    };
  }, [model, safeControlPanel, safeOpenPanel, handleModelChange, onRenderTab]);

  if (!value) {
    return <ProjectLoadingIndicator message="Loading layout..." />;
  }

  return (
    <ProjectEditorContext.Provider value={value}>
      {children}
    </ProjectEditorContext.Provider>
  );
}
