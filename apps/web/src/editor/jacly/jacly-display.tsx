import { JaclyEditor } from '@jaculus/jacly/editor';
import type { EngineMissingPackages } from '@jaculus/jacly/engine';
import { useCallback } from 'react';
import { logger } from '@/core';
import { useTheme } from '@/core/components/theme';
import { getLocale } from '@/core/paraglide/runtime';
import { useJacPackages } from '@/packages';
import { useProjectEditor } from '@/project';
import { useEditorJacly } from './jacly-context';
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
        const sortedBlockTypes = [...blockTypes].sort();
        logger.error(
          `Unsupported/not installed library "${packageName}": ${sortedBlockTypes.join(', ')}`,
        );
      }
      controlPanel('logs', 'expand');
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
