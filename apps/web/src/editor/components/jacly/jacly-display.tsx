import { JaclyEditor } from '@jaculus/jacly/editor';
import type { EngineMissingPackages } from '@jaculus/jacly/engine';
import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import { logger } from '@/core';
import { useTheme } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';
import { getLocale } from '@/core/paraglide/runtime';
import { useJacPackages } from '@/packages/state/packages-context';
import { useProjectEditor } from '@/project/state/project-editor-context';
import { useEditorJacly } from '../../state/jacly-context';
import { JaclyEditorLoading } from './jacly-editor-loading';

export function EditorJaclyDisplay() {
  const { themeNormalized } = useTheme();
  const {
    state: { initialJson, jaclyBlocksData, engine },
    actions,
  } = useEditorJacly();

  const {
    state: { initialInstallDone },
  } = useJacPackages();

  const {
    actions: { controlPanel },
  } = useProjectEditor();

  const onMissingPackage = useCallback(
    async (missingPackages: EngineMissingPackages) => {
      for (const [packageName, blockTypes] of Object.entries(missingPackages)) {
        logger.error(
          `Missing package: ${packageName}, required by blocks: ${[...blockTypes].join(', ')}`,
        );
      }
      controlPanel('logs', 'expand');
      enqueueSnackbar(m.editor_jacly_missing_packages(), { variant: 'error' });
    },
    [controlPanel],
  );

  if (!initialInstallDone) {
    return <JaclyEditorLoading phase="installing-packages" />;
  }

  if (!initialJson || !jaclyBlocksData) {
    return <JaclyEditorLoading phase="loading-editor" />;
  }

  return (
    <JaclyEditor
      engine={engine}
      theme={themeNormalized}
      jaclyBlocksData={jaclyBlocksData}
      locale={getLocale()}
      initialJson={initialJson}
      onJsonChange={actions.handleJsonChange}
      onGeneratedCode={actions.handleGeneratedCode}
      onMissingPackage={onMissingPackage}
    />
  );
}
