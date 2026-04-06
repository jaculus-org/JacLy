import { useCallback } from 'react';
import { JaclyEditor, JaclyLoading } from '@jaculus/jacly/editor';
import { useTheme } from '@/core/components/theme';
import { getLocale } from '@/core/paraglide/runtime';
import { m } from '@/core/paraglide/messages';
import { enqueueSnackbar } from 'notistack';
import { useEditorJacly } from '../../state/jacly-context';
import { logger } from '@/core';
import { useProjectEditor } from '@/project/state/project-editor-context';
import type { EngineMissingPackages } from '@jaculus/jacly/engine';
import { useJacPackages } from '@/packages/state/packages-context';

export function EditorJaclyDisplay() {
  const { themeNormalized } = useTheme();
  const {
    state: { initialJson, jaclyBlocksData, engine },
    actions,
  } = useEditorJacly();

  const {
    state: { isInstalling },
  } = useJacPackages();

  const {
    actions: { controlPanel },
  } = useProjectEditor();

  const onMissingPackage = useCallback(
    async (missingPackages: EngineMissingPackages) => {
      for (const [packageName, blockTypes] of Object.entries(missingPackages)) {
        logger.error(
          `Missing package: ${packageName}, required by blocks: ${[...blockTypes].join(', ')}`
        );
      }
      controlPanel('logs', 'expand');
      enqueueSnackbar(m.editor_jacly_missing_packages(), { variant: 'error' });
    },
    [controlPanel]
  );

  if (!initialJson || !jaclyBlocksData || isInstalling) {
    return <JaclyLoading />;
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
