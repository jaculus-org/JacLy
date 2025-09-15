import { useJacly } from '@/components/jacly-provider';
import { useTheme } from '@/components/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/ui';

export function BlocklyEditor() {
  const { themeNormalized } = useTheme();
  const { setGeneratedCode } = useJacly();

  return (
    <JaclyEditor theme={themeNormalized} onCodeChange={setGeneratedCode} />
  );
}
