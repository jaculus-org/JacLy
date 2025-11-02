import { useTheme } from '@/providers/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/ui';

export function BlocklyEditorPanel() {
  const { themeNormalized } = useTheme();

  async function onCodeChange(code: string) {
    console.log('Blockly code changed:', code);
  }

  return (
    <JaclyEditor
      theme={themeNormalized}
      onCodeChange={async code => await onCodeChange(code)}
    />
  );
}
