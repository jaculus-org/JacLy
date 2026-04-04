import { JaclyEditor, JaclyLoading } from '@jaculus/jacly/editor';
import { useTheme } from '@/core/components/theme';
import { getLocale } from '@/core/paraglide/runtime';
import { useEditorJacly } from '../../state/blockly-context';

export function EditorJaclyDisplay() {
  const { themeNormalized } = useTheme();
  const {
    state: { initialJson, jaclyBlocksData },
    actions,
  } = useEditorJacly();

  if (!initialJson || !jaclyBlocksData) {
    return <JaclyLoading />;
  }

  return (
    <JaclyEditor
      theme={themeNormalized}
      jaclyBlocksData={jaclyBlocksData}
      locale={getLocale()}
      initialJson={initialJson}
      onJsonChange={actions.handleJsonChange}
      onGeneratedCode={actions.handleGeneratedCode}
    />
  );
}
