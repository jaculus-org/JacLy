import { useJac } from '@/jaculus/provider/jac-context';
import { useTheme } from '@/providers/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/ui';

export function BlocklyEditor() {
  const { themeNormalized } = useTheme();
  const { setGeneratedCode } = useJac();

  return (
    <JaclyEditor theme={themeNormalized} onCodeChange={setGeneratedCode} />
  );
}
